#!/usr/bin/env python3
import argparse
import json
import os
import re
import signal
import socket
import subprocess
import sys
import time
from pathlib import Path

import sqlite3
import threading
from flask import Flask, Response, jsonify, render_template, request, g

_generating = threading.Lock()

APP_NAME = "prompt-builder"
DEFAULT_PORT = 3007
DATA_DIR = Path.home() / ".prompt-builder"
DB_PATH = DATA_DIR / "prompt-builder.db"
PID_PATH = DATA_DIR / "prompt-builder.pid"
CONFIG_PATH = DATA_DIR / "config.json"
BASE_DIR = Path(__file__).resolve().parent


# ---------------------------------------------------------------------------
# Data directory & config
# ---------------------------------------------------------------------------

def ensure_data_dir():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    config = {}
    if CONFIG_PATH.exists():
        try:
            config = json.loads(CONFIG_PATH.read_text())
        except json.JSONDecodeError:
            config = {}
    config.setdefault("port", DEFAULT_PORT)
    config["app_root"] = str(BASE_DIR)
    CONFIG_PATH.write_text(json.dumps(config, indent=2))


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(_exc=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS prompts (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    company_url         TEXT NOT NULL,
    company_name        TEXT,
    target_role         TEXT,
    target_department   TEXT,
    prompts_json        TEXT,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""


def init_db(conn):
    conn.executescript(SCHEMA_SQL)
    conn.commit()


def ensure_db():
    ensure_data_dir()
    conn = sqlite3.connect(DB_PATH)
    try:
        init_db(conn)
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Claude prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = (
    "You are an expert prompt engineer for a meeting intelligence platform. "
    "When given a company URL, you research the company using web search to understand "
    "their business, industry, challenges, and public-facing tone. "
    "You then create tailored prompts that the company's employees would use to search "
    "and extract insights from their OWN meeting recordings. "
    "Prompts should feel native to the company's language and tone. "
    "Go straight into the content — no preamble. "
    "Each prompt should help users surface actionable insights from their own meetings. "
    "Output ONLY valid JSON — no preamble, no markdown fences, no commentary."
)

USER_PROMPT_TEMPLATE = """\
Research the company at {company_url} using web search. Understand their business, \
industry, key challenges, and public-facing communication tone.

{role_context}{department_context}

Return JSON:
{{"company_name":"...","company_tone":"...","prompts":[{{"title":"...","prompt":"...","use_case":"..."}}]}}

Rules:
- Generate 3-5 prompts tailored to this company
- Each prompt should search the customer's own meeting library
- Match the tone of prompts to the company's public-facing materials
- Go straight into content — no preamble or platform references
- "title" is a short label for the prompt (e.g. "Pipeline Risk Signals")
- "prompt" is the actual prompt text the user would type into the search interface
- "use_case" is a one-sentence description of when/why to use this prompt
- Make prompts specific to the company's industry, terminology, and likely meeting topics
- Prompts should surface insights from the customer's OWN meetings, not external data"""


def build_prompt(data):
    role_context = ""
    dept_context = ""
    target_role = (data.get("target_role") or "").strip()
    target_department = (data.get("target_department") or "").strip()

    if target_role:
        role_context = f"The target user role is: {target_role}. Tailor prompts to be most useful for this role.\n"
    if target_department:
        dept_context = f"The target department is: {target_department}. Focus prompts on this department's meeting topics and needs.\n"

    return USER_PROMPT_TEMPLATE.format(
        company_url=data["company_url"],
        role_context=role_context,
        department_context=dept_context,
    )


def parse_json_response(text):
    """Try to extract JSON from Claude's response, handling markdown fences."""
    text = text.strip()
    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Try extracting from code fences
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    # Try finding first { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return None


def result_to_markdown(data):
    """Convert structured JSON result to markdown."""
    lines = []
    company_name = data.get("company_name", "Unknown")
    company_tone = data.get("company_tone", "")
    prompts = data.get("prompts", [])

    lines.append(f"# Meeting Memory Prompts for {company_name}")
    lines.append("")
    if company_tone:
        lines.append(f"**Company Tone:** {company_tone}")
        lines.append("")

    for i, p in enumerate(prompts, 1):
        lines.append(f"## {i}. {p.get('title', 'Untitled')}")
        lines.append("")
        lines.append(f"**Use case:** {p.get('use_case', '')}")
        lines.append("")
        lines.append("```")
        lines.append(p.get("prompt", ""))
        lines.append("```")
        lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Flask application
# ---------------------------------------------------------------------------

def create_app(prefix=""):
    static_path = prefix + "/static" if prefix else "/static"
    app = Flask(
        __name__,
        static_folder=str(BASE_DIR / "static"),
        static_url_path=static_path,
        template_folder=str(BASE_DIR / "templates"),
    )
    app.config["URL_PREFIX"] = prefix

    @app.context_processor
    def inject_prefix():
        return {"prefix": app.config["URL_PREFIX"]}

    @app.teardown_appcontext
    def teardown_db(exception=None):
        close_db(exception)

    # --- Page routes -------------------------------------------------------

    @app.route(prefix + "/")
    @app.route("/")
    def index():
        return render_template("index.html")

    # --- API routes --------------------------------------------------------

    @app.route(prefix + "/api/generate", methods=["POST"])
    @app.route("/api/generate", methods=["POST"])
    def api_generate():
        data = request.get_json(silent=True) or {}

        if not (data.get("company_url") or "").strip():
            return jsonify({"error": "company_url is required"}), 400

        prompt = build_prompt(data)

        def stream():
            if not _generating.acquire(blocking=False):
                yield f"data: {json.dumps({'error': 'A generation request is already running. Please wait.'})}\n\n"
                return

            full_prompt = SYSTEM_PROMPT + "\n\n" + prompt

            try:
                import shutil
                claude_bin = shutil.which("claude")
                if not claude_bin:
                    yield f"data: {json.dumps({'error': 'claude CLI not found. Install Claude Code first.'})}\n\n"
                    return

                yield f"data: {json.dumps({'status': 'Researching company and generating prompts...'})}\n\n"

                result = subprocess.run(
                    [
                        claude_bin, "-p", full_prompt,
                        "--output-format", "text",
                        "--model", "claude-sonnet-4-6",
                        "--allowedTools", "WebSearch,WebFetch",
                    ],
                    capture_output=True,
                    text=True,
                    env={k: v for k, v in os.environ.items() if k != "CLAUDECODE"},
                    cwd=str(Path.home()),
                    stdin=subprocess.DEVNULL,
                    timeout=120,
                )

                if result.returncode != 0:
                    err_detail = result.stderr.strip() or result.stdout.strip() or "(no output)"
                    yield f"data: {json.dumps({'error': f'Claude CLI error (exit {result.returncode}): {err_detail}'})}\n\n"
                    return

                raw_text = result.stdout
                if not raw_text.strip():
                    yield f"data: {json.dumps({'error': 'No output from Claude CLI'})}\n\n"
                    return

                # Parse the JSON response
                parsed = parse_json_response(raw_text)
                if not parsed:
                    yield f"data: {json.dumps({'error': 'Could not parse results as JSON', 'raw': raw_text})}\n\n"
                    return

                # Save to DB
                company_name = parsed.get("company_name", "")
                prompts_json = json.dumps(parsed.get("prompts", []))
                conn = sqlite3.connect(DB_PATH)
                conn.row_factory = sqlite3.Row
                try:
                    cur = conn.execute(
                        "INSERT INTO prompts (company_url, company_name, target_role, target_department, prompts_json) VALUES (?, ?, ?, ?, ?)",
                        (
                            data["company_url"].strip(),
                            company_name,
                            (data.get("target_role") or "").strip() or None,
                            (data.get("target_department") or "").strip() or None,
                            prompts_json,
                        ),
                    )
                    conn.commit()
                    prompt_id = cur.lastrowid
                finally:
                    conn.close()

                yield f"data: {json.dumps({'done': True, 'id': prompt_id, 'result': parsed})}\n\n"

            except subprocess.TimeoutExpired:
                yield f"data: {json.dumps({'error': 'Generation timed out after 2 minutes. Try again.'})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
            finally:
                _generating.release()

        return Response(stream(), mimetype="text/event-stream",
                        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

    @app.route(prefix + "/api/prompts", methods=["GET"])
    @app.route("/api/prompts", methods=["GET"])
    def api_prompts_list():
        ensure_db()
        conn = get_db()
        rows = conn.execute(
            "SELECT id, company_url, company_name, target_role, target_department, created_at FROM prompts ORDER BY created_at DESC"
        ).fetchall()
        return jsonify({
            "prompts": [
                {
                    "id": r["id"],
                    "company_url": r["company_url"],
                    "company_name": r["company_name"],
                    "target_role": r["target_role"],
                    "target_department": r["target_department"],
                    "created_at": r["created_at"],
                }
                for r in rows
            ]
        })

    @app.route(prefix + "/api/prompts/<int:prompt_id>", methods=["GET"])
    @app.route("/api/prompts/<int:prompt_id>", methods=["GET"])
    def api_prompt_get(prompt_id):
        ensure_db()
        conn = get_db()
        row = conn.execute("SELECT * FROM prompts WHERE id = ?", (prompt_id,)).fetchone()
        if not row:
            return jsonify({"error": "Prompt set not found"}), 404
        return jsonify({
            "id": row["id"],
            "company_url": row["company_url"],
            "company_name": row["company_name"],
            "target_role": row["target_role"],
            "target_department": row["target_department"],
            "prompts": json.loads(row["prompts_json"]) if row["prompts_json"] else [],
            "created_at": row["created_at"],
        })

    @app.route(prefix + "/api/prompts/<int:prompt_id>", methods=["PUT"])
    @app.route("/api/prompts/<int:prompt_id>", methods=["PUT"])
    def api_prompt_update(prompt_id):
        ensure_db()
        conn = get_db()
        existing = conn.execute("SELECT id FROM prompts WHERE id = ?", (prompt_id,)).fetchone()
        if not existing:
            return jsonify({"error": "Prompt set not found"}), 404

        data = request.get_json(silent=True) or {}
        updates = []
        params = []

        if "prompts" in data:
            updates.append("prompts_json = ?")
            params.append(json.dumps(data["prompts"]))
        if "company_name" in data:
            updates.append("company_name = ?")
            params.append(data["company_name"])

        if updates:
            params.append(prompt_id)
            conn.execute(f"UPDATE prompts SET {', '.join(updates)} WHERE id = ?", params)
            conn.commit()

        return jsonify({"success": True})

    @app.route(prefix + "/api/prompts/<int:prompt_id>", methods=["DELETE"])
    @app.route("/api/prompts/<int:prompt_id>", methods=["DELETE"])
    def api_prompt_delete(prompt_id):
        ensure_db()
        conn = get_db()
        existing = conn.execute("SELECT id FROM prompts WHERE id = ?", (prompt_id,)).fetchone()
        if not existing:
            return jsonify({"error": "Prompt set not found"}), 404
        conn.execute("DELETE FROM prompts WHERE id = ?", (prompt_id,))
        conn.commit()
        return jsonify({"success": True})

    @app.route(prefix + "/api/prompts/<int:prompt_id>/export", methods=["GET"])
    @app.route("/api/prompts/<int:prompt_id>/export", methods=["GET"])
    def api_prompt_export(prompt_id):
        ensure_db()
        conn = get_db()
        row = conn.execute("SELECT * FROM prompts WHERE id = ?", (prompt_id,)).fetchone()
        if not row:
            return jsonify({"error": "Prompt set not found"}), 404

        parsed = {
            "company_name": row["company_name"],
            "prompts": json.loads(row["prompts_json"]) if row["prompts_json"] else [],
        }
        markdown = result_to_markdown(parsed)
        filename = f"prompts-{row['company_name'] or 'unknown'}.md"
        filename = re.sub(r"[^\w\s.-]", "", filename).replace(" ", "-").lower()
        return Response(
            markdown,
            mimetype="text/markdown",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    return app


# ---------------------------------------------------------------------------
# Server lifecycle CLI
# ---------------------------------------------------------------------------

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.2)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def wait_for_port(port, timeout=2.0):
    start = time.time()
    while time.time() - start < timeout:
        if is_port_in_use(port):
            return True
        time.sleep(0.1)
    return False


def read_pid():
    if not PID_PATH.exists():
        return None
    try:
        return int(PID_PATH.read_text().strip())
    except ValueError:
        return None


def is_process_running(pid):
    if pid is None:
        return False
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    return True


def command_start(args):
    ensure_db()

    if PID_PATH.exists():
        pid = read_pid()
        if pid and is_process_running(pid):
            print(f"Prompt Builder already running (PID {pid}).")
            return 0
        PID_PATH.unlink(missing_ok=True)

    port = args.port or DEFAULT_PORT
    if is_port_in_use(port):
        print(f"Port {port} is in use. Stop other process or use '{APP_NAME} start --port XXXX'.")
        return 1

    cmd = [sys.executable, str(Path(__file__).resolve()), "serve", "--port", str(port)]
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )
    PID_PATH.write_text(str(process.pid))

    wait_for_port(port, timeout=2.0)
    try:
        import webbrowser
        webbrowser.open(f"http://localhost:{port}")
    except Exception:
        print(f"Open http://localhost:{port} in your browser.")

    print(f"Prompt Builder running at http://localhost:{port} (use '{APP_NAME} stop' to shut down)")
    return 0


def command_stop(_args):
    pid = read_pid()
    if not pid or not is_process_running(pid):
        print("Prompt Builder is not running.")
        PID_PATH.unlink(missing_ok=True)
        return 0
    try:
        os.kill(pid, signal.SIGTERM)
    except OSError:
        print("Unable to stop the Prompt Builder process.")
        return 1
    PID_PATH.unlink(missing_ok=True)
    print("Prompt Builder stopped.")
    return 0


def command_status(_args):
    pid = read_pid()
    if pid and is_process_running(pid):
        print(f"Prompt Builder running (PID {pid}).")
        return 0
    print("Prompt Builder is not running.")
    return 1


def command_serve(args):
    ensure_db()
    prefix = getattr(args, "prefix", "") or ""
    app = create_app(prefix=prefix)
    port = args.port or DEFAULT_PORT
    app.run(host="127.0.0.1", port=port, debug=False, threaded=True)
    return 0


# ---------------------------------------------------------------------------
# Argument parser
# ---------------------------------------------------------------------------

def build_parser():
    parser = argparse.ArgumentParser(prog=APP_NAME)
    subparsers = parser.add_subparsers(dest="command")

    start_parser = subparsers.add_parser("start", help="Start the Prompt Builder server")
    start_parser.add_argument("--port", type=int, default=None, help="Port to bind")

    subparsers.add_parser("stop", help="Stop the Prompt Builder server")
    subparsers.add_parser("status", help="Show server status")

    serve_parser = subparsers.add_parser("serve")
    serve_parser.add_argument("--port", type=int, default=None)
    serve_parser.add_argument("--prefix", type=str, default="", help="URL prefix for gateway mode")

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "start":
        return command_start(args)
    if args.command == "stop":
        return command_stop(args)
    if args.command == "status":
        return command_status(args)
    if args.command == "serve":
        return command_serve(args)

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())

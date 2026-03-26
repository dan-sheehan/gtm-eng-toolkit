# Architecture

## Overview

GTM Tools is a microservices suite where each tool runs as an independent Flask application on its own port. A stdlib reverse proxy (gateway) at port 8000 unifies all apps under a single URL, routing by path prefix.

## System Architecture

```
Browser (localhost:8000)
   │
   ▼
┌─────────────────────────────────────────┐
│  Gateway (port 8000)                    │
│  stdlib http.server reverse proxy       │
│  Routes: /prefix/* → localhost:PORT/*   │
│  Serves: hub landing page at /          │
└────┬────┬────┬────┬────┬────┬────┬──────┘
     │    │    │    │    │    │    │
     ▼    ▼    ▼    ▼    ▼    ▼    ▼
   3003 3004 3005 3006 3007 3008 3009
   Brf  Plbk Disc Comp PrBd Email Trnd
```

Each app is fully standalone — it can run on its own port without the gateway for development or testing.

## Data Flow: AI-Powered Tools

```
Browser                Flask App              Claude CLI           Web
  │                       │                      │                  │
  │  POST /api/generate   │                      │                  │
  │──────────────────────>│                      │                  │
  │                       │  subprocess.Popen    │                  │
  │                       │─────────────────────>│                  │
  │                       │                      │  WebSearch/Fetch │
  │                       │                      │─────────────────>│
  │                       │                      │<─────────────────│
  │                       │  stdout (streaming)  │                  │
  │  SSE: data: {text}    │<─────────────────────│                  │
  │<──────────────────────│                      │                  │
  │  SSE: data: {done}    │                      │                  │
  │<──────────────────────│                      │                  │
  │                       │  save to SQLite      │                  │
  │                       │─────────┐            │                  │
  │                       │<────────┘            │                  │
```

1. Browser sends form data via POST
2. Flask app builds a prompt from templates + user input
3. Claude CLI is invoked via `subprocess.Popen` with `--allowedTools WebSearch,WebFetch`
4. Stdout is read line-by-line and streamed to the browser as Server-Sent Events (SSE)
5. On completion, the structured result is parsed and saved to SQLite

## Data Flow: Rule-Based Tools

ICP Scorer and Pipeline Dashboard skip the Claude CLI entirely:

```
Browser → Flask App → Python computation → SQLite → JSON response
```

## Key Design Patterns

### Gateway Proxy

The gateway uses Python's `http.server` and `urllib.request` — no external dependencies. It:
- Matches URL path prefixes to backend host:port pairs
- Forwards all HTTP methods (GET, POST, PUT, DELETE)
- Rewrites `Location` headers on redirects to include the prefix
- Detects content types for static assets (CSS, JS, images)

### SQLite Per App

Each app stores data in its own SQLite database under `~/.appname/`:
- `~/.playbook/playbook.db`
- `~/.discovery/discovery.db`
- `~/.pipeline/pipeline.db`

This isolation means apps never contend for locks, and data is easy to inspect or reset independently.

### Database Connection Pattern

Every app follows the same Flask `g` pattern:

```python
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(str(DB_PATH))
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(exc=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()
```

### SSE Streaming

For AI-powered tools, responses stream via SSE rather than waiting for the full response:

```python
def generate():
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, text=True)
    for line in proc.stdout:
        yield f"data: {json.dumps({'text': line})}\n\n"
    yield f"data: {json.dumps({'done': True, 'id': saved_id})}\n\n"

return Response(generate(), content_type="text/event-stream")
```

The frontend reads SSE via `fetch()` + `ReadableStream`, not `EventSource`, to support POST requests with JSON bodies.

### Direct Port Bypass

When behind the gateway, SSE streams can buffer. The frontend detects gateway mode and hits the app's direct port for streaming endpoints:

```javascript
function directApiBase() {
    if (PREFIX && window.location.port === "8000") {
        return "http://localhost:3005";  // direct to app
    }
    return PREFIX;  // standalone mode
}
```

### App Skeleton

Every app follows an identical structure:

```
apps/appname/
├── appname.py          # Flask app + argparse CLI (serve/start/stop/status)
├── templates/
│   └── index.html      # Jinja2 template
├── static/
│   ├── app.js          # Vanilla JS, IIFE-wrapped
│   └── style.css       # Dark theme, CSS variables
└── README.md
```

No build step, no frontend frameworks, no transpilation.

## Technology Choices

| Choice | Rationale |
|--------|-----------|
| Flask | Simplicity, Jinja2 built-in, minimal boilerplate |
| SQLite | Zero config, local-first, no server process |
| Claude CLI | No API keys needed, works with Claude Max subscription |
| stdlib proxy | No nginx/traefik dependency, single Python file |
| Vanilla JS | No build step, instant page load, zero dependencies |
| SSE over WebSocket | Simpler protocol, HTTP-native, one-directional fits the use case |
| IIFE pattern | Avoids global scope pollution without module bundler |

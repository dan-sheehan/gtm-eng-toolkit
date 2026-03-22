# Design Decisions

Key architectural and technology choices, with rationale.

## Flask over FastAPI

**Decision:** Flask for all apps.

**Why:** Flask's simplicity matches the project's needs — each app is a single file with 5-10 routes. Jinja2 templating is built-in, which matters because every app serves HTML. FastAPI's async model adds complexity without benefit here: the bottleneck is Claude CLI (subprocess), not I/O concurrency. Flask's synchronous model makes the subprocess streaming code straightforward.

**Trade-off:** No automatic OpenAPI docs. Acceptable because the API surface per app is small (3-6 endpoints) and documented in READMEs.

## SQLite over Postgres

**Decision:** Each app uses its own SQLite database stored in `~/.appname/`.

**Why:** Zero configuration. No server process, no connection strings, no Docker compose. A hiring manager can `git clone && pip install && ./hub start` and have everything working. SQLite handles the concurrency model (single user, sequential requests) perfectly.

**Trade-off:** No concurrent writes across apps, no shared database queries. Acceptable because each app's data is independent — there's no cross-app JOIN that would benefit from a shared Postgres instance.

## Claude CLI over Anthropic API

**Decision:** Invoke Claude via `claude -p` subprocess rather than the Anthropic Python SDK.

**Why:** No API keys required. Works with a Claude Max subscription ($20/month personal plan). Removes the friction of environment variable setup, billing configuration, and key rotation. For a portfolio project, the setup cost of "install Claude CLI" is dramatically lower than "create an Anthropic account, generate an API key, set ANTHROPIC_API_KEY."

**Trade-off:** Can't control model parameters (temperature, max_tokens) as precisely. Subprocess spawning has higher latency than an HTTP API call. Acceptable because the use case is human-in-the-loop (user clicks "generate" and waits 10-30 seconds), not high-throughput batch processing.

## Gateway Pattern over Monolith

**Decision:** Separate Flask apps behind a stdlib reverse proxy, not one Flask app with blueprints.

**Why:** Each tool is independently deployable, testable, and restartable. A crash in one app doesn't take down others. Different tools have different dependencies — ICP Scorer needs zero AI, while Discovery needs Claude CLI with web tools. The gateway also provides a natural demo entry point (one URL for everything).

**Trade-off:** More processes to manage. Mitigated by the `hub` script that starts/stops all apps with one command.

## Vanilla JS over React/Vue

**Decision:** No frontend framework. Each app has a single `app.js` file wrapped in an IIFE.

**Why:** Zero build step. No `node_modules`, no webpack, no `npm install`. The frontend is simple enough (form → API call → render results) that a framework adds dependency overhead without meaningful productivity gain. Page load is instant because there's nothing to bundle, transpile, or hydrate.

**Trade-off:** No component reuse across apps, manual DOM manipulation. Acceptable because each app's UI is self-contained (one page, one form, one results view) and the shared CSS variables provide visual consistency.

## SSE over WebSocket

**Decision:** Server-Sent Events for streaming AI output.

**Why:** SSE is HTTP-native — works through standard proxies, needs no upgrade handshake, and is one-directional (server → client), which is exactly the streaming pattern. The gateway can proxy SSE without special handling. Implementation is simpler: `yield` lines from a generator function.

**Trade-off:** No bidirectional communication. Not needed — the client sends one POST to start generation, then receives a stream of text chunks. There's no interactive back-and-forth during generation.

## Config Files over Database Config

**Decision:** `personas.json`, `competitors.json`, `scoring_model.json` as flat files rather than database tables.

**Why:** Readable, diffable, and editable without a UI. A developer can open the JSON file, add a persona or adjust scoring weights, and the change takes effect immediately. Version control tracks config changes naturally. For a portfolio project, seeing well-structured config files in the repo communicates "this person thinks about configurability."

**Trade-off:** No runtime admin UI for config changes (except ICP Scorer's PUT endpoint). Acceptable for the current user count (one).

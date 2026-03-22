# Prompts

Browse, search, and render prompts from the markdown prompt library. Supports prompt types, tags, and variable substitution.

## Data Source

No database. Prompts are indexed from markdown files in `docs/prompts/` on each request via `cli/indexer.py`. Each `.md` file defines one or more prompts with frontmatter-style metadata (name, description, tags, variables, type).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/prompts` | List prompts (supports `?q=`, `?tag=`, `?type=`, `?offset=`, `?limit=`) |
| GET | `/api/prompts/:slug` | Get single prompt by slug |
| POST | `/api/prompts/:slug/run` | Render prompt with `{variables}` filled in |
| GET | `/api/tags` | List all tags with counts (supports `?type=` filter) |
| GET | `/api/types` | List prompt types with counts |
| GET | `/api/search?q=` | Full-text search with snippets |

## Pages

- `/` — Browse all prompts with type/tag filters
- `/prompt/:slug` — Prompt detail (view body, metadata)
- `/prompt/:slug/run` — Fill in variables and render prompt
- `/search` — Search page

## Files

| File | Purpose |
|------|---------|
| `prompts.py` | Flask server + CLI (start/stop/status/serve) |
| `cli/indexer.py` | Parses markdown files into Prompt objects |
| `cli/search.py` | Tag filtering helpers |
| `cli/config.py` | Configuration constants |
| `static/app.js` | Client-side rendering |
| `static/style.css` | Dark theme styles |
| `templates/` | index, prompt, run, search HTML templates |

## CLI

```bash
prompts start [--port 3002]   # Start background server, open browser
prompts stop                  # Stop server
prompts status                # Check if running
prompts serve --port 3002     # Run in foreground (for gateway/preview)
```

## Running

**Via gateway:** `hub start` then visit `http://localhost:8000/prompts/`

**Standalone:** `python3 apps/prompts/prompts.py serve --port 3002`

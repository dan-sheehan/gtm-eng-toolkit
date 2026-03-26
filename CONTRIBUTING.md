# Contributing

Thanks for your interest in contributing to GTM Tools.

## Adding a new app

1. Create a directory under `apps/` with your app name
2. Use Flask for the backend (`serve` CLI command with `--port` and `--prefix` args)
3. Use vanilla HTML/CSS/JS for the frontend (no build step)
4. Use SQLite for storage (store in `~/.appname/appname.db`)
5. Add a route entry in `apps/gateway/gateway.py`
6. Add a card to the hub page HTML in `gateway.py`
7. Add a launch config entry in `.claude/launch.json`
8. Add start/stop lines to `hub`
9. Update the README app table

## Conventions

- One `server.py` (or `appname.py`) per app
- `static/` for CSS and JS, `templates/` for HTML
- Use `--prefix` for path-prefix routing behind the gateway
- Keep dependencies minimal — Flask + stdlib where possible
- AI features use Claude CLI (`claude -p`) via subprocess

## Testing and linting

Before submitting a PR, make sure:

```bash
python3 -m pytest tests/ -v        # All tests pass
python3 -m ruff check apps/        # No lint issues
```

## Pull requests

- Keep PRs focused — one app or feature per PR
- Include a screenshot or description of what the app does
- Test that `make start` still works with the gateway
- Ensure tests pass and linter is clean (CI enforces both)

# Morning Brief

Automated daily dashboard that pulls weather, unread emails, calendar events, and Notion tasks into a single local web page.

## How It Works

1. Data is fetched from weather (wttr.in), Gmail (MCP), Google Calendar (MCP), and Notion tasks (MCP)
2. Results are written to `~/.morning-brief/latest.json`
3. The Flask web app reads and displays the JSON

### Fetching Data

**Recommended — `/today` slash command in Claude Code:**

```
/today
```

This runs inside the active Claude session with full MCP access. No separate auth needed.

**Alternative — `hub brief` from terminal:**

```bash
hub brief
```

This calls `fetch.sh` which spawns a `claude -p` subprocess. Requires the Claude CLI to have MCP connectors configured independently.

## Setup

### Prerequisites

- Python 3 with Flask (`pip install flask`)
- Claude CLI (`claude`) in your PATH
- MCP connectors authenticated: Gmail, Google Calendar, Notion

### View the App

**Via gateway** (with all other apps):

```bash
hub start
# Open http://localhost:8000/brief/
```

**Standalone**:

```bash
python3 apps/morning-brief/brief.py serve --port 3003
# Open http://localhost:3003
```

## Files

| File | Purpose |
|------|---------|
| `brief.py` | Flask server — serves the web UI and JSON API |
| `fetch.sh` | Shell script that invokes `claude -p` to gather data |
| `prompt.md` | Prompt template for Claude (data fetch instructions) |
| `templates/index.html` | Single-page HTML layout |
| `static/style.css` | Dark theme styles |
| `static/app.js` | Client-side rendering |

## Data Sources

| Source | Method | Auth Required |
|--------|--------|--------------|
| Weather (Seattle) | `curl wttr.in` | No |
| Gmail (unread, primary inbox only) | Gmail MCP | Yes (Google OAuth) |
| Google Calendar | GCal MCP | Yes (Google OAuth) |
| Notion tasks | Notion MCP | Yes (Notion OAuth) |

## Customization

- **Change city**: Edit `prompt.md`, replace "Seattle" with your city
- **Change email count**: Edit `prompt.md`, adjust `maxResults`
- **Change cron time**: Edit your crontab entry
- **Notion database**: The Tasks database ID is configured in `prompt.md`

## Troubleshooting

- **No data**: Run `fetch.sh` manually and check `~/.morning-brief/fetch.log`
- **MCP auth fails**: Open Claude Code interactively, use the failing MCP tool once to re-authenticate
- **`claude` not found in cron**: The script sources `~/.zshrc` — ensure `claude` is in your PATH there

## API Endpoints

- `GET /api/brief` — Returns the latest brief JSON
- `POST /api/refresh` — Triggers a background fetch

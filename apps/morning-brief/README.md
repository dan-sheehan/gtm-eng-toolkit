# GTM Signal Dashboard

Automated daily signal detection dashboard that surfaces pipeline alerts, competitive intelligence, account changes, and market signals for revenue teams.

## How It Works

1. Signals are gathered from Gmail (MCP), Google Calendar (MCP), and Notion (MCP)
2. Claude analyzes emails and events to extract GTM-relevant signals
3. Results are written to `~/.morning-brief/latest.json`
4. The Flask web app reads and displays the signals by category

## Signal Categories

| Category | What It Covers | Sources |
|----------|---------------|---------|
| **Pipeline Alerts** | Stalled deals, upcoming close dates, at-risk renewals, pricing discussions | Gmail, Calendar |
| **Competitive Signals** | Competitor mentions, win/loss reports, competitive displacements, feature launches | Gmail |
| **Account Signals** | Champion job changes, funding rounds, org restructures, hiring spikes | Gmail, Notion |
| **Market Signals** | Industry news, regulatory changes, analyst reports, market trends | Gmail |

Each signal includes a **severity level** (high/medium/low), a **title**, and a **description** with context.

### Fetching Signals

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
| `fetch.sh` | Shell script that invokes `claude -p` to gather signals |
| `prompt.md` | Prompt template for Claude (signal detection instructions) |
| `templates/index.html` | Single-page HTML layout |
| `static/style.css` | Dark theme styles |
| `static/app.js` | Client-side rendering |

## Customization

- **Signal sources**: Edit `prompt.md` to adjust Gmail search queries for your domain
- **ICP keywords**: Add industry-specific terms to the search queries in `prompt.md`
- **Severity thresholds**: Adjust the severity classification guidance in `prompt.md`
- **Signal categories**: Add or modify categories in both `prompt.md` and `app.js`
- **Notion database**: Update the data source ID in `prompt.md` for your tasks database

## Troubleshooting

- **No signals**: Run `fetch.sh` manually and check `~/.morning-brief/fetch.log`
- **MCP auth fails**: Open Claude Code interactively, use the failing MCP tool once to re-authenticate
- **`claude` not found in cron**: The script sources `~/.zshrc` — ensure `claude` is in your PATH there

## API Endpoints

- `GET /api/brief` — Returns the latest signals JSON
- `POST /api/refresh` — Triggers a background signal fetch

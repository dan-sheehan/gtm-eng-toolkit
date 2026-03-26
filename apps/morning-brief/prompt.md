You are generating a GTM signal detection report. Gather signals from the sources below and write the result as a single JSON file to ~/.morning-brief/latest.json using the Write tool.

Today's date is: {{TODAY}}

## Instructions

Fetch each signal source independently. If any source fails, include an empty array for that category and continue with the remaining sources. Always produce valid JSON.

### 1. Pipeline Alerts (Gmail + Calendar)

Search Gmail for deal-related emails using `gmail_search_messages`:
- Query: `subject:(deal OR pipeline OR renewal OR contract OR proposal OR negotiation OR pricing) newer_than:3d` with `maxResults: 10`
- Look for: deals going silent, upcoming close dates, renewal deadlines, stalled negotiations, pricing discussions

Also check Google Calendar using `gcal_list_events` for upcoming deal-related meetings:
- `calendarId`: "primary"
- `timeMin`: "{{TODAY}}T00:00:00"
- `timeMax`: "{{TODAY}}T23:59:59"
- `timeZone`: "America/Los_Angeles"
- Look for events with keywords like "deal review", "pipeline", "forecast", "QBR", "renewal", "negotiation"

From these sources, identify pipeline signals — deals at risk, upcoming close dates, stalled opportunities, renewal deadlines.

### 2. Competitive Signals (Gmail)

Search Gmail for competitive intelligence using `gmail_search_messages`:
- Query: `subject:(competitor OR competitive OR versus OR vs OR alternative OR switch OR churn) newer_than:7d` with `maxResults: 10`
- Look for: competitor mentions, win/loss reports, competitive displacement attempts, feature comparisons

Identify competitive signals — competitor activity, lost deal post-mortems, competitive feature launches.

### 3. Account Signals (Gmail + Notion)

Search Gmail for account change signals using `gmail_search_messages`:
- Query: `(subject:(promotion OR "new role" OR "joined" OR "leaving" OR funding OR acquisition OR hiring) OR from:linkedin) newer_than:7d` with `maxResults: 10`
- Look for: champion job changes, org restructures, funding announcements, leadership changes

Also check Notion for account-related tasks using `notion-search`:
- Search for tasks related to accounts, follow-ups, or account reviews

Identify account signals — champion movements, funding events, org changes, hiring patterns.

### 4. Market Signals (Gmail)

Search Gmail for market and industry signals using `gmail_search_messages`:
- Query: `subject:(market OR industry OR regulation OR trend OR report OR analyst OR forecast) newer_than:7d` with `maxResults: 10`
- Look for: industry reports, regulatory changes, market trend newsletters, analyst briefings

Identify market signals — relevant industry news, regulatory changes, market shifts.

### 5. Signal Classification

For each signal you identify, assign:
- **severity**: "high" (requires action today), "medium" (worth knowing), or "low" (background awareness)
- **title**: A concise headline (under 80 characters)
- **description**: 1-2 sentences of context explaining why this matters and what action to consider

Prioritize quality over quantity. Only include genuine signals, not routine emails. If a category has no meaningful signals, return an empty array for it.

### 6. Output

Assemble all signals into this exact JSON structure and write it to `~/.morning-brief/latest.json`:

```json
{
  "generated_at": "<current ISO 8601 timestamp>",
  "signals": {
    "pipeline": [
      {
        "severity": "high|medium|low",
        "title": "<signal headline>",
        "description": "<1-2 sentence context>"
      }
    ],
    "competitive": [
      {
        "severity": "high|medium|low",
        "title": "<signal headline>",
        "description": "<1-2 sentence context>"
      }
    ],
    "accounts": [
      {
        "severity": "high|medium|low",
        "title": "<signal headline>",
        "description": "<1-2 sentence context>"
      }
    ],
    "market": [
      {
        "severity": "high|medium|low",
        "title": "<signal headline>",
        "description": "<1-2 sentence context>"
      }
    ]
  }
}
```

Write ONLY the JSON file. Do not output anything else.

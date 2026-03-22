You are generating a morning brief. Fetch data from the sources below and write the result as a single JSON file to ~/.morning-brief/latest.json using the Write tool.

Today's date is: {{TODAY}}

## Instructions

Fetch each data source independently. If any source fails, include an `"error"` key in that section with a short explanation, and continue with the remaining sources. Always produce valid JSON.

### 1. Weather (Seattle, WA)

Run this command via Bash:
```
curl -s "wttr.in/Seattle?format=j1"
```

From the JSON response, extract:
- `current_condition[0].weatherDesc[0].value` → condition
- `current_condition[0].temp_F` → temp_f (as integer)
- `weather[0].maxtempF` → high_f (as integer)
- `weather[0].mintempF` → low_f (as integer)
- `weather[0].astronomy[0].sunset` → sunset

If curl fails or returns invalid data, set weather to `{"error": "Weather unavailable"}`.

### 2. Unread Emails (Gmail)

Use the `gmail_search_messages` tool with query `is:unread in:inbox category:primary` and `maxResults: 10`.

For each message returned, extract:
- `from`: sender name and email
- `subject`: email subject line
- `summary`: first 1-2 sentences of the email body, or the snippet if body is not available

Cap at 10 emails. If the tool fails, set emails to `{"error": "Gmail unavailable"}`.

### 3. Calendar Events (Google Calendar)

Use the `gcal_list_events` tool with:
- `calendarId`: "primary"
- `timeMin`: "{{TODAY}}T00:00:00"
- `timeMax`: "{{TODAY}}T23:59:59"
- `timeZone`: "America/Los_Angeles"

For each event, extract:
- `time`: formatted as "9:00 AM - 10:00 AM" (use start/end dateTime). For all-day events, use "All day".
- `title`: event summary
- `video_link`: hangout link, Google Meet link, or Zoom link from the event (null if none)

If the tool fails, set calendar to `{"error": "Calendar unavailable"}`.

### 4. Notion Tasks Due Today

Use the `notion-search` tool to search the Tasks database for tasks due today.

The Tasks database data source ID is: `collection://13ece276-b687-457c-b6f1-480692ba8b5a`

Search for tasks and then use `notion-fetch` on the database URL `https://www.notion.so/f317ee8fb2f4407aa54144c7225d3dc3` to get current tasks. Filter for tasks where:
- Due Date matches today ({{TODAY}})
- Status is NOT "Done"

For each matching task, extract:
- `title`: Task name
- `status`: Status value (e.g., "To Do", "In Progress", "Waiting")
- `priority`: Priority value (e.g., "High", "Medium", "Low")
- `project`: Project value (e.g., "Personal", "Work", "Career")

If the tool fails or no tasks match, set tasks to an empty array `[]`.

### 5. Output

Assemble all sections into this exact JSON structure and write it to `~/.morning-brief/latest.json`:

```json
{
  "generated_at": "<current ISO 8601 timestamp>",
  "weather": {
    "location": "Seattle, WA",
    "condition": "<condition text>",
    "temp_f": <integer>,
    "high_f": <integer>,
    "low_f": <integer>,
    "sunset": "<time string>"
  },
  "emails": [
    {
      "from": "<sender>",
      "subject": "<subject>",
      "summary": "<one-line summary>"
    }
  ],
  "calendar": [
    {
      "time": "<formatted time range>",
      "title": "<event title>",
      "video_link": "<url or null>"
    }
  ],
  "tasks": [
    {
      "title": "<task name>",
      "status": "<status>",
      "priority": "<priority>",
      "project": "<project>"
    }
  ]
}
```

Write ONLY the JSON file. Do not output anything else.

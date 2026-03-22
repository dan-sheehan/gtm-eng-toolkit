# Outbound Email Helper

AI-powered email cadence generator that produces persona-targeted, multi-touch outbound sequences with A/B subject variants. Combines company research with persona pain points to generate emails that feel hand-written.

## GTM Workflow

Automates the most time-consuming SDR/AE workflow — researching a prospect's company, mapping their likely pain points to your value props, and writing a multi-touch email sequence. Supports persona-based messaging (VP Sales, Head of RevOps, Founder, SDR) with configurable touch counts and angle progression (problem-aware → solution-aware → social proof → direct ask → breakup).

## How It Works

1. User enters a company URL, prospect details, and selects a persona and touch count (3-6)
2. Persona config from `personas.json` injects pain points, tone, and value props into the prompt
3. Claude CLI researches the company via web search and generates a tailored email sequence
4. Each email has a unique angle; email 1 includes an A/B subject line variant for testing
5. Results stream via SSE with copy-to-clipboard on each email card

## Example Output

```json
{
  "company_name": "Acme Corp",
  "emails": [
    {
      "type": "initial",
      "angle": "problem-aware",
      "subject": "Pipeline visibility at Acme",
      "subject_variant": "Quick question about your forecasting process",
      "body": "Hi Sarah,\n\nNoticed Acme just closed a Series B..."
    },
    {
      "type": "follow_up_1",
      "angle": "social proof",
      "subject": "How [Similar Company] solved this",
      "body": "Sarah — wanted to share a quick example..."
    }
  ],
  "persona_match": "Matched to VP Sales persona — metric-driven tone, focused on pipeline visibility and forecast accuracy"
}
```

## Business Impact

Reduces email sequence creation from 45+ minutes of research and writing to under 3 minutes — generates personalized, persona-targeted cadences with A/B variants ready for immediate use.

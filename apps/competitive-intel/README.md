# Competitive Intel

AI-powered competitive analysis tool that generates battlecards, general intelligence reports, and head-to-head comparisons. Supports configurable competitor profiles and three analysis modes optimized for different sales scenarios.

## GTM Workflow

Powers the competitive enablement workflow — when a rep encounters a competitor in a deal, they need instant access to positioning, feature comparisons, landmine questions, and win/loss patterns. This tool generates structured battlecards with a feature matrix, objection handling, and pricing intelligence that sales teams typically maintain in static wikis.

## How It Works

1. User selects a target company and analysis type (general, battlecard, or comparison)
2. For battlecards: competitor profiles from `competitors.json` inject known strengths/weaknesses into the prompt
3. Claude CLI researches the company via web search and produces structured analysis
4. Results render into type-specific views — battlecards show feature matrices and landmine questions, general shows key updates and positioning
5. Reports are saved to SQLite and exportable as markdown

## Example Output (Battlecard)

```json
{
  "positioning_comparison": {
    "them": "Revenue intelligence platform focused on call recording and deal analytics",
    "counter": "We provide end-to-end pipeline visibility, not just conversation capture"
  },
  "feature_matrix": [
    { "feature": "Call Recording", "us": "Basic", "them": "Advanced AI", "verdict": "loss" },
    { "feature": "Pipeline Analytics", "us": "Full funnel", "them": "Deal-level only", "verdict": "win" }
  ],
  "landmine_questions": [
    {
      "question": "How do you handle pipeline forecasting beyond the conversation layer?",
      "context": "Exposes their gap in full-funnel visibility",
      "expected_response": "They'll pivot to partnership integrations"
    }
  ]
}
```

## Business Impact

Reduces competitive research from hours of Googling to a 2-minute structured analysis — gives reps battlecard-quality intel on demand instead of waiting for product marketing updates.

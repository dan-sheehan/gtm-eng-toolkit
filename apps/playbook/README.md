# Onboarding Playbook Generator

AI-powered generator that produces structured customer onboarding playbooks tailored to product type, customer segment, and timeline. Includes segment-specific templates and milestone-based health scoring.

## GTM Workflow

Bridges the gap between closed-won and first value — the most critical window for churn prevention. Generates playbooks with segment-appropriate timelines (SMB: 14/30/60 days, Mid-Market: 30/60/90, Enterprise: 30/60/90/120), milestone tracking, and health scores that flag at-risk onboardings before they stall.

## How It Works

1. User selects a customer segment and describes the product
2. Segment template injects timeline, touch frequency, and escalation thresholds into the prompt
3. Claude CLI generates a structured playbook with milestones, owner roles, and success criteria
4. Output streams to the browser via SSE with real-time markdown rendering
5. Health score endpoint computes weighted milestone completion (pure Python, no AI)

## Example Output

```json
{
  "score": 72,
  "grade": "B",
  "at_risk": false
}
```

Segment templates:

| Segment | Timeline | Touch Frequency | Escalation |
|---------|----------|-----------------|------------|
| SMB | 14/30/60 days | Weekly | Day 21 if < 50% |
| Mid-Market | 30/60/90 days | Bi-weekly | Day 45 if < 40% |
| Enterprise | 30/60/90/120 days | Weekly + QBR | Day 60 if < 30% |

## Business Impact

Reduces playbook creation from 2-3 hours of manual work to under 2 minutes — ensures every customer gets a segment-appropriate onboarding plan with built-in risk detection.

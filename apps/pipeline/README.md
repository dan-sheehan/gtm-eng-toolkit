# Pipeline Dashboard

Deal tracking and pipeline analytics dashboard with funnel visualization, weighted pipeline metrics, and stage conversion analysis. Pure CRUD + metrics computation — no AI required.

## GTM Workflow

Provides the single-pane-of-glass view that sales leaders check daily — total pipeline value, weighted pipeline (probability-adjusted), average deal size, and win rate. The funnel visualization shows where deals are stacking up and the stage-level metrics reveal bottlenecks (e.g., deals stuck in proposal for 20+ days).

## How It Works

1. Deals are added manually or loaded from seed data
2. Each deal has: company, contact, value, stage, days in stage, expected close date
3. Metrics endpoint computes: total pipeline, weighted pipeline (stage × probability), avg deal size, win rate, stage counts, avg days per stage
4. Funnel renders proportional bars by stage value
5. Deals table supports stage filtering and inline deletion

Stage weights for weighted pipeline:
- Prospecting: 10%
- Discovery: 25%
- Proposal: 50%
- Negotiation: 75%
- Closed Won: 100%
- Closed Lost: 0%

## Example Output

```json
{
  "total_pipeline": 697000,
  "weighted_pipeline": 312750,
  "avg_deal_size": 87125,
  "win_rate": 40,
  "open_deals": 8,
  "stage_summary": [
    {"stage": "prospecting", "count": 2, "value": 113000},
    {"stage": "discovery", "count": 3, "value": 335000},
    {"stage": "proposal", "count": 2, "value": 107000},
    {"stage": "negotiation", "count": 3, "value": 395000}
  ]
}
```

## Business Impact

Gives sales leaders instant pipeline visibility without CRM login — surfaces deal velocity and conversion bottlenecks that drive forecast accuracy.

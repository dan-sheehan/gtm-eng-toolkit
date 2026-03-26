# GTM Workflows

How the tools map to the revenue lifecycle and connect into end-to-end workflows.

## Revenue Lifecycle Coverage

```
 PROSPECTING     DISCOVERY      QUALIFICATION    OUTREACH       CLOSE         ONBOARD       RETAIN
 ┌──────────┐   ┌──────────┐   ┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
 │ICP Scorer│──>│Discovery │──>│Competitive  │──>│Outbound  │──>│Pipeline  │──>│Playbook  │──>│Morning   │
 │Enrichment│   │Call Prep │   │Intel        │  │Email     │  │Dashboard │  │Generator │  │Brief     │
 └──────────┘   └──────────┘   └─────────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
   Score &        Research       Battlecards      Persona-based  Track deals   Segment-      Signal
   qualify        company &      & competitive    multi-touch    & pipeline    specific      detection
   accounts       prospect       positioning      cadences       metrics       onboarding    & alerts
```

## Workflow Chains

### 1. New Account Prospecting

**Trigger:** Marketing provides a list of target accounts.

1. **ICP Scorer** — Score each account against your ICP dimensions. Filter to A/B grades only.
2. **Enrichment** — Run multi-step enrichment on qualified accounts to gather company intel, tech stack, and news signals.
3. **Discovery Call Prep** — For accounts that accept a meeting, generate a Discovery Brief with competitive context and tailored questions.

**Handoff:** AE walks into the discovery call with a structured brief and informed questions.

### 2. Competitive Deal

**Trigger:** Prospect mentions evaluating a competitor.

1. **Competitive Intel** (Battlecard mode) — Generate a battlecard with feature matrix, landmine questions, and win/loss patterns.
2. **Discovery Call Prep** — Refresh the company brief with competitive landscape emphasis.
3. **Outbound Email** — Generate follow-up emails using the "social proof" angle with competitive differentiation messaging.

**Handoff:** Rep has specific talk tracks, questions to plant doubt, and email templates ready.

### 3. Outbound Sequence

**Trigger:** SDR identifies a target account and contact.

1. **ICP Scorer** — Verify the account is A/B grade before investing time.
2. **Discovery Call Prep** — Research the company and prospect for personalization signals.
3. **Outbound Email** — Select the matching persona (VP Sales, Head of RevOps, etc.) and generate a 4-6 touch cadence with A/B subject lines.

**Handoff:** SDR has a ready-to-send sequence with personalized hooks from real company research.

### 4. Deal Progression

**Trigger:** Deal moves from Discovery to Proposal.

1. **Pipeline Dashboard** — Update deal stage, monitor days-in-stage for stalling.
2. **Competitive Intel** (Comparison mode) — If multiple vendors, generate a head-to-head comparison.
3. **Morning Brief** — Daily signal detection surfaces deal risks (champion going silent, competitor mentions in email).

**Handoff:** Manager has visibility into deal health; rep gets early warning on risks.

### 5. Post-Close Onboarding

**Trigger:** Deal moves to Closed Won.

1. **Playbook Generator** — Select the customer segment (SMB/Mid-Market/Enterprise) and generate a structured onboarding playbook with milestones and success criteria.
2. **Morning Brief** — Signal detection monitors for churn signals and expansion opportunities during the onboarding window.
3. **Pipeline Dashboard** — Track downstream expansion deals from successful onboardings.

**Handoff:** CS team gets a segment-appropriate playbook; signals surface before at-risk onboardings stall.

## Tool-to-Stage Matrix

| Tool | Prospecting | Discovery | Qualification | Outreach | Close | Onboard | Retain |
|------|:-----------:|:---------:|:-------------:|:--------:|:-----:|:-------:|:------:|
| ICP Scorer | **Primary** | | | | | | |
| Enrichment | **Primary** | Secondary | | | | | |
| Discovery Call Prep | | **Primary** | Secondary | | | | |
| Competitive Intel | | | **Primary** | Secondary | | | |
| Outbound Email | | | | **Primary** | | | |
| Pipeline Dashboard | | | | | **Primary** | | Secondary |
| Playbook Generator | | | | | | **Primary** | |
| Morning Brief | | | | | Secondary | Secondary | **Primary** |
| Prompt Builder | Supporting | Supporting | Supporting | Supporting | | | |

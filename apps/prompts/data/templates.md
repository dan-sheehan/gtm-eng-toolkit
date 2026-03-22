# Reusable Frameworks & Templates

> General-purpose, company-agnostic templates. Copy/paste and adapt.

---

## 1. Executive Update (Weekly / Biweekly)

**Use when:** keeping stakeholders aligned without dragging them into details.

Tags: communication

```
Subject: [Project/Area] — [Week of Date] Update

TL;DR (1–2 bullets):
- …

What changed since last update:
- …

Progress (wins / completed):
- …

Current focus (next 5–10 days):
- …

Risks / blockers (and what we need):
- Risk: …
- Ask: …

Decisions needed (if any):
- Decision: …
- Options: …
- Recommendation: …
- Deadline: …

Links / artifacts:
- …
```

---

## 2. Ask Email (High-response-rate request)

**Use when:** you need someone to do something and want fast compliance.

Tags: communication

```
Subject: Quick ask: [Action] by [Date]

Hi [Name] — quick ask.

What I need: [specific action]
Why it matters: [1 sentence]
Context: [2–4 bullets max]
Deadline: [date/time + timezone]
Output format: [what "done" looks like]

Thanks — happy to jump on a 10-min call if easier.
```

---

## 3. Meeting Agenda (30/45/60 minutes)

**Use when:** preventing meetings from becoming vague discussion.

Tags: meetings, planning

```
Title: [Meeting name] — [Date]

Objective: (one sentence)
Desired outcome: (decision / plan / alignment / review)
Pre-reads: (links)

Attendees + roles:
- Driver:
- Decision-maker:
- Contributors:

Agenda:
1. Context (5 min)
2. Review options (10 min)
3. Discussion + risks (10–20 min)
4. Decision / next steps (5–10 min)

Decision(s) required: (explicit)

Notes:

Action items:
- [Owner] — [task] — [deadline]
```

---

## 4. Decision Memo (1–2 pages)

**Use when:** decision is important enough to write down once.

Tags: decision-making, documentation

```
1. Decision to make
2. Background / context
3. Goals / success criteria
4. Constraints (time, budget, people, technical)
5. Options considered
   - Option A: pros/cons, cost, risk
   - Option B: pros/cons, cost, risk
6. Recommendation
7. Rationale (why this option wins)
8. Risks + mitigations
9. Rollout plan
10. Owner + timeline
11. Open questions
```

---

## 5. Two-Way Door vs One-Way Door Decision Filter

**Use when:** deciding whether to move fast or slow.

Tags: decision-making

```
Classify decision:
- Two-way door: reversible, low blast radius → decide quickly, bias to action
- One-way door: hard to reverse, high blast radius → slow down, document, align

Checklist:
- [ ] Reversible within 1–2 weeks?
- [ ] Customer impact easily contained?
- [ ] Costs recoverable?
- [ ] Requires migration or permanent data changes?
```

---

## 6. Root Cause Analysis (RCA)

**Use when:** incidents recur or reliability matters.

Tags: engineering, analysis

```
Summary: what happened + impact
Timeline: key events (timestamps)
Detection: how we noticed, time-to-detect
Root cause: (single sentence)

Contributing factors:
- …

What went well:
- …

What went poorly:
- …

Corrective actions:
- Immediate mitigation:
- Long-term fix:
- Prevent recurrence:

Owners + deadlines:
Follow-up validation plan:
```

---

## 7. Pre-mortem (Risk discovery before launch)

**Use when:** launching something important and want to avoid surprises.

Tags: planning, analysis

```
Prompt: "It's 3 months after launch and this failed. Why?"

Failure modes (list 10–20):
- …

Top 5 risks (ranked):
1. …

Mitigations per risk:
- Mitigation:
- Owner:
- Trigger metric:

No-go criteria: (conditions under which we pause)
Monitoring plan: (metrics + alerts)
```

---

## 8. Problem Statement (for alignment)

**Use when:** teams are jumping to solutions.

Tags: planning, analysis

```
Problem: (what is happening)
Who is affected: (personas / segments)
Impact: (time, money, quality, risk)
Evidence: (data points, examples)
Root cause hypothesis: (optional)
Constraints: (must-haves)
Non-goals: (explicit)
Success metrics: (how we'll know it's fixed)
```

---

## 9. 80/20 Analysis

**Use when:** you need direction fast without perfect data.

Tags: planning, analysis

```
1. Define the decision you're trying to make
2. Identify the top 3 drivers
3. Pick proxy metrics
4. Collect "good enough" data quickly
5. Decide + commit
6. Instrument for correction
7. Revisit at a fixed checkpoint
```

---

## 10. Prioritization Matrix (Effort x Impact x Confidence)

**Use when:** backlog is too big.

Tags: planning

```
Score each item 1–5:
- Impact: how much value if successful?
- Effort: time/complexity
- Confidence: how sure we are?

Priority score: (Impact × Confidence) / Effort

Bucket:
- Do now: high score
- Plan: medium
- Kill / defer: low
```

---

## 11. One-Pager Project Plan

**Use when:** need clarity without heavyweight PM.

Tags: planning

```
Goal:
Why now:
Scope:
- In scope:
- Out of scope:
Milestones:
Dependencies:
Risks:
Owner(s):
Metrics:
Comms plan:
Next step:
```

---

## 12. Feedback Framework (SBI)

**Use when:** giving feedback that improves outcomes.

Tags: people

```
Situation: when/where
Behavior: what happened (observable)
Impact: effect on outcome/team

Then:
- Request: what you want instead
- Support: how you'll help
- Check: ask for their view
```

---

## 13. Triage Template (When things are on fire)

**Use when:** issue is unclear and time matters.

Tags: engineering, operations

```
1. What's broken? (symptoms)
2. Severity: (customer impact)
3. What changed recently?
4. Fast containment option
5. Rollback option
6. Owner assignments
7. Next update time
```

---

## 14. Stakeholder Alignment Checklist

**Use when:** about to ship something cross-functional.

Tags: planning, communication

```
- [ ] Who can block this?
- [ ] Who will be surprised by this?
- [ ] Who will have to support this later?
- [ ] Who owns adjacent systems?
- [ ] Who needs to approve messaging/legal/security?
- [ ] What's the "default yes" path?
```

---

## 15. Launch Readiness Review

**Use when:** you need a final go/no-go decision before release.

Tags: product

```
Launch: [name]
Release date: [date/time]
Owner: [name]

Scope:
- In release:
- Out of release:

Readiness checks:
- [ ] Engineering complete
- [ ] QA sign-off
- [ ] Monitoring/alerts configured
- [ ] Support enablement complete
- [ ] Docs/changelog prepared
- [ ] Rollback plan tested

Open risks:
- Risk:
- Mitigation:
- Owner:

Decision:
- Go / No-go
- Conditions (if any):
```

---

## 16. Experiment Plan (A/B or Pilot)

**Use when:** validating an idea before full rollout.

Tags: product

```
Hypothesis:
If we [change], then [audience] will [outcome], measured by [metric].

Experiment design:
- Variant A:
- Variant B:
- Population:
- Duration:
- Success threshold:

Guardrails:
- Metric:
- Stop condition:

Analysis plan:
- Primary metric:
- Secondary metrics:
- Segments:

Decision rule:
- Ship / iterate / stop
```

---

## 17. Post-Launch Review

**Use when:** capturing lessons and outcomes 1-4 weeks after launch.

Tags: product, analysis

```
Launch:
Date:
Owner:

Expected outcomes:
- ...

Actual outcomes:
- ...

Metric impact:
- KPI 1 (target vs actual):
- KPI 2 (target vs actual):

What worked:
- ...

What didn't:
- ...

Follow-up actions:
- [Owner] [Task] [Due date]
```

---

## 18. KPI Definition Sheet

**Use when:** avoiding metric confusion across teams.

Tags: analysis, planning

```
Metric name:
Business question it answers:
Definition:
Formula:
Data source(s):
Update cadence:
Owner:
Primary audience:

Segments/breakdowns:
- ...

Known caveats:
- ...

Related metrics:
- Leading:
- Lagging:
```

---

## 19. Customer Interview Script

**Use when:** collecting reliable qualitative insights.

Tags: analysis

```
Research goal:
Participant profile:
Duration:

Intro (1 min):
- Thank you + purpose
- Consent + recording permission

Warm-up questions:
1. ...
2. ...

Core questions:
1. Tell me about the last time you...
2. What was hardest about...
3. What did you try before...
4. How did that affect...
5. If you could wave a magic wand...

Wrap-up:
- Anything we missed?
- Follow-up permission?
```

---

## 20. Win/Loss Debrief

**Use when:** understanding why deals or opportunities were won/lost.

Tags: analysis

```
Opportunity:
Result: Win / Loss
Date:
Owner:

Customer context:
- Segment:
- Use case:
- Priority problem:

Decision factors (ranked):
1.
2.
3.

What helped us:
- ...

What hurt us:
- ...

Actions to improve:
- [Owner] [Action] [Due date]
```

---

## 21. Product Requirement Brief (PRD-lite)

**Use when:** kicking off a feature with clear scope and constraints.

Tags: product, planning

```
Feature:
Owner:
Status:

Problem:
Users affected:
Goal/outcome:

Scope:
- Must-have:
- Nice-to-have:
- Out of scope:

Requirements:
1.
2.
3.

Success metrics:
- ...

Dependencies:
- ...

Risks:
- ...
```

---

## 22. User Story + Acceptance Criteria

**Use when:** translating ideas into implementable tasks.

Tags: product, engineering

```
User story:
As a [persona], I want [capability], so that [benefit].

Acceptance criteria:
- [ ] Given [context], when [action], then [expected result]
- [ ] Given ...
- [ ] Given ...

Edge cases:
- ...

Non-functional requirements:
- Performance:
- Security/privacy:
- Accessibility:
```

---

## 23. QA Test Plan

**Use when:** ensuring critical paths are covered before release.

Tags: engineering

```
Feature/build:
Test owner:
Environment:

Test scope:
- In scope:
- Out of scope:

Test matrix:
- Platform/browser:
- Account types/roles:
- Data scenarios:

Core test cases:
1.
2.
3.

Regression checks:
- ...

Exit criteria:
- [ ] Critical defects resolved
- [ ] High-severity issues accepted/waived
- [ ] Sign-off complete
```

---

## 24. Bug Report (High-signal)

**Use when:** filing issues that engineering can reproduce quickly.

Tags: engineering

```
Title:
Severity:
Environment:

Summary:
Expected behavior:
Actual behavior:

Steps to reproduce:
1.
2.
3.

Repro rate: [x/y]

Evidence:
- Screenshot/video:
- Logs:
- Error IDs:

Impact:
- Who is affected:
- Workaround:
```

---

## 25. Incident Communication Update

**Use when:** sending clear status updates during outages/incidents.

Tags: communication, engineering

```
Incident: [name/id]
Status: Investigating / Identified / Monitoring / Resolved
Last updated: [timestamp + timezone]

Impact:
- Affected users/systems:
- Start time:

What we know:
- ...

What we're doing now:
- ...

Next update by:
- [timestamp + timezone]

Workaround (if any):
- ...
```

---

## 26. Service Ownership Runbook

**Use when:** documenting how to operate and recover a service.

Tags: operations, engineering

```
Service name:
Owner team:
Primary on-call:

Purpose:
Dependencies:

SLOs/SLIs:
- Availability:
- Latency:
- Error rate:

Dashboards/alerts:
- ...

Common failure modes:
1. Symptom:
   Likely cause:
   First actions:

Escalation:
- Level 1:
- Level 2:
- External contacts:
```

---

## 27. Risk Register Template

**Use when:** tracking delivery/operational risks over time.

Tags: planning, analysis

```
Risk ID:
Description:
Category: Product / Technical / Operational / Legal / Financial
Likelihood: Low / Medium / High
Impact: Low / Medium / High

Early warning signals:
- ...

Mitigation plan:
- ...

Contingency plan:
- ...

Owner:
Review date:
Status: Open / Monitoring / Closed
```

---

## 28. Dependency Mapping Template

**Use when:** multiple teams/systems must line up for delivery.

Tags: planning

```
Project:
Owner:

Dependency list:
1. Dependency:
   Type: Team / System / Vendor
   Needed by:
   External owner:
   Status: Not started / In progress / Done
   Risk if late:

Critical path:
- ...

Escalation triggers:
- ...
```

---

## 29. Weekly Planning Template

**Use when:** aligning focus and commitments for the week.

Tags: planning

```
Week of:
Owner:

Top 3 outcomes:
1.
2.
3.

Committed deliverables:
- [Deliverable] [Owner] [Due day]

Carryover from last week:
- ...

Risks/blockers:
- ...

Support needed:
- ...
```

---

## 30. Quarterly Planning Narrative

**Use when:** defining priorities for the next quarter.

Tags: planning

```
Quarter:
Team/Org:
Theme:

Where we are now:
- ...

Top objectives (3-5):
1. Objective:
   Why it matters:
   KPI target:

Major bets/projects:
- ...

Tradeoffs and deprioritized work:
- ...

Capacity assumptions:
- Headcount:
- Budget:

Key risks:
- ...
```

---

## 31. Team Retrospective Template

**Use when:** turning a sprint/project retro into concrete improvements.

Tags: meetings

```
Period reviewed:
Facilitator:

What went well:
- ...

What was painful:
- ...

Root causes:
- ...

What to change next cycle:
- ...

Action items:
- [Owner] [Change] [Due date]
```

---

## 32. 1:1 Agenda Template

**Use when:** making manager-report check-ins more productive.

Tags: meetings, people

```
Date:
Manager:
Direct report:

Check-in:
- Energy level:
- Wins since last 1:1:

Discussion topics:
1.
2.
3.

Support needed:
- ...

Career/development:
- ...

Actions before next 1:1:
- [Owner] [Action]
```

---

## 33. Delegation Brief

**Use when:** handing off ownership while keeping quality high.

Tags: people

```
Task/project:
Delegate:
Deadline:

Outcome expected:
- ...

Context:
- Why this matters:
- Constraints:

Decision boundaries:
- You can decide:
- You must escalate:

Resources:
- Docs:
- Stakeholders:

Checkpoints:
- Date:
- Expected artifact:
```

---

## 34. Handoff Note Template

**Use when:** transferring work between people or teams.

Tags: operations

```
Handoff from:
Handoff to:
Date:

Current state:
- Completed:
- In progress:
- Not started:

Important context:
- ...

Open decisions:
- ...

Risks/watch-outs:
- ...

Next recommended actions:
1.
2.
3.
```

---

## 35. Hiring Interview Scorecard

**Use when:** standardizing interview feedback and reducing bias.

Tags: people

```
Candidate:
Role:
Interviewer:
Interview type:

Rubric (1-5):
- Problem solving:
- Communication:
- Role-specific competency:
- Collaboration:
- Growth potential:

Evidence/examples:
- ...

Concerns:
- ...

Final recommendation:
- Strong hire / Hire / No hire / Strong no hire
```

---

## 36. Onboarding Plan (First 30/60/90)

**Use when:** giving new hires a clear ramp path.

Tags: people

```
New hire:
Role:
Manager:
Start date:

0-30 days:
- Learn:
- Build relationships:
- Deliver:

31-60 days:
- Own:
- Improve:
- Deliver:

61-90 days:
- Lead:
- Scale:
- Deliver:

Success signals by day 90:
- ...
```

---

## 37. Performance Support Plan

**Use when:** clarifying expectations and support for someone struggling.

Tags: people

```
Employee:
Role:
Manager:
Plan period:

Areas to improve:
1.
2.

Expected behaviors/outcomes:
- ...

Support provided:
- Coaching:
- Resources:
- Check-ins:

Milestones:
- [Date] [Expectation]

Review outcome criteria:
- Met expectations / Partial / Not met
```

---

## 38. Vendor Evaluation Matrix

**Use when:** comparing tools/providers objectively.

Tags: operations, analysis

```
Need/problem:
Options evaluated:
- Vendor A
- Vendor B
- Vendor C

Criteria (weight):
- Fit to requirements (%):
- Security/compliance (%):
- Total cost (%):
- Implementation effort (%):
- Support/reliability (%):

Scores:
- Vendor A:
- Vendor B:
- Vendor C:

Recommendation:
Rationale:
Open risks:
```

---

## 39. Procurement Business Case

**Use when:** requesting budget approval for software/services.

Tags: operations

```
Request:
Owner:
Amount:
Term:

Business problem:
- ...

Why now:
- ...

Expected ROI:
- Time saved:
- Revenue impact:
- Risk reduction:

Alternatives considered:
- Build:
- Buy:
- Do nothing:

Recommendation:
Approval needed by:
```

---

## 40. Pricing Change Review

**Use when:** evaluating a pricing/packaging update.

Tags: product, analysis

```
Proposed change:
Effective date:
Owner:

Objective:
- ...

Affected segments:
- ...

Expected impact:
- Conversion:
- Retention/churn:
- ARPA/ARR:

Risks:
- ...

Mitigations:
- ...

Rollout plan:
- Pilot?
- Full launch?
```

---

## 41. Feature Request Intake

**Use when:** collecting requests in a form that supports prioritization.

Tags: product

```
Requester:
Date:
Feature request:

Problem to solve:
- ...

Who is affected:
- Segment:
- Count/frequency:

Current workaround:
- ...

Business impact:
- Revenue:
- Efficiency:
- Risk/compliance:

Urgency:
- Deadline/event:

Supporting evidence:
- Tickets:
- Calls:
- Metrics:
```

---

## 42. Change Management Announcement

**Use when:** communicating process/system changes to internal teams.

Tags: communication, operations

```
Subject: Upcoming change: [System/Process] on [Date]

What is changing:
- ...

Why we are changing it:
- ...

Who is impacted:
- ...

What you need to do:
1.
2.
3.

Timeline:
- Key dates:

Support:
- Docs/training:
- Contact/help channel:
```

---

## 43. Knowledge Base Article Template

**Use when:** documenting repeatable answers for internal or customer support.

Tags: documentation

```
Title:
Audience:
Last updated:
Owner:

Summary:
- ...

When to use this article:
- ...

Steps:
1.
2.
3.

Troubleshooting:
- Symptom:
- Cause:
- Fix:

Related links:
- ...
```

---

## 44. Executive Decision Log Entry

**Use when:** recording high-impact decisions for auditability and context.

Tags: decision-making, documentation

```
Decision ID:
Date:
Decision owner:
Decision-makers:

Decision made:
- ...

Context:
- ...

Options considered:
- Option A:
- Option B:

Why this decision:
- ...

Implications:
- Team/process impact:
- Customer impact:

Review date:
```

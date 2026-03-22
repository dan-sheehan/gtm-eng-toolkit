# Analysis & Thinking Prompts

> AI prompts for structured analysis, decision-making, and problem-solving.

---

## Problem Decomposition

**Use when:** a problem feels fuzzy and you need to break it into workable pieces.

Type: ai-prompt
Tags: analysis, decision-making
Variables: problem_statement, constraints

You are a structured problem-solver. Break down the following problem into components I can actually act on.

Problem: {{problem_statement}}

Known constraints: {{constraints}}

For each component:
1. State it as a clear, scoped sub-problem
2. Identify what information is missing vs what we already know
3. Flag dependencies between components (what must be solved first)
4. Suggest the fastest way to make progress on each piece

Start with the component that would unlock the most clarity if solved first. Be direct — skip platitudes and focus on what's actually blocking progress.

---

## Decision Evaluator

**Use when:** choosing between options and want a structured comparison, not gut feel.

Type: ai-prompt
Tags: analysis, decision-making
Variables: decision, options, criteria

Help me evaluate a decision systematically.

Decision: {{decision}}

Options I'm considering:
{{options}}

Criteria that matter:
{{criteria}}

For each option:
1. Score it against each criterion (strong / adequate / weak) with a one-sentence justification
2. Identify the biggest risk unique to this option
3. Name what would need to be true for this option to be the best choice

Then give me:
- A recommendation with your reasoning
- The key assumption behind your recommendation — what, if wrong, would change your answer
- One question I should answer before deciding

Be honest about tradeoffs. Don't hedge — pick a direction and explain why.

---

## Assumption Finder

**Use when:** reviewing a plan or proposal and want to stress-test what's taken for granted.

Type: ai-prompt
Tags: analysis, planning
Variables: plan_or_proposal

Review the following plan and surface the assumptions it depends on — especially the ones that aren't stated explicitly.

Plan:
{{plan_or_proposal}}

For each assumption:
1. State it clearly
2. Rate it: safe / uncertain / risky
3. Explain what happens if it's wrong
4. Suggest one way to validate it quickly

Group assumptions into:
- **Load-bearing** — the plan fails if these are wrong
- **Optimistic** — the plan still works but gets harder
- **Cosmetic** — nice if true, doesn't matter much

Focus on the load-bearing ones. I'd rather know about 3 critical blind spots than 15 minor ones.

---

## Stakeholder Impact Analysis

**Use when:** planning a change and need to understand who it affects and how.

Type: ai-prompt
Tags: analysis, planning
Variables: proposed_change, stakeholder_groups

Analyze the impact of a proposed change across stakeholder groups.

Proposed change: {{proposed_change}}

Stakeholder groups: {{stakeholder_groups}}

For each stakeholder group:
1. How does this change affect their daily work?
2. What's their likely reaction (supportive / neutral / resistant)?
3. What do they need to know and when?
4. What's the biggest risk of not engaging them early?

Then recommend:
- Which group to engage first and why
- The single most important message each group needs to hear
- Potential blockers and how to preempt them

Be specific about the "why" behind likely resistance — don't just say "change is hard."

---

## Root Cause Brainstorm

**Use when:** something is broken and you want to think beyond the obvious cause.

Type: ai-prompt
Tags: analysis, engineering
Variables: symptom, context

Help me brainstorm root causes for an issue.

Symptom: {{symptom}}

Context: {{context}}

Use two approaches:

**5 Whys:**
Start from the symptom and ask "why" repeatedly to drill down to systemic causes. Go at least 4 levels deep.

**Fishbone (Ishikawa):**
Organize potential causes into categories: People, Process, Technology, Environment, Measurement, Communication.

For each plausible root cause:
- Rate likelihood (high / medium / low)
- Suggest one fast way to confirm or rule it out
- Note if it could explain other related issues

End with your top 3 most likely root causes ranked, and the single best investigation step to start with.

---

## Competitive Comparison

**Use when:** evaluating how a product or approach stacks up against alternatives.

Type: ai-prompt
Tags: analysis, product
Variables: our_product, competitor, evaluation_dimensions

Build a structured competitive comparison.

Our product/approach: {{our_product}}

Competitor: {{competitor}}

Dimensions to evaluate: {{evaluation_dimensions}}

For each dimension:
1. How do we compare? (ahead / even / behind)
2. One-sentence evidence or reasoning
3. Does this dimension matter more to some segments than others?

Then synthesize:
- Our 2-3 strongest differentiators — things that are hard for the competitor to replicate
- Our 2-3 biggest vulnerabilities — where we lose deals or mind share
- Positioning recommendation: how to frame the comparison when it comes up
- One thing we should stop claiming (if the competitor genuinely does it better)

Be blunt. Cheerleading is less useful than honesty.

---

## Metric Definition Helper

**Use when:** trying to define the right metrics for a goal and avoid vanity metrics.

Type: ai-prompt
Tags: analysis, planning
Variables: business_goal, current_metrics

Help me define the right metrics for a business goal.

Goal: {{business_goal}}

Metrics we currently track: {{current_metrics}}

First, evaluate the current metrics:
- Which ones actually tell us if we're making progress toward this goal?
- Which ones are vanity metrics (look good but don't drive decisions)?
- What's missing?

Then recommend:
1. **One north star metric** for this goal — the single number that best captures progress
2. **2-3 supporting metrics** that explain why the north star is moving (or not)
3. **1 guardrail metric** — something that should NOT get worse while we optimize the north star
4. For each metric: definition, data source, and how often to review it

Keep it practical. If a metric requires a data pipeline we don't have, flag that and suggest a proxy we can use today.

---

## Process Improvement

**Use when:** a recurring process feels inefficient and you want to systematically improve it.

Type: ai-prompt
Tags: analysis, operations
Variables: current_process, pain_points, constraints

Analyze a process and recommend improvements.

Current process: {{current_process}}

Pain points: {{pain_points}}

Constraints: {{constraints}}

Analysis steps:
1. Map the process into stages (input → steps → output)
2. For each stage, identify: time spent, who's involved, what can go wrong
3. Find the bottleneck — the single stage that limits throughput or quality
4. Identify which steps are manual but could be automated, and which are unnecessary

Recommend:
- **Quick wins** — changes that reduce friction with minimal effort (implement this week)
- **Structural changes** — redesigns that fix the root problem (implement this month)
- **Automation opportunities** — where a tool, script, or workflow could replace manual work

For each recommendation, estimate effort (low/medium/high) and impact (low/medium/high). Start with the highest impact-to-effort ratio.

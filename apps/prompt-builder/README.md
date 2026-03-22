# Prompt Builder

Interactive prompt construction tool that helps GTM teams build structured AI prompts with context injection, persona targeting, and output format specification. Designed for non-technical users who need consistent AI outputs.

## GTM Workflow

Bridges the gap between "I need AI to help with X" and a well-structured prompt that produces reliable, actionable output. Sales teams use this to build custom research prompts, email templates, and analysis frameworks without prompt engineering expertise — ensuring consistent quality across the team.

## How It Works

1. User describes their goal and selects a prompt framework (research, outreach, analysis)
2. Claude CLI generates a structured, reusable prompt with placeholders and output format
3. The generated prompt can be tested immediately with sample inputs
4. Saved prompts are stored in SQLite for reuse across sessions

## Example Output

```markdown
## Prompt: Account Research Brief

Research {company_name} in the {industry} space. Focus on:
- Recent funding, leadership changes, or product launches in the last 90 days
- Technology stack signals from job postings and engineering blog
- Competitive positioning relative to {our_product}

Output as JSON with keys: company_summary, recent_signals[], tech_stack[], competitive_angle
```

## Business Impact

Reduces prompt iteration from trial-and-error to guided construction — enables non-technical team members to build production-quality prompts in minutes.

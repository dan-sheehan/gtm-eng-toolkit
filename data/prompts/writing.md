# Writing & Communication Prompts

> AI prompts for drafting, rewriting, and improving written communication.

---

## Email Rewriter

**Use when:** you have a rough draft email that needs to be tighter, clearer, and appropriately toned

Type: ai-prompt
Tags: writing, communication
Variables: draft_email, tone, audience

Rewrite the following email draft. Your goal is to preserve the core message while making it significantly clearer and more actionable.

Audience: {{audience}}
Desired tone: {{tone}}

Guidelines:
- Lead with the main point or ask in the first 1-2 sentences
- Remove filler phrases, hedging language, and unnecessary preamble
- If there are action items or requests, make them explicit and easy to find
- Keep paragraphs short (2-3 sentences max)
- End with a clear next step or call to action
- Match the tone to the audience — don't be overly formal if the relationship is casual, and don't be too casual if it's a senior stakeholder
- If the original is longer than it needs to be, cut aggressively

Draft email:
{{draft_email}}

Provide the rewritten email, then a brief note on what you changed and why.

---

## Slack Message Crafter

**Use when:** you need to turn scattered thoughts into a clear, well-structured Slack message

Type: ai-prompt
Tags: writing, communication
Variables: message_context, audience, desired_outcome

Turn the following rough thoughts into a clear Slack message.

Audience: {{audience}}
Desired outcome: {{desired_outcome}}

Guidelines:
- Open with a one-line summary so the reader immediately knows what this is about and whether they need to act
- Use bullets or numbered lists for anything with more than two items
- Bold key names, dates, or decisions so they're scannable
- Keep the total length appropriate for Slack — if it's getting long, consider whether it should be a doc instead
- Use a direct, conversational tone — no corporate speak
- If you need something from the reader, put the ask at the top, not buried at the bottom
- Include relevant context but don't over-explain — assume the reader has baseline knowledge of the project

Raw thoughts:
{{message_context}}

---

## Executive Summary Generator

**Use when:** you need to condense a long document, report, or thread into a tight summary for busy stakeholders

Type: ai-prompt
Tags: writing, communication
Variables: full_content, audience, key_decisions

Write an executive summary of the following content.

Audience: {{audience}}
Key decisions or questions this should address: {{key_decisions}}

Structure:
1. **Bottom line** (1-2 sentences): What is the single most important thing the reader needs to know? Lead with the "so what."
2. **Key findings or context** (3-5 bullets): Only include details that directly support the bottom line or are essential for the decisions at hand. Leave out background the audience already knows.
3. **Risks or concerns** (if any): Flag anything that could derail progress or change the recommendation.
4. **Next steps or decisions needed**: Be specific about who needs to do what, and by when.

Guidelines:
- Write for someone who will spend 60 seconds reading this
- Use plain language — no jargon unless the audience expects it
- If the source material is ambiguous or contradictory, call that out rather than smoothing it over
- The summary should stand on its own without needing to read the full content

Full content:
{{full_content}}

---

## Meeting Notes Synthesizer

**Use when:** you have raw or messy meeting notes and need to extract structured takeaways

Type: ai-prompt
Tags: writing, meetings
Variables: raw_notes, meeting_purpose

Transform the following raw meeting notes into a structured summary.

Meeting purpose: {{meeting_purpose}}

Output format:

**Decisions Made**
List each decision clearly. If something was discussed but not decided, don't put it here.

**Action Items**
For each action item, include: what needs to happen, who owns it, and the deadline (if one was set). If ownership was unclear in the notes, flag it as "Owner TBD."

**Key Discussion Points**
Briefly summarize the most important topics discussed — focus on context that matters for people who weren't in the room. Skip small talk and tangents.

**Open Questions**
List anything that was raised but not resolved. Include enough context that someone reading this later understands what still needs to be figured out.

**Follow-ups**
Any next meetings, check-ins, or async follow-ups that were mentioned.

Guidelines:
- Be concise — this should be much shorter than the raw notes
- If the notes are ambiguous about whether something was decided or just discussed, err on the side of listing it as an open question
- Use names where they appear in the notes

Raw notes:
{{raw_notes}}

---

## Difficult Conversation Prep

**Use when:** you need to prepare for a tough or sensitive conversation and want structured talking points

Type: ai-prompt
Tags: writing, people
Variables: situation, relationship, desired_outcome

Help me prepare for a difficult conversation.

Situation: {{situation}}
My relationship to this person: {{relationship}}
Desired outcome: {{desired_outcome}}

Provide:

**Opening (2-3 sentences)**
How to open the conversation in a way that's direct but not aggressive. Set the right tone and frame the purpose clearly. Avoid sandwiching — don't start with forced positivity if the topic is serious.

**Key Points to Make (3-5 bullets)**
The essential things I need to communicate. For each point, give me the message and a suggested way to phrase it. Focus on observable behavior and impact, not character judgments.

**Anticipated Responses & How to Handle Them**
Think through 2-3 likely reactions (defensiveness, deflection, emotional response, counter-arguments) and give me a brief approach for each. Focus on staying grounded and redirecting to the core issue.

**How to Close Constructively**
How to end the conversation with clarity on next steps, shared understanding, and preserved relationship. Include a specific question or statement that checks for alignment.

Guidelines:
- Keep the tone human and empathetic — this is a real conversation, not a script
- Prioritize honesty over comfort, but pair directness with respect
- If the situation is ambiguous, help me see it from the other person's perspective too
- Flag if the desired outcome seems unrealistic given the situation

---

## Status Update Writer

**Use when:** you need to turn rough bullet points into a polished stakeholder update

Type: ai-prompt
Tags: writing, communication
Variables: project_name, progress_notes, blockers, next_steps

Write a stakeholder status update for **{{project_name}}**.

Use this format:

**TL;DR** (1-2 sentences)
The single most important thing to know about where this project stands right now. If there's a risk or a win, lead with it.

**Progress**
What was accomplished since the last update. Be specific — "made progress on the API" is useless; "shipped the authentication endpoint and it's in staging" is useful. Group related items if there are many.

**Blockers**
Anything slowing the team down or at risk of causing delays. For each blocker, briefly note what's being done about it or what help is needed.

**Next Steps**
What's planned for the next cycle. Include rough timing if known.

**Asks**
Anything you need from the audience — decisions, resources, reviews, approvals. Make these specific and actionable. If there are no asks, omit this section.

Inputs:
- Progress notes: {{progress_notes}}
- Blockers: {{blockers}}
- Next steps: {{next_steps}}

Guidelines:
- Write for someone who tracks 10+ projects and needs to quickly assess where this one stands
- Use plain language — skip internal jargon unless the audience shares it
- Don't pad thin progress — if it was a slow week, say so briefly and focus on what's next
- Keep the whole update under 200 words if possible

---

## Document Feedback

**Use when:** you need to give structured, actionable feedback on a draft document

Type: ai-prompt
Tags: writing
Variables: document_text, feedback_focus, intended_audience

Review the following document and provide structured feedback.

Feedback focus: {{feedback_focus}}
Intended audience: {{intended_audience}}

Provide feedback in these categories:

**Overall Assessment** (2-3 sentences)
Does this document achieve what it's trying to achieve? Give a direct, honest take.

**Structure & Flow**
Is the document organized logically? Does the reader get what they need in the right order? Flag any sections that feel out of place, redundant, or missing.

**Clarity & Precision**
Identify specific passages that are vague, ambiguous, or harder to parse than they need to be. For each one, explain the issue and suggest a clearer approach.

**Audience Fit**
Is the level of detail, tone, and assumed knowledge appropriate for the intended audience? Flag anything that's over their heads or too basic.

**Missing Pieces**
What questions would the reader have after reading this that aren't answered? What context or evidence is missing?

**Strongest Elements**
What's working well? Call out 1-2 things the author should keep or lean into.

Guidelines:
- Focus on substantive feedback, not copyediting or grammar
- Be specific — "this section is unclear" is not helpful; "this section assumes the reader knows X, but your audience likely doesn't" is helpful
- Prioritize your feedback — lead with the changes that would have the biggest impact
- Be direct but constructive — the goal is to make the document better, not to critique the author

Document:
{{document_text}}

---

## LinkedIn Post Drafter

**Use when:** you want to turn a rough idea into a polished LinkedIn post that sounds like a real person

Type: ai-prompt
Tags: writing, communication
Variables: topic, key_insight, audience

Draft a LinkedIn post based on the following inputs.

Topic: {{topic}}
Key insight or takeaway: {{key_insight}}
Target audience: {{audience}}

Structure:
1. **Hook** (first 1-2 lines): Open with something that makes the reader stop scrolling. A surprising observation, a contrarian take, or a specific moment. Avoid generic openings like "I've been thinking about..." or "Excited to share..."
2. **Context or story** (3-5 lines): Give enough background to make the insight land. Use a concrete example, a brief story, or a specific observation — not abstract generalizations.
3. **Insight** (2-3 lines): The core point you want people to walk away with. Make it specific and grounded. If it could apply to any industry or situation, it's too vague.
4. **Takeaway or question** (1-2 lines): End with something that invites reflection or conversation. A question works well, but only if it's genuine — not rhetorical fluff.

Guidelines:
- Write in first person, conversational tone
- No buzzwords (synergy, leverage, disrupt, game-changer, etc.)
- No hashtag spam — use 0-3 relevant hashtags at most, and only if they're genuinely useful
- Keep it under 200 words — LinkedIn rewards concise posts
- It should sound like something a real person would actually say, not a content template
- Avoid the "I'm humbled to announce" genre entirely
- Use line breaks between sections for readability

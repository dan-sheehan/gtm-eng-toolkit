# Job Hunting Prompts

> AI prompts for job search, applications, and interview prep.

---

## Job Description Analyzer

**Use when:** You find a role worth applying to and need to understand what actually matters before tailoring your materials.

Type: ai-prompt
Tags: job-hunting, analysis
Variables: job_description, company_name

Analyze this job description for {{company_name}} and give me a structured breakdown:

1. **Core responsibilities** — What will this person actually spend their time doing day-to-day? Separate the real work from the aspirational filler.
2. **Must-have vs nice-to-have skills** — Distinguish between hard requirements and wish-list items. Call out which "requirements" are likely flexible based on phrasing.
3. **Culture and team signals** — What can you infer about the team size, working style, pace, and org maturity from how this JD is written? Note anything about reporting structure or cross-functional expectations.
4. **Red flags** — Identify any warning signs: unrealistic scope for one role, contradictory expectations, signs of dysfunction, or vague accountability.
5. **What the hiring manager likely cares about most** — Based on the ordering, emphasis, and language, what are the top 2-3 things that will make or break a candidacy?
6. **Keywords to echo** — List the specific terms and phrases I should mirror in my resume and cover letter.

Job description:
{{job_description}}

---

## Resume Tailoring

**Use when:** You have a target JD and need to reshape your resume to speak its language without fabricating experience.

Type: ai-prompt
Tags: job-hunting, writing
Variables: job_description, resume, company_name

I'm applying to a role at {{company_name}}. Rewrite my resume bullets to better align with this job description while staying completely truthful to my actual experience.

For each section of my resume:
- Rewrite bullets to use the JD's terminology and frame my experience in terms of what this role values.
- Reorder bullets so the most relevant ones come first.
- Quantify impact wherever the original bullet implies but doesn't state a metric.
- Flag any bullet that's weak or irrelevant for this specific application and suggest whether to cut or rephrase it.

After the rewrite, give me:
- A **gap analysis**: skills or experiences the JD emphasizes that my resume doesn't address. For each gap, note whether I should address it in my cover letter, or if it's a genuine weakness.
- A **strength summary**: the 3 strongest alignment points between my background and this role.

Job description:
{{job_description}}

My current resume:
{{resume}}

---

## Cover Letter Drafter

**Use when:** You need a cover letter that sounds like a human wrote it, not a template engine.

Type: ai-prompt
Tags: job-hunting, writing
Variables: job_description, company_name, key_experience, why_interested

Write a cover letter for the {{company_name}} role below. Keep it under 350 words. The tone should be confident and conversational — like a smart colleague explaining why they're a fit, not a supplicant begging for consideration.

Structure:
- **Opening**: One sentence that names the role and makes a specific, non-generic hook. No "I'm excited to apply" or "I was thrilled to see." Start with something concrete.
- **Body (2-3 paragraphs)**: Connect my specific experience to what this role needs. Each paragraph should pair something from the JD with something I've actually done. Use concrete details, not adjectives.
- **Closing**: End with a forward-looking statement that references what I'd want to work on in the first 90 days. Include a clear call to action.

Avoid: cliches ("passionate about"), buzzword stacking, restating the resume line by line, or any sentence that could appear in anyone else's cover letter unchanged.

Job description:
{{job_description}}

My key relevant experience:
{{key_experience}}

Why I'm interested in this role/company:
{{why_interested}}

---

## Interview Story Prep (STAR)

**Use when:** You're preparing for behavioral interviews and need structured stories ready to deploy.

Type: ai-prompt
Tags: job-hunting
Variables: question_theme, relevant_experience

Generate 4 structured STAR stories I can use in behavioral interviews when asked about **{{question_theme}}**.

For each story, produce:
- **Situation** (2-3 sentences): Set the scene with enough context that the interviewer understands the stakes. Include team size, timeline, or business context where relevant.
- **Task** (1-2 sentences): What was specifically your responsibility? Make the ownership clear.
- **Action** (3-5 sentences): What did you actually do? Be specific about your decisions, not the team's. Include your reasoning — interviewers want to understand how you think, not just what happened.
- **Result** (2-3 sentences): Quantify the outcome. If you don't have hard metrics, describe the qualitative impact and what changed. Include any follow-on effects or lessons.

Also give me:
- A one-line summary of each story I can mentally index during an interview (e.g., "the migration story" or "the stakeholder conflict one").
- 2-3 common interview questions each story could answer, so I can pattern-match in real time.

Base the stories on this experience:
{{relevant_experience}}

---

## Company Research Brief

**Use when:** You have an interview coming up and need to walk in informed, not just skimming the About page.

Type: ai-prompt
Tags: job-hunting, analysis
Variables: company_name, role_title

Produce a pre-interview research brief for my upcoming interview at {{company_name}} for the {{role_title}} role. Structure it as:

1. **Business model** — How does the company make money? Who are the customers? What's the core value proposition? If it's a startup, what stage are they at and what's the funding situation?
2. **Recent news and changes** (last 6-12 months) — Leadership changes, product launches, funding rounds, layoffs, acquisitions, or strategic pivots. Anything that signals where the company is heading.
3. **Competitive landscape** — Who are the 3-4 main competitors? What's this company's differentiation or moat? Where are they vulnerable?
4. **Likely challenges for this role** — Based on the company's stage, recent moves, and the role itself, what problems is this person probably being hired to solve?
5. **Smart questions to ask** — Give me 5-6 questions that demonstrate I've done my homework. These should probe real strategic tensions or decisions, not softballs like "what's the culture like?" Each question should have a brief note on what the answer would reveal.

Be specific and opinionated, not generic. If you don't have enough information about the company to be specific, say so and tell me where to look.

---

## Thank You Email

**Use when:** You just finished an interview and want to follow up within 24 hours with something better than "thanks for your time."

Type: ai-prompt
Tags: job-hunting, communication
Variables: interviewer_name, role_title, company_name, key_discussion_points

Draft a post-interview thank you email to {{interviewer_name}} following my interview for the {{role_title}} position at {{company_name}}.

Guidelines:
- Keep it under 150 words. Brevity signals confidence.
- Reference one specific thing we discussed that genuinely interested me — not a generic restatement of the job.
- Reinforce one point of fit that connects something from the conversation to my experience, ideally something I wish I'd said more about.
- If there was a question I didn't answer well, include a brief, natural addition — not a defensive correction, just "I've been thinking more about your question on X, and..."
- End with something forward-looking that assumes momentum without being presumptuous.
- Tone: warm, professional, brief. Not stiff, not overly casual.

Key discussion points from the interview:
{{key_discussion_points}}

---

## Networking Outreach

**Use when:** You want to reach out to someone at a target company or in your industry without sounding like a LinkedIn bot.

Type: ai-prompt
Tags: job-hunting, communication
Variables: contact_name, their_role, company_name, connection_reason

Draft a concise outreach message to {{contact_name}}, who is a {{their_role}} at {{company_name}}.

Requirements:
- Keep it under 100 words. Shorter messages get more responses.
- First sentence: establish why I'm reaching out to them specifically, not just anyone at the company. Reference something concrete — a shared connection, their work, a talk they gave, a project they shipped.
- Second part: one sentence about who I am and why it's relevant to them.
- The ask: make it specific, small, and easy to say yes to. "Could I ask you 2 questions about X over email?" beats "Would you be open to a 30-minute chat sometime?" The lower the commitment, the higher the response rate.
- Close: make it easy to decline without awkwardness.
- Tone: respectful of their time, not self-deprecating. No "I know you're busy but..." or "Sorry to bother you."

Connection reason / context:
{{connection_reason}}

---

## Role Fit Self-Assessment

**Use when:** You want an honest evaluation before investing time in an application, or you need to prepare for "why should we hire you" questions.

Type: ai-prompt
Tags: job-hunting, analysis
Variables: job_description, resume

Compare my resume against this job description and give me an honest, unvarnished fit assessment. Don't be encouraging for the sake of it — I need the real picture.

Produce:
1. **Strong alignment** — Where does my experience directly match what they're asking for? Rate each as strong match, moderate match, or partial match. Cite specific resume lines and JD requirements.
2. **Gaps and risks** — Where am I light? For each gap, categorize it:
   - Learnable quickly (weeks) — I just haven't done this exact thing but have adjacent skills
   - Needs investment (months) — Real skill gap but acquirable
   - Structural mismatch — Industry, seniority, or domain gap that's hard to overcome
3. **Framing strategy** — For each gap in the first two categories, suggest how to frame it as a growth opportunity rather than a weakness. Give me the actual language I could use in an interview.
4. **Overall honest take** — Would you recommend I apply? Is this a stretch, a lateral, or a step back? What's the likely hit rate for someone with my profile?

Job description:
{{job_description}}

My resume:
{{resume}}

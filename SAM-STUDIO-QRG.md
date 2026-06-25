# Scout LLM Persona System — User Guide & Cheat Sheet

## Quick Start: Two Prompts, Endless Combinations

You have **19 expert personas** and **2 master prompts**:
- `REVIEW-DOCUMENT.md` — Get expert feedback on any document
- `REWRITE-DOCUMENT.md` — Get a full rewrite in a persona's voice

---

## How to Invoke: REVIEW-DOCUMENT.md

### Basic Pattern
```
Attach: [persona file] + [document to review] + REVIEW-DOCUMENT.md

Type: "review this document using [persona name]"
```

### What Happens
1. Scout reads the persona file to understand the expert's standards
2. Reviews your document through that lens
3. Returns a structured markdown report with:
   - Overall verdict
   - Strengths (2-5 bullets)
   - Findings (ordered by severity: Critical → Major → Minor)
   - Questions the persona would ask you
   - Scorecard (persona-specific dimensions, 1-5 scale)

### Example Invocation
```
Attachments:
- 02-COMMANDER-SAM-PERSONA.md
- project-proposal.pptx
- REVIEW-DOCUMENT.md

Prompt: "review this proposal using Commander Sam"
```

### What You Get Back
```markdown
# project-proposal.pptx — Review by Sam Steele

> [One-paragraph verdict in persona voice]

## Strengths
- [What works, specifically]

## Findings

### 1. [Issue title] — Slide 3
**Severity:** Critical
**Issue:** [What's wrong]
**Recommendation:** [How to fix it, with rewritten text]

[... more findings ...]

## Scorecard
| Dimension | Score | Note |
|-----------|-------|------|
| Verdict placement | 2 | [Specific feedback] |
```

---

## How to Invoke: REWRITE-DOCUMENT.md

### Basic Pattern
```
Attach: [persona file] + [document to rewrite] + REWRITE-DOCUMENT.md

Type: "rewrite this document using [persona name]"
```

### What Happens
1. Scout reads the persona file to understand voice, structure, tone rules
2. Rewrites your **entire document** in that persona's voice
3. Preserves all facts/figures (never invents data)
4. Inserts `[NEEDS: ...]` placeholders where source data is missing
5. Returns rewritten content + notes on structural changes made

### Example Invocation
```
Attachments:
- 10-ENERGETIC-COLLABORATIVE-PERSONA.md
- technical-briefing.pptx
- REWRITE-DOCUMENT.md

Prompt: "rewrite this deck using Energetic Collaborative persona"
```

### What You Get Back
```markdown
# technical-briefing.pptx — Rewritten by Sam Cruz

## Slide 1: [New title in persona voice]

[On-slide content]

**Speaker notes:**
[Full narration in persona voice]

---

## Slide 2: [Title]
[Content]
**Speaker notes:**
[Narration]

[... all slides rewritten ...]

---

## Rewrite notes

### Structural changes made and why:
1. [What changed and rationale]
2. [What moved and why]

### [NEEDS: ...] placeholders inserted:
- `[NEEDS: cost per month]` — Slide 1
- `[NEEDS: baseline metric]` — Slide 3
```

---

## Quick Persona Selection Guide

| You Need | Use This Persona | File |
|----------|------------------|------|
| **Fast executive decision** | Executive Briefing | `12-EXECUTIVE-BRIEFING-PERSONA.md` |
| **Skeptical board/audit** | Skeptic-Proof Analyst | `11-SKEPTIC-PROOF-ANALYST-PERSONA.md` |
| **Win team buy-in** | Energetic Collaborative | `10-ENERGETIC-COLLABORATIVE-PERSONA.md` |
| **User adoption/change** | Empathetic Holistic | `09-EMPATHETIC-HOLISTIC-PERSONA.md` |
| **Teach/onboard** | Teacher/Explainer | `14-TEACHER-EXPLAINER-PERSONA.md` |
| **Funding/sales pitch** | Sales/Pitch | `15-SALES-PITCH-PERSONA.md` |
| **Compliance/legal** | Legal/Compliance | `18-LEGAL-COMPLIANCE-PERSONA.md` |
| **Neutral reporting** | Journalist | `16-JOURNALIST-INVESTIGATIVE-PERSONA.md` |
| **Wake up the room** | Commander | `02-COMMANDER-SAM-PERSONA.md` |
| **Deep storytelling** | Documentary Narrator | `13-DOCUMENTARY-NARRATOR-PERSONA.md` |
| **Balanced technical** | Classic SAM | `01-SAM-PERSONA.md` |
| **Workshop/training** | Workshop Facilitator | `17-WORKSHOP-FACILITATOR-PERSONA.md` |
| **Sprint/Agile docs** | Scrum Master | `19-SCRUM-MASTER-PERSONA.md` |

---

## Common Workflows

### Workflow 1: Get Multiple Perspectives
```
Round 1: Review with Commander Sam (finds buried verdicts, weak asks)
Round 2: Review with Skeptic-Proof Analyst (finds unsupported claims)
Round 3: Review with Empathetic Holistic (finds dehumanizing language)

Result: Three expert reviews, three different lenses
```

### Workflow 2: Review → Rewrite → Review Again
```
Step 1: Review with Executive Briefing persona
Step 2: Fix critical findings manually
Step 3: Rewrite entire deck with same persona
Step 4: Review the rewrite with Skeptic-Proof Analyst (different lens)

Result: Polished deck that passes multiple expert standards
```

### Workflow 3: Audience-Specific Versions
```
Version A: Rewrite with Commander Sam (for skeptical leadership)
Version B: Rewrite with Teacher/Explainer (for new staff onboarding)
Version C: Rewrite with Sales/Pitch (for funding committee)

Same content, three different voices for three different audiences
```

### Workflow 4: Iterative Refinement
```
Round 1: Review with [persona] → get findings
Round 2: "Fix finding #3 on slide 5" → Scout rewrites just that section
Round 3: "Now review slide 5 again" → Scout confirms fix works
Round 4: Repeat for other findings

Result: Surgical improvements without full rewrite
```

---

## Pro Tips

### Tip 1: You Can Mix and Match
```
"Review this deck using Commander Sam, 
but also tell me what Empathetic Holistic would say about slide 3"

Scout will give you both perspectives in one response
```

### Tip 2: Ask Follow-Up Questions (Stay in Persona)
```
After a review:
"Why is finding #2 marked Critical instead of Major?"
"Show me a rewrite of just slide 7 using your recommendations"
"What would this look like if the audience were non-technical?"

Scout stays in the persona's voice and perspective
```

### Tip 3: Request Specific Sections
```
"Rewrite just the opening slide using Energetic Collaborative"
"Review only the cost section using Skeptic-Proof Analyst"

You don't always need to process the entire document
```

### Tip 4: Personas Can Review Other Personas' Work
```
Step 1: Rewrite with Sales/Pitch persona
Step 2: Review that rewrite with Legal/Compliance persona

Finds: "This sales claim needs a documented basis" (compliance lens)
```

### Tip 5: Use `[NEEDS: ...]` Placeholders as TODOs
```
After a rewrite, search the output for "[NEEDS:"
Those are your action items — data you need to fill in
Fill them in, paste back, ask Scout to review again
```

---

## Command Templates (Copy-Paste Ready)

### Template: Basic Review
```
Review this [document type] using [persona name] from [persona-file.md]

[Paste document or attach file]
```

### Template: Basic Rewrite
```
Rewrite this [document type] using [persona name] from [persona-file.md]

[Paste document or attach file]
```

### Template: Review Specific Section
```
Using [persona name], review only [section/slide number] and tell me:
1. What's the severity of issues here?
2. How would you rewrite it?
```

### Template: Compare Two Personas
```
Review this document from two perspectives:
1. [Persona A name] — what are the critical findings?
2. [Persona B name] — what would they flag that Persona A missed?
```

### Template: Iterative Fix
```
I fixed finding #[number] on [slide/section].
Here's the revised version: [paste revision]

Using [persona name], does this fix work? What else needs attention?
```

---

## What Scout Preserves (NEVER Invents)

✅ **Always preserved exactly:**
- Numbers, metrics, percentages
- Dates, timelines, milestones
- Names (people, products, systems)
- Technical specifications
- Cost figures
- Source citations

❌ **Never invented:**
- Data Scout doesn't have
- Claims not in the source
- Numbers to "make the story better"
- Fake sources or citations

🔧 **When data is missing:**
Scout inserts: `[NEEDS: specific data description]`
Example: `[NEEDS: baseline processing time before automation]`

---

## Troubleshooting

### "The review feels generic"
**Fix:** Make sure you attached the **persona file** and **REVIEW-DOCUMENT.md** prompt. Scout needs both to adopt the expert lens.

### "The rewrite changed my facts"
**Fix:** Point out the specific fact that changed. Scout will correct it and explain what happened. Facts should never change.

### "I only wanted slide 3 reviewed, but got the whole deck"
**Fix:** Be explicit: "Review only slide 3 using [persona]" — Scout will focus there.

### "The persona feels too harsh/soft"
**Fix:** Pick a different persona. Commander Sam is blunt. Empathetic Holistic is gentle. Match persona to your tolerance for directness.

### "I don't know which persona to use"
**Fix:** Describe your audience and goal:
"I'm presenting to skeptical executives who hate fluff. Which persona?"
Scout will recommend the right one.

---

## File Checklist for Each Session

When starting a review or rewrite, attach:

- [ ] **The persona file** (e.g., `02-COMMANDER-SAM-PERSONA.md`)
- [ ] **REVIEW-DOCUMENT.md** or **REWRITE-DOCUMENT.md** (the master prompt)
- [ ] **Your document** (pptx, docx, md, pdf, or paste text directly)

Optional but helpful:
- [ ] Context files (background docs, previous versions, audience description)

---

## Remember

- **Reviews** tell you what's wrong and how to fix it
- **Rewrites** give you a finished product in the persona's voice
- **Personas stay in character** for follow-up questions
- **Facts are sacred** — Scout never invents data
- **Iterate freely** — "fix this, then review again" workflows are encouraged

---

**Ready to start?**

Pick a persona. Attach your document. Type "review this" or "rewrite this." Scout handles the rest.
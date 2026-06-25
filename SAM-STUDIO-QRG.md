# SAM Studio — User Guide & Cheat Sheet

## Before You Start

Think about the last document you wrote that needed to land with a specific audience — executives, skeptics, new staff, a compliance team, a budget committee. Now imagine having 18 expert reviewers on call, each looking at that document through a different professional lens.

That's what this system gives you. Two prompts. Eighteen perspectives. One workflow that adapts to any document, any audience, any stakes level.

---

## Your First Review (Start Here)

Pick any document you're working on right now. Follow these three steps:

```
Step 1: Attach these files to Scout:
        - 02-COMMANDER-SAM-PERSONA.md  (the reviewer)
        - REVIEW-DOCUMENT.md           (the instruction prompt)
        - Your document                (what gets reviewed)

Step 2: Type: "review this document"

Step 3: Read what comes back.
```

That's the system in action. Everything below builds on that first experience.

---

## The Two Commands

| Command | What It Does | What You Get Back |
|---------|--------------|-------------------|
| **REVIEW** | Expert feedback through a persona's lens | Structured report: verdict, strengths, findings, scorecard |
| **REWRITE** | Full document rewritten in a persona's voice | Complete rewrite with speaker notes + structural change log |

---

## How to Invoke: REVIEW-DOCUMENT.md

### What to Attach
```
1. [Persona file]         — tells Scout which expert to become
2. [REVIEW-DOCUMENT.md]   — tells Scout what task to perform
3. [Your document]        — the content that gets reviewed
```

### What to Type
```
"Review this [document type] using [persona name]"
```

### What You Get Back
```markdown
# [Document name] — Review by [Persona name]

> One-paragraph verdict in the persona's voice

## Strengths
- [2-5 bullets — what works, specifically]

## Findings
### 1. [Issue title] — Slide X / Section Y
**Severity:** Critical / Major / Minor
**Issue:** [What's wrong, from this persona's perspective]
**Recommendation:** [Specific fix, with rewritten text]

## What this persona would ask the author
- [2-4 pointed questions]

## Scorecard
| Dimension | Score (1-5) | Note |
```

### Example
```
Attachments:
- 11-SKEPTIC-PROOF-ANALYST-PERSONA.md
- budget-proposal.pptx
- REVIEW-DOCUMENT.md

Prompt: "Review this budget proposal using Skeptic-Proof Analyst"
```

---

## How to Invoke: REWRITE-DOCUMENT.md

### What to Attach
```
1. [Persona file]          — tells Scout which voice to write in
2. [REWRITE-DOCUMENT.md]   — tells Scout what task to perform
3. [Your document]         — the content that gets rewritten
```

### What to Type
```
"Rewrite this [document type] using [persona name]"
```

### What You Get Back
```markdown
# [Document name] — Rewritten by [Persona name]

## Slide 1: [New title in persona voice]
[On-slide content — concise, shaped by persona]

**Speaker notes:**
[Full narration in persona voice]

---
## Slide 2: [Title]
[Content + speaker notes continue...]

---
## Rewrite notes
### Structural changes made and why:
1. [What changed and rationale]

### [NEEDS: ...] placeholders inserted:
- `[NEEDS: baseline metric]` — Slide 3
```

### Example
```
Attachments:
- 15-SALES-PITCH-PERSONA.md
- project-overview.pptx
- REWRITE-DOCUMENT.md

Prompt: "Rewrite this deck using Sales/Pitch persona"
```

---

> **Checkpoint:** You now understand the two core commands and what they produce. The next section helps you choose the right persona for your situation.

---

## Finding Your Persona

### Start With Three Questions

1. **Who is my audience?** (Executives? Peers? New staff? Auditors? A funding committee?)
2. **What do I need from them?** (A decision? Buy-in? Understanding? Compliance sign-off? Budget approval?)
3. **What's my biggest worry about this document?** (Too long? Too technical? Not persuasive? Missing evidence? Ignoring the people affected?)

Your answers point to the persona. Use the table below to match:

---

### Persona Selection Guide

| Your Situation | Use This Persona | File |
|----------------|------------------|------|
| C-suite briefing, 8 minutes max | **Executive Briefing** · Sam Page | `12-EXECUTIVE-BRIEFING-PERSONA.md` |
| Board review, skeptical audience | **Skeptic-Proof Analyst** · Sam Ledger | `11-SKEPTIC-PROOF-ANALYST-PERSONA.md` |
| Team demo, need shared momentum | **Energetic Collaborative** · Sam Cruz | `10-ENERGETIC-COLLABORATIVE-PERSONA.md` |
| Adoption rollout, people are anxious | **Empathetic Holistic** · Sam Hart | `09-EMPATHETIC-HOLISTIC-PERSONA.md` |
| Onboarding, new audience to the topic | **Teacher/Explainer** · Sam Bell | `14-TEACHER-EXPLAINER-PERSONA.md` |
| Funding pitch, vendor proposal | **Sales/Pitch** · Sam Archer | `15-SALES-PITCH-PERSONA.md` |
| Policy or regulatory submission | **Legal/Compliance** · Sam Clarke | `18-LEGAL-COMPLIANCE-PERSONA.md` |
| Post-mortem, incident report, audit | **Journalist/Investigative** · Sam Bradlee | `16-JOURNALIST-INVESTIGATIVE-PERSONA.md` |
| Leadership needs a wake-up call | **Commander** · Sam Steele | `02-COMMANDER-SAM-PERSONA.md` |
| Training video, org history | **Documentary Narrator** · Sam Atwood | `13-DOCUMENTARY-NARRATOR-PERSONA.md` |
| Balanced architecture review | **Classic SAM** · Sam Wright | `01-SAM-PERSONA.md` |
| Interactive workshop, facilitated session | **Workshop Facilitator** · Sam Rowan | `17-WORKSHOP-FACILITATOR-PERSONA.md` |
| Sprint planning, retros, agile docs | **Scrum Master** · Sam Agile | `19-SCRUM-MASTER-PERSONA.md` |
| Product roadmap, user-value alignment | **Product Manager** · Sam Product | `20-PRODUCT-MANAGER-PERSONA.md` |
| Security audit, threat model | **Security Auditor** · Sam Shield | `21-SECURITY-AUDITOR-PERSONA.md` |
| Slide design, accessibility, visual clutter | **Design Critique** · Sam Pixel | `22-DESIGN-CRITIQUE-PERSONA.md` |
| Budget justification, ROI, cost model | **Financial Controller** · Sam Capital | `23-FINANCIAL-CONTROLLER-PERSONA.md` |
| Staff training plan, phased rollout | **Change Manager** · Sam People | `24-CHANGE-MANAGER-PERSONA.md` |

---

### Still Not Sure?

Tell Scout your situation. It will recommend a persona:
```
"I'm presenting a new automation tool to skeptical program directors 
who've seen three prior projects fail. Which persona should I use?"
```

---

> **Checkpoint:** You know the two commands and which persona fits your audience. The next section shows patterns for combining them.

---

## Workflows — When to Use Which Pattern

### Workflow 1: Get Multiple Perspectives
**Use when:** Something feels off about your document, but you can't pinpoint what. You want blind spots surfaced before a high-stakes moment.

```
Round 1: Review with Commander Sam → finds buried verdicts, weak asks
Round 2: Review with Skeptic-Proof Analyst → finds unsupported claims
Round 3: Review with Empathetic Holistic → finds dehumanizing language

Result: Three expert reviews, three different lenses, complete coverage
```

---

### Workflow 2: Review → Rewrite → Review Again
**Use when:** The document needs significant improvement and you want a structured path from draft to polished output.

```
Step 1: Review with Executive Briefing persona → identify critical findings
Step 2: Fix critical findings manually (or ask Scout to fix specific ones)
Step 3: Rewrite entire deck with same persona → get polished output
Step 4: Review the rewrite with Skeptic-Proof Analyst → stress-test it

Result: Polished deck that passes multiple expert standards
```

---

### Workflow 3: Audience-Specific Versions
**Use when:** The same content needs to reach different audiences — leadership, staff, compliance — and each group needs a different voice.

```
Version A: Rewrite with Commander Sam → for skeptical leadership
Version B: Rewrite with Teacher/Explainer → for new staff onboarding
Version C: Rewrite with Sales/Pitch → for the funding committee

Same facts, three voices, three audiences served
```

---

### Workflow 4: Iterative Refinement
**Use when:** The document is mostly there, but specific sections need surgical improvement without a full rewrite.

```
Round 1: Review with [persona] → get findings list
Round 2: "Fix finding #3 on slide 5" → Scout rewrites just that section
Round 3: "Now review slide 5 again" → Scout confirms fix works
Round 4: Repeat for remaining findings

Result: Surgical improvements, section by section
```

---

### Workflow 5: Cross-Discipline Stress Test
**Use when:** The document touches multiple concerns — security, budget, adoption, compliance — and each needs validation.

```
Pass 1: Security Auditor → flags data handling gaps
Pass 2: Financial Controller → validates cost model
Pass 3: Change Manager → checks adoption plan
Pass 4: Legal/Compliance → verifies scope and claims

Result: Document survives every review board in one session
```

---

> **Checkpoint:** You now have five workflow patterns. Before moving to advanced tips, ask yourself: do I already know which workflow fits my current project? If yes, skip to Command Templates below. If not, re-read the "Use when" triggers above.

---

## Pro Tips

### Tip 1: Request Specific Sections
```
"Rewrite just the opening slide using Energetic Collaborative"
"Review only the cost section using Financial Controller"
```
You don't always need to process the entire document.

---

### Tip 2: Ask Follow-Up Questions (Scout Stays in Persona)
```
After a review:
"Why is finding #2 marked Critical instead of Major?"
"Show me a rewrite of just slide 7 using your recommendations"
"What would this look like if the audience were non-technical?"
```

---

### Tip 3: Mix Perspectives in One Request
```
"Review this deck using Commander Sam, but also tell me 
what Empathetic Holistic would say about slide 3"
```
Scout gives you both perspectives in one response.

---

### Tip 4: Personas Can Review Other Personas' Work
```
Step 1: Rewrite with Sales/Pitch persona
Step 2: Review that rewrite with Legal/Compliance persona

Finds: "This sales claim needs a documented basis"
```
This catches overreach and balances persuasion with rigor.

---

### Tip 5: Use `[NEEDS: ...]` Placeholders as a TODO List
```
After a rewrite, search the output for "[NEEDS:"
Those are your action items — data you need to fill in.
Fill them in, paste back, ask Scout to review again.
```

---

### Tip 6: Describe Your Audience for Persona Recommendations
```
"I'm presenting to a program director who has 10 minutes 
and cares about cost and compliance. Which persona?"
```
Scout will recommend the right one and explain why.

---

## Command Templates (Copy-Paste Ready)

### Basic Review
```
Review this [document type] using [persona name] from [persona-file.md]
```

### Basic Rewrite
```
Rewrite this [document type] using [persona name] from [persona-file.md]
```

### Review Specific Section
```
Using [persona name], review only [section/slide number] and tell me:
1. What's the severity of issues here?
2. How would you rewrite it?
```

### Compare Two Personas
```
Review this document from two perspectives:
1. [Persona A] — what are the critical findings?
2. [Persona B] — what would they flag that Persona A missed?
```

### Iterative Fix
```
I fixed finding #[number] on [slide/section].
Here's the revised version: [paste revision]

Using [persona name], does this fix work? What else needs attention?
```

### Full Cross-Discipline Review
```
Review this document using these four lenses in sequence:
1. Security Auditor — data handling and trust boundaries
2. Financial Controller — cost model and ROI
3. Legal/Compliance — scope and claims
4. Executive Briefing — structure and ask clarity
```

---

## What Scout Preserves (NEVER Invents)

| Always Preserved Exactly | Never Invented |
|--------------------------|----------------|
| Numbers, metrics, percentages | Data Scout doesn't have |
| Dates, timelines, milestones | Claims not in the source |
| Names (people, products, systems) | Numbers to "make the story better" |
| Technical specifications | Fake sources or citations |
| Cost figures | Speculative outcomes |
| Source citations | Attribution not in the original |

**When data is missing:** Scout inserts `[NEEDS: specific description]`

Example: `[NEEDS: baseline processing time before automation]`

---

## Persona Quick Reference — What Each Expert Hunts For

| Persona | Primary Focus | Key Question They Ask |
|---------|---------------|----------------------|
| **Classic SAM** (Wright) | Precision, signal-to-noise | "Is every claim exact?" |
| **Commander** (Steele) | Verdict placement, conviction | "Where's the decision?" |
| **Empathetic Holistic** (Hart) | Human impact, adoption safety | "What about the people?" |
| **Energetic Collaborative** (Cruz) | Momentum, win visibility | "Where's the celebration?" |
| **Skeptic-Proof Analyst** (Ledger) | Evidence, assumptions | "What's the proof?" |
| **Executive Briefing** (Page) | Economy, ask clarity | "What do I approve?" |
| **Documentary Narrator** (Atwood) | Through-line, context | "What's the story arc?" |
| **Teacher/Explainer** (Bell) | Concept sequencing, clarity | "Will they understand?" |
| **Sales/Pitch** (Archer) | Value anchoring, next step | "What's the payoff?" |
| **Journalist** (Bradlee) | Source coverage, neutrality | "Where's the evidence?" |
| **Workshop Facilitator** (Rowan) | Interaction, reflection | "What does the audience do?" |
| **Legal/Compliance** (Clarke) | Scope, quantifier precision | "Can this survive audit?" |
| **Scrum Master** (Agile) | Iteration, team empowerment | "Where's the feedback loop?" |
| **Product Manager** (Product) | User-value alignment, KPIs | "Who benefits and how?" |
| **Security Auditor** (Shield) | Trust boundaries, data lifecycle | "Where's the vulnerability?" |
| **Design Critique** (Pixel) | Visual hierarchy, cognitive load | "Can the eye find the point?" |
| **Financial Controller** (Capital) | ROI, cost basis, scaling | "What's the payback window?" |
| **Change Manager** (People) | Training footprint, phased rollout | "How does the team adopt this?" |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Review feels generic | Confirm you attached the **persona file** AND **REVIEW-DOCUMENT.md** — Scout needs both |
| Rewrite changed my facts | Point out the specific change — facts should never change; Scout will correct |
| Got the whole deck, only wanted one slide | Be explicit: "Review only slide 3 using [persona]" |
| Persona feels too harsh | Try Empathetic Holistic or Teacher/Explainer — match persona to your tolerance |
| Persona feels too soft | Try Commander or Skeptic-Proof Analyst — they don't soften |
| Don't know which persona to use | Describe your audience and goal — Scout will recommend |
| Output is too long | Ask: "Summarize findings as a bullet list, top 3 only" |
| Need more detail on one finding | Ask: "Expand on finding #2 with a full rewrite of that section" |

---

## File Checklist

Every session needs these three files:

- [ ] **The persona file** (e.g., `02-COMMANDER-SAM-PERSONA.md`) — tells Scout which expert to become
- [ ] **REVIEW-DOCUMENT.md** or **REWRITE-DOCUMENT.md** — tells Scout what task to perform
- [ ] **Your document** (pptx, docx, md, pdf, or paste text) — the content that gets reviewed or rewritten

Optional:
- [ ] **Context files** — background docs, prior versions, or audience description that helps Scout understand the bigger picture


---
name: review
description: Review a slide deck or document (PPTX, PDF, DOCX, Markdown, text) through one or more expert personas from the personas/ folder. Produces one report per persona plus a synthesis. Usage - /review <file> [persona names or numbers] ... e.g. /review deck.pptx 11 12 18, or /review deck.pptx (personas chosen interactively).
---

# Multi-Persona Document Review

Run an expert review panel over a slide deck or document. Each selected persona
reviews independently (in parallel), then the results are synthesized.

## Arguments

`/review <file> [personas...]`

- `<file>` — path to a `.pptx`, `.pdf`, `.docx`, `.md`, or `.txt` file. If no
  file was given, ask the user which file to review (Glob the working directory
  for candidates first).
- `[personas...]` — optional. Number prefixes (`11 12`), name fragments
  (`skeptic exec legal`), or `all`. Match against filenames in `personas/`
  (ignore `PERSONA-README.md`).

## Workflow

### 1. Resolve personas

Glob `personas/*-PERSONA.md` for the available set.

- If the user named personas, resolve them by prefix or fuzzy name match.
- If not: read the **Quick Selector** table in `personas/PERSONA-README.md`,
  infer the document's audience/purpose from its filename and a quick skim of
  the extracted content, then use AskUserQuestion (multiSelect) to propose
  2–4 recommended personas with a one-line reason each.

A panel of 2–4 personas is the sweet spot; warn before running more than 5.

### 2. Extract content

```bash
python3 scripts/extract.py <file> > reviews/<doc-slug>/_extracted.md
```

`<doc-slug>` = the input filename, lowercased, extension stripped, spaces and
special characters replaced with `-`. Create the directory first
(`mkdir -p reviews/<doc-slug>`). If extraction fails or yields almost no text
(e.g. an image-only PDF), tell the user and stop.

### 3. Spawn one reviewer per persona — in parallel

For each selected persona, spawn a `persona-reviewer` agent **in a single
message** (parallel tool calls) with this prompt template:

```
Review the document as the persona defined below.

Persona file: personas/<persona-file>
Extracted content: reviews/<doc-slug>/_extracted.md
Write your report to: reviews/<doc-slug>/<persona-slug>.md

Original document: <file> (for context only — review the extracted content)
```

`<persona-slug>` = persona filename without the `.md` extension, lowercased
(e.g. `11-skeptic-proof-analyst-persona`).

### 4. Synthesize

After all reviewers return, write `reviews/<doc-slug>/00-SYNTHESIS.md`:

```markdown
# <Document name> — Review Synthesis
*Panel: <persona names> · <date>*

## Overall verdict
(2–3 sentences: the panel's collective read)

## Consensus findings
(Issues flagged by 2+ personas — these are the highest-confidence problems.
For each: the issue, who flagged it, the agreed fix.)

## Conflicts & tensions
(Where personas disagree — e.g. Sales wants punchier claims, Skeptic wants
hedged ones. Name the trade-off and recommend a resolution.)

## Unique catches
(Important findings only one persona caught, worth keeping.)

## Top 5 priority fixes
(Ordered, actionable, with slide/page references.)
```

Base the synthesis on the agents' returned summaries plus the full reports
(read them — agents' final messages are abbreviated).

### 5. Report back

Show the user: the verdict, the top 5 fixes, and clickable paths to all
reports in `reviews/<doc-slug>/`.

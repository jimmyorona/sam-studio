# SAM Slide Suite — LLM Prompt Reference

Every LLM prompt the workflows send to Ollama, where it lives, and what it does.
The two bridge scripts hold all prompts: `scripts/reviewer_synth.py`
(Review/Rewrite) and `scripts/pptx_to_video.py` (Narrate/Produce). The web
server and skills never embed model prompts — they only orchestrate these.

## Summary table

| # | Prompt | Role | Workflow / mode | Script | Location |
|---|--------|------|-----------------|--------|----------|
| 1 | `REVIEWER_SYSTEM_PROMPT` | system | Review | `scripts/reviewer_synth.py` | [:53](../scripts/reviewer_synth.py#L53) |
| 2 | `REWRITER_SYSTEM_PROMPT` | system | Rewrite | `scripts/reviewer_synth.py` | [:94](../scripts/reviewer_synth.py#L94) |
| 3 | `REWRITER_ADVISE_ADDENDUM` | system (appended) | Rewrite · Advise on | `scripts/reviewer_synth.py` | [:138](../scripts/reviewer_synth.py#L138) |
| 4 | `SYNTHESIS_SYSTEM_PROMPT` | system | Review · synthesis (2+ personas) | `scripts/reviewer_synth.py` | [:150](../scripts/reviewer_synth.py#L150) |
| 5 | Review/Rewrite **user message** (assembled) | user | Review · Rewrite | `scripts/reviewer_synth.py` | [:382](../scripts/reviewer_synth.py#L382) |
| 5a | ↳ `BACKGROUND CONTEXT` block | user (part) | Review · Rewrite (when context given) | `scripts/reviewer_synth.py` | [:360](../scripts/reviewer_synth.py#L360) |
| 5b | ↳ `REVIEW FINDINGS TO APPLY` block | user (part) | Rewrite (when prior review exists) | `scripts/reviewer_synth.py` | [:336](../scripts/reviewer_synth.py#L336) |
| 6 | Synthesis **user message** (assembled) | user | Review · synthesis | `scripts/reviewer_synth.py` | [:432](../scripts/reviewer_synth.py#L432) |
| 7 | Narration **system** prompt (`build_chat_history`) | system | Narrate | `scripts/pptx_to_video.py` | [:322](../scripts/pptx_to_video.py#L322) |
| 8 | `SLIDE_USER_TEMPLATE` (per-slide) | user | Narrate | `scripts/pptx_to_video.py` | [:82](../scripts/pptx_to_video.py#L82) |
| 9 | `MUSIC_PROMPT_SYSTEM_BASE` | system | Produce · background music (optional) | `scripts/pptx_to_video.py` | [:91](../scripts/pptx_to_video.py#L91) |
| 10 | `MUSIC_PROMPT_USER_TEMPLATE` | user | Produce · background music (optional) | `scripts/pptx_to_video.py` | [:97](../scripts/pptx_to_video.py#L97) |

**Persona briefs** (`personas/*-PERSONA.md`) are *not* in this table: they aren't
standalone prompts but content injected into prompts 5 and 7. Reviews/rewrites
read the `## Review Lens` sections; narration reads the voice/TTS sections.

---

## Review / Rewrite — `scripts/reviewer_synth.py`

One Ollama `/api/chat` call per persona (system + assembled user message), then
one synthesis call when 2+ reviews succeed.

### 1. `REVIEWER_SYSTEM_PROMPT` — system (Review)
Directs the model to fully adopt the persona's `## Review Lens` and emit a
fixed-structure markdown review (verdict, strengths, findings with severity,
questions, scorecard).

### 2. `REWRITER_SYSTEM_PROMPT` — system (Rewrite)
Directs the model to rewrite the whole deck in the persona's voice, keep
`## Slide N` structure, preserve every fact, and turn missing data into
`[NEEDS: …]` placeholders with `**Speaker notes:**`.

### 3. `REWRITER_ADVISE_ADDENDUM` — system, appended (Rewrite · Advise)
Appended to prompt 2 only when `--advise` is set. Tells the model to follow each
`[NEEDS: X]` with a `[DRAFT: …]` proposal — a plausible, clearly-unverified
value to confirm or replace.

### 4. `SYNTHESIS_SYSTEM_PROMPT` — system (Review · synthesis)
The "panel chair": merges the per-persona reviews into consensus findings,
conflicts (weighted by each persona's blind spots), unique catches, and a top-5
priority-fix list. Skipped when only one reviewer succeeds.

### 5. Review/Rewrite user message (assembled per persona)
Built at [reviewer_synth.py:382](../scripts/reviewer_synth.py#L382) by
concatenating, in order:

```
PERSONA BRIEF (referred to as "<name>" …):
<full persona .md>
---
[5a BACKGROUND CONTEXT block]   ← if context text/file supplied
[5b REVIEW FINDINGS TO APPLY]   ← rewrite only, if a prior review exists
<task_line>:                    ← "DOCUMENT TO REVIEW (…)" or "PRESENTATION TO REWRITE (…)"
<extracted document content>
```

- **5a `BACKGROUND CONTEXT`** — user-supplied grounding (typed text and/or an
  attached `.md`/`.txt`); see also the context-file path in the server.
- **5b `REVIEW FINDINGS TO APPLY`** — the prior review's synthesis (or its
  per-persona reviews) injected so every rewrite applies the fixes.

### 6. Synthesis user message (assembled)
Built at [reviewer_synth.py:432](../scripts/reviewer_synth.py#L432): document
name, date, panel list, and each persona review (truncated to ~8k chars),
concatenated for the synthesis call.

---

## Narrate / Produce — `scripts/pptx_to_video.py`

Narration is a single **stateful** chat: a system message plus one user message
per slide, with the full conversation history carried across slides for
cross-slide coherence.

### 7. Narration system prompt (`build_chat_history`)
Base instruction, with the persona brief prepended and an optional reference
document appended:

```
You are narrating a slide presentation. Write natural spoken narration for each
slide you are given. Output plain text only — no stage directions, sound
effects, or markdown formatting.
```

### 8. `SLIDE_USER_TEMPLATE` — user (per slide)
Sent once per slide, appended to the running history:

```
Slide content:
{slide_text}{notes_block}

Narration:
```

### 9–10. Background music prompts (optional, Produce)
Used only when music generation is requested (`/api/generate-music-prompt`).

- **9. `MUSIC_PROMPT_SYSTEM_BASE`** — "You are a music director scoring a
  presentation video… Output plain text only."
- **10. `MUSIC_PROMPT_USER_TEMPLATE`** — feeds the concatenated slide content and
  asks for a single <120-word music description (genre, mood, tempo,
  instrumentation, dynamic arc) for the ElevenLabs Sound Generation API.

---

## Notes

- **Context window:** every call passes `options.num_ctx` set to the model's max
  (Ollama `/api/show`), so these stacked prompts aren't truncated
  (`REVIEWER_NUM_CTX` / `NARRATE_NUM_CTX` override).
- **Editing prompts:** change the constants above; the server and UI carry no
  prompt text, so a single edit per script updates the whole workflow.
- **Terminal review** (`.claude/skills/review/SKILL.md`) runs the *same* review
  conceptually but delegates wording to the persona-reviewer agent rather than
  these constants.

# Changelog

All notable changes to **SAM Slide Suite** are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project is pre-1.0 and not yet versioned, so dated entries are used.

## [Unreleased]

### Fixed
- **Produce failures left the job unretryable.** The synthesize step deleted the
  rendered work_dir on *error*, so a second Produce attempt failed with a
  confusing `ENOENT … supertonic_narrations.json` instead of the real cause. The
  work_dir is now kept on error (cleaned only on success), and a missing work_dir
  reports "re-run Narrate" clearly.
- **Empty/cue-only slides crashed Produce.** A slide whose narration stripped to
  nothing made edge-tts emit a 0-byte file and ffprobe/ffmpeg fail; such slides
  now get brief silence instead.
- **Voice picker was empty.** `/api/voices` didn't parse edge-tts ≥7's table
  output, so only two fallback voices showed; it now parses the table (322
  voices) with a fallback to the old format.
- **Review showed reports for personas you didn't select.** A review/rewrite run
  listed every report in `reviews/<doc-slug>/`, so prior runs on the same
  document (other personas, a stale synthesis) appeared as result tabs. Results
  are now scoped to the reports the current job produced (via its job snapshot),
  and each run also clears its own stale outputs on disk: a review run replaces
  prior persona reviews + synthesis; a rewrite run replaces prior rewrites
  (keeping the review reports it reads for findings).

### Added
- **TTS provider availability guard.** A new `GET /api/tts-status` reports which
  providers are installed; the Voice picker disables an unavailable provider
  (e.g. "Supertonic (not installed)") and, if one is somehow selected, warns and
  blocks Run — so you can't start a Narrate/Produce that would fail at TTS.
- **Accept draft recommendations.** In the Rewrite tab, an "✓ Accept N drafts"
  button (shown when Advise produced drafts) folds each `[DRAFT: …]` into the
  slide content, drops the paired `[NEEDS: …]` marker, and persists the result
  (new `POST /api/reviews/:slug/:report`) so exports use the accepted version.
- **Prompt reference.** `docs/PROMPTS.md` — a table of every LLM prompt the
  workflows send to Ollama (role, workflow, and the script + line where it
  lives), with per-prompt notes. Linked from the README.
- **UI walkthrough.** `docs/UI-WALKTHROUGH.md` — an annotated, screenshot tour of
  the Review and Rewrite workflow stages (empty → configured → running → results
  → compare), captured from real runs, linked from the README. Also
  `docs/ui-deck.html` — a self-contained light-blue slide deck of the same stages
  with prev/next, keyboard navigation, and a clickable thumbnail rail.
- **Architecture diagrams.** `docs/ARCHITECTURE.md` with Mermaid diagrams of the
  component topology and the Review/Rewrite and Narrate/Produce workflows
  (web UI ↔ API services ↔ Python bridges ↔ Ollama/TTS), linked from the README.
- **Context file attachments.** The Context section accepts an attached `.md`/
  `.txt` file (combined with any typed text) as background that informs the
  review/rewrite. Context now reaches Review/Rewrite (previously narrate-only),
  injected into each persona prompt as a grounding block.
- **Model refresh button.** A `⟳` button re-queries Ollama for the available LLM
  models, with a toast on success/failure — on the Model picker (all tabs) and
  next to Default Model in the Settings panel.
- **Rewrite → "Advise" toggle.** A checkbox in the Rewrite panel that asks the
  persona to draft a `[DRAFT: …]` proposal after each `[NEEDS: …]` gap —
  plausible, context/benchmark-based, and explicitly labeled as unverified, with
  the `[NEEDS:]` marker kept so gaps stay tracked. Wired through
  `store.adviseNeeds` → `/api/rewrite` `advise` field → `reviewer_synth.py
  --advise`. The markdown renderer highlights `NEEDS` (amber) and `DRAFT`
  (purple) inline, and the rewrite summary shows a drafted count.

### Changed
- **Auto-size the model context window.** Review/rewrite and narrate now query
  the selected model's max context length (Ollama `/api/show`) and pass it as
  `num_ctx`, so stacked review prompts (persona brief + context + findings +
  document) and the stateful narration history aren't silently truncated by
  Ollama's small default. No config knob; override with `REVIEWER_NUM_CTX`
  (review/rewrite) or `NARRATE_NUM_CTX` (narrate/produce) to cap memory use.
- **Skip synthesis for a single reviewer.** When only one persona review
  succeeds, the merge/synthesis pass is skipped (nothing to merge) — no
  `00-SYNTHESIS.md` is written, and the Review progress view omits the Synthesis
  row.
- **Review findings now flow into Rewrite.** When a rewrite runs, the prior
  review's analysis for the same document (the synthesis if present, otherwise
  the per-persona reviews) is injected into every rewrite persona's prompt as a
  "REVIEW FINDINGS TO APPLY" work order — applied regardless of the rewrite
  persona. No-op when no prior review exists.

## [2026-06-17] — Initial merged build

Clean-room merge of **SAM Slide Reviewer** (review/rewrite) and **SAM
Slide-to-Video** (narrate/produce) into one Express + Vue web app over a shared
persona library and a local Ollama backend.

### Added
- **Four modes** behind a single SPA: Review, Rewrite, Narrate, Produce.
- **Subprocess bridge** `scripts/reviewer_synth.py` (`run` / `export`) porting the
  retired FastAPI reviewer: persona fan-out (`MAX_CONCURRENT_REVIEWS`), synthesis
  pass, and DOCX / PPTX export. Streams `@@STATE`/`@@SLUG`/`@@REPORT`/`@@DONE`
  markers that the server turns into typed SSE events.
- **Express endpoints** reusing the existing in-memory jobs Map + SSE infra:
  `POST /api/review`, `/api/rewrite`; `GET /api/reviews/jobs/:id`,
  `/api/reviews/:slug/reports`, `/api/export/:slug/:report.(docx|pptx)`.
- **4-tab Vue 3 UI** per the screen-layout spec: shared adaptive left panel,
  per-mode right panels, light/dark/mixed themes, settings drawer, toasts,
  keyboard shortcuts, and a `marked` + DOMPurify markdown renderer.
- **Unified persona library** (`personas/`, 12 `*-PERSONA.md`): the reviewer's
  superset carrying both TTS/voice sections (narration) and `## Review Lens`
  sections (review).
- **Claude config**: the `/review` skill and `persona-reviewer` agent.
- **Prereqs** now also check `pdftotext` (poppler) and `python-docx`.

### Changed
- Narrate/Produce reuse the converter's two-phase flow (`POST /api/narrate` →
  `POST /api/jobs/:id/synthesize`); `PERSONAS_DIR` repointed to the top-level
  `personas/`.

### Removed
- The reviewer's FastAPI server (logic now runs as the `reviewer_synth.py`
  subprocess).

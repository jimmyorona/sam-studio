# Changelog

All notable changes to **SAM Slide Suite** are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project is pre-1.0 and not yet versioned, so dated entries are used.

## [Unreleased]

### Added
- **Model refresh button.** A `⟳` button on the Model picker re-queries Ollama
  for the available LLM models (visible on the Review tab and every other tab),
  with a toast on success/failure.
- **Rewrite → "Advise" toggle.** A checkbox in the Rewrite panel that asks the
  persona to draft a `[DRAFT: …]` proposal after each `[NEEDS: …]` gap —
  plausible, context/benchmark-based, and explicitly labeled as unverified, with
  the `[NEEDS:]` marker kept so gaps stay tracked. Wired through
  `store.adviseNeeds` → `/api/rewrite` `advise` field → `reviewer_synth.py
  --advise`. The markdown renderer highlights `NEEDS` (amber) and `DRAFT`
  (purple) inline, and the rewrite summary shows a drafted count.

### Changed
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

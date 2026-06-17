# CLAUDE.md — SAM Slide Suite

Guidance for Claude Code working in this repo.

## What this is

A merged Express + Vue web app exposing four modes over one shared persona
library and a local Ollama backend: **Review**, **Rewrite** (from the slide
reviewer) and **Narrate**, **Produce** (from the slide-to-video converter).
The former FastAPI reviewer server is retired; its logic now runs as a
subprocess helper. See [README.md](README.md) for the full picture.

## Architecture you must preserve

- **One server**: [web/server/index.js](web/server/index.js) — Express on :3001.
  All modes share its in-memory `jobs` Map and the `GET /api/jobs/:id/stream`
  SSE endpoint.
- **Subprocess bridge pattern**: Python does the heavy lifting; Node spawns it
  and streams stdout. `pptx_to_video.py` (narrate/produce), `supertonic_synth.py`
  (TTS), and `reviewer_synth.py` (review/rewrite/export) all follow this shape.
  When adding Python work, mirror it — don't embed a second long-running server.
- **`reviewer_synth.py` markers**: the `run` subcommand prints `@@STATE`,
  `@@SLUG`, `@@REPORT`, `@@DONE` lines to stdout; the server parses them into
  typed SSE events (`persona`, `slug`, `report`, `done`). Keep both sides in
  sync if you change the protocol.
- **One persona library**: [personas/](personas/) is the single source of truth
  (12 `*-PERSONA.md`). Each file is a superset — narration reads the TTS/voice
  sections, reviews read the `## Review Lens` sections, and each ignores the
  other's. Don't fork per-mode persona copies.

## Paths

`web/server/index.js` resolves `../../scripts` and `../../personas` and
`../../reviews` from `web/server/`. Uploads/outputs live under `web/`.
Generated reports go to top-level `reviews/<doc-slug>/` (gitignored).

## Format support

Review/Rewrite: PPTX, PDF, DOCX, MD, TXT. Narrate/Produce: PPTX, MD only (the
video pipeline renders slide images). The UI disables Narrate/Produce for
unsupported uploads — keep that guard if you touch the left panel.

## Running & verifying

```bash
cd web && ./setup.sh && ./run.sh        # dev (Vite :5174 → Express :3001)
npx vite build                          # production bundle → web/dist/
node server/index.js                    # serves dist/ if present
```

Smoke test without a deck: `POST /api/review` with `-F text=… -F personas=… -F model=…`,
then read `GET /api/jobs/:id/stream`. The CLI helper also works standalone:
`python3 scripts/reviewer_synth.py run --text … --slug t --personas <file> --model <m>`.

## Dependencies

Node: express, multer, cors, vue, vite, marked, dompurify, @elevenlabs/elevenlabs-js.
Python: edge-tts, python-pptx, python-docx, requests (+ optional supertonic).
System: libreoffice, poppler-utils, ffmpeg, marp-cli, ollama.

## Conventions

- Commit one runnable checkpoint per logical change; keep the app bootable.
- Update [CHANGELOG.md](CHANGELOG.md) (the `[Unreleased]` section) in the same
  commit as any user-facing change — Added/Changed/Removed, matching the commit.
- Treat the persona files as a stable contract across modes.
- Prefer extending the existing job/SSE infra over new streaming mechanisms.

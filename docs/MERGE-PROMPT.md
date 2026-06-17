# Build prompt — SAM Slide Suite (clean-room merge)

> Run this in a **new, empty folder** (e.g. `~/projects/sam-slide-suite`) with Claude Code.
> It copies relevant files from two existing repos and assembles a single unified project.

---

You are bootstrapping a brand-new project, **SAM Slide Suite**, in the current
(empty) folder by merging two existing projects. Build it clean-room: copy only
the relevant files from the sources, do **not** modify the source folders, and do
**not** copy any `.git/`, `node_modules/`, `.venv/`, `__pycache__/`, `dist/`,
`uploads/`, `outputs/`, or build artifacts.

## Sources (read-only)

- **Converter** — `/home2/jorona/projects/sam-slide-converter`
  PPTX/MD → AI-narrated MP4 video. Stack: Python CLI (`scripts/pptx_to_video.py`)
  + a Vue 3 / Express web app (`pptx-video-web/`, Express on :3001, Vite on :5174).
  Already shells out to a Python helper (`scripts/supertonic_synth.py`) as a
  subprocess — mirror that pattern for the reviewer bridge.
- **Reviewer** — `/home2/jorona/projects/sam-slide-reviewer`
  Multi-persona review/rewrite of decks & docs. Stack: FastAPI + vanilla JS
  (`webapp/server.py`, :8090) + a Claude `/review` skill and `persona-reviewer`
  agent. Extraction is text-only (`scripts/extract.py`); exports DOCX/PPTX.

## Target architecture (already decided)

ONE web app — the converter's **Express + Vue** — exposing two capabilities as
tabs: **Narrate** (existing video pipeline) and **Review** (reviewer's
review/rewrite). The reviewer's Python logic is bridged into Express as a
subprocess helper (`scripts/reviewer_synth.py`), exactly like
`supertonic_synth.py`. The FastAPI server is retired (kept only as a reference
copy during the port). One persona set is shared by everything.

```
sam-slide-suite/
├── personas/                 ← canonical set = REVIEWER's personas/ (superset:
│                               narrator briefs + `## Review Lens` sections)
├── scripts/
│   ├── pptx_to_video.py      ← from converter
│   ├── supertonic_synth.py   ← from converter
│   ├── make_video.sh         ← from converter
│   ├── extract.py            ← from reviewer
│   └── reviewer_synth.py     ← NEW (Phase 4): bridge, ported from reviewer/webapp/server.py
├── video-production/         ← from converter (production briefs 02–08 only; NOT personas)
├── web/                      ← from converter's pptx-video-web/ (Express + Vue)
│   ├── server/index.js
│   ├── src/App.vue · src/main.js
│   ├── index.html · vite.config.js · package.json · package-lock.json
│   ├── setup.sh · run.sh
│   └── _reviewer_legacy.py   ← TEMP copy of reviewer/webapp/server.py (port source; delete after Phase 4)
├── .claude/
│   ├── skills/review/SKILL.md           ← from reviewer
│   └── agents/persona-reviewer.md       ← from reviewer
├── reviews/.gitkeep          ← generated review output (gitignored)
├── README.md  CLAUDE.md  .gitignore
```

## Phases — do them in order, commit after each, keep a runnable checkpoint

### Phase 0 — Scaffold
- `git init`. Create the folder skeleton above.
- Write `.gitignore` covering: `__pycache__/`, `*.py[cod]`, `.venv/`,
  `web/node_modules/`, `web/dist/`, `web/uploads/`, `web/outputs/`, `outputs/`,
  `reviews/*` (but `!reviews/.gitkeep`), `.DS_Store`.

### Phase 1 — Copy the converter (Narrate side), get it running
- Copy `scripts/{pptx_to_video.py,supertonic_synth.py,make_video.sh}`.
- Copy `pptx-video-web/` → `web/` (exclude node_modules/dist/uploads/outputs and
  its bundled `personas/` — personas come from the reviewer in Phase 2).
- Copy `video-production/` (keep the non-persona production briefs; drop the 3
  persona `.md` files since personas are unified in Phase 2).
- In `web/server/index.js`, repoint `PERSONAS_DIR` to the new top-level
  `../../personas`. Adjust any other `../../scripts/...` paths so they resolve
  from `web/server/` to the new `scripts/` location.
- **Verify:** `cd web && ./setup.sh && ./run.sh`; the Narrate UI loads, the
  persona dropdown and `/api/prereqs` work. Commit.

### Phase 2 — Unify personas (one canonical set)
- Copy the **reviewer's** `personas/` (11 `*-PERSONA.md` + `PERSONA-README.md`)
  to top-level `personas/`. Do NOT use the `video-production/` persona files.
  These are the superset — they keep the TTS/voice sections narration needs AND
  add the `## Review Lens` sections the review/synthesis uses.
- Ensure nothing else references a personas folder. Narration ignores the Review
  Lens sections; reviews ignore the TTS/voice sections (symmetric, by design).
- **Verify:** narration persona dropdown now lists all 11; pick one, confirm the
  narration prompt still builds. Commit.

### Phase 3 — Bring in Claude config (Review side, terminal)
- Copy `.claude/skills/review/SKILL.md` and `.claude/agents/persona-reviewer.md`.
- The `/review` skill globs top-level `personas/`, so it works unchanged.
- **Verify:** `/review` is discoverable and resolves personas. Commit.

### Phase 4 — Bridge the reviewer into Express (the real work)
- Copy `reviewer/webapp/server.py` → `web/_reviewer_legacy.py` and
  `reviewer/scripts/extract.py` → `scripts/extract.py` as the port sources.
- Create `scripts/reviewer_synth.py` — a one-shot CLI shaped like
  `pptx_to_video.py`, carrying over from the legacy server:
  `REVIEWER_SYSTEM_PROMPT`, `REWRITER_SYSTEM_PROMPT`, `SYNTHESIS_SYSTEM_PROMPT`,
  the fan-out orchestration (`MAX_CONCURRENT_REVIEWS`, synthesis pass), and the
  DOCX / `rewrite_md_to_pptx` export helpers. It must stream progress to stdout
  (Express captures it for SSE) and write reports to `reviews/<doc-slug>/`.
- In `web/server/index.js`, add endpoints reusing the existing in-memory `jobs`
  Map and `/api/jobs/:id/stream` SSE infra:
  - `POST /api/review` and `POST /api/rewrite` → spawn `reviewer_synth.py`
  - `GET  /api/reviews/:slug/reports`
  - `GET  /api/export/:slug/:report.(docx|pptx)` → subprocess to the Python export helper
- In `web/src/App.vue`, add a **Review** tab beside Narrate: persona multi-select
  (reuse the persona list), Review/Rewrite mode toggle, report tabs +
  side-by-side compare, and export buttons. Retire FastAPI; delete
  `web/_reviewer_legacy.py` once parity is reached.
- **Verify:** upload a small deck, run Review (panel + synthesis) and Rewrite,
  export DOCX and PPTX. Commit.

### Phase 5 — Docs & prereqs
- Write one `README.md` and one `CLAUDE.md` describing the unified suite (Narrate
  + Review, the subprocess-bridge architecture, ports, persona system).
- Extend the prereqs panel / `/api/prereqs` to also check `python-docx` and
  `pdftotext` (poppler-utils). Reconcile setup scripts and the pip/npm install
  lists (LibreOffice, ffmpeg, poppler-utils, edge-tts, python-pptx, python-docx,
  fastapi deps no longer needed, marp-cli, Ollama).
- Final commit.

## Rules
- Treat both source folders as **read-only**. Never write to them.
- After each phase, leave the project in a runnable state and commit with a clear
  message.
- Prefer copying then adapting over rewriting from scratch — the converter's Vue
  UI (SSE logs, review mode, voice preview) and the reviewer's prompts/exports
  are working code; preserve their behavior.
- If a copy path or reference is ambiguous, inspect the source file before
  guessing.

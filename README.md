# SAM Slide Suite

A unified, local-first platform for **reviewing**, **rewriting**, **narrating**,
and **producing** presentation content — one document in, expert critique, a
polished rewrite, or a narrated video out. All powered by the same persona
library and a local Ollama model.

It merges two former projects into a single Express + Vue web app:

- **Narrate / Produce** — from the *slide-to-video* converter: per-slide AI
  narration with cross-slide memory, then TTS + ffmpeg assembly into MP4.
- **Review / Rewrite** — from the *slide reviewer*: multi-persona critique with
  synthesis, and full-deck rewrites with speaker notes and `[NEEDS: …]`
  placeholders. The reviewer's Python logic is bridged into Express as a
  subprocess helper (`scripts/reviewer_synth.py`) — the same pattern the
  converter already used for `supertonic_synth.py`. The old FastAPI server is
  retired.

## The four modes

| Mode | What it does | Backend |
|------|--------------|---------|
| **Review** | Several personas independently critique the deck, then a synthesis pass merges consensus findings, conflicts, and priority fixes | `reviewer_synth.py` fan-out |
| **Rewrite** | One persona rewrites the whole deck in its voice, with speaker notes | `reviewer_synth.py` |
| **Narrate** | Generates an editable per-slide narration script with directorial cues | `pptx_to_video.py` (phase 1) |
| **Produce** | Synthesizes TTS and assembles a 1920×1080 H.264/AAC MP4 | `pptx_to_video.py` (phase 2) |

Review/Rewrite accept PPTX, PDF, DOCX, MD, and TXT. Narrate/Produce require
PPTX or MD (the video pipeline renders slide images).

## Architecture

```
sam-studio/
├── personas/              one canonical persona library (12 *-PERSONA.md)
│                          superset: TTS/voice sections + ## Review Lens sections
├── scripts/
│   ├── pptx_to_video.py   narration + TTS + video assembly (converter)
│   ├── supertonic_synth.py  offline TTS helper
│   ├── make_video.sh
│   ├── extract.py         PPTX/PDF/DOCX/MD/TXT → markdown (reviewer)
│   └── reviewer_synth.py  NEW bridge: review/rewrite fan-out + DOCX/PPTX export
├── video-production/      production briefs (non-persona)
├── web/                   Express (:3001) + Vue 3 SPA (Vite :5174)
│   ├── server/index.js    one server, all modes; in-memory jobs + SSE
│   └── src/               4-tab UI (store.js + components/)
├── .claude/
│   ├── skills/review/     /review skill (terminal)
│   └── agents/persona-reviewer.md
└── reviews/<doc-slug>/    generated reports (gitignored)
```

The Vue app is one SPA with a persistent top bar (mode tabs + settings) and a
two-panel body: a shared left config panel and a per-mode right output panel.
See [SCREEN-LAYOUT-PROMPT.md](SCREEN-LAYOUT-PROMPT.md) for the full UI spec.

## Quick start

```bash
cd web
./setup.sh          # npm install + create uploads/ outputs/

# Python + system deps (once):
pip install edge-tts python-pptx python-docx requests
sudo apt install libreoffice poppler-utils ffmpeg
npm i -g @marp-team/marp-cli        # Markdown slides only

ollama serve &      # local model backend
ollama pull llama3.2:3b

./run.sh            # dev: UI http://localhost:5174 · API http://localhost:3001
./run.sh --build && ./run.sh --prod   # production: Express serves built SPA on :3001
```

The Settings gear (⚙️) configures the Ollama URL, default model, theme
(light/dark/mixed), review concurrency, and TTS provider/key. Settings persist
to `localStorage`.

## Terminal interface

The `/review` Claude Code skill runs the same multi-persona review from the
terminal, globbing `personas/` and writing to `reviews/<doc-slug>/`:

```
/review deck.pptx 11 12 18      # skeptic, executive, legal
/review deck.pptx               # personas chosen interactively
```

## Key endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/review`, `/api/rewrite` | start a persona fan-out job |
| `GET /api/reviews/:slug/reports` | finished report markdown |
| `GET /api/export/:slug/:report.(docx\|pptx)` | export a report |
| `POST /api/narrate` | generate narration script (phase 1) |
| `POST /api/jobs/:id/synthesize` | TTS + assemble video (phase 2) |
| `GET /api/jobs/:id/stream` | SSE progress for any job |
| `GET /api/personas`, `/api/models`, `/api/voices`, `/api/prereqs` | catalogues + health |

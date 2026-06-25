# SAM Studio Suite

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

## Feature highlights

- **Multi-persona review with synthesis** — run any subset of the 12 personas in
  parallel; consensus findings, conflicts (weighted by each persona's known
  blind spots), and a top-5 priority-fix list are merged into one synthesis.
  Pick a single reviewer and the redundant synthesis pass is skipped.
- **Review-informed rewrite** — when you rewrite after reviewing the same
  document, the prior review's findings are folded into every rewrite persona's
  prompt automatically, so the fixes actually get applied regardless of voice.
- **"Advise" mode** — optionally have the rewrite draft proposed `[DRAFT: …]`
  content for each `[NEEDS: …]` gap the review surfaced, clearly labeled as
  unverified starting points to confirm or replace.
- **Editable narration, then video** — narration is generated per slide with
  cross-slide memory and directorial cues, fully editable (raw or per-slide)
  with in-browser voice preview before you produce the MP4.
- **Background context, typed or attached** — add a `.md`/`.txt` file or pasted
  notes that ground the review, rewrite, and narration.
- **Automatic context sizing** — the model's full context window is detected and
  used (no manual token config), so stacked prompts and long narration history
  aren't silently truncated.
- **Exports** — DOCX for any report, PPTX for rewrites (real speaker-notes
  pages), MP4 for produced video.
- **One shared workspace** — document, persona picks, and results persist across
  tabs; live SSE progress, three themes (light/dark/mixed), settings drawer,
  toasts, and keyboard shortcuts.
- **Local-first** — all generation runs against a local Ollama model; TTS via
  Edge (free), ElevenLabs, or offline Supertonic.
- **Terminal too** — the same multi-persona review runs from Claude Code via the
  `/review` skill.

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
See [SCREEN-LAYOUT-PROMPT.md](SCREEN-LAYOUT-PROMPT.md) for the full UI spec,
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for Mermaid diagrams of the
component topology and the Review/Rewrite and Narrate/Produce workflows, and
[docs/UI-WALKTHROUGH.md](docs/UI-WALKTHROUGH.md) for an annotated, screenshot
tour of the Review and Rewrite stages (with a slideshow at
[docs/ui-deck.html](docs/ui-deck.html)). [docs/PROMPTS.md](docs/PROMPTS.md)
tables every LLM prompt the workflows use and which script holds it.

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

## Running on Windows / Azure Virtual Desktop (WSL2)

For Windows-based environments (like Azure Virtual Desktop), the recommended way to run this suite is via **WSL2 (Windows Subsystem for Linux)** with an Ubuntu distribution, which handles the Linux-native script executions and prerequisite checks:

1. **Install WSL2:**
   Open PowerShell as Administrator and run:
   ```powershell
   wsl --install
   ```
   Restart the virtual desktop if prompted.

2. **Install Ubuntu dependencies:**
   Open the Ubuntu terminal and run:
   ```bash
   sudo apt update
   sudo apt install -y libreoffice poppler-utils ffmpeg python3-pip python3-venv nodejs npm
   npm i -g @marp-team/marp-cli
   ```

3. **Install Ollama inside WSL:**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

4. **Navigate and Run:**
   WSL automatically mounts your Windows drives (e.g. `C:` is at `/mnt/c/`). Navigate to the cloned workspace and boot the server:
   ```bash
   cd /mnt/c/path/to/sam-studio/web
   ./setup.sh
   ./run.sh rpod  # Runs production mode on port 3001 for external access
   ```
   *Tip:* If your Azure Virtual Desktop VM uses a GPU-enabled size, ensure Windows host drivers are up to date. WSL2 will automatically pass through GPU acceleration to Ollama.

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

# pptx-video-web

Web UI for the PPTX / Markdown → AI-Narrated Video pipeline. Wraps `scripts/pptx_to_video.py` in a browser interface with real-time progress streaming and a one-click MP4 download.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vue 3 + Vite (port 5174) |
| Backend | Express (port 3001) |
| Pipeline | `scripts/pptx_to_video.py` (subprocess) |

## Quickstart

```bash
cd src/pptx-video-web
./setup.sh      # first time — npm install + creates uploads/ outputs/
./run.sh        # starts both servers → http://localhost:5174
```

## Prerequisites

```bash
# Ubuntu / Debian
sudo apt install libreoffice poppler-utils ffmpeg

# Python
pip install edge-tts python-pptx

# Node (for Marp — Markdown slide rendering)
npm i -g @marp-team/marp-cli
# or use via npx (no install needed if Node is present)
```

Ollama must be running locally (`ollama serve`). Use the **Check prerequisites** panel in the UI to verify everything is in place before converting.

> **Narration timeout:** each Ollama call is allowed 300 s per slide. If you see `timed out` errors, try a smaller model or a shorter deck.

## Usage

1. Drop a `.pptx` or `.md` file onto the upload zone (or click to browse)
2. Select a **Narrator Persona** from the dropdown (optional) — loads a character brief into the editable textarea, which is prepended to every slide narration prompt
3. Choose a **Voice engine** using the Edge TTS / ElevenLabs toggle:
   - **Edge TTS** — local, free; pick from recommended voices or type a custom voice ID
   - **ElevenLabs** — cloud API; enter your API key, voice ID, model, and tune the voice settings sliders
4. Expand **Options** to adjust model, pause length, DPI, Ollama URL, and Marp theme (`.md` files only)
5. Click **Generate Video** — live log output streams in real time; click **Download MP4** when the job completes

### Review narration before generating video (optional)

Check **Review & edit narration before generating video** in step 3. This splits the pipeline into two phases:

1. **Narrate Slides** — runs the LLM against all slides and stops before voice synthesis. A review panel opens below, showing each slide's narration in an editable textarea with a live word count.
2. Edit any slides — fix tone, emphasis, length, or factual wording. Narrations for other slides are unaffected.
3. Click **Generate Video** in the review panel — TTS synthesis and assembly run on the edited narrations.

The **↺ Re-narrate** button reruns the LLM from scratch, discarding edits. TTS options (voice, ElevenLabs settings) chosen before narration are preserved and used automatically at synthesis time.

The light/dark theme toggle is in the top-right of the header; preference is saved to `localStorage`. The ElevenLabs API key is stored in `localStorage` only and never logged by the server.

## Narrator Persona

The persona dropdown is populated from all `.md` files in the `personas/` directory. Selecting a file loads its content into an editable textarea — you can use it as-is or modify it for the current job.

The persona text is prepended to every slide narration prompt sent to Ollama, separated from the slide content by `---`. Clearing the selection (choosing "None") sends no persona and uses the default generic narration style.

### Available personas

| # | File | Archetype | Best For |
|---|------|-----------|----------|
| 01 | `01-SAM-PERSONA.md` | Senior systems architect — measured confidence | Formal briefings, architecture boards |
| 09 | `09-EMPATHETIC-HOLISTIC-PERSONA.md` | Builder/coach — humans first | Onboarding, change management |
| 10 | `10-ENERGETIC-COLLABORATIVE-PERSONA.md` | High-energy teammate — upbeat | Sprint demos, team showcases |
| 11 | `11-SKEPTIC-PROOF-ANALYST-PERSONA.md` | Seasoned analyst — states assumptions openly | CFO/auditor reviews |
| 12 | `12-EXECUTIVE-BRIEFING-PERSONA.md` | Trusted briefer — answer first | C-suite, board updates |
| 13 | `13-DOCUMENTARY-NARRATOR-PERSONA.md` | Cinematic, third-person gravitas | Training videos, org histories |
| 14 | `14-TEACHER-EXPLAINER-PERSONA.md` | Patient, Socratic — builds understanding step by step | Technical onboarding, non-technical audiences |
| 15 | `15-SALES-PITCH-PERSONA.md` | Confident, benefit-forward | Proposal decks, vendor pitches |
| 16 | `16-JOURNALIST-INVESTIGATIVE-PERSONA.md` | Neutral, finding-first — no editorializing | Post-mortems, audit findings |
| 17 | `17-WORKSHOP-FACILITATOR-PERSONA.md` | Reflective, uses "we"/"you" | Interactive training, retrospectives |
| 18 | `18-LEGAL-COMPLIANCE-PERSONA.md` | Declarative, precisely hedged | Policy briefings, compliance docs |

To add a new persona: drop a `.md` file into `personas/` and click **↺** in the persona dropdown to refresh the list. No server restart needed.

## Markdown slide format

Upload any `.md` file directly. Slides are split on `---` horizontal rules (standard Marp syntax):

```markdown
# Slide One Title
First slide content, bullet points, etc.

---

## Slide Two Title
- Point one
- Point two
```

If no `---` separators are present the parser falls back to splitting on `#` / `##` headings.

**Rendering:** Marp CLI converts the `.md` file to styled PNG images at 2× scale for crisp 1080p video.

### Themes

| Theme | Description |
|-------|-------------|
| `default` | Clean white, blue accents |
| `gaia` | Dark background with gradient header |
| `uncover` | Minimal, centered layout |

## Options reference

| Option | Default | Notes |
|--------|---------|-------|
| Narrator Persona | None | Select from `personas/*.md` or type custom text; click ↺ to refresh |
| Voice engine | Edge TTS | Toggle between Edge TTS (local) and ElevenLabs (cloud) |
| Edge TTS Voice | `en-US-AriaNeural` | Recommended list, full en-US/en-GB list, or custom ID |
| ElevenLabs API Key | — | Stored in `localStorage`; never logged server-side |
| ElevenLabs Voice ID | `pNInz6obpgDQGcFmaJgB` | Adam — see elevenlabs.io/voice-library for all IDs |
| ElevenLabs Model | `eleven_multilingual_v2` | Multilingual v2, Turbo v2.5, or v3 |
| Stability | `0.5` | Voice consistency 0–1 |
| Similarity Boost | `0.75` | Adherence to voice profile 0–1 |
| Style | `0.0` | Expressiveness 0–1 |
| Speed | `1.0x` | Speaking rate 0.7–1.2 |
| Speaker Boost | on | Enhances voice clarity |
| Ollama URL | `http://localhost:11434` | Model list fetched live from this URL |
| Model | `llama3.2:3b` | Swap to `qwen2.5:14b` for better narration quality; click ↺ to refresh after changing URL |
| Slide Theme | `default` | Marp theme — shown only for `.md` uploads |
| Pause | `1.0 s` | Silence appended after each slide's audio |
| DPI | `150` | Slide image resolution for PPTX — 150 ≈ 1920×1080 |
| Animation FPS | `8` | Frames per second for `[FRAME]`-tagged animation groups |
| Keep temp | off | Preserves working directory for debugging |

## Animation / Motion Simulation

Simulate motion by creating multiple consecutive slides that show incremental visual changes — like a cartoon flipbook. The pipeline plays them in rapid succession while a single narration audio track runs underneath.

### Authoring

**PPTX:** Add `[FRAME]` anywhere in a slide's **speaker notes** to mark it as an animation frame of the preceding base slide.

**Markdown:** Add `<!-- FRAME -->` anywhere inside a slide block (between `---` separators).

```
Slide 1  (notes: empty)       → base slide — gets narration
Slide 2  (notes: [FRAME])     → animation frame of slide 1
Slide 3  (notes: [FRAME])     → animation frame of slide 1
Slide 4  (notes: empty)       → new base slide — new narration
```

At assembly time the base slide's narration audio plays over all frames in the group, which cycle at the configured **Animation FPS**. Non-animated slides are unaffected.

Use the **Animation FPS** input in Options (default: 8) to control how fast the frames cycle — lower values are slower, higher values are faster.

## Background Music

Enable **Generate background music (ElevenLabs)** in the Options section to mix an AI-generated ambient track under the narration.

1. Check the box to reveal the music panel
2. Write a music description manually, or click **✨ Generate Prompt** to have the LLM produce one from your slide content and persona
3. Set **Duration** (seconds) and **Mix level** (dB — negative values keep music below narration)
4. Provide an ElevenLabs API key (auto-filled if ElevenLabs is already selected as the voice engine)

Music is generated via the ElevenLabs Sound Generation API (`/v1/sound-generation`) and mixed into the final video with ffmpeg's `amix` filter, looped to match video length and faded out cleanly.

The **✨ Generate Prompt** button sends the uploaded file to the LLM along with the current persona and context — it requires a file to be uploaded first and Ollama to be reachable.

## API endpoints (Express, port 3001)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/convert` | Upload `.pptx` or `.md` + options; returns `{ jobId }` — full pipeline in one shot |
| `POST` | `/api/narrate` | Phase 1 of review mode: extract + render + narrate only; returns `{ jobId }` |
| `GET` | `/api/jobs/:id/narrations` | Return narrations array after `/api/narrate` completes |
| `POST` | `/api/jobs/:id/synthesize` | Phase 2: accept `{ narrations }` (possibly edited), run TTS + assembly |
| `GET` | `/api/jobs/:id/stream` | SSE log stream; emits `{ type: 'log' }` and `{ type: 'done', status }` events |
| `GET` | `/api/jobs/:id/download` | Stream the finished `.mp4` |
| `GET` | `/api/personas` | List `.md` files from `personas/` with `filename`, `label`, `content` |
| `GET` | `/api/models` | Proxy to Ollama `/api/tags` |
| `GET` | `/api/voices` | Run `edge-tts --list-voices` (cached per process) |
| `GET` | `/api/prereqs` | Check `soffice`, `pdftoppm`, `ffmpeg`, `edge-tts`, Ollama, Marp CLI |
| `POST` | `/api/generate-music-prompt` | Upload file + options; returns `{ prompt }` — LLM-generated music description |

`/api/prereqs` accepts `?ttsProvider=edge|elevenlabs` — when `elevenlabs`, edge-tts is marked as not required.

**Review mode SSE flow:** `/api/narrate` emits `{ type: 'done', status: 'narrated' }` when narration is complete. The client fetches `/api/jobs/:id/narrations`, renders the review panel, then calls `/api/jobs/:id/synthesize`. The client re-opens `/api/jobs/:id/stream` to stream Phase 2 progress.

## Output

Videos are written to `outputs/<jobId>.mp4` on the server and streamed to the browser on download. Uploaded files are deleted after the job completes.

## Production build

```bash
./run.sh --build   # Vite build → dist/
./run.sh --prod    # Express only, serves dist/ statically
```

---

## Changelog

### 2026-05-26 — Cartoon animation / motion simulation via frame groups

- **`[FRAME]` tag** — add `[FRAME]` to a PPTX slide's speaker notes (or `<!-- FRAME -->` in Markdown) to mark it as an animation frame of the preceding base slide. Frame slides share the base slide's narration and audio.
- **Animation FPS** — new Options input (default: 8); controls how fast frame images cycle during playback. Passed to both the Python CLI (`--anim-fps`) and the Node.js manifest assembly path.
- **Looping frame assembly** — for animated groups, ffmpeg cycles through all frame images at the configured FPS for the full duration of the narration audio using the concat demuxer. Static slides use the existing `-loop 1` path and are completely unaffected.
- **Updated manifest format** — `images` field is now an array of arrays (`string[][]`); each inner array holds the image paths for one narration group. Single-image groups remain `["path"]`. The assembly function handles both formats for backward compatibility.

### 2026-05-25 — Background music, new personas, model refresh, network binding

- **Background music** — new Options panel section; check "Generate background music (ElevenLabs)" to mix an AI-generated ambient track into the final video. Configurable duration, mix level (dB), and ElevenLabs API key. Music is generated via `/v1/sound-generation`, looped to video length, and mixed with `amix`.
- **✨ Generate Prompt button** — sends the uploaded file + current persona/context to Ollama via `--generate-music-prompt-only`; returns a ready-to-use music description without running the full pipeline.
- **`POST /api/generate-music-prompt`** — new endpoint backing the Generate Prompt button.
- **`--generate-music-prompt-only`** — new Python CLI flag; extracts slide text, calls Ollama for a music description, writes JSON to `--output`, and exits.
- **11 narrator personas** — six new persona files added (`13-DOCUMENTARY-NARRATOR`, `14-TEACHER-EXPLAINER`, `15-SALES-PITCH`, `16-JOURNALIST-INVESTIGATIVE`, `17-WORKSHOP-FACILITATOR`, `18-LEGAL-COMPLIANCE`).
- **↺ Refresh model button** — added next to the model dropdown; re-fetches the model list from the current Ollama URL on demand without blurring the URL field.
- **Network binding** — Express server now explicitly binds to `0.0.0.0`; Vite `allowedHosts` set to `all` so the app is reachable from any host without hostname whitelisting.

### 2026-05-25 — Narration review & edit

- **Review mode** — checkbox in step 3 splits the pipeline into two phases: narration-only (`POST /api/narrate`) and synthesis + assembly (`POST /api/jobs/:id/synthesize`).
- **Review panel** — appears after narration completes; shows each slide's LLM-generated narration in a resizable textarea with live word count. Edits are reflected directly in the final audio.
- **Re-narrate** — button re-runs the LLM from scratch when a full regeneration is needed.
- **`synthesizeEdgeTTSSlides()`** — Edge TTS synthesis added to the Node.js server (was Python-only); enables the review path without requiring Python for synthesis.
- **Three new API endpoints** — `/api/narrate`, `/api/jobs/:id/narrations`, `/api/jobs/:id/synthesize`.
- **SSE reconnect** — client re-subscribes to `/api/jobs/:id/stream` between Phase 1 and Phase 2 to stream synthesis progress. Job record holds manifest and TTS opts across both phases.

### 2026-05-23 — Narrator Persona injection

- **Persona selector** — dropdown above the TTS toggle populated from all `.md` files in `video-production/`. Selecting a file loads its content into an editable textarea; the text is prepended to every Ollama narration prompt.
- **`/api/personas`** — new Express endpoint returning `{ filename, label, content }` for each persona file.
- **`--persona-text` / `--persona-file`** — new CLI args in `pptx_to_video.py`; `load_persona()` helper resolves inline text or file path.
- **`generate_narration()`** — updated signature adds `persona: str = ""`; injects `{persona}\n\n---\n\n` before the slide content when set.
- **`NARRATION_PROMPT`** — refactored to `{persona_block}` + `{slide_text}` template slots.

### 2026-05-23 — ElevenLabs TTS + provider toggle

- **Voice engine toggle** — pill-style radio button (Edge TTS / ElevenLabs) always visible at the top of the Options card; replaces the hidden dropdown.
- **ElevenLabs support** — API key (password field, stored in `localStorage`), voice ID, model selector, and sliders for stability, similarity boost, style, speed, and speaker boost.
- **`--tts-provider`** — new CLI arg; `edge` keeps existing behaviour, `elevenlabs` calls `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` directly via `urllib` (no extra Python dependency).
- **Sequential synthesis** — ElevenLabs slides are synthesized one at a time to respect per-minute character rate limits.
- **Server** — `/api/convert` forwards all `el*` fields; `/api/prereqs` marks edge-tts as not required when `ttsProvider=elevenlabs`.

### 2026-05-22 — Themed Markdown slide rendering (Marp)

- **Marp rendering** — Markdown files rendered to styled PNG slides via Marp CLI.
- **Theme picker** — `default`, `gaia`, `uncover`; shown only for `.md` uploads.
- **Image scale** — 2× rendering for crisp 1080p output.
- **`render_markdown_with_marp()`** / **`check_marp()`** — new functions in `pptx_to_video.py`.

### 2026-05-22 — Markdown input support

- UI accepts `.md` files alongside `.pptx`.
- `parse_markdown_slides()` splits on `---`; falls back to heading-based split.

### Initial release — video presentations

- Web UI wrapping `scripts/pptx_to_video.py` for PPTX → MP4 conversion
- Real-time SSE log streaming per job
- Ollama model selector, Edge TTS voice picker, light/dark theme, prerequisites checker
- Production build support

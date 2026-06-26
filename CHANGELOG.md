# Changelog

All notable changes to **SAM Slide Suite** are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project is pre-1.0 and not yet versioned, so dated entries are used.

## [Unreleased]

### Added
- **Google Gemini API support.** Integrated Google Gemini API as a first-class model provider alongside local Ollama. Added Model Provider configuration select and Gemini API Key input to Settings Drawer, updated store and left config panel, and modified Python subprocess bridges (`reviewer_synth.py`, `pptx_to_video.py`) to route requests to Gemini generateContent REST endpoints with stateful role mapping.

### Fixed
- **Docker build failed downloading Ollama.** Ollama changed its linux release
  asset from `ollama-linux-amd64.tgz` (now 404) to `ollama-linux-amd64.tar.zst`
  (zstd-compressed); the Dockerfile now pulls the `.tar.zst` and extracts it with
  `tar --zstd` (added `zstd` to the image). Verified: the image builds and boots
  with `llama3.1:8b` baked in.
- **Gemini API calls failed with 429 Too Many Requests.** High frequency requests (e.g. slide-by-slide loops or concurrent persona critiques) triggered rate limit errors. Added robust retry logic with exponential backoff and jitter for `429` (rate limit) and `5xx` (server error) responses.
- **Supertonic ignored the voice selection (always its default).** The Supertonic
  voice (F1/M1/…) is the `stVoice` field, but the client only sent it as `voice`,
  which the server ignores for Supertonic — so every preview/narration used the
  default. The store now sends `stVoice` for Supertonic in preview and narrate
  (Produce inherits it).
- **Voice preview played the same voice regardless of selection.** The voice-
  picker Preview used a fire-and-forget `new Audio().play()` that wasn't retained
  (could be GC'd before playing) and never stopped the previous clip, so a newly
  selected voice's audio could be lost under the still-playing earlier one. It now
  retains a single audio element, stops the prior preview, and revokes old blob
  URLs. (The server already returned the correct per-voice audio.)
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
- **Optional AMD ROCm GPU support for the Docker image.** Build with
  `--build-arg OLLAMA_ROCM=true` to overlay AMD's ROCm libraries into the bundled
  Ollama; run with `--device /dev/kfd --device /dev/dri` and the host's
  `render`/`video` GIDs to offload inference onto an AMD GPU. Verified on an
  RX 9070 (gfx1201): all 33 layers of llama3.1:8b load into VRAM. Default builds
  remain CPU/NVIDIA and are unaffected.
- **Windows / Azure WSL2 run documentation.** Added instructions to `README.md` for setting up and running the application suite on Windows Azure Virtual Desktop via WSL2.
- **Prod / Rpod mode shortcuts and auto-build.** Added support for `prod`, `rpod`, and `--rpod` flags to `web/run.sh`. If the production `dist/` directory does not exist, the script automatically triggers a production build. It also provides port-forwarding documentation output on startup for easier external access.
- **Docker package.** `docker/` ships a single, self-contained image
  (`docker/Dockerfile`, multi-stage: Vite build → slim runtime with
  libreoffice/poppler/ffmpeg/chromium, a Python venv, and Marp CLI) that also
  **bundles Ollama with the `llama3.1:8b` model baked in at build time** (chosen
  to run all four modes' prompts while keeping the image far smaller than a 20B
  model; override with `--build-arg OLLAMA_MODEL`). An
  `entrypoint.sh` starts `ollama serve` alongside the Node server; the app reaches
  it on localhost (override `OLLAMA_URL` for an external Ollama, `OLLAMA_PULL` for
  an extra model, `--build-arg OLLAMA_MODEL` to bake a different one). Includes
  `docker-compose.yml`, `.env.example`, and a `README.md` with ECR/ECS/EC2 deploy
  steps for an AWS tenant.
- **`OLLAMA_URL` server default.** The Express server now reads its default Ollama
  endpoint from the `OLLAMA_URL` env var (falling back to `http://localhost:11434`),
  so containerized deployments can target an Ollama elsewhere in the VPC without a
  UI change; per-request `ollamaUrl` from the UI still wins.
- **Narrate from the Rewrite output.** A "Narration source" toggle on the Narrate
  tab lets you narrate either the uploaded document (default) or the Rewrite tab's
  rewritten deck. Choosing the rewrite converts it to a clean Marp deck (one slide
  per `## Slide N` section, speaker notes + NEEDS/DRAFT dropped) and feeds that to
  the narration pipeline. The option is disabled until a rewrite exists.
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
- **Edge TTS voices: English-only with personalities.** `/api/voices` now reads
  the catalogue via the `edge_tts` Python API and returns only English-speaking
  locales (en-US, en-GB, en-AU, en-IN, …), each labeled with its voice
  "personalities" (Microsoft's term for the voice actors), replacing the
  table-scraping parser that returned all 322 voices unlabeled.
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

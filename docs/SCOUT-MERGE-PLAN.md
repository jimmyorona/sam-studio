# Analysis & Merged Application Proposal

## Summary of Source Applications

### App 1: SAM Slide Reviewer

| Aspect | Detail |
|--------|--------|
| **Purpose** | Multi-persona review, critique, and rewriting of slide decks |
| **Core function** | 12 expert personas independently review a document, then results are synthesized into consensus findings, conflicts, and priority fixes |
| **Modes** | Review (critique + scorecard) · Rewrite (full deck in persona voice) |
| **Inputs** | PPTX, PDF, DOCX, Markdown, plain text, pasted text |
| **Outputs** | Markdown reports · DOCX exports · PPTX rewrites with speaker notes |
| **UI** | FastAPI web app (port 8090), vanilla JS, no build step |
| **AI backend** | Ollama (local models) |
| **Other interfaces** | Claude Code `/review` skill · Portable single-file prompts for any chat agent |
| **Key features** | Side-by-side compare · 3 themes · Synthesis with blind-spot weighting · `[NEEDS: …]` placeholders for missing data |
| **Architecture** | `scripts/extract.py` → fan-out persona reviews (3 concurrent) → synthesis pass → markdown on disk |

### App 2: SAM Slide to Video

| Aspect | Detail |
|--------|--------|
| **Purpose** | Convert slide decks into narrated MP4 videos with AI-generated narration |
| **Core function** | Extract slide content → generate narration per slide via LLM → render images → synthesize audio → assemble video |
| **Modes** | Direct generation · Review & edit narration (two-phase) |
| **Inputs** | PPTX, Markdown |
| **Outputs** | MP4 video (1920×1080, H.264, AAC) |
| **UI** | Web UI (port 5174) + Python CLI + Shell wrapper |
| **AI backend** | Ollama (local models, stateful cross-slide memory) |
| **TTS** | Edge TTS (free, local) · ElevenLabs (cloud) · Supertonic (offline, on-device) |
| **Key features** | Cross-slide memory · Speaker notes as narration guidance · Persona + voice pairings · Animation frames (`[FRAME]`) · Directorial cues (`[VISUAL CUE]`, `*(tone)*`, SSML) · Editable narration script |
| **Architecture** | `pptx_to_video.py` → per-slide LLM chat → TTS → ffmpeg assembly |

---

## Feature Overlap & Gaps

| Capability | Reviewer | Video | Merged Need |
|------------|:--------:|:-----:|-------------|
| PPTX extraction | ✅ | ✅ | Unify into one extractor |
| PDF extraction | ✅ | ❌ | Keep |
| DOCX extraction | ✅ | ❌ | Keep |
| Markdown input | ✅ | ✅ | Unify |
| Persona library (12) | ✅ | ✅ (same files) | Single shared library |
| Review/critique mode | ✅ | ❌ | Keep |
| Rewrite mode | ✅ | ❌ | Keep |
| Synthesis (multi-persona merge) | ✅ | ❌ | Keep |
| Narration generation | ❌ | ✅ | Add |
| TTS (3 providers) | ❌ | ✅ | Add |
| Video assembly | ❌ | ✅ | Add |
| Cross-slide memory | ❌ | ✅ | Add |
| Animation frames | ❌ | ✅ | Add |
| Narration review/edit | ❌ | ✅ | Add |
| DOCX export | ✅ | ❌ | Keep |
| PPTX export (rewrite) | ✅ | ❌ | Keep |
| Side-by-side compare | ✅ | ❌ | Keep |
| Claude Code skill | ✅ | ❌ | Extend |
| Portable prompts (any agent) | ✅ | ❌ | Extend |
| Themes (light/dark/mixed) | ✅ | ❌ | Keep |
| Context injection | ❌ | ✅ | Add |

---

## Proposed Merged Application: **SAM Studio**

### Vision

A unified local-first platform for **reviewing**, **rewriting**, **narrating**, and **producing** presentation content — powered by the same persona library and backed by Ollama.

> **One document in → expert critique, polished rewrite, or narrated video out.**

---

### Core Modes

| Mode | Description | Inherited From |
|------|-------------|----------------|
| **Review** | Multi-persona critique → synthesis with consensus, conflicts, priority fixes | Reviewer |
| **Rewrite** | Persona rewrites full deck with speaker notes and `[NEEDS: …]` placeholders | Reviewer |
| **Narrate** | Generate narration script per slide with cross-slide memory and directorial cues | Video |
| **Produce** | TTS synthesis + ffmpeg assembly → MP4 video | Video |
| **Compare** | Side-by-side view of any two outputs (reviews, rewrites, narration scripts) | Reviewer |

### Workflow Compositions

Users can chain modes into end-to-end workflows:

```
┌─────────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Upload    │────▶│  Review  │────▶│ Rewrite  │────▶│ Narrate  │────▶ Produce
│  PPTX/PDF/  │     │ (panel)  │     │(persona) │     │ (script) │     (MP4)
│  DOCX/MD    │     └──────────┘     └──────────┘     └──────────┘
└─────────────┘           │                │                │
                          ▼                ▼                ▼
                      DOCX report     PPTX export     Edit script
```

| Workflow | Steps | Use Case |
|----------|-------|----------|
| **Full production** | Upload → Review → Rewrite → Narrate → Edit → Produce | New deck through final video |
| **Quick video** | Upload → Narrate → Produce | Existing good deck, just add narration |
| **Review only** | Upload → Review | Pre-meeting critique |
| **Rewrite + export** | Upload → Rewrite → PPTX export | Improve deck without video |
| **Review → Narrate** | Upload → Review → fix deck → Narrate → Produce | Review-informed narration |

---

### Unified Architecture

```
sam-studio/
├── personas/                    # Single shared persona library (12+ files)
│   ├── 01-SAM-PERSONA.md
│   ├── ...
│   └── PERSONA-README.md
├── prompts/
│   ├── REVIEW-DOCUMENT.md       # Portable review prompt
│   ├── REWRITE-DOCUMENT.md      # Portable rewrite prompt
│   └── NARRATE-DOCUMENT.md      # Portable narration prompt (new)
├── scripts/
│   ├── extract.py               # Unified extractor (PPTX/PDF/DOCX/MD/TXT)
│   ├── narrate.py               # Narration generation (cross-slide memory)
│   ├── tts.py                   # TTS provider abstraction (Edge/ElevenLabs/Supertonic)
│   ├── assemble.py              # ffmpeg video assembly
│   └── export.py                # DOCX/PPTX export from markdown
├── webapp/
│   ├── server.py                # FastAPI backend — all modes
│   ├── static/
│   │   ├── index.html           # Single-page app
│   │   ├── app.js               # Mode router + UI logic
│   │   ├── review.js            # Review mode UI
│   │   ├── rewrite.js           # Rewrite mode UI
│   │   ├── narrate.js           # Narrate + edit mode UI
│   │   ├── produce.js           # Video production UI
│   │   ├── compare.js           # Side-by-side compare UI
│   │   └── themes.css           # Light / dark / mixed
│   └── ws.py                    # WebSocket for streaming progress
├── .claude/
│   ├── skills/
│   │   ├── review/              # /review skill
│   │   ├── rewrite/             # /rewrite skill (new)
│   │   └── narrate/             # /narrate skill (new)
│   └── agents/
│       └── persona-agent.md     # Subagent definition
├── outputs/                     # Generated artifacts
│   └── <doc-slug>/
│       ├── reviews/             # Per-persona markdown reviews + synthesis
│       ├── rewrites/            # Per-persona rewritten decks
│       ├── narration/           # Narration scripts + edited versions
│       └── video/               # Final MP4 + per-slide audio
└── README.md
```

---

### API Design (FastAPI)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload` | POST | Upload document, returns extracted markdown + doc ID |
| `/api/review` | POST | Run review with selected personas |
| `/api/review/{id}/synthesis` | GET | Get synthesis report |
| `/api/rewrite` | POST | Run rewrite with selected persona |
| `/api/narrate` | POST | Generate narration script |
| `/api/narrate/{id}/edit` | PUT | Save edited narration script |
| `/api/narrate/{id}/preview/{slide}` | GET | TTS preview of one slide |
| `/api/produce` | POST | Generate video from narration |
| `/api/produce/{id}/status` | WebSocket | Streaming progress updates |
| `/api/export/docx/{id}` | GET | Export report/rewrite as DOCX |
| `/api/export/pptx/{id}` | GET | Export rewrite as PPTX |
| `/api/compare` | POST | Generate side-by-side comparison data |
| `/api/personas` | GET | List available personas |
| `/api/models` | GET | List available Ollama models |
| `/api/voices` | GET | List available TTS voices by provider |

---

### Unified Extraction Pipeline

```python
# scripts/extract.py — enhanced to handle all formats
# Returns standardized markdown with ## Slide N / ## Page N headings

SUPPORTED_FORMATS = {
    '.pptx': extract_pptx,   # python-pptx → slides + notes
    '.pdf':  extract_pdf,    # poppler pdftoppm + pdftotext
    '.docx': extract_docx,   # python-docx
    '.md':   extract_md,     # split on --- or headings
    '.txt':  extract_txt,    # passthrough with heading injection
}

# Each extractor returns:
@dataclass
class ExtractedDocument:
    title: str
    slug: str
    slides: list[Slide]      # unified "slide" concept
    raw_markdown: str        # full markdown with ## Slide N headers
    metadata: dict           # page count, format, extracted notes

@dataclass
class Slide:
    number: int
    title: str
    body: str               # text content
    notes: str              # speaker notes (PPTX) or empty
    is_frame: bool          # [FRAME] animation marker
    image_path: str | None  # rendered PNG (for video mode)
```

---

### Persona Library Enhancement

Each persona file gains a unified structure supporting all three modes:

```markdown
# Persona Name

## Character Profile
...

## Voice Personality
...

## Review Lens (Document & Slide Review)
- Hunt priorities for critique mode
- Severity calibration
- Scorecard rubric
- Known blind spots

## Narration Voice (Video Production)
- Tone rules for narration generation
- SSML conventions
- Sample narration lines

## TTS Configuration
- Edge TTS voice + style
- ElevenLabs settings (stability, style, speed)
- Supertonic voice + settings

## Rewrite Style
- Writing principles for deck rewriting
- Slide structure preferences
- Speaker note conventions
```

---

### UI Design — Mode Tabs

```
┌──────────────────────────────────────────────────────────────────┐
│  SAM Studio    [Review]  [Rewrite]  [Narrate]  [Produce]  [⚙️]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐  │
│  │  📄 Document         │  │  Output Panel                    │  │
│  │                      │  │                                  │  │
│  │  Upload / Paste      │  │  (mode-specific content)         │  │
│  │                      │  │                                  │  │
│  │  ─────────────────── │  │  Review: findings + scorecard    │  │
│  │  Persona Selection   │  │  Rewrite: slide-by-slide         │  │
│  │  □ Classic SAM       │  │  Narrate: editable script        │  │
│  │  □ Commander SAM     │  │  Produce: progress + preview     │  │
│  │  □ Empathetic        │  │                                  │  │
│  │  □ Energetic         │  │                                  │  │
│  │  □ Skeptic-Proof     │  │                                  │  │
│  │  □ Executive         │  │                                  │  │
│  │  □ Documentary       │  │                                  │  │
│  │  □ Teacher           │  │                                  │  │
│  │  □ Sales/Pitch       │  │                                  │  │
│  │  □ Journalist        │  │                                  │  │
│  │  □ Facilitator       │  │                                  │  │
│  │  □ Legal/Compliance  │  │                                  │  │
│  │  ─────────────────── │  │                                  │  │
│  │  [🎤 Voice: Aria]    │  │                                  │  │
│  │  [🤖 Model: llama3]  │  │                                  │  │
│  │  ─────────────────── │  │                                  │  │
│  │  [ ▶ Run ]           │  │  [ 📥 Export ]  [ 🔀 Compare ]  │  │
│  └──────────────────────┘  └──────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

### Narration-to-Video Pipeline (Unified)

```
Extract Document
      │
      ▼
┌─────────────────────────────────────────────────┐
│ Narrate (per slide, with cross-slide memory)    │
│  • Persona system message                       │
│  • Context injection (optional)                 │
│  • Speaker notes as guidance                    │
│  • Full conversation history for coherence      │
└─────────────────────────────────────────────────┘
      │
      ▼
Editable Narration Script (## SLIDE N sections)
      │
      ├── [VISUAL CUE: ...] — stripped before TTS
      ├── *(tone note)* — stripped before TTS
      ├── <break time="0.8s"/> — SSML (ElevenLabs only)
      ▼
┌─────────────────────────────────────────────────┐
│ TTS Synthesis (per slide)                       │
│  • Provider: Edge / ElevenLabs / Supertonic     │
│  • Voice selected by persona config             │
│  • Strip non-spoken cues                        │
└─────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────┐
│ Video Assembly (ffmpeg)                         │
│  • Slide image + audio per segment              │
│  • [FRAME] groups → flipbook at configured FPS  │
│  • 1920×1080, H.264, AAC 192kbps               │
│  • Configurable inter-slide pause               │
└─────────────────────────────────────────────────┘
      │
      ▼
   Final MP4
```

---

### Review-to-Rewrite-to-Video Pipeline (New)

A key merged capability: **use review findings to inform the rewrite, then narrate the improved version.**

```
Original Deck
      │
      ▼
Multi-Persona Review (parallel)
      │
      ▼
Synthesis: Priority Fix List
      │
      ▼
Rewrite (selected persona applies fixes)
      │
      ▼
Rewritten PPTX (with improved speaker notes)
      │
      ▼
Narrate (using rewritten content + notes)
      │
      ▼
Produce Video
```

This pipeline could run as a single command:

```bash
# Claude Code
/produce deck.pptx --review skeptic legal --rewrite executive --narrate --voice en-US-ChristopherNeural

# CLI
python sam-studio.py produce deck.pptx \
  --review-personas skeptic legal \
  --rewrite-persona executive \
  --voice en-US-ChristopherNeural \
  --output final.mp4
```

---

### Claude Code Skills (Extended)

```bash
# Review (existing)
/review deck.pptx skeptic legal executive

# Rewrite (new)
/rewrite deck.pptx executive

# Narrate (new)
/narrate deck.pptx --persona documentary --context docs/background.md

# Full pipeline (new)
/produce deck.pptx --persona executive --review skeptic --voice en-US-ChristopherNeural
```

---

### Configuration & Defaults

```yaml
# sam-studio.yaml (project-level config)
server:
  port: 8090
  ollama_url: http://localhost:11434

defaults:
  model: llama3.2:3b
  theme: mixed
  tts_provider: edge
  voice: en-US-AriaNeural
  review_concurrency: 3
  inter_slide_pause: 1.0
  video_dpi: 150
  anim_fps: 8

personas:
  directory: personas/
  default_review_panel:
    - skeptic-proof
    - executive
    - legal

video:
  resolution: [1920, 1080]
  fps: 30
  codec: libx264
  audio_codec: aac
  audio_bitrate: 192k

export:
  output_dir: outputs/
```

---

### Dependencies (Merged)

```bash
# Python packages
pip install \
  fastapi 'uvicorn[standard]' httpx \
  python-pptx python-docx python-multipart \
  edge-tts \
  supertonic  # optional: offline TTS

# System packages
sudo apt install libreoffice poppler-utils ffmpeg
npm i -g @marp-team/marp-cli   # Markdown slides only
```

---

### Quick Start

```bash
git clone https://github.com/user/sam-studio.git
cd sam-studio

# Setup
uv venv .venv
uv pip install --python .venv/bin/python -r requirements.txt

# Run
ollama serve &
.venv/bin/python webapp/server.py

# Open http://localhost:8090
```

---

### Migration Path from Existing Apps

| Current | Merged Location | Changes |
|---------|----------------|---------|
| `sam-slide-reviewer/scripts/extract.py` | `sam-studio/scripts/extract.py` | Enhanced with image rendering |
| `sam-slide-reviewer/webapp/` | `sam-studio/webapp/` | Extended with narrate/produce tabs |
| `sam-slide-reviewer/personas/` | `sam-studio/personas/` | Add TTS config sections |
| `sam-slide-to-video/scripts/pptx_to_video.py` | Split into `narrate.py` + `tts.py` + `assemble.py` | Modularized |
| `sam-slide-to-video/pptx-video-web/` | Absorbed into `sam-studio/webapp/` | Unified UI |
| `video-production/` persona files | Merged into `sam-studio/personas/` | Single source of truth |
| `.claude/skills/review/` | `.claude/skills/review/` + `/rewrite/` + `/narrate/` | Extended |

---

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Single persona library** | Both apps already share the same persona files — unify to avoid drift |
| **Modular pipeline scripts** | Each step (extract, narrate, TTS, assemble) is independently testable and replaceable |
| **One FastAPI server** | Reduces operational complexity; single port, single process |
| **Mode tabs, not separate apps** | Users working on one deck naturally flow between review → rewrite → narrate |
| **WebSocket for production** | Video assembly is slow — streaming progress keeps users informed |
| **Shared Ollama connection** | Both review and narration use the same local model; connection pooling improves throughput |
| **Config file + env vars** | `sam-studio.yaml` for project defaults; `OLLAMA_URL`, `ELEVENLABS_API_KEY` for environment |

---

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Increased complexity | Higher maintenance burden | Modular architecture; each script works standalone |
| Long-running video jobs block reviews | Poor UX | Background task queue with WebSocket status updates |
| Persona file format changes break one mode | Regression | Schema validation on persona files; backward-compatible sections |
| Large decks exhaust Ollama context | Narration quality degrades | Sliding window for cross-slide memory; warn user |
| Multiple concurrent Ollama calls (review fan-out + narration) | Resource contention | Configurable concurrency limit; queue overflow to sequential |

---

### Summary

**SAM Studio** merges two complementary applications into a single platform that handles the full lifecycle of presentation content:

1. **Critique** — multi-persona review with synthesis
2. **Improve** — persona-driven rewrite with speaker notes
3. **Narrate** — AI-generated narration with cross-slide coherence
4. **Produce** — TTS + video assembly into broadcast-ready MP4
5. **Export** — DOCX reports, PPTX decks, or MP4 videos

All running locally, all powered by the same persona library, and all accessible through a single web UI, CLI, or Claude Code skill.
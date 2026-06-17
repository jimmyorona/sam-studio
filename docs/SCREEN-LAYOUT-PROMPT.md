```markdown
# SCREEN-LAYOUT.md — SAM Slide Suite UI Specification

> **Purpose:** This document is a complete screen layout and interaction
> specification for the SAM Slide Suite web UI. Hand it to a build agent along
> with the project source to implement the front-end.

---

## 1. Global Shell

The app is a **single-page application** with a persistent top bar and a
two-panel body. The top bar contains the app title and mode tabs. The body is
split into a **left config panel** (fixed-width, scrollable) and a **right
output panel** (fluid, scrollable). This layout never changes — only the
contents of each panel change per mode.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  SAM Slide Suite   [Review]  [Rewrite]  [Narrate]  [Produce]       [⚙️] │
├────────────────────────┬─────────────────────────────────────────────────┤
│                        │                                                 │
│   LEFT PANEL           │   RIGHT PANEL (output)                          │
│   (config, 320px)      │   (fluid, fills remaining width)               │
│                        │                                                 │
│                        │                                                 │
└────────────────────────┴─────────────────────────────────────────────────┘
```

### 1.1 Top Bar

| Element | Behavior |
|---------|----------|
| App title | "SAM Slide Suite" — plain text, left-aligned, bold |
| Mode tabs | `Review` · `Rewrite` · `Narrate` · `Produce` — pill-shaped toggle group. Active tab is highlighted (filled accent color). Clicking a tab switches both panels. |
| Settings gear ⚙️ | Opens a dropdown/modal with: Ollama URL, default model, theme selector (light / dark / mixed), concurrency limit |

### 1.2 Theme Support

Three themes. The theme class is set on `<body>`:

| Theme | Class | Description |
|-------|-------|-------------|
| Light | `theme-light` | White background, dark text, light borders |
| Dark | `theme-dark` | Dark background (#0d1117), light text, subtle borders |
| Mixed | `theme-mixed` | Dark chrome (top bar, left panel), light reading cards in right panel |

Default: `theme-mixed`.

---

## 2. Left Panel (Shared Across All Tabs)

The left panel has the same **structure** in every mode but conditionally shows/hides sections based on the active tab. Width: `320px` fixed. Background: slightly darker than body. Scrolls independently.

### 2.1 Document Input Section

```
┌────────────────────────┐
│  📄 Document           │
│                        │
│  ┌──────────────────┐  │
│  │  Drop file here  │  │
│  │  or click to     │  │
│  │  browse          │  │
│  │                  │  │
│  │  PPTX · PDF ·   │  │
│  │  DOCX · MD · TXT│  │
│  └──────────────────┘  │
│                        │
│  ── OR ──              │
│                        │
│  ┌──────────────────┐  │
│  │  Paste text...   │  │
│  │                  │  │
│  └──────────────────┘  │
│                        │
│  ✓ slides.pptx (12    │
│    slides extracted)   │
└────────────────────────┘
```

| Element | Details |
|---------|---------|
| Drop zone | Accepts `.pptx`, `.pdf`, `.docx`, `.md`, `.txt`. On drop/select: uploads to `/api/upload`, extracts via `extract.py`, shows confirmation. |
| Paste area | A collapsible `<textarea>` — hidden when a file is loaded. On submit: sends text body to `/api/upload` as raw text. |
| Confirmation | After upload: filename, slide/page count, and a ✕ button to clear and re-upload. |
| Persistence | The uploaded document persists across tab switches. Switching tabs does NOT re-upload. The document is shared state. |

### 2.2 Persona Selection Section

```
┌────────────────────────┐
│  👤 Personas           │
│                        │
│  [Select All] [Clear]  │
│                        │
│  □ Classic SAM         │
│  □ Commander SAM       │
│  □ Empathetic Holistic │
│  □ Energetic Collab.   │
│  □ Skeptic-Proof       │
│  □ Executive Briefing  │
│  □ Documentary         │
│  □ Teacher/Explainer   │
│  □ Sales/Pitch         │
│  □ Journalist          │
│  □ Workshop Facilitator│
│  □ Legal/Compliance    │
│                        │
└────────────────────────┘
```

| Mode | Selection Type | Constraint |
|------|---------------|------------|
| **Review** | Multi-select (checkboxes) | At least 2 recommended; max all 12 |
| **Rewrite** | Single-select (radio) | Exactly 1 |
| **Narrate** | Single-select (radio) | Exactly 1 |
| **Produce** | Inherited from Narrate (shown as read-only badge) | Cannot change here |

The persona list is fetched from `/api/personas` on app load. Each item shows:
- Checkbox or radio input
- Persona short name (bold)
- One-line description (muted, truncated)

"Select All" and "Clear" buttons appear only in Review mode.

### 2.3 Voice Picker (Narrate + Produce only)

```
┌────────────────────────┐
│  🎤 Voice              │
│                        │
│  Provider: [Edge ▾]    │
│  Voice:    [Aria ▾]    │
│  Style:    [Confident] │
│                        │
│  [▶ Preview]           │
└────────────────────────┘
```

| Mode | Visibility |
|------|-----------|
| Review | Hidden |
| Rewrite | Hidden |
| Narrate | Shown — user selects provider + voice + style |
| Produce | Shown read-only — displays what was set in Narrate |

Provider dropdown: `Edge TTS` · `ElevenLabs` · `Supertonic`

When provider changes, the voice dropdown repopulates from `/api/voices?provider=X`.

The "Preview" button speaks a short sample sentence in the selected voice (calls `/api/preview-voice`).

### 2.4 Model Picker

```
┌────────────────────────┐
│  🤖 Model              │
│                        │
│  [llama3.2:3b      ▾]  │
│                        │
└────────────────────────┘
```

A dropdown populated from `/api/models` (Ollama `/api/tags`). Shown in all modes. Default from settings.

### 2.5 Context Injection (Optional, Collapsible)

```
┌────────────────────────┐
│  📎 Context (optional) │
│  [▸ Expand]            │
│                        │
│  (when expanded:)      │
│  ┌──────────────────┐  │
│  │ Drop .md/.txt    │  │
│  │ or paste context │  │
│  └──────────────────┘  │
└────────────────────────┘
```

Collapsed by default. When expanded: accepts a context file or pasted text that provides background information for narration or review. Sent as `context` field in API calls.

### 2.6 Run Button

```
┌────────────────────────┐
│                        │
│  [ ▶ Run Review    ]   │  ← Full-width, accent-colored
│                        │
│  Estimated: ~2 min     │  ← Shown after first run with similar config
└────────────────────────┘
```

| Mode | Button Label | Disabled When |
|------|-------------|---------------|
| Review | "▶ Run Review" | No document, <1 persona selected, job running |
| Rewrite | "▶ Rewrite Deck" | No document, no persona selected, job running |
| Narrate | "▶ Generate Script" | No document, no persona, job running |
| Produce | "▶ Produce Video" | No narration script exists, job running |

When running: button becomes a progress indicator (percentage + spinner). A "✕ Cancel" link appears below it.

---

## 3. Right Panel — Review Mode

### 3.1 Empty State

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│            📋                                        │
│                                                     │
│     Upload a document and select your               │
│     review panel, then click Run Review.            │
│                                                     │
│     Each persona will independently critique        │
│     the deck, then results are synthesized          │
│     into consensus findings.                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3.2 Running State

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ████████████████░░░░░░░░░░  55%                    │
│                                                     │
│  ✓ Skeptic-Proof Analyst .............. done        │
│  ✓ Executive Briefing ................. done        │
│  ◌ Legal/Compliance ................... running      │
│  · Synthesis .......................... pending      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Shows a progress bar, per-persona status (pending → running → done), and a live log of progress messages streamed via SSE.

### 3.3 Results State

```
┌─────────────────────────────────────────────────────┐
│  [Synthesis] [Skeptic] [Executive] [Legal]          │  ← Report tabs
│─────────────────────────────────────────────────────│
│                                                     │
│  ## Synthesis Report                                │
│                                                     │
│  ### Consensus Findings                             │
│  1. Slide 3: Unsupported "40% improvement" claim    │
│     (Skeptic: Critical, Legal: High)                │
│  2. Slide 7: Missing CTA / decision ask             │
│     (Executive: Critical, Sales: High)              │
│                                                     │
│  ### Conflicts                                      │
│  - Slide 5: Sales wants bolder claim; Skeptic       │
│    wants hedging. Weight: Skeptic (Sales has         │
│    known blind spot: hype tolerance)                │
│                                                     │
│  ### Priority Fixes (Top 5)                         │
│  1. Add source citation for 40% claim (Slide 3)    │
│  2. Add explicit ask/CTA to closing (Slide 12)     │
│  3. ...                                            │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  [ 📥 Export DOCX ]         [ 🔀 Compare ]          │
└─────────────────────────────────────────────────────┘
```

| Element | Behavior |
|---------|----------|
| Report tabs | One tab per persona report + a "Synthesis" tab (always first, always present). Active tab is highlighted. |
| Report content | Rendered markdown. Scroll independently. Headings, bullet lists, severity badges, scorecard table. |
| Severity badges | Inline colored badges: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low · ⚪ Suggestion |
| Scorecard | Table at the end of each persona report with category scores (1–10) |
| Export DOCX | Downloads the currently visible report as `.docx` |
| Compare button | Opens a split-pane overlay showing two reports side-by-side (user picks which two) |

### 3.4 Compare Overlay

```
┌─────────────────────────────────────────────────────┐
│  Compare: [Skeptic ▾] vs [Executive ▾]    [✕ Close] │
├─────────────────────────┬───────────────────────────┤
│                         │                           │
│  ## Skeptic-Proof       │  ## Executive Briefing    │
│                         │                           │
│  Findings...            │  Findings...              │
│                         │                           │
│                         │                           │
└─────────────────────────┴───────────────────────────┘
```

Full-screen overlay. Two dropdowns to pick personas. Both panes scroll independently. Close button returns to normal view.

---

## 4. Right Panel — Rewrite Mode

### 4.1 Empty State

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│            ✏️                                        │
│                                                     │
│     Upload a document and select a persona,         │
│     then click Rewrite Deck.                        │
│                                                     │
│     The persona will rewrite every slide in         │
│     its voice, with speaker notes. Missing          │
│     data becomes [NEEDS: ...] placeholders.         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4.2 Results State

```
┌─────────────────────────────────────────────────────┐
│  Rewrite by: Executive Briefing                     │
│  [Slide 1] [Slide 2] [Slide 3] ... [Slide 12]      │  ← Slide tabs
│─────────────────────────────────────────────────────│
│                                                     │
│  ## Slide 3: Architecture Overview                  │
│                                                     │
│  **Decision:** Microservices on ECS with event      │
│  bus decoupling.                                    │
│                                                     │
│  Three services handle the pipeline:                │
│  1. Ingestion — file upload, validation, routing    │
│  2. Processing — extraction, classification         │
│  3. Loading — schema validation, Dataverse write    │
│                                                     │
│  [NEEDS: latency SLA for end-to-end processing]    │
│  [NEEDS: monthly transaction volume estimate]       │
│                                                     │
│  ─── Speaker Notes ───                              │
│  Open with the decision. The audience wants the     │
│  answer first, then the rationale...                │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  Placeholders (2): latency SLA, transaction volume  │
│  ─────────────────────────────────────────────────  │
│  [ 📥 Export PPTX ]    [ 📥 Export DOCX ]           │
└─────────────────────────────────────────────────────┘
```

| Element | Behavior |
|---------|----------|
| Slide tabs | Horizontal scrollable tab bar. One tab per slide. Shows slide number + short title. |
| Slide content | Rendered markdown of the rewritten slide. |
| `[NEEDS: ...]` placeholders | Highlighted in a distinct style (yellow/amber background, dashed border). Collected into a summary list at the bottom. |
| Speaker notes | Below a visual divider. Styled differently (muted background, italic). |
| Placeholder summary | Collapsible section listing all unfilled `[NEEDS: ...]` across all slides. |
| Export PPTX | Generates a real PowerPoint file with slide content in the slides and speaker notes in the notes pane. |
| Export DOCX | Full rewrite as a Word document. |

---

## 5. Right Panel — Narrate Mode

### 5.1 Empty State

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│            🎬                                        │
│                                                     │
│     Upload a document and select a persona +        │
│     voice, then click Generate Script.              │
│                                                     │
│     The model generates narration for every         │
│     slide using cross-slide memory. You can         │
│     edit the script before producing video.         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5.2 Results State — Editable Script

```
┌─────────────────────────────────────────────────────┐
│  Narration Script    [Raw Edit] [Slide View]        │  ← View toggle
│─────────────────────────────────────────────────────│
│                                                     │
│  ## SLIDE 1                                         │
│  ┌───────────────────────────────────────────────┐  │
│  │ Welcome to the SAM-PDF-Flow architecture      │  │
│  │ overview. Today we're going to walk through   │  │
│  │ how an unstructured PDF becomes a validated    │  │
│  │ Dataverse record — with no manual             │  │
│  │ transcription.                                │  │
│  │                                               │  │
│  │ [VISUAL CUE: title slide fades in]           │  │
│  │ *(measured, confident opening)*               │  │
│  └───────────────────────────────────────────────┘  │
│  [▶ Preview Slide 1]                                │
│                                                     │
│  ## SLIDE 2                                         │
│  ┌───────────────────────────────────────────────┐  │
│  │ Let's start with the problem we're solving.   │  │
│  │ Federal procurement teams today process       │  │
│  │ vendor quotes, invoices, and government       │  │
│  │ contract forms entirely by hand.              │  │
│  │                                               │  │
│  │ <break time="0.6s"/>                          │  │
│  │                                               │  │
│  │ That manual data entry into Dataverse is the  │  │
│  │ bottleneck.                                   │  │
│  └───────────────────────────────────────────────┘  │
│  [▶ Preview Slide 2]                                │
│                                                     │
│  ...                                                │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  Directorial Cue Legend:                            │
│  • [VISUAL CUE: ...] — not spoken                  │
│  • *(tone)* — not spoken                           │
│  • <break.../> — SSML pause (ElevenLabs only)      │
│  • <emphasis>word</emphasis> — SSML (ElevenLabs)   │
│  ─────────────────────────────────────────────────  │
│  [ Save Edits ]       [ → Produce Video ]           │
└─────────────────────────────────────────────────────┘
```

| Element | Behavior |
|---------|----------|
| View toggle | **Raw Edit**: single `<textarea>` with the full script (## SLIDE N sections). **Slide View**: per-slide editable cards as shown above. |
| Per-slide card | Editable text area. Syntax-highlighted for cues: `[VISUAL CUE:]` grey italics, `*(tone)*` purple italics, SSML tags blue monospace. |
| Preview button | Per-slide. Calls `/api/preview-slide` with that slide's text + selected voice. Plays audio in-browser via `<audio>` element. Shows a small waveform/progress bar. |
| Cue legend | Static reference panel at the bottom. Collapsible. |
| Save Edits | Persists the edited script (PUT `/api/narrate/:id/edit`). |
| → Produce Video | Switches to the Produce tab with this script loaded. Equivalent to clicking the Produce tab. |

### 5.3 Narration Cue Highlighting

| Cue | Display Style | Stripped Before TTS? |
|-----|--------------|---------------------|
| `## SLIDE N` | Bold heading, section divider | N/A (structural) |
| `[VISUAL CUE: ...]` | Grey background, italic, 🎬 icon | ✅ Always |
| `*(tone note)*` | Purple italic, no background | ✅ Always |
| `<break time="..."/>` | Blue monospace pill | ❌ Kept for ElevenLabs; ✅ stripped for Edge |
| `<emphasis>word</emphasis>` | Blue underline on the word | ❌ Kept for ElevenLabs; ✅ unwrapped for Edge |

---

## 6. Right Panel — Produce Mode

### 6.1 Pre-Flight State

```
┌─────────────────────────────────────────────────────┐
│  🎬 Video Production                                │
│─────────────────────────────────────────────────────│
│                                                     │
│  Document:  slides.pptx (12 slides)                 │
│  Persona:   Executive Briefing                      │
│  Voice:     en-US-ChristopherNeural (Edge TTS)      │
│  Script:    ✓ Generated (edited 2 min ago)          │
│                                                     │
│  ─── Settings ───                                   │
│  Pause between slides: [1.0s    ]                   │
│  Animation FPS:        [8       ]                   │
│  DPI (image render):   [150     ]                   │
│  Output format:        1920×1080 H.264 AAC          │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  [ ▶ Produce Video ]                                │
└─────────────────────────────────────────────────────┘
```

Shows a summary of all settings inherited from prior tabs. User can adjust production-specific settings (pause, FPS, DPI) before running.

### 6.2 Running State

```
┌─────────────────────────────────────────────────────┐
│  🎬 Producing Video...                              │
│─────────────────────────────────────────────────────│
│                                                     │
│  ████████████████████░░░░░░░░  68%                  │
│  Synthesizing audio for slide 8/12...               │
│                                                     │
│  ─── Progress Log ───                               │
│  ✓ Slide images rendered (12/12)                    │
│  ✓ TTS slide 1: 8.2s audio                         │
│  ✓ TTS slide 2: 12.1s audio                        │
│  ✓ TTS slide 3: 9.8s audio                         │
│  ✓ TTS slide 4: 11.3s audio                        │
│  ✓ TTS slide 5: 7.6s audio                         │
│  ✓ TTS slide 6: 10.4s audio                        │
│  ✓ TTS slide 7: 9.1s audio                         │
│  ◌ TTS slide 8: synthesizing...                     │
│  · TTS slide 9–12: pending                          │
│  · Video assembly: pending                          │
│                                                     │
│  [ ✕ Cancel ]                                       │
└─────────────────────────────────────────────────────┘
```

Progress streamed via SSE from `/api/jobs/:id/stream`. Shows per-slide status with audio durations.

### 6.3 Complete State

```
┌─────────────────────────────────────────────────────┐
│  ✅ Video Complete                                   │
│─────────────────────────────────────────────────────│
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │          ▶  (video player)                    │  │
│  │                                               │  │
│  │   00:00 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 02:47   │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Duration: 2:47  ·  Size: 24.3 MB  ·  12 slides    │
│                                                     │
│  [ 📥 Download MP4 ]    [ ▶ Produce Again ]         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Inline `<video>` player with controls. Download button. Option to re-produce with different settings.

---

## 7. Settings Panel (⚙️)

Opens as a slide-out drawer from the right or a modal:

```
┌─────────────────────────────────────────┐
│  ⚙️ Settings                      [✕]   │
│─────────────────────────────────────────│
│                                         │
│  Ollama URL:                            │
│  [http://localhost:11434           ]     │
│                                         │
│  Default Model:                         │
│  [llama3.2:3b                      ▾]   │
│                                         │
│  Theme:                                 │
│  (●) Mixed  ( ) Light  ( ) Dark        │
│                                         │
│  Review Concurrency:                    │
│  [3  ] (max parallel persona reviews)   │
│                                         │
│  TTS defaults:                          │
│  Provider: [Edge TTS               ▾]   │
│  ElevenLabs Key: [••••••••••••     ]    │
│                                         │
│  ─────────────────────────────────────  │
│  [ Save ]           [ Reset Defaults ]  │
└─────────────────────────────────────────┘
```

Settings are persisted to `localStorage`. The Ollama URL can also be set via `OLLAMA_URL` environment variable on the server.

---

## 8. Responsive Behavior

| Breakpoint | Layout Change |
|-----------|---------------|
| ≥ 1200px | Full two-panel layout as specified |
| 900–1199px | Left panel collapses to 280px; font sizes reduce slightly |
| < 900px | Left panel becomes a collapsible drawer (hamburger toggle). Right panel takes full width. |

---

## 9. Component Hierarchy

```
App.vue
├── TopBar.vue
│   ├── ModeTabs.vue          (Review | Rewrite | Narrate | Produce)
│   └── SettingsButton.vue
├── LeftPanel.vue
│   ├── DocumentInput.vue     (upload + paste + confirmation)
│   ├── PersonaSelector.vue   (checkbox/radio list, adapts per mode)
│   ├── VoicePicker.vue       (provider + voice + style dropdowns)
│   ├── ModelPicker.vue       (Ollama model dropdown)
│   ├── ContextInput.vue      (collapsible context file/paste)
│   └── RunButton.vue         (mode-specific label + progress)
├── RightPanel.vue
│   ├── ReviewOutput.vue
│   │   ├── ReviewProgress.vue
│   │   ├── ReportTabs.vue
│   │   ├── ReportContent.vue  (markdown renderer)
│   │   ├── CompareOverlay.vue
│   │   └── ExportBar.vue
│   ├── RewriteOutput.vue
│   │   ├── SlideTabs.vue
│   │   ├── SlideContent.vue
│   │   ├── SpeakerNotes.vue
│   │   ├── PlaceholderSummary.vue
│   │   └── ExportBar.vue
│   ├── NarrateOutput.vue
│   │   ├── ScriptViewToggle.vue  (Raw Edit | Slide View)
│   │   ├── SlideScriptCard.vue   (editable, per-slide)
│   │   ├── PreviewButton.vue     (audio playback)
│   │   ├── CueLegend.vue
│   │   └── SaveBar.vue
│   └── ProduceOutput.vue
│       ├── PreFlight.vue         (settings summary + adjustments)
│       ├── ProductionProgress.vue
│       └── VideoPlayer.vue       (complete state)
└── SettingsDrawer.vue
```

---

## 10. State Flow Between Tabs

The document and generated artifacts are **shared state** across tabs. Switching tabs does NOT lose work.

```
                    ┌───────────────────────────────────┐
                    │        SHARED APP STATE           │
                    │                                   │
                    │  • uploadedDocument (file + slug)  │
                    │  • extractedMarkdown              │
                    │  • selectedPersonas[]             │
                    │  • selectedVoice                  │
                    │  • selectedModel                  │
                    │  • context (optional)             │
                    │  • reviewReports{}                │
                    │  • rewriteResult{}                │
                    │  • narrationScript (editable)     │
                    │  • producedVideo{}                │
                    └───────────────────────────────────┘
                         ▲        ▲        ▲        ▲
                         │        │        │        │
                    ┌────┘   ┌────┘   ┌────┘   ┌────┘
                    │        │        │        │
               [Review] [Rewrite] [Narrate] [Produce]
```

### Tab Transition Rules

| From → To | Behavior |
|-----------|----------|
| Any → Any | Document persists. Left panel adapts (persona mode, voice visibility). Right panel shows that mode's output (or empty state if not yet run). |
| Narrate → Produce | Produce tab auto-populates with narration script + settings from Narrate. |
| Review → Rewrite | If review found issues, the rewrite persona sees the same document. No auto-linking yet. |
| Produce → Narrate | User can go back to edit the script and return to Produce. |

### Workflow Indicator

When the user has completed a step, that tab shows a small checkmark badge:

```
[Review ✓]  [Rewrite]  [Narrate ✓]  [Produce]
```

This helps users track progress through the full pipeline.

---

## 11. API Endpoints Referenced

| Endpoint | Method | Used By | Purpose |
|----------|--------|---------|---------|
| `/api/upload` | POST | All tabs | Upload file or text, returns slug + extracted markdown |
| `/api/personas` | GET | All tabs | List available personas with metadata |
| `/api/models` | GET | All tabs | List Ollama models |
| `/api/voices` | GET | Narrate, Produce | List TTS voices by provider |
| `/api/prereqs` | GET | Settings | Check system dependencies |
| `/api/review` | POST | Review tab | Start multi-persona review job |
| `/api/rewrite` | POST | Rewrite tab | Start single-persona rewrite job |
| `/api/narrate` | POST | Narrate tab | Generate narration script |
| `/api/narrate/:id/edit` | PUT | Narrate tab | Save edited script |
| `/api/preview-slide` | POST | Narrate tab | TTS preview of one slide |
| `/api/preview-voice` | POST | Voice picker | Short sample in selected voice |
| `/api/produce` | POST | Produce tab | Start video production job |
| `/api/jobs/:id/stream` | GET (SSE) | All running jobs | Stream progress events |
| `/api/reviews/:slug/reports` | GET | Review tab | List report files |
| `/api/reviews/:slug/report/:file` | GET | Review tab | Get report markdown |
| `/api/export/:slug/:file.docx` | GET | Review, Rewrite | Download DOCX |
| `/api/export/:slug/:file.pptx` | GET | Rewrite | Download PPTX |
| `/api/outputs/:slug/video.mp4` | GET | Produce | Download/stream video |

---

## 12. Visual Design Tokens

### Colors (Mixed Theme — Default)

| Token | Light Panel | Dark Chrome |
|-------|------------|-------------|
| `--bg-chrome` | — | `#161b22` |
| `--bg-panel` | — | `#1c2333` |
| `--bg-card` | `#ffffff` | — |
| `--bg-card-alt` | `#f8fafc` | — |
| `--text-primary` | `#1e293b` | `#f0f6fc` |
| `--text-secondary` | `#64748b` | `#8b949e` |
| `--accent` | `#2563eb` | `#58a6ff` |
| `--accent-2` | `#7c3aed` | `#bc8cff` |
| `--success` | `#059669` | `#3fb950` |
| `--warning` | `#d97706` | `#d29922` |
| `--danger` | `#dc2626` | `#f85149` |
| `--border` | `#e2e8f0` | `#30363d` |
| `--radius-sm` | `8px` | `8px` |
| `--radius-md` | `12px` | `12px` |
| `--radius-lg` | `16px` | `16px` |
| `--shadow` | `0 2px 8px rgba(0,0,0,0.08)` | `0 4px 16px rgba(0,0,0,0.3)` |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| App title | System sans | 20px | 700 |
| Tab labels | System sans | 14px | 600 |
| Section headers | System sans | 16px | 700 |
| Body text | System sans | 14px | 400 |
| Code / JSON | JetBrains Mono, Fira Code, monospace | 13px | 400 |
| Muted labels | System sans | 12px | 500 |

### Spacing Scale

`4px · 8px · 12px · 16px · 20px · 24px · 32px · 48px`

---

## 13. Interaction States

### Buttons

| State | Style |
|-------|-------|
| Default | Solid accent background, white text |
| Hover | Slightly lighter background, subtle shadow |
| Active/Pressed | Darker background, inset shadow |
| Disabled | 40% opacity, cursor: not-allowed |
| Loading | Text replaced with spinner + "Running..." |

### Cards / Panels

| State | Style |
|-------|-------|
| Default | Border, subtle shadow |
| Hover (where clickable) | Border becomes accent color, shadow increases |
| Selected | Left border accent (4px), slightly elevated |
| Error | Border becomes danger color, subtle red background |

### Inputs

| State | Style |
|-------|-------|
| Default | 1px border, white background |
| Focus | Accent border (2px), subtle glow |
| Error | Red border, error message below |
| Disabled | Grey background, muted text |

---

## 14. Empty State Illustrations

Each tab's empty state uses a single emoji icon (large, centered) plus 2–3 lines of helper text. No complex illustrations. Keep it simple and fast to load.

| Tab | Icon | Helper Text |
|-----|------|-------------|
| Review | 📋 | "Upload a document and select your review panel, then click Run Review." |
| Rewrite | ✏️ | "Upload a document and select a persona, then click Rewrite Deck." |
| Narrate | 🎬 | "Upload a document and select a persona + voice, then click Generate Script." |
| Produce | 🎥 | "Generate a narration script in the Narrate tab first, then return here to produce video." |

---

## 15. Error Handling

| Error Type | Display |
|-----------|---------|
| Upload failed | Toast notification (top-right, red) + error message below drop zone |
| Ollama unreachable | Banner across top of right panel: "Cannot connect to Ollama at {url}. Check that `ollama serve` is running." |
| Job failed | Progress bar turns red. Error message shown in log area. "Retry" button appears. |
| Export failed | Toast notification with error. |
| Prerequisite missing | Warning badge on Settings gear. Settings panel shows which deps are missing. |

### Toast Notifications

```
┌────────────────────────────┐
│  ✅ Review complete (3/3)   │   ← Success (green, auto-dismiss 5s)
└────────────────────────────┘

┌────────────────────────────┐
│  ❌ Upload failed: file     │   ← Error (red, manual dismiss)
│     too large (max 50MB)   │
└────────────────────────────┘
```

Toasts stack vertically in the top-right corner. Success auto-dismisses after 5 seconds. Errors require manual dismiss.

---

## 16. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | Switch to Review tab |
| `Ctrl+2` | Switch to Rewrite tab |
| `Ctrl+3` | Switch to Narrate tab |
| `Ctrl+4` | Switch to Produce tab |
| `Ctrl+Enter` | Run (same as clicking Run button) |
| `Escape` | Close overlay / drawer |
| `Ctrl+S` | Save edits (Narrate tab) |

---

## 17. Implementation Notes for Build Agent

1. **Framework:** Vue 3 Composition API with `<script setup>`. No Options API.
2. **State management:** Use `reactive()` or Pinia store for shared state (document, personas, results).
3. **Styling:** Scoped CSS per component. CSS custom properties for theming. No Tailwind — keep it vanilla CSS with the design tokens from §12.
4. **Markdown rendering:** Use `marked` or `markdown-it` library for report/rewrite content. Sanitize output with DOMPurify.
5. **SSE handling:** Use native `EventSource` API. Wrap in the `useJobs` composable.
6. **File upload:** Use `FormData` + `fetch`. Show upload progress via `XMLHttpRequest` if needed for large files.
7. **Audio preview:** HTML5 `<audio>` element. Server returns audio file URL on preview request.
8. **Video player:** HTML5 `<video>` element with native controls.
9. **No build step for dev:** Vite handles HMR. Production: `vite build` outputs to `dist/`.
10. **Express serves API on :3001.** Vite dev server on :5174 proxies `/api/*` to Express.
11. **Persona list cached:** Fetch once on app mount, store in shared state. Refresh on Settings save.
12. **Mobile:** Not a primary target but the responsive rules in §8 should make it usable.

---

## 18. File Naming Convention for Generated Output

```
reviews/
└── <doc-slug>/
    ├── 00-SYNTHESIS.md
    ├── 11-SKEPTIC-PROOF-ANALYST.md
    ├── 12-EXECUTIVE-BRIEFING.md
    ├── 18-LEGAL-COMPLIANCE.md
    ├── 12-EXECUTIVE-BRIEFING-REWRITE.md
    ├── narration-script.md
    ├── narration-script-edited.md
    └── video/
        └── final.mp4

outputs/
└── <doc-slug>/
    ├── slides/          (rendered PNGs)
    ├── audio/           (per-slide MP3/WAV)
    └── final.mp4
```

---

## 19. Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Keyboard navigation | All interactive elements focusable. Tab order logical. |
| ARIA labels | Tabs use `role="tablist"`, `role="tab"`, `role="tabpanel"` |
| Color contrast | All text meets WCAG AA (4.5:1 for body, 3:1 for large text) |
| Screen reader | Progress updates announced via `aria-live="polite"` region |
| Focus management | When tab switches, focus moves to first interactive element in new panel |
| Reduced motion | Respect `prefers-reduced-motion` — disable transitions |

---

## 20. Summary — What to Build

| Priority | Component | Tab | Notes |
|----------|-----------|-----|-------|
| P0 | Global shell (top bar + two-panel layout + theme) | All | Foundation — build first |
| P0 | DocumentInput + upload flow | All | Shared left panel section |
| P0 | PersonaSelector (adaptive) | All | Multi vs single based on mode |
| P1 | ReviewOutput (progress + reports + tabs) | Review | Core deliverable |
| P1 | RewriteOutput (slide tabs + content + notes) | Rewrite | Core deliverable |
| P1 | NarrateOutput (editable script + preview) | Narrate | Core deliverable |
| P1 | ProduceOutput (pre-flight + progress + player) | Produce | Core deliverable |
| P2 | CompareOverlay | Review | Enhancement |
| P2 | SettingsDrawer | Global | Enhancement |
| P2 | VoicePicker + preview | Narrate | Enhancement |
| P3 | Keyboard shortcuts | Global | Polish |
| P3 | Toast notifications | Global | Polish |
| P3 | Mobile responsive drawer | Global | Polish |
```

---

This document should give your subagent everything it needs to build the complete UI. Want me to also produce:

- A **companion API-SPEC.md** defining all endpoint request/response schemas?
- A **COMPONENT-CONTRACTS.md** defining props/emits for each Vue component?
- A **THEME-TOKENS.css** file ready to import?
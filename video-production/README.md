# SAM-PDF-Flow — Video Production Package
## ITTO Enterprise Architecture Overview

**Project:** SAM-PDF-Flow Architecture Overview video
**Subject:** Software Asset Management — federal procurement document extraction pipeline
**Estimated runtime:** 10:45
**Production status:** Scripts and direction complete — ready for audio generation and video assembly

---

## Package Contents

| File | Purpose | Use When |
|------|---------|----------|
| `01-SAM-PERSONA.md` | Voice character brief, ElevenLabs baseline settings, tone rules, sample lines | Before generating any audio — defines the voice |
| `02-SCENE-EMOTION-MAP.md` | Per-section emotion beat, energy level, music cue, visual focus, director notes | During motion graphics design and editing |
| `03-NARRATION-SCRIPT.md` | Full 1,845-word narration with SSML markup — production-ready for ElevenLabs | Audio generation |
| `04-TIMESTAMPED-SCRIPT.md` | Per-second markers, Premiere chapter CSV, visual sync cues | Premiere assembly and marker import |
| `05-MUSIC-PROMPT-PACK.md` | 5 music cues — Suno/Udio generative prompts, stock search terms, full cue sheet | Music sourcing |
| `06-STORYBOARD.md` | 74 shots — frame composition, animation spec, overlay text, b-roll, cut type | Motion graphics production, editor brief |
| `07-ACTOR-DIRECTION-PACING.md` | Per-section ElevenLabs JSON settings, pacing rules, 30-clip batch generation list | Audio production, Premiere edit |
| `08-PRODUCTION-SETTINGS.md` | Premiere sequence spec, design system, export settings, QC checklist | Project setup and final export |

---

## Recommended Production Path

### Option A — AI Actor (Talking Head + Graphics)
Best for: internal briefings, executive presentations, SharePoint/Teams distribution

```
1. HeyGen or Synthesia
   └── Paste narration from 03-NARRATION-SCRIPT.md (strip [VISUAL CUE] markers)
   └── Select AI avatar
   └── Export talking-head MP4

2. ElevenLabs Studio (optional audio upgrade)
   └── Generate 30 clips per 07-ACTOR-DIRECTION-PACING.md
   └── Replace HeyGen audio in Premiere if needed

3. Adobe Premiere
   └── V1: HeyGen AI actor video
   └── V2: Motion graphics / animated diagrams (per 06-STORYBOARD.md)
   └── A1: Narration (HeyGen or ElevenLabs)
   └── A2: Music (per 05-MUSIC-PROMPT-PACK.md)
   └── Import chapter markers from 04-TIMESTAMPED-SCRIPT.md
   └── Export per 08-PRODUCTION-SETTINGS.md
```

### Option B — Voice Narration Over Graphics (No Actor)
Best for: technical audiences, conference presentations, YouTube

```
1. ElevenLabs Studio
   └── Generate 30 clips per 07-ACTOR-DIRECTION-PACING.md
   └── Export per-chapter WAV files

2. Adobe Premiere
   └── V1: Background / dark base plates
   └── V2: Full animated diagram sequence (per 06-STORYBOARD.md)
   └── A1: ElevenLabs narration clips assembled in order
   └── A2: Music (per 05-MUSIC-PROMPT-PACK.md)
   └── Import chapter markers
   └── Export per 08-PRODUCTION-SETTINGS.md
```

---

## Voice & Audio Notes

- **SAM persona** is the narrator voice — authoritative, measured, no hype. See `01-SAM-PERSONA.md` for full character brief.
- **Hybrid tone** applies throughout: story-first in Sections 1 and 12, executive briefing in Sections 3, 6, 7, 8. See the tone rules table in `01-SAM-PERSONA.md`.
- **SSML tags** in `03-NARRATION-SCRIPT.md` are ElevenLabs-compatible. Strip `[VISUAL CUE]` and `*(italics)*` markers before pasting into any TTS tool.
- **30 narration clips** are listed in `07-ACTOR-DIRECTION-PACING.md` Part 3. Eight of them are isolated punchline clips with custom settings — do not merge these into adjacent clips.
- **Critical pauses** that must be preserved in the final edit:
  - Section 1: triple staccato ("It is slow. / It is inconsistent. / And it does not scale.")
  - Section 10: 2.0s silence after "$1–7/month" — this is an intentional editorial beat
  - Section 11 kicker: "None of these decisions are free. All of them are deliberate."
  - Section 12 closing: "These are not gaps in the system. They are the next conversation."

---

## Music Notes

Five cues covering the full runtime. See `05-MUSIC-PROMPT-PACK.md` for full prompts and cue sheet.

| Cue | Name | Sections | Tone |
|-----|------|----------|------|
| 1 | Weight of Paper | Intro, S1 | Sparse piano, melancholy |
| 2 | Signal Path | S2, S3, S5, S6, S9 | Electronic pulse, precise |
| 3 | Clean Room | S4, S7, S8 | Warm ambient, reassuring |
| 4 | Closing Argument | S10, S11 | Orchestral-electronic, resolved |
| 5 | The Next Conversation | S12, Outro | Piano callback to Cue 1, resolved |

Cue 5 intentionally echoes Cue 1's piano motif but resolves in D major — the emotional arc of the piece completes here.

---

## Motion Graphics Notes

- **Design system** is in `08-PRODUCTION-SETTINGS.md` — dark navy base (#0D1117), five accent colors, Inter or SF Pro Display fonts.
- **74 shots** are documented in `06-STORYBOARD.md`. Each shot includes frame composition, animation type, overlay text, and cut type.
- **Mermaid diagrams** from the source document (`SAM-OVERVIEW-OPUS.md`) can be rendered at [mermaid.live](https://mermaid.live), exported as SVG, and animated in After Effects.
- **Energy peaks** are at Sections 3 and 5/6 — the Production Architecture sequence diagram and the Classify-Extract flowchart. These sections have the most animation complexity and should be built first to validate the motion style before building the rest.
- Section 10 ("$1–7/month" full-screen hold) is a simple but high-impact moment — do not over-design it.

---

## Premiere Project Setup Checklist

- [ ] Create sequence: 1920×1080, 29.97fps, 48kHz audio (settings in `08-PRODUCTION-SETTINGS.md`)
- [ ] Import chapter markers via CSV (template in `08-PRODUCTION-SETTINGS.md`)
- [ ] Set up three video tracks: V1 (base), V2 (graphics), V3 (overlays/text)
- [ ] Set up three audio tracks: A1 (narration mono), A2 (music stereo), A3 (SFX optional)
- [ ] Normalize all narration clips to -3 dB peak before placing on timeline
- [ ] Insert 2.0s silence clip on A1 at TC 00:10:38 (the $1–7/month pause)

---

## Source Document

All content is derived from `../SAM-OVERVIEW-OPUS.md` — the authoritative architecture overview for SAM-PDF-Flow. If the source document is updated, the narration script and storyboard will need corresponding revisions.

**Sections in source → video mapping:** 1:1. All 12 sections of the source document are covered in sequence. No content was omitted; the Open Questions section (S12) and Key Decisions (S11) were treated as narrative beats rather than dry lists.

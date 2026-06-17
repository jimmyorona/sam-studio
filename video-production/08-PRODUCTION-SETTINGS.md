# Production Settings
## SAM-PDF-Flow — Adobe Premiere Pro & ElevenLabs Specs

---

## Adobe Premiere Pro — Sequence Settings

### Sequence Preset
**New Sequence → Settings (Custom)**

| Setting | Value |
|---------|-------|
| Editing Mode | Custom |
| Timebase | 29.97 fps (NTSC) — or 25 fps if distributing to EU/international |
| Frame Size | 1920 × 1080 (Full HD) — or 3840 × 2160 (4K) if motion graphics were created at 4K |
| Pixel Aspect Ratio | Square Pixels (1.0) |
| Fields | No Fields (Progressive Scan) |
| Display Format | 29.97 fps Drop-Frame Timecode |
| Audio Sample Rate | 48000 Hz |
| Audio Display Format | Audio Samples |
| Video Previews | GPU Accelerated Rendering |
| Preview File Format | I-Frame Only MPEG (or ProRes 422 if on Mac) |
| Codec | Any compatible with your GPU (CUDA / Metal) |
| Maximum Bit Depth | Checked |
| Maximum Render Quality | Checked |

---

## Track Layout

```
Timeline track map:

V3 — Overlay text / lower thirds / callout chips / section labels
V2 — Motion graphics / animated diagrams / b-roll compositing layer
V1 — Background / full-bleed footage or dark base plates

A1 — Narration (mono, center panned, -3 dB peak)
A2 — Music stereo (L+R, -18 to -22 dB under narration)
A3 — Sound design / SFX (optional — diagram whooshes, transitions)
```

### Audio Track Settings
| Track | Type | Pan | Peak |
|-------|------|-----|------|
| A1 Narration | Mono | Center (0) | -3 dB |
| A2 Music | Stereo | L/R (full width) | -18 dB (narration) / -12 dB (visual-only) |
| A3 SFX | Stereo | Slight center bias | -24 dB average |

### Audio Effects (Essential Sound Panel)
- A1: Enable "Reduce Noise" (Amount: 10%), "Reduce Rumble" (checked), EQ: low-shelf cut at 80Hz (-6 dB)
- A2: Enable "Loudness" auto-match on all music clips before placing on timeline
- A3: None — apply manually per clip

---

## Chapter Markers (Import)

Chapter markers from `04-TIMESTAMPED-SCRIPT.md` can be imported into Premiere via the Markers panel.

**Method 1 — Manual:** Add sequence markers at each Chapter TC listed in the timestamped script. Use Chapter type for section starts, Comment type for VO and scene cues.

**Method 2 — CSV Import:**
Create a CSV with columns: `Name, Start, Duration, Type, Comment`

```csv
Name,Start,Duration,Type,Comment
INTRO_START,00:00:00;00,00:00:01;00,Chapter,Fade from black
S01_START,00:00:20;00,00:00:01;00,Chapter,Business Context
S02_START,00:01:10;00,00:00:01;00,Chapter,Solution Overview
S03_START,00:02:05;00,00:00:01;00,Chapter,Production Architecture
S04_START,00:03:45;00,00:00:01;00,Chapter,Local Development
S05_START,00:04:45;00,00:00:01;00,Chapter,Processing Model
S06_START,00:06:04;00,00:00:01;00,Chapter,Power Automate
S07_START,00:07:36;00,00:00:01;00,Chapter,Data Architecture
S08_START,00:08:34;00,00:00:01;00,Chapter,Security Model
S09_START,00:09:24;00,00:00:01;00,Chapter,Deployment Topology
S10_START,00:10:14;00,00:00:01;00,Chapter,Cost Profile
S11_START,00:11:14;00,00:00:01;00,Chapter,Key Decisions
S12_START,00:12:34;00,00:00:01;00,Chapter,Open Questions
OUTRO_START,00:14:02;00,00:00:01;00,Chapter,Outro
END,00:14:25;00,00:00:01;00,Chapter,End
```

Import via: Markers panel → ☰ → Import Markers → select CSV

---

## Motion Graphics Specification

### Design System
| Element | Value |
|---------|-------|
| Background | #0D1117 (near-black navy) |
| Primary text | #FFFFFF |
| Secondary text | #8B9DC3 (muted blue-gray) |
| Accent blue | #4A90D9 |
| Accent green | #4AD97A |
| Accent purple | #7B4AD9 |
| Accent amber | #D9A84A |
| Accent teal | #4AD9D9 |
| Accent red | #D94A4A |
| Card background | #1C2333 |
| Font — headings | SF Pro Display Bold (or Inter Bold as free alternative) |
| Font — body | SF Pro Text Regular (or Inter Regular) |
| Font — code/labels | JetBrains Mono (monospace) |
| Corner radius (cards) | 12px |
| Drop shadow (cards) | 0 4px 24px rgba(0,0,0,0.4) |

### Animation Defaults
| Motion | Duration | Easing |
|--------|----------|--------|
| Fade in | 0.4s | Ease out |
| Slide in (from left/right) | 0.35s | Ease out cubic |
| Slide in (from bottom) | 0.40s | Ease out cubic |
| Chip/badge pop | 0.25s | Spring (slight overshoot) |
| Card flip (3D Y-axis) | 0.50s | Ease in-out |
| Bar chart grow | 0.60s–1.20s | Ease out |
| Arrow draw | 0.50s–0.80s | Linear |
| Cross-dissolve | 0.50s | Linear |
| Wipe (section transitions) | 0.40s | Ease in-out |
| Fade to black | 2.00s | Linear |
| Text tracker / typewriter | 0.03s per character | Linear |

### Tools (recommended)
| Task | Tool |
|------|------|
| Diagram animation | Adobe After Effects + Premiere Dynamic Link |
| Motion graphic templates | Adobe Express / After Effects MOGRT |
| Mermaid diagram rendering | mermaid.live (export SVG → import to AE) |
| Icon set | Phosphor Icons or Heroicons (open license) |
| Logo/badge | Adobe Illustrator |

---

## ElevenLabs — API Export Specification

### Audio Format
| Setting | Value |
|---------|-------|
| Output format | mp3_44100_192 (MP3, 44.1kHz, 192kbps) |
| Alternative (higher quality) | pcm_44100 (uncompressed WAV — recommended for Premiere import) |
| Sample rate | 44100 Hz |
| Channels | Mono (narration only; stereo not needed for VO) |

### API Endpoint
```
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
Headers:
  xi-api-key: YOUR_API_KEY
  Content-Type: application/json
Body:
  {
    "text": "<SSML or plain text from script>",
    "model_id": "eleven_turbo_v2_5",
    "voice_settings": {
      "stability": [see per-section values in 07-ACTOR-DIRECTION-PACING.md],
      "similarity_boost": 0.78,
      "style": [see per-section values],
      "use_speaker_boost": true,
      "speed": [see per-section values]
    }
  }
```

### Recommended Model
| Model | Use |
|-------|-----|
| `eleven_turbo_v2_5` | Fast generation, high quality — recommended for full production run |
| `eleven_multilingual_v2` | If the presentation will be localized to other languages later |
| `eleven_flash_v2_5` | Rapid iteration during script review phase (lower cost, slightly lower quality) |

### SSML Support
ElevenLabs supports a subset of SSML. Tags used in this project that are supported:
- `<break time="Xs"/>` — supported
- `<emphasis level="moderate|strong">` — supported
- `<prosody rate="slow">` — supported (use sparingly)

Tags NOT supported by ElevenLabs (do not include in API calls):
- `<speak>` wrapper required by some TTS — optional in ElevenLabs
- `<say-as>` — not supported; spell out abbreviations in plain text instead

---

## Export / Delivery Specification

### Primary Deliverable (Web / Presentation)
| Setting | Value |
|---------|-------|
| Format | H.264 (.mp4) |
| Preset | Match Source — High Bitrate |
| Resolution | 1920 × 1080 |
| Frame rate | 29.97 fps |
| Video bitrate | VBR, 2-pass, Target: 8 Mbps, Max: 12 Mbps |
| Audio codec | AAC |
| Audio bitrate | 320 kbps |
| Audio sample rate | 48000 Hz |
| Color space | Rec. 709 |

### Archive / Edit Master
| Setting | Value |
|---------|-------|
| Format | QuickTime (.mov) |
| Codec | Apple ProRes 422 HQ (Mac) or DNxHR HQ (PC) |
| Resolution | 1920 × 1080 (or 3840 × 2160 if 4K source) |
| Frame rate | 29.97 fps |
| Audio | PCM, 48kHz, stereo |

### SharePoint / Teams Distribution
| Setting | Value |
|---------|-------|
| Format | H.264 (.mp4) |
| Resolution | 1280 × 720 (720p) |
| Video bitrate | 4 Mbps target |
| Max file size target | < 500 MB |

### YouTube / Public (if applicable)
| Setting | Value |
|---------|-------|
| Format | H.264 or H.265 (.mp4) |
| Resolution | 3840 × 2160 (upscaled from 1080p source) |
| Video bitrate | 40 Mbps (YouTube recommends high bitrate for processing) |
| Chapters | Export chapter marker list from Premiere and add to YouTube description |

---

## File Naming Convention

```
video-production/
├── 01-SAM-PERSONA.md
├── 02-SCENE-EMOTION-MAP.md
├── 03-NARRATION-SCRIPT.md
├── 04-TIMESTAMPED-SCRIPT.md
├── 05-MUSIC-PROMPT-PACK.md
├── 06-STORYBOARD.md
├── 07-ACTOR-DIRECTION-PACING.md
├── 08-PRODUCTION-SETTINGS.md          ← this file
├── audio/
│   ├── 01_intro.mp3
│   ├── 02_s01_main.mp3
│   ├── 03_s01_punchline.mp3
│   └── ... (see clip list in 07-ACTOR-DIRECTION-PACING.md)
├── music/
│   ├── cue1_weight_of_paper.mp3
│   ├── cue2_signal_path.mp3
│   ├── cue3_clean_room.mp3
│   ├── cue4_closing_argument.mp3
│   └── cue5_next_conversation.mp3
├── exports/
│   ├── SAM-PDF-Flow-Overview_1080p_web.mp4
│   ├── SAM-PDF-Flow-Overview_ProRes_master.mov
│   └── SAM-PDF-Flow-Overview_720p_teams.mp4
└── premiere/
    └── SAM-PDF-Flow-Overview.prproj
```

---

## Quick-Start Checklist

- [ ] Voice selected in ElevenLabs — voice ID saved
- [ ] All 30 narration clips generated (see clip list in `07-ACTOR-DIRECTION-PACING.md`)
- [ ] All clips normalized to -3 dB peak (Essential Sound panel)
- [ ] Music cues sourced (Suno/Udio/Artlist) and trimmed to spec
- [ ] Premiere sequence created with settings above
- [ ] Chapter markers imported from `04-TIMESTAMPED-SCRIPT.md`
- [ ] Audio tracks laid: A1 narration, A2 music, A3 SFX
- [ ] $1–7/month silence gap (2.0s) added at TC 00:10:38
- [ ] Kicker ("None of these decisions are free.") at TC 00:12:22 — isolated clip confirmed
- [ ] Closing ("They are the next conversation.") at TC 00:13:52 — isolated clip confirmed
- [ ] Music fade-out (8s) verified at TC 00:14:17
- [ ] Color grade: ensure #0D1117 backgrounds render correctly (no crush)
- [ ] Export web version → verify chapter markers appear in MP4
- [ ] Export Teams version → verify file size < 500 MB

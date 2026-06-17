# Music Prompt Pack
## SAM-PDF-Flow — Video Score Brief

**Five cues** covering the full runtime. Each cue has:
- A generative AI prompt (Suno / Udio)
- A stock music search brief (Musicbed / Artlist / Epidemic Sound)
- Tempo, key, instrumentation, and duration spec
- Usage notes tied to the scene-emotion map

---

## Cue 1 — "Weight of Paper"
**Sections:** Intro, Section 1 (Business Context)
**Duration:** 0:00 → 1:10 (~70 seconds)
**Emotion:** Tension → Empathy → Urgency

### Suno / Udio Prompt
```
Sparse ambient piano, single repeated motif in D minor, melancholy but not dramatic.
Slow tempo, 58 BPM. No percussion. Subtle room reverb, intimate mic placement.
Thin string pad enters at 0:30, barely audible — adds warmth without momentum.
No resolution. Ends unresolved on a suspended chord, fading into silence.
Cinematic, understated. PBS documentary tone.
Duration: 70 seconds.
```

### Stock Music Search Terms
> Artlist / Musicbed: `sparse piano ambient government documentary melancholy slow`
> Epidemic Sound: `piano tension build cinematic underscore minimal`
> Keywords: minimal piano, unresolved, ambient underscore, documentary, slow burn

### Spec
| Attribute | Value |
|-----------|-------|
| BPM | 58 |
| Key | D minor |
| Instrumentation | Solo piano + thin string pad |
| Mix level in video | -18 dB under narration |
| Fade in | 2s from black |
| Transition to Cue 2 | 2s crossfade at 1:08 |

---

## Cue 2 — "Signal Path"
**Sections:** Section 2 (Solution), Section 3 (Architecture), Section 5 (Processing Model), Section 6 (Power Automate), Section 9 (Deployment)
**Duration:** Recurs — total ~5:30 of runtime across sections
**Emotion:** Momentum → Precision → Control

### Suno / Udio Prompt
```
Light electronic pulse, 92 BPM, C minor. Minimalist IDM / ambient electronic.
Subtle four-on-the-floor kick, very low in the mix — felt more than heard.
Synth arpeggio pattern, clean and precise, no distortion.
Occasional data-flicker sound design (short, very quiet) on beat 2 of every 4 bars.
Cold, purposeful, machine-intelligent. Think Ólafur Arnalds meets Jon Hopkins (quiet side).
No vocals. No melody — texture and pulse only.
Master version: 3 minutes loopable with clean loop point at bar 32.
```

### Stock Music Search Terms
> Artlist: `electronic ambient pulse cinematic technology precision`
> Musicbed: `IDM minimal electronic corporate documentary underscore`
> Epidemic Sound: `tech ambient electronic modern corporate`
> Keywords: ambient electronic, pulse, data, precision, modern, loopable

### Spec
| Attribute | Value |
|-----------|-------|
| BPM | 92 |
| Key | C minor |
| Instrumentation | Synth pulse, kick, arp, sound design accents |
| Mix level in video | -20 dB under narration; -14 dB during diagram transitions |
| Loop point | Bar 32 (clean) |
| Transition in | 2s fade from Cue 1 or Cue 3 |
| Transition out | 2s fade to Cue 3 or Cue 4 |

### Section-specific mixing notes
| Section | Cue 2 treatment |
|---------|----------------|
| S02 — Solution Overview | Fade in at 1:10, medium energy |
| S03 — Architecture | Beat drops slightly at 2:05 — more mechanical texture |
| S05 — Processing Model | Full return at 4:45, steady pulse |
| S06 — Power Automate | Continues through, tracker line sync |
| S09 — Deployment | Return briefly at 9:24, building toward Cue 4 |

---

## Cue 3 — "Clean Room"
**Sections:** Section 4 (Local Dev), Section 7 (Data Architecture), Section 8 (Security Model)
**Duration:** ~2:25 total across sections
**Emotion:** Approachability → Order → Assurance

### Suno / Udio Prompt
```
Soft ambient electronic, 72 BPM, F major. Warm, not cold.
Gentle plucked guitar sample layered with soft synth pad.
Very subtle hi-hat pattern, brushed — barely rhythmic, more texture.
Clean, airy, slightly hopeful. Like a well-organized workspace.
No tension, no urgency. Reassuring precision.
Think Brian Eno "Music for Airports" with a faint organic warmth.
No vocals. Loopable at bar 24.
Duration: 90 seconds master, loopable.
```

### Stock Music Search Terms
> Artlist: `ambient warm soft electronic calm reassuring`
> Musicbed: `ambient minimal calm workplace focus underscore`
> Epidemic Sound: `ambient soft warm calm relaxed`
> Keywords: ambient, warm, calm, clean, reassuring, Eno-esque

### Spec
| Attribute | Value |
|-----------|-------|
| BPM | 72 |
| Key | F major |
| Instrumentation | Plucked guitar sample, synth pad, soft brushed hi-hat |
| Mix level in video | -22 dB under narration |
| Loop point | Bar 24 |
| Transition in | 2s crossfade from Cue 2 |
| Transition out | 2s crossfade to Cue 2 or Cue 4 |

---

## Cue 4 — "Closing Argument"
**Sections:** Section 10 (Cost Profile), Section 11 (Key Decisions)
**Duration:** ~1:50 total
**Emotion:** Relief → Satisfaction → Intellectual Honesty

### Suno / Udio Prompt
```
Warm orchestral-electronic hybrid, 80 BPM, G major.
Piano lead melody — simple, four bars, slightly triumphant but restrained.
Soft string section underneath, long sustained notes.
Light electronic texture on top — not prominent, just modernizing the orchestral warmth.
Confident without being bombastic. The feeling of a good decision made well.
No dramatic swells. No percussion fill. Steady and assured.
Resolve fully — this cue ends on a major chord.
Duration: 2 minutes. Does not need to loop.
```

### Stock Music Search Terms
> Artlist: `orchestral piano warm resolution confident cinematic`
> Musicbed: `piano strings warm confident corporate resolved`
> Epidemic Sound: `cinematic warm resolution hopeful modern`
> Keywords: warm, resolved, confident, piano + strings, corporate cinematic

### Spec
| Attribute | Value |
|-----------|-------|
| BPM | 80 |
| Key | G major |
| Instrumentation | Piano, string section, light electronic texture |
| Mix level in video | -18 dB under narration; -12 dB during $1-7/month hold |
| Special note | At 10:38 ($1–7/month on screen) — briefly pull narration, let cue sit at -12 dB for 2s |
| Transition in | 2s crossfade from Cue 3 |
| Transition out | Crossfade to Cue 5 at 12:34 |

---

## Cue 5 — "The Next Conversation"
**Sections:** Section 12 (Open Questions), Outro
**Duration:** 14:02 → 14:25 (~1:50 total with fade)
**Emotion:** Invitation → Forward Motion → Quiet Confidence

### Suno / Udio Prompt
```
Return of the solo piano motif from Cue 1 — same key (D minor), same tempo (58 BPM).
But this time: resolved. Ends on D major (Picardy third).
Single piano, intimate. Slight room ambience — warmer than Cue 1.
Optional: very faint acoustic guitar harmony enters in final 16 bars.
The emotional arc completes here — tension from the intro finds its answer.
Fade out over 8 seconds from the final chord.
Duration: 110 seconds including 8-second fade.
```

### Stock Music Search Terms
> Artlist: `piano solo resolved hopeful minimal ambient closing`
> Musicbed: `solo piano warm closing hopeful documentary`
> Epidemic Sound: `piano outro resolved warm cinematic`
> Keywords: solo piano, resolved, hopeful, closing theme, intimate

### Spec
| Attribute | Value |
|-----------|-------|
| BPM | 58 |
| Key | D minor → D major resolution |
| Instrumentation | Solo piano, optional faint acoustic guitar |
| Mix level in video | -16 dB under narration; -10 dB during logo hold |
| Fade out | 8s starting at 14:17 |
| Thematic callback | References Cue 1 motif — intentional bookend |

---

## Full Cue Sheet (Premiere Audio Track Reference)

| Cue | In | Out | Track | Notes |
|-----|-----|-----|-------|-------|
| Cue 1 | 00:00:00 | 00:01:10 | A2 | 2s fade in, 2s crossfade out |
| Cue 2a | 00:01:08 | 00:03:45 | A2 | Crossfade from Cue 1 |
| Cue 3a | 00:03:43 | 00:04:47 | A2 | Section 4 |
| Cue 2b | 00:04:45 | 00:06:06 | A2 | Section 5 |
| Cue 2c | 00:06:04 | 00:07:38 | A2 | Section 6 |
| Cue 3b | 00:07:36 | 00:09:26 | A2 | Sections 7 + 8 |
| Cue 2d | 00:09:24 | 00:10:16 | A2 | Section 9 |
| Cue 4 | 00:10:14 | 00:12:36 | A2 | Sections 10 + 11 |
| Cue 5 | 00:12:34 | 00:14:25 | A2 | Section 12 + Outro |

**Track layout:**
- A1 — Narration (mono, centered, -3 dB headroom)
- A2 — Music (stereo, -18 to -22 dB under narration, -10 to -14 dB during visuals-only moments)
- A3 — Sound design accents (optional — diagram whooshes, data-flicker SFX, transition tones)

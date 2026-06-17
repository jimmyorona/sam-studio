# Actor Direction & Pacing Notes
## SAM-PDF-Flow — ElevenLabs Production Guide

**Voice:** SAM persona (see 01-SAM-PERSONA.md)
**Script:** 03-NARRATION-SCRIPT.md
**Timecodes:** 04-TIMESTAMPED-SCRIPT.md

---

## Part 1 — ElevenLabs API Settings Per Section

### How to apply
Pass these as request body parameters to the ElevenLabs `/v1/text-to-speech/{voice_id}` endpoint.
Generate each section as a separate audio file. Assemble in Premiere on track A1.

---

### INTRO
```json
{
  "stability": 0.55,
  "similarity_boost": 0.78,
  "style": 0.40,
  "use_speaker_boost": true,
  "speed": 0.88
}
```
**Director note:** Slowest speed in the entire piece. Every pause is sacred here — do not trim silence. The 1.0s break after "Line by line. Field by field." should be left at full length in the final edit.

---

### Section 1 — Business Context
```json
{
  "stability": 0.55,
  "similarity_boost": 0.78,
  "style": 0.38,
  "use_speaker_boost": true,
  "speed": 0.90
}
```
**Director note:** The staccato triple delivery ("It is slow. / It is inconsistent. / And it does not scale with volume.") must land with equal weight on each phrase. If ElevenLabs merges them into a continuous sentence, break them into three separate API calls and join the audio files in Premiere with 0.3s of silence between.

**Critical beat:** "SAM-PDF-Flow eliminates that bottleneck." — This is the first punchline. Speed can drop to 0.84 for this sentence only. Regenerate as an isolated clip if needed.

---

### Section 2 — Solution Overview
```json
{
  "stability": 0.60,
  "similarity_boost": 0.78,
  "style": 0.30,
  "use_speaker_boost": true,
  "speed": 0.93
}
```
**Director note:** The five-characteristic list should feel like a countdown — each item landing with slightly more confidence than the last. If the voice sounds rushed through the list, regenerate with the list items as separate clips and add 0.3s gaps between each.

---

### Section 3 — Production Architecture
```json
{
  "stability": 0.72,
  "similarity_boost": 0.78,
  "style": 0.18,
  "use_speaker_boost": true,
  "speed": 0.95
}
```
**Director note:** Most neutral delivery in the piece. No color, no emphasis beyond the SSML tags already in the script. The sequence diagram narration should feel like a calm technical walkthrough — a senior architect explaining to a peer, not presenting to an audience.

**Critical beat:** "The Docling Server is the only component that touches the LLM." — raise `style` to 0.30 and drop `speed` to 0.88 for this sentence only. It is the architectural thesis of the entire section.

---

### Section 4 — Local Development
```json
{
  "stability": 0.60,
  "similarity_boost": 0.78,
  "style": 0.28,
  "use_speaker_boost": true,
  "speed": 0.93
}
```
**Director note:** This is the relief section after the dense architecture pass. Slightly warmer than Section 3. The four-service chain ("Vue.js on 5173 talks to Express on 3000...") should feel like a guided tour, not a recitation. Let each port number land before moving to the next.

---

### Section 5 — Processing Model
```json
{
  "stability": 0.65,
  "similarity_boost": 0.78,
  "style": 0.24,
  "use_speaker_boost": true,
  "speed": 0.94
}
```
**Director note:** Starts balanced, firms up as the token counts appear. The token numbers ("650 tokens," "3,200 to 5,330 tokens") should be spoken clearly and slightly slower — they are cost data, not filler. Regenerate those sentences at `speed: 0.88` if the pacing feels rushed.

---

### Section 6 — Power Automate
```json
{
  "stability": 0.68,
  "similarity_boost": 0.78,
  "style": 0.20,
  "use_speaker_boost": true,
  "speed": 0.95
}
```
**Director note:** This is the longest technical section. The voice should be deliberate but never dull. The error/success branch narration ("If the document fails... / If it passes...") benefits from a clean 0.5s gap between the two conditions — add in Premiere if not present in the generated audio.

---

### Section 7 — Data Architecture
```json
{
  "stability": 0.65,
  "similarity_boost": 0.78,
  "style": 0.22,
  "use_speaker_boost": true,
  "speed": 0.92
}
```
**Director note:** "Two tables." must land as a complete, self-contained statement with 0.6s of silence following it. If generated as part of a longer sentence, edit. The table names (`sam_importstaging`, `sam_softwarelicensequeue`) should be spoken clearly — these are proper nouns, not technical jargon to be glossed over. Consider regenerating these names at `speed: 0.88` for clarity.

---

### Section 8 — Security Model
```json
{
  "stability": 0.72,
  "similarity_boost": 0.80,
  "style": 0.16,
  "use_speaker_boost": true,
  "speed": 0.93
}
```
**Director note:** This section earns credibility through stillness and precision. The most neutral voice settings in the piece. "APIM is the sole entry point." and "Prompts do not contain secrets." are both thesis statements — they should be separated from surrounding text by the full break times in the SSML. Do not trim these pauses.

---

### Section 9 — Deployment Topology
```json
{
  "stability": 0.62,
  "similarity_boost": 0.78,
  "style": 0.26,
  "use_speaker_boost": true,
  "speed": 0.95
}
```
**Director note:** Moderate energy — this is a completion beat, not a peak. The platform names (AWS ECS Fargate, Azure APIM, Power Automate) should each get their own breath. The Lambda function descriptions can move slightly faster — they are auxiliary context.

---

### Section 10 — Cost Profile
```json
{
  "stability": 0.58,
  "similarity_boost": 0.78,
  "style": 0.35,
  "use_speaker_boost": true,
  "speed": 0.90
}
```
**Director note:** This is the dry wit section. The voice should be slightly warmer and more relaxed here — the numbers are good, let them breathe. "Total infrastructure: one to seven dollars a month." — generate this sentence as a separate clip. After the period, add 2.0 seconds of silence in Premiere before the next line. The silence IS the joke.

**The $1–7/month moment:** Narration clip ends. Music sits at -12 dB. Visual holds full screen for 2 full seconds. Narration resumes. This is a deliberate editorial pause — preserve it.

---

### Section 11 — Key Decisions
```json
{
  "stability": 0.62,
  "similarity_boost": 0.78,
  "style": 0.28,
  "use_speaker_boost": true,
  "speed": 0.93
}
```
**Director note:** The trade-off clauses ("The trade-off: ...") should be delivered in a slightly quieter register — not apologetic, just honest. If the ElevenLabs voice doesn't naturally differentiate the rationale from the trade-off, add 0.4s of silence before each "The trade-off:" phrase in Premiere.

**Kicker:** "None of these decisions are free. All of them are deliberate." — generate as a separate clip. Speed: 0.87. Style: 0.35. This is the only moment in the piece where SAM reveals a hint of conviction. Let it land.

---

### Section 12 — Open Questions
```json
{
  "stability": 0.55,
  "similarity_boost": 0.78,
  "style": 0.40,
  "use_speaker_boost": true,
  "speed": 0.90
}
```
**Director note:** Return to story-first warmth. The five questions should feel like genuine invitations, not a checklist. Between each question, let the 0.8s breaks breathe — add to 1.0s in Premiere if needed.

**Closing line:** "These are not gaps in the system. They are the next conversation." — generate as a separate clip. Speed: 0.86. This is the emotional resolution. It should feel earned, not hurried.

---

### Outro
```json
{
  "stability": 0.65,
  "similarity_boost": 0.78,
  "style": 0.22,
  "use_speaker_boost": true,
  "speed": 0.88
}
```
**Director note:** Two short sentences. Calm and complete. No emphasis. Let the music handle the emotional weight of the ending.

---

## Part 2 — Pacing Notes (Premiere Edit Reference)

### Global Rules

| Rule | Value |
|------|-------|
| Narration track headroom | -3 dB peak max |
| Music under narration | -18 to -22 dB (narrator always dominant) |
| Music during visual-only moments | -10 to -14 dB |
| Minimum silence between sections | 0.5s |
| Maximum narration gap (within a section) | 1.2s (per SSML breaks) |
| Never trim SSML-marked pauses | These are intentional — preserve all `<break>` durations |

---

### Section-by-Section Pacing Notes

**INTRO**
- The three-beat staccato ("Somewhere… / And typing… / Line by line…") must have visible gaps between lines on the audio waveform. If they run together, use Premiere's Razor tool to manually insert 0.4s gaps.
- Total section must not feel rushed. If it runs under 18 seconds, something was trimmed.

**Section 1 — Business Context**
- The "It is slow. / It is inconsistent. / And it does not scale." sequence: add 0.3s silence between each. This is a rhetorical device — the rhythm matters.
- "SAM-PDF-Flow eliminates that bottleneck." — allow 0.5s silence before and 0.7s after in the final edit.

**Section 3 — Production Architecture**
- This is the longest section (~1:20). Do not compress it. The sequence diagram animation depends on the narration pace.
- Add a 0.5s narration gap between Stage 1 and Stage 2 narration blocks — the visual label transition needs breathing room.

**Section 5 — Processing Model**
- Token counts should sync with the on-screen badge animation. If the animation is faster than the narration, slow the animation — not the voice.

**Section 6 — Power Automate**
- The tracker line descends the flowchart at narration pace. If the narration outpaces the animation, add 0.3s gaps between flowchart node narrations to let the tracker catch up.

**Section 10 — Cost Profile**
- The "$1–7/month" silence: in Premiere, cut the narration track at the period after "...one to seven dollars a month." Insert 2.0 seconds of room tone (silence). Then bring in the next narration line. This 2-second gap is non-negotiable — it is the punchline delivery mechanism.

**Section 11 — Key Decisions**
- Each decision card flip should begin 0.2s before its narration — the visual should precede the spoken word slightly, so the audience reads the card label as the narrator begins speaking.

**Section 12 — Open Questions**
- The question cards fan out slowly — do not rush the animation to match a compressed narration. If needed, add 0.5s of narration silence between each question to let the card animation breathe.
- "They are the next conversation." — this line ends the narration. Allow music to hold for 8+ seconds before any cut or fade.

---

## Part 3 — ElevenLabs Batch Generation Workflow

### Recommended clip list (28 clips)

Generate each as a separate MP3 (44.1kHz, 192kbps or higher):

| Clip | Section | Special settings |
|------|---------|-----------------|
| 01_intro | INTRO | Story-first settings |
| 02_s01_main | Section 1 | Story-first settings |
| 03_s01_punchline | "SAM-PDF-Flow eliminates…" | Speed 0.84, isolated |
| 04_s02_main | Section 2 | Balanced settings |
| 05_s03_main | Section 3 | Executive briefing |
| 06_s03_thesis | "The Docling Server is the only…" | Speed 0.88, style 0.30, isolated |
| 07_s04_main | Section 4 | Balanced settings |
| 08_s05_main | Section 5 | Balanced settings |
| 09_s05_tokens | Token count sentences | Speed 0.88, isolated |
| 10_s06_main | Section 6 | Executive briefing |
| 11_s07_main | Section 7 | Executive briefing |
| 12_s07_two_tables | "Two tables." | Speed 0.88, isolated |
| 13_s08_main | Section 8 | Security settings |
| 14_s08_sole_entry | "APIM is the sole entry point." | Isolated, full break after |
| 15_s08_no_secrets | "Prompts do not contain secrets." | Isolated, full break after |
| 16_s09_main | Section 9 | Moderate settings |
| 17_s10_main | Section 10 | Dry wit settings |
| 18_s10_total_infra | "Total infrastructure: one to seven…" | Speed 0.88, isolated — 2s silence added in Premiere |
| 19_s10_inference | Inference narration lines | Normal settings |
| 20_s11_intro | Section 11 opening | Balanced |
| 21_s11_decisions | Five decision narration lines | One clip per decision (5 clips) |
| 27_s11_kicker | "None of these decisions are free…" | Speed 0.87, style 0.35, isolated |
| 28_s12_main | Section 12 | Story-first settings |
| 29_s12_closing | "These are not gaps in the system…" | Speed 0.86, isolated |
| 30_outro | Outro | Outro settings |

**Assembly in Premiere:** Lay clips end-to-end on A1. Use Premiere's Essential Sound panel to normalize all clips to -3 dB peak before assembly. Add room-tone silence clips for the intentional gaps (particularly the 2s $1–7/month pause).

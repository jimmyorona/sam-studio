# Timestamped Script
## SAM-PDF-Flow — Adobe Premiere Marker Import / ElevenLabs Chapter Reference

**Format:** HH:MM:SS — cumulative from 00:00:00
**Marker type:** Adobe Premiere Pro sequence markers (Chapter + Comment)
**ElevenLabs:** Use segment boundaries for chapter breaks in multi-voice projects

---

> **How to use in Premiere:**
> Import `05-PREMIERE-MARKERS.csv` (generated from this doc) via Markers panel → Import Markers.
> Each `[MARKER]` row maps to one Premiere chapter marker at that timecode.
> Scene markers (lighter weight) are comment markers.

---

## 00:00:00 — INTRO

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:00:00 | `INTRO_START` | Chapter | Fade from black |
| 00:00:02 | `VO_01` | Comment | "Somewhere in a federal agency right now…" |
| 00:00:10 | `VO_02` | Comment | "And typing what they see." |
| 00:00:14 | `VO_03` | Comment | "Line by line. Field by field." |
| 00:00:18 | `VO_04` | Comment | "That is the problem this system solves." |
| 00:00:20 | `TITLE_CARD` | Scene | Hard cut — project title + ITTO badge |

---

## 00:00:20 — SECTION 1: Business Context

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:00:20 | `S01_START` | Chapter | Music Cue 1 warms slightly |
| 00:00:22 | `VO_S01_01` | Comment | "Federal procurement teams process vendor quotes…" |
| 00:00:34 | `VO_S01_02` | Comment | "Manual data entry into Dataverse is the current bottleneck." |
| 00:00:38 | `VO_S01_03` | Comment | "It is slow." — 3-beat staccato delivery |
| 00:00:46 | `VISUAL_SPLIT` | Scene | Split screen holds — PDF left / JSON right |
| 00:00:52 | `VO_S01_04` | Comment | "SAM-PDF-Flow eliminates that bottleneck." — punchline |
| 00:01:02 | `VO_S01_05` | Comment | "No manual transcription." |
| 00:01:10 | `S01_END` | Scene | Dissolve to Section 2 |

---

## 00:01:10 — SECTION 2: Solution Overview

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:01:10 | `S02_START` | Chapter | Music Cue 2 — electronic pulse enters |
| 00:01:12 | `VO_S02_01` | Comment | "SAM-PDF-Flow is an event-driven document extraction pipeline." |
| 00:01:22 | `VO_S02_02` | Comment | "Five characteristics define how it works." |
| 00:01:26 | `CHIP_01` | Scene | Chip: "Event-driven" appears |
| 00:01:28 | `VO_S02_03` | Comment | "It is event-driven…" |
| 00:01:34 | `CHIP_02` | Scene | Chip: "Two-stage inference" appears |
| 00:01:35 | `VO_S02_04` | Comment | "It uses two-stage inference…" |
| 00:01:42 | `CHIP_03` | Scene | Chip: "Contract-first" appears |
| 00:01:43 | `VO_S02_05` | Comment | "It is contract-first…" |
| 00:01:50 | `CHIP_04` | Scene | Chip: "Environment-portable" appears |
| 00:01:51 | `VO_S02_06` | Comment | "It is environment-portable…" |
| 00:01:58 | `CHIP_05` | Scene | Chip: "Low-code orchestration" appears |
| 00:01:59 | `VO_S02_07` | Comment | "And it uses low-code orchestration…" |
| 00:02:05 | `S02_END` | Scene | Wipe right to architecture diagram |

---

## 00:02:05 — SECTION 3: Production Architecture

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:02:05 | `S03_START` | Chapter | Music Cue 2 — beat drops, mechanical texture |
| 00:02:07 | `VO_S03_01` | Comment | "The production architecture flows through seven components." |
| 00:02:14 | `SEQ_01` | Scene | SharePoint node lights up |
| 00:02:15 | `VO_S03_02` | Comment | "A file lands in SharePoint." |
| 00:02:19 | `SEQ_02` | Scene | PA node lights up |
| 00:02:20 | `VO_S03_03` | Comment | "Power Automate picks up the creation event…" |
| 00:02:30 | `SEQ_03` | Scene | APIM node lights up |
| 00:02:31 | `VO_S03_04` | Comment | "That payload travels to Azure API Management…" |
| 00:02:44 | `STAGE1_LABEL` | Scene | "Stage 1" blue label appears |
| 00:02:45 | `VO_S03_05` | Comment | "Stage one is classification." |
| 00:02:52 | `SEQ_04` | Scene | DS node lights up |
| 00:02:53 | `VO_S03_06` | Comment | "APIM forwards the request to the Docling Server…" |
| 00:03:04 | `STAGE2_LABEL` | Scene | "Stage 2" orange label appears |
| 00:03:05 | `VO_S03_07` | Comment | "Stage two is extraction." |
| 00:03:12 | `SEQ_05` | Scene | Okta + UGAP nodes light up |
| 00:03:13 | `VO_S03_08` | Comment | "The Docling Server authenticates to Okta…" |
| 00:03:25 | `SEQ_06` | Scene | DV node lights up — full chain complete |
| 00:03:26 | `VO_S03_09` | Comment | "The result is written to SharePoint, loaded into Dataverse…" |
| 00:03:35 | `VO_S03_10` | Comment | "The Docling Server is the only component that touches the LLM." — hold |
| 00:03:44 | `COMP_TABLE` | Scene | Component roles table fades in |
| 00:03:45 | `S03_END` | Scene | Cross-dissolve to Section 4 |

---

## 00:03:45 — SECTION 4: Local Development

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:03:45 | `S04_START` | Chapter | Music Cue 3 — softer, warmer |
| 00:03:47 | `VO_S04_01` | Comment | "The local development stack mirrors the production API contract exactly." |
| 00:03:55 | `NODE_01` | Scene | Vue node glows |
| 00:03:56 | `VO_S04_02` | Comment | "Vue.js on port 5173 talks to an Express server on 3000." |
| 00:04:02 | `NODE_02` | Scene | Flask node glows |
| 00:04:03 | `VO_S04_03` | Comment | "Express calls a Flask server on 8080." |
| 00:04:07 | `NODE_03` | Scene | Ollama node glows |
| 00:04:08 | `VO_S04_04` | Comment | "Flask calls Ollama on 11434." |
| 00:04:14 | `EQUIV_TABLE` | Scene | Equivalence table — production ↔ local |
| 00:04:16 | `VO_S04_05` | Comment | "In production, the Docling Server handles document parsing…" |
| 00:04:32 | `API_BANNER` | Scene | "Same API contract" banner |
| 00:04:33 | `VO_S04_06` | Comment | "Prompts developed against a local model can be promoted to production…" |
| 00:04:45 | `S04_END` | Scene | Dissolve to Section 5 |

---

## 00:04:45 — SECTION 5: Processing Model

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:04:45 | `S05_START` | Chapter | Music Cue 2 returns — mechanical, precise |
| 00:04:47 | `VO_S05_01` | Comment | "The pipeline uses a two-stage inference pattern…" |
| 00:04:58 | `FLOW_01` | Scene | PDF → classifier animated |
| 00:04:59 | `VO_S05_02` | Comment | "Stage one — classification — costs roughly 650 tokens." |
| 00:05:07 | `FLOW_02` | Scene | Classifier → router fork |
| 00:05:08 | `VO_S05_03` | Comment | "It returns four routing fields…" |
| 00:05:16 | `GATE_DIAMOND` | Scene | SOFTWARE gate decision diamond highlighted |
| 00:05:17 | `VO_S05_04` | Comment | "The most important of those fields is content type." |
| 00:05:26 | `FLOW_03` | Scene | Three prompt paths branch |
| 00:05:27 | `VO_S05_05` | Comment | "Only documents classified as SOFTWARE reach extraction." |
| 00:05:36 | `TOKEN_BADGE` | Scene | "3,200–5,330 tokens" badge appears |
| 00:05:37 | `VO_S05_06` | Comment | "Stage two — extraction — runs between 3,200 and 5,330 tokens…" |
| 00:05:47 | `TIER_TABLE` | Scene | Model tier table |
| 00:05:48 | `VO_S05_07` | Comment | "Three model tiers handle the range…" |
| 00:05:56 | `VO_S05_08` | Comment | "Each tier receives a prompt variant calibrated to its capability…" |
| 00:06:04 | `S05_END` | Scene | Dissolve to Section 6 |

---

## 00:06:04 — SECTION 6: Power Automate Orchestration

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:06:04 | `S06_START` | Chapter | Music Cue 2 — steady, purposeful |
| 00:06:06 | `VO_S06_01` | Comment | "Power Automate owns the full pipeline logic." |
| 00:06:14 | `FLOW_TOP` | Scene | Trigger node highlights |
| 00:06:15 | `VO_S06_02` | Comment | "The flow begins with one of three trigger modes." |
| 00:06:20 | `TRIGGER_01` | Scene | SharePoint trigger card |
| 00:06:21 | `VO_S06_03` | Comment | "A SharePoint folder watch processes PDFs automatically…" |
| 00:06:28 | `TRIGGER_02` | Scene | Manual trigger card |
| 00:06:29 | `VO_S06_04` | Comment | "A manual file pick lets a user trigger processing on demand." |
| 00:06:34 | `TRIGGER_03` | Scene | OneDrive trigger card |
| 00:06:35 | `VO_S06_05` | Comment | "An OneDrive folder watch extends automatic coverage…" |
| 00:06:41 | `FLOW_TRACKER` | Scene | Tracker line descends through flow nodes |
| 00:06:42 | `VO_S06_06` | Comment | "All three converge on the same core pipeline…" |
| 00:06:48 | `VO_S06_07` | Comment | "The flow encodes the document, calls the classifier…" |
| 00:07:04 | `ERROR_PATH` | Scene | Error path highlights red |
| 00:07:05 | `VO_S06_08` | Comment | "If the document fails the SOFTWARE gate…" |
| 00:07:12 | `SUCCESS_PATH` | Scene | Success path highlights green |
| 00:07:13 | `VO_S06_09` | Comment | "If it passes, the flow selects the extraction prompt…" |
| 00:07:30 | `VO_S06_10` | Comment | "A Teams notification confirms success." |
| 00:07:36 | `S06_END` | Scene | Cross-dissolve to Section 7 |

---

## 00:07:36 — SECTION 7: Data Architecture

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:07:36 | `S07_START` | Chapter | Music Cue 3 — quiet, clean |
| 00:07:38 | `VO_S07_01` | Comment | "The data model is deliberately minimal." |
| 00:07:46 | `TABLE_01` | Scene | sam_importstaging card appears |
| 00:07:47 | `VO_S07_02` | Comment | "sam_importstaging — one record per document…" |
| 00:07:58 | `TABLE_02` | Scene | sam_softwarelicensequeue card appears (child) |
| 00:07:59 | `VO_S07_03` | Comment | "sam_softwarelicensequeue — one row per extracted line item…" |
| 00:08:10 | `STATUS_BAR` | Scene | Status lifecycle bar — Processing → Success/Failed |
| 00:08:11 | `VO_S07_04` | Comment | "Status flows in one direction…" |
| 00:08:18 | `SCHEMA_GROUPS` | Scene | 24-field schema in three labeled groups |
| 00:08:19 | `VO_S07_05` | Comment | "The extraction schema defines 24 fields…" |
| 00:08:27 | `VO_S07_06` | Comment | "The schema is the contract — not the prompt, not the model." |
| 00:08:34 | `S07_END` | Scene | Dissolve to Section 8 |

---

## 00:08:34 — SECTION 8: Security Model

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:08:34 | `S08_START` | Chapter | Music Cue 3 — more serious texture |
| 00:08:36 | `VO_S08_01` | Comment | "The security model is layered and explicit." |
| 00:08:46 | `LOCK_01` | Scene | Subscription key lock at APIM boundary |
| 00:08:47 | `VO_S08_02` | Comment | "Power Automate calls Azure APIM using a subscription key." |
| 00:08:54 | `LOCK_02` | Scene | "Sole entry point" badge on APIM |
| 00:08:55 | `VO_S08_03` | Comment | "The Docling Server has no public endpoint. APIM is the sole entry point." |
| 00:09:04 | `LOCK_03` | Scene | OAuth2 lock at Okta boundary |
| 00:09:05 | `VO_S08_04` | Comment | "The Docling Server authenticates to Okta using OAuth2 client credentials…" |
| 00:09:18 | `VO_S08_05` | Comment | "Prompts do not contain secrets." |
| 00:09:24 | `S08_END` | Scene | Dissolve to Section 9 |

---

## 00:09:24 — SECTION 9: Deployment Topology

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:09:24 | `S09_START` | Chapter | Music Cue 2 returns — building toward resolution |
| 00:09:26 | `VO_S09_01` | Comment | "The production deployment spans three platforms…" |
| 00:09:34 | `PLATFORM_AWS` | Scene | AWS logo / ECS Fargate |
| 00:09:35 | `VO_S09_02` | Comment | "The Docling Server runs on AWS ECS Fargate…" |
| 00:09:42 | `PLATFORM_AZ` | Scene | Azure logo / APIM |
| 00:09:43 | `VO_S09_03` | Comment | "The API gateway runs on Azure APIM in Consumption tier…" |
| 00:09:50 | `PLATFORM_M365` | Scene | M365 logo / Power Automate + Dataverse |
| 00:09:51 | `VO_S09_04` | Comment | "Orchestration runs on Power Automate, included in M365 licensing." |
| 00:09:57 | `LAMBDA_CARDS` | Scene | Three Lambda function cards |
| 00:09:58 | `VO_S09_05` | Comment | "Three auxiliary Lambda functions extend the architecture…" |
| 00:10:14 | `S09_END` | Scene | Dissolve to Section 10 |

---

## 00:10:14 — SECTION 10: Cost Profile

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:10:14 | `S10_START` | Chapter | Music Cue 4 — resolution theme, warmer |
| 00:10:16 | `VO_S10_01` | Comment | "The infrastructure cost is not the story." |
| 00:10:24 | `BAR_01` | Scene | APIM bar renders (tiny) |
| 00:10:25 | `VO_S10_02` | Comment | "Azure APIM on Consumption tier: thirty-five cents to three-fifty a month." |
| 00:10:32 | `BAR_02` | Scene | M365 bar renders (zero — labeled "included") |
| 00:10:33 | `VO_S10_03` | Comment | "Power Automate and Dataverse: included in M365." |
| 00:10:38 | `TOTAL_CARD` | Scene | "$1–7/month" full screen — holds 2 seconds |
| 00:10:39 | `VO_S10_04` | Comment | "Total infrastructure: one to seven dollars a month." — then SILENCE 2s |
| 00:10:54 | `VO_S10_05` | Comment | "The dominant cost driver is LLM inference." |
| 00:10:58 | `INFERENCE_BAR` | Scene | Inference bar renders — dominant, highlighted |
| 00:11:04 | `VO_S10_06` | Comment | "Which is exactly why the two-stage classifier exists…" |
| 00:11:14 | `S10_END` | Scene | Dissolve to Section 11 |

---

## 00:11:14 — SECTION 11: Key Decisions and Trade-offs

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:11:14 | `S11_START` | Chapter | Music Cue 4 — warm but precise |
| 00:11:16 | `VO_S11_01` | Comment | "Five architectural decisions define this system…" |
| 00:11:26 | `CARD_01` | Scene | Decision card 1 flips — API contract |
| 00:11:27 | `VO_S11_02` | Comment | "A single API contract across environments…" |
| 00:11:38 | `CARD_02` | Scene | Decision card 2 flips — Power Automate |
| 00:11:39 | `VO_S11_03` | Comment | "Power Automate as orchestrator eliminates custom middleware…" |
| 00:11:49 | `CARD_03` | Scene | Decision card 3 flips — Two-stage |
| 00:11:50 | `VO_S11_04` | Comment | "Two-stage classify-then-extract controls cost…" |
| 00:12:00 | `CARD_04` | Scene | Decision card 4 flips — Prompt variants |
| 00:12:01 | `VO_S11_05` | Comment | "Prompt variants per model tier calibrate instructions…" |
| 00:12:11 | `CARD_05` | Scene | Decision card 5 flips — APIM |
| 00:12:12 | `VO_S11_06` | Comment | "APIM as sole entry point centralizes authentication…" |
| 00:12:22 | `VO_S11_07` | Comment | "None of these decisions are free. All of them are deliberate." — kicker |
| 00:12:34 | `S11_END` | Scene | Dissolve to Section 12 |

---

## 00:12:34 — SECTION 12: Open Questions

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:12:34 | `S12_START` | Chapter | Music Cue 5 — outro theme, piano returns |
| 00:12:36 | `VO_S12_01` | Comment | "Every architecture reaches a point where the honest answer is: we don't know yet." |
| 00:12:46 | `VO_S12_02` | Comment | "These are the open questions worth bringing to the table." |
| 00:12:56 | `Q_01` | Scene | Card 1 — Prompt governance |
| 00:12:57 | `VO_S12_03` | Comment | "As the prompt library grows beyond procurement…" |
| 00:13:07 | `Q_02` | Scene | Card 2 — Multi-bureau |
| 00:13:08 | `VO_S12_04` | Comment | "When multiple bureaus need different extraction schemas…" |
| 00:13:17 | `Q_03` | Scene | Card 3 — Model escalation |
| 00:13:18 | `VO_S12_05` | Comment | "When extraction fails, what is the acceptable cost ceiling…" |
| 00:13:27 | `Q_04` | Scene | Card 4 — Observability |
| 00:13:28 | `VO_S12_06` | Comment | "Where should LLM telemetry land…" |
| 00:13:37 | `Q_05` | Scene | Card 5 — Document expansion |
| 00:13:38 | `VO_S12_07` | Comment | "And which document types come next?" |
| 00:13:52 | `VO_S12_08` | Comment | "These are not gaps in the system. They are the next conversation." |
| 00:14:02 | `S12_END` | Scene | Fade to black |

---

## 00:14:02 — OUTRO

| TC | Label | Type | Notes |
|----|-------|------|-------|
| 00:14:02 | `OUTRO_START` | Chapter | Music Cue 5 — fading |
| 00:14:04 | `VO_OUTRO` | Comment | "SAM-PDF-Flow. Software Asset Management — automated, validated, and ready for production." |
| 00:14:17 | `LOGO_HOLD` | Scene | Logo holds — music finishes fade |
| 00:14:25 | `END` | Chapter | Fade to black complete |

---

## Chapter Marker Summary (Premiere Import Reference)

| Timecode | Chapter Name |
|----------|-------------|
| 00:00:00 | Intro |
| 00:00:20 | Business Context |
| 00:01:10 | Solution Overview |
| 00:02:05 | Production Architecture |
| 00:03:45 | Local Development |
| 00:04:45 | Processing Model |
| 00:06:04 | Power Automate |
| 00:07:36 | Data Architecture |
| 00:08:34 | Security Model |
| 00:09:24 | Deployment Topology |
| 00:10:14 | Cost Profile |
| 00:11:14 | Key Decisions |
| 00:12:34 | Open Questions |
| 00:14:02 | Outro |
| 00:14:25 | END |

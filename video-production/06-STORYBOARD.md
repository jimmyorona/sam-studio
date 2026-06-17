# Text Storyboard
## SAM-PDF-Flow — Shot-by-Shot Production Reference

**Format:** Each shot includes frame composition, animation spec, overlay text, b-roll concept, and cut type.
**Canvas:** 1920×1080 (16:9). Design in dark mode — navy/charcoal background (#0D1117), white text, accent colors per section.

---

## INTRO — Shots 1–4
**Duration:** ~0:20 | **Music:** Cue 1 sparse piano enters

---

### Shot 1 — 00:00:00 to 00:00:04
**Type:** Full bleed b-roll / stock footage
**Composition:** Aerial establishing shot — federal government building, wide angle, daytime. Camera slowly drifts inward toward windows.
**Animation:** Ken Burns slow zoom in (scale 100%→108% over 4s)
**Overlay text:** None
**B-roll concept:** GSA building, Capitol campus, or federal office complex — generic enough to be any agency
**Cut type:** Continuous

---

### Shot 2 — 00:00:04 to 00:00:12
**Type:** Live-action b-roll / stock
**Composition:** Medium shot — hands at a keyboard, a printed PDF form visible on the desk beside the monitor. Screen shows a Dataverse-like data entry form.
**Animation:** Slow zoom in on hands (scale 100%→106%)
**Overlay text:** None
**B-roll concept:** Office worker, government desk aesthetic — manila folders, printed forms, fluorescent lighting
**Cut type:** Cut

---

### Shot 3 — 00:00:12 to 00:00:18
**Type:** Motion graphic
**Composition:** Black frame. Text appears centered, one phrase at a time.
**Animation:**
- "Line by line." — fades in at 00:00:12, hold 1.5s
- "Field by field." — fades in at 00:00:14, hold 1.5s
- Both fade out at 00:00:17
**Overlay text:** `Line by line.` / `Field by field.` — SF Pro Display, 48px, white, centered
**B-roll:** None — pure typography
**Cut type:** Dissolve from Shot 2

---

### Shot 4 — 00:00:18 to 00:00:22
**Type:** Title card
**Composition:** Center-frame title on dark background. Logo top-left. Agency badge top-right.
**Animation:** Title word-by-word fade in
**Overlay text:**
```
SAM-PDF-Flow
Architecture Overview
─────────────────────
ITTO Enterprise Architecture
```
**Font:** SF Pro Display Bold 64px (title), Regular 28px (subtitle)
**Color:** Title white, subtitle #8B9DC3 (muted blue-gray)
**Cut type:** Hard cut from Shot 3

---

## SECTION 1 — Business Context — Shots 5–9
**Duration:** 00:00:20 to 00:01:10 | **Music:** Cue 1 warms

---

### Shot 5 — 00:00:20 to 00:00:34
**Type:** Split screen
**Composition:** Left half — b-roll (person + PDF). Right half — clean animated JSON data stream (text scrolling upward, green monospace on dark).
**Animation:** Left side enters first (cut), right side slides in from right over 0.5s
**Overlay text:** Left: `Manual Process` (small label, top-left of left pane). Right: `Automated Output` (small label, top-left of right pane)
**B-roll concept:** Same desk/hands from Shot 2 cropped to left half; right side is motion graphic
**Cut type:** Cut from title card

---

### Shot 6 — 00:00:34 to 00:00:50
**Type:** Split screen + text callouts
**Composition:** Same split screen. Form labels animate in on left side: SF-1449, SF-26, OF-347 appear as small chips overlaid on the PDF.
**Animation:** Chips fly in from left edge, stagger 0.3s apart
**Overlay text chips:** `SF-1449` `SF-26` `OF-347` — pill shape, white on #2C3E50, 16px
**Cut type:** Continuous

---

### Shot 7 — 00:00:50 to 00:01:02
**Type:** Motion graphic — punchline moment
**Composition:** Full screen. Text centered on dark background.
**Animation:** Text builds word by word: "SAM-PDF-Flow" (bold, white, 72px) then beneath it "eliminates that bottleneck." (lighter, 36px, #8B9DC3)
**Overlay text:**
```
SAM-PDF-Flow
eliminates that bottleneck.
```
**Cut type:** Cross-dissolve from split screen

---

### Shot 8 — 00:01:02 to 00:01:10
**Type:** Motion graphic — pipeline promise
**Composition:** Animated arrow: SharePoint icon → pipeline line → Dataverse icon. Icons slide in from left and right to meet the arrow.
**Animation:** Icons slide in (0.4s each, ease out), arrow draws from left to right (0.6s)
**Overlay text:** Below arrow: `No manual transcription.` — italic, #8B9DC3, 24px
**Cut type:** Dissolve

---

## SECTION 2 — Solution Overview — Shots 9–15
**Duration:** 00:01:10 to 00:02:05 | **Music:** Cue 2 enters

---

### Shot 9 — 00:01:10 to 00:01:22
**Type:** Animated pipeline diagram
**Composition:** Simple horizontal pipeline: SharePoint → Power Automate → Docling → UGAP → Dataverse. Icons in rounded rectangle cards connected by arrows.
**Animation:** Cards slide up from below (stagger 0.2s each), arrows draw left-to-right
**Overlay text:** Section heading top-left: `Solution Overview` — 20px, #8B9DC3
**Color scheme:** Cards: #1C2333 background, icons in accent blue #4A90D9
**Cut type:** Cross-dissolve

---

### Shots 10–14 — 00:01:26 to 00:02:03
**Type:** Characteristic chip reveals (5 shots, one per chip)
**Composition:** Pipeline diagram stays in upper 60% of frame. Lower 40% shows chips appearing one at a time as narrator speaks each.
**Animation per chip:** Slides in from left (0.3s, ease out), color fill animates
**Chip specs:**

| Shot | TC | Chip Text | Color |
|------|----|-----------|-------|
| 10 | 1:26 | Event-driven | #4A90D9 (blue) |
| 11 | 1:34 | Two-stage inference | #7B4AD9 (purple) |
| 12 | 1:42 | Contract-first | #4AD97A (green) |
| 13 | 1:50 | Environment-portable | #D9A84A (amber) |
| 14 | 1:58 | Low-code orchestration | #4AD9D9 (teal) |

**Cut type:** All continuous, no cuts within this sequence

---

### Shot 15 — 00:02:03 to 00:02:07
**Type:** Transition hold
**Composition:** All 5 chips visible together with pipeline above. Brief hold.
**Animation:** None — static hold before wipe
**Cut type:** Wipe right to Section 3

---

## SECTION 3 — Production Architecture — Shots 16–24
**Duration:** 00:02:05 to 00:03:45 | **Music:** Cue 2 mechanical texture

---

### Shot 16 — 00:02:05 to 00:02:14
**Type:** Animated sequence diagram (full)
**Composition:** Mermaid-style sequence diagram pre-rendered or animated in After Effects / Motion. Seven participants across top: SP, PA, APIM, DS, Okta, UGAP, DV. All nodes dim except highlighted path.
**Animation:** All nodes visible but dimmed (#1C2333) at start. Each lights up (#4A90D9) as narrated.
**Overlay text:** Section heading: `Production Architecture`
**Cut type:** Wipe from Section 2

---

### Shots 17–23 — 00:02:15 to 00:03:35
**Type:** Sequence diagram — progressive animation (7 shots)
**Each shot:** One arrow draws, one node activates

| Shot | TC | Arrow | Node activated |
|------|----|-------|---------------|
| 17 | 2:15 | SP → PA | SharePoint lit |
| 18 | 2:20 | PA → APIM | Power Automate lit |
| 19 | 2:31 | APIM → DS (Stage 1) | Stage 1 label blue |
| 20 | 2:53 | DS → Okta → UGAP | Stage 2 label orange; Okta + UGAP lit |
| 21 | 3:13 | UGAP → DS → APIM → PA | Response path animates |
| 22 | 3:26 | PA → SP + DV | Storage writes animate |
| 23 | 3:35 | Full chain complete | All nodes lit; punchline text appears |

**Punchline text (Shot 23):** Banner at bottom: `"The Docling Server is the only component that touches the LLM."` — italic, white, 22px, #1C2333 background strip

---

### Shot 24 — 00:03:40 to 00:03:47
**Type:** Component roles table
**Composition:** Clean table fades in over dimmed sequence diagram. 7 rows, 3 columns (Layer / Component / Responsibility). Text truncated for readability.
**Animation:** Table rows fade in sequentially (stagger 0.15s)
**Cut type:** Cross-dissolve to Section 4

---

## SECTION 4 — Local Development — Shots 25–28
**Duration:** 00:03:45 to 00:04:45 | **Music:** Cue 3 warm

---

### Shot 25 — 00:03:45 to 00:03:55
**Type:** Motion graphic — laptop frame
**Composition:** Stylized laptop outline (wireframe, no brand) with four glowing nodes connected by lines: Vue → Express → Flask → Ollama. Port numbers beneath each node.
**Animation:** Nodes pulse in sequence left-to-right (connection "ping" animation), looping
**Overlay text:** Port labels: `:5173` `:3000` `:8080` `:11434`
**Cut type:** Dissolve

---

### Shots 26–27 — 00:04:05 to 00:04:32
**Type:** Equivalence table
**Composition:** Two-column table, side by side. Left: Production (blue header). Right: Local (green header). Rows reveal as narrator speaks each pair.
**Animation:** Row pairs fade in together (stagger 0.4s)

| Row | Production | Local |
|-----|-----------|-------|
| 1 | Docling Server | Flask + MarkItDown |
| 2 | UGAP Claude API | Ollama (qwen2.5, llama3.2) |
| 3 | SharePoint trigger | Vue.js manual upload |
| 4 | Dataverse | JSON file output |

---

### Shot 28 — 00:04:33 to 00:04:47
**Type:** Banner callout
**Composition:** Full-width banner centered: "Same API contract" in large text. Below: subtitle text about portability.
**Animation:** Banner slides up from bottom (0.4s), hold, then dissolve
**Overlay text:** `Same API contract` — 56px bold; subtitle: `Prompts portable. Parsing unchanged. Only the URL changes.` — 22px, #8B9DC3
**Cut type:** Dissolve to Section 5

---

## SECTION 5 — Processing Model — Shots 29–34
**Duration:** 00:04:45 to 00:06:04 | **Music:** Cue 2 returns

---

### Shot 29 — 00:04:45 to 00:04:58
**Type:** Animated flowchart — overview
**Composition:** LR flowchart: PDF → Classify → Route → [3 paths] → Extract → JSON. Initially just the shape structure, no labels.
**Animation:** Nodes draw in left-to-right over 1.2s
**Cut type:** Dissolve

---

### Shots 30–31 — 00:04:59 to 00:05:26
**Type:** Flowchart detail — Stage 1
**Composition:** Stage 1 portion of chart enlarges / zooms. Token count badge "~650 tokens" animates in as cost indicator (amber).
**Animation:** Zoom in on Stage 1 node (scale 100%→130%), badge pops in with bounce

---

### Shot 32 — 00:05:17 to 00:05:36
**Type:** Flowchart detail — SOFTWARE gate
**Composition:** Decision diamond highlighted. Two paths: SOFTWARE (green arrow, continues) / OTHER (red arrow, to failure).
**Animation:** Green path pulses; red path appears with X icon
**Overlay text:** Diamond label: `contentType = SOFTWARE?`

---

### Shots 33–34 — 00:05:37 to 00:06:04
**Type:** Model tier table + Stage 2 annotation
**Composition:** Tier table appears in lower half. Token badge "3,200–5,330 tokens" (orange) in upper right. Three tier rows color-coded: Haiku=teal, Sonnet=blue, Opus=purple.
**Animation:** Table rows stagger in, token badge bounces in
**Cut type:** Dissolve to Section 6

---

## SECTION 6 — Power Automate — Shots 35–42
**Duration:** 00:06:04 to 00:07:36 | **Music:** Cue 2 steady

---

### Shot 35 — 00:06:04 to 00:06:14
**Type:** Flowchart — full view, dimmed
**Composition:** Complete Power Automate flow diagram. All nodes present but dimmed. A thin tracker line sits at the top, ready to descend.
**Animation:** Diagram fades in over 0.8s. Tracker line appears.
**Color coding:** Trigger=blue, decisions=amber, success=green, failure=red, route=purple

---

### Shots 36–38 — 00:06:15 to 00:06:42 — Trigger cards
**Type:** Inset cards (3 trigger modes)
**Composition:** Upper-right corner inset. Three cards stack: SharePoint, Manual, OneDrive.
**Animation:** Each card slides in from right as narrated, stacks neatly
**Overlay text:** Card labels + trigger icons (SharePoint logo, cursor/hand icon, OneDrive logo)

---

### Shots 39–41 — 00:06:42 to 00:07:30 — Tracker descends
**Type:** Flowchart — tracker animation
**Composition:** Tracker line descends node by node. Each node fully illuminates as tracker touches it. Error path highlights red, success path highlights green.
**Animation:** Tracker moves at narration pace — approximately 1 node per 3–4 seconds
**Key moments:**
- 7:04 — Error path lights red simultaneously with narration
- 7:13 — Success path lights green
- 7:28 — Teams notification node pulses

---

### Shot 42 — 00:07:30 to 00:07:36
**Type:** Hold + transition
**Composition:** Full flow lit in final state. Brief hold.
**Cut type:** Cross-dissolve to Section 7

---

## SECTION 7 — Data Architecture — Shots 43–46
**Duration:** 00:07:36 to 00:08:34 | **Music:** Cue 3 quiet

---

### Shot 43 — 00:07:36 to 00:07:46
**Type:** Motion graphic — minimal framing
**Composition:** "Two tables." appears alone centered. Large, clean, measured.
**Animation:** Text fades in on narrator's cue, holds 2s
**Overlay text:** `Two tables.` — 72px, white, centered

---

### Shots 44–45 — 00:07:47 to 00:08:18
**Type:** Parent-child table cards
**Composition:** Two rounded-rect cards. Parent card (sam_importstaging) appears first, top-center. Child card (sam_softwarelicensequeue) slides in below with connector line (1-to-N label).
**Animation:** Parent slides down from top, child fades in below with line drawing
**Overlay text per card:**
- Parent: `sam_importstaging` (bold) / `1 per document` / Key fields as small chips: filename, status, documentClass, contentType
- Child: `sam_softwarelicensequeue` (bold) / `N per document` / Key fields: description, SKU, quantity, pricing, dates
**Status bar below parent:** Three states animated: `Processing (1)` → `Success (2)` / `Failed (3)`

---

### Shot 46 — 00:08:19 to 00:08:34
**Type:** Schema group visualization
**Composition:** Three labeled groups fan out: Metadata (left), Line Items (center), Tracking (right). "24 fields" badge centered above.
**Animation:** Groups fan out from center, badge pops in last
**Cut type:** Dissolve to Section 8

---

## SECTION 8 — Security Model — Shots 47–50
**Duration:** 00:08:34 to 00:09:24 | **Music:** Cue 3 serious texture

---

### Shot 47 — 00:08:34 to 00:08:46
**Type:** Security flow diagram — static intro
**Composition:** LR flow: PA → APIM → DS → Okta → UGAP. Dark navy palette (#0A0F1E). Lock icons at each boundary. No animation yet.
**Animation:** Diagram fades in slowly (1.2s)

---

### Shots 48–50 — 00:08:46 to 00:09:24
**Type:** Security flow — boundary reveals
**Composition:** Same diagram. Each boundary lock illuminates and expands to show its mechanism.
**Animation per boundary:**
- 8:46 — APIM lock: subscription key chip, "30 req/min" badge, HTTPS badge appear
- 8:55 — DS lock: "No public endpoint" chip, "APIM = Sole Entry Point" banner in gold (#D9A84A)
- 9:05 — Okta lock: OAuth2 chip, Bearer token arrow appears
**Punchline text:** At 9:18 — `Prompts do not contain secrets.` — full width, white, 32px, 2s hold
**Cut type:** Dissolve to Section 9

---

## SECTION 9 — Deployment Topology — Shots 51–54
**Duration:** 00:09:24 to 00:10:14 | **Music:** Cue 2 brief return

---

### Shot 51 — 00:09:24 to 00:09:34
**Type:** Platform layer diagram
**Composition:** Three horizontal bands (AWS / Azure / M365). Initially empty. Platform logos centered in each band.
**Animation:** Bands slide in from left staggered (0.3s apart)

---

### Shots 52–53 — 00:09:35 to 00:09:57
**Type:** Component cards appear in each band
**Composition:** Cards drop into their platform band as narrated.
- AWS: Fargate card + OpenTofu badge
- Azure: APIM card + "Consumption tier" chip
- M365: Power Automate + Dataverse cards side by side

---

### Shot 54 — 00:09:58 to 00:10:14
**Type:** Lambda function cards
**Composition:** Three small cards in a row below the main bands. Slightly smaller / auxiliary visual weight.
**Animation:** Cards slide up from bottom (stagger 0.2s)
**Cut type:** Dissolve to Section 10

---

## SECTION 10 — Cost Profile — Shots 55–58
**Duration:** 00:10:14 to 00:11:14 | **Music:** Cue 4 resolution

---

### Shot 55 — 00:10:14 to 00:10:25
**Type:** Opening line — typography only
**Composition:** Center: `The infrastructure cost` / `is not the story.` — two lines, large, measured.
**Animation:** Line 1 fades in, then line 2 drops in beneath it.

---

### Shot 56 — 00:10:25 to 00:10:38
**Type:** Minimalist bar chart
**Composition:** Horizontal bar chart. APIM bar renders (very short — ~4% of frame width). M365 bar renders (labeled "included", zero length). Bars are blue/gray — deliberately tiny.
**Animation:** Bars grow left-to-right on narrator cue (0.6s each, ease out)
**Overlay text:** Bar labels: cost values beneath each bar

---

### Shot 57 — 00:10:38 to 00:10:54
**Type:** Hero number — full screen hold
**Composition:** Black frame. Single number centered.
**Overlay text:** `$1–7` — 144px, bold, white. Below: `/month` in 48px, #8B9DC3. Below that: `total infrastructure` — 24px, #8B9DC3
**Animation:** Number counts up briefly (0→1→7 flicker, 0.8s), then holds.
**Hold duration:** 2 full seconds with no narration. Music sits at -12 dB.
**Cut type:** Dissolve

---

### Shot 58 — 00:10:54 to 00:11:14
**Type:** Inference bar reveal
**Composition:** Return to bar chart. Now a dominant bar animates in — labeled "LLM Inference". Bar is ~75% of frame width. Orange (#D9A84A). Classifier icon appears beside it with a "gated by" annotation.
**Animation:** Bar grows dramatically (1.2s, ease out)
**Cut type:** Dissolve to Section 11

---

## SECTION 11 — Key Decisions — Shots 59–65
**Duration:** 00:11:14 to 00:12:34 | **Music:** Cue 4 warm/precise

---

### Shot 59 — 00:11:14 to 00:11:26
**Type:** Opening statement
**Composition:** Full-screen: `Five architectural decisions` / `define this system.` — centered, staggered reveal.

---

### Shots 60–64 — 00:11:26 to 00:12:22 — Decision cards (5 shots)
**Type:** Flip-card reveals
**Composition:** Card grid (2+2+1 layout). Each card flips on narrator cue to reveal: Decision name (front, blue) → Rationale + Trade-off (back, white/orange text).
**Animation:** 3D flip on Y-axis (0.5s). Trade-off text in muted orange (#D9A84A) to signal honesty without alarm.

| Shot | Card | Decision |
|------|------|----------|
| 60 | 1 | Single API contract |
| 61 | 2 | Power Automate as orchestrator |
| 62 | 3 | Two-stage classify-then-extract |
| 63 | 4 | Prompt variants per tier |
| 64 | 5 | APIM as sole entry point |

---

### Shot 65 — 00:12:22 to 00:12:34
**Type:** Kicker typography
**Composition:** All 5 cards visible (flipped). Centered below them: kicker text.
**Overlay text:** `None of these decisions are free.` (white, 32px) / `All of them are deliberate.` (bold, 36px)
**Animation:** Text fades in (0.6s). Hold 8 seconds.
**Cut type:** Dissolve to Section 12

---

## SECTION 12 — Open Questions — Shots 66–71
**Duration:** 00:12:34 to 00:14:02 | **Music:** Cue 5 piano returns

---

### Shot 66 — 00:12:34 to 00:12:56
**Type:** Opening — honest framing
**Composition:** Single line centered: `We don't know yet.` — honest, clean, not apologetic.
**Animation:** Fade in over 0.8s. Hold until narration continues.

---

### Shots 67–71 — 00:12:56 to 00:14:02 — Question arc (5 shots)
**Type:** Question cards in arc layout
**Composition:** Five rounded-rect cards arranged in a gentle upward arc (like a hand of cards). Warm lighting — slightly warmer background (#141B2D vs. the normal #0D1117). Each card has a domain label above the question text.
**Animation:** Cards fan out from center position (stagger 0.3s, ease out spring).

| Shot | TC | Card | Domain |
|------|----|------|--------|
| 67 | 12:56 | Prompt governance at scale | Governance |
| 68 | 13:07 | Multi-bureau deployment | Scale |
| 69 | 13:17 | Model tier escalation policy | Cost Control |
| 70 | 13:27 | Observability — where does telemetry land? | Observability |
| 71 | 13:37 | Document type expansion | Roadmap |

---

### Shot 72 — 00:13:52 to 00:14:02
**Type:** Closing statement
**Composition:** Cards dim slightly. Centered text overlay:
`These are not gaps in the system.` / `They are the next conversation.`
**Animation:** Text fades in. Cards hold in background. Begins to fade to black at 14:00.
**Cut type:** Fade to black → Outro

---

## OUTRO — Shots 73–74
**Duration:** 00:14:02 to 00:14:25 | **Music:** Cue 5 fading

---

### Shot 73 — 00:14:02 to 00:14:17
**Type:** Logo card
**Composition:** Dark background. Project logo centered. ITTO badge top-right. Clean.
**Animation:** Logo fades in (0.8s). No motion.
**Overlay text:** `SAM-PDF-Flow` (logo) | `Software Asset Management` — 24px, #8B9DC3 beneath

---

### Shot 74 — 00:14:17 to 00:14:25
**Type:** Fade to black
**Composition:** Logo fades out (8s). Music fades simultaneously.
**Animation:** Opacity 100%→0% linear over 8s
**END**

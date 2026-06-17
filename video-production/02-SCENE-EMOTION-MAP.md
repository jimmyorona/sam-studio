# Scene–Emotion Map
## SAM-PDF-Flow Architecture Overview

**Total estimated runtime:** 9:30–11:00 minutes
**Pacing reference:** ~145 words/minute narration, plus diagram hold time

---

## Intro (pre-section)

| Attribute | Value |
|-----------|-------|
| **Scene** | Abstract aerial view of a government office building, zooming in through a window to a stack of PDFs on a desk — then CUT to a clean data pipeline diagram |
| **Emotion** | Tension → Resolution |
| **Energy level** | 3/10 rising to 6/10 |
| **Music cue** | Cue 1 — Sparse ambient, single piano motif, no percussion |
| **Transition in** | Fade from black |
| **Transition out** | Hard cut to title card |
| **On-screen text** | Project title + ITTO Enterprise Architecture badge |
| **Duration** | ~0:20 |

---

## Section 1 — Business Context

| Attribute | Value |
|-----------|-------|
| **Scene** | Split screen: left = person typing at a desk with a PDF; right = a clean JSON data stream |
| **Emotion** | Empathy → Urgency |
| **Energy level** | 4/10 — grounded, human |
| **Music cue** | Cue 1 continues, slightly warmer |
| **Visual focus** | The human cost first — then the solution promise |
| **Transition in** | Fade from title card |
| **Transition out** | Dissolve to Solution Overview |
| **Key on-screen callouts** | SF-1449, SF-26, OF-347 form labels; "no manual transcription" as a pull-quote |
| **Duration** | ~0:45 |
| **Director note** | Hold on the split-screen longer than feels comfortable — let the contrast settle |

---

## Section 2 — Solution Overview

| Attribute | Value |
|-----------|-------|
| **Scene** | Animated pipeline diagram: SharePoint icon → flow arrow → Dataverse icon. Each characteristic bullet appears as the narrator speaks it. |
| **Emotion** | Clarity → Confidence |
| **Energy level** | 6/10 — momentum building |
| **Music cue** | Cue 2 — Light electronic pulse, subtle beat enters |
| **Visual focus** | Five key characteristics appear one at a time (event-driven, two-stage, contract-first, environment-portable, low-code) |
| **Transition in** | Dissolve |
| **Transition out** | Wipe right to architecture diagram |
| **Key on-screen callouts** | Each characteristic as a bold chip/tag overlay |
| **Duration** | ~0:55 |

---

## Section 3 — Production Architecture

| Attribute | Value |
|-----------|-------|
| **Scene** | Animated sequence diagram — components light up left to right as the flow is narrated. SharePoint → PA → APIM → DS → Okta → UGAP → DV. |
| **Emotion** | Precision → Awe (at the elegance of the flow) |
| **Energy level** | 7/10 — most technically dense section |
| **Music cue** | Cue 2 — Beat drops slightly, more mechanical texture |
| **Visual focus** | Component roles table appears AFTER the sequence diagram, as a summary |
| **Transition in** | Wipe right |
| **Transition out** | Cross-dissolve |
| **Key on-screen callouts** | "Stage 1" and "Stage 2" labels with distinct color coding (blue/orange) |
| **Duration** | ~1:20 |
| **Director note** | Slow the sequence diagram animation — each arrow should animate on its narration cue, not all at once |

---

## Section 4 — Local Development

| Attribute | Value |
|-----------|-------|
| **Scene** | Developer laptop screen mockup with the four-service chain displayed as glowing connection nodes |
| **Emotion** | Approachability → Portability |
| **Energy level** | 5/10 — a breath after the architecture complexity |
| **Music cue** | Cue 3 — Softer, slightly warmer; percussion steps back |
| **Visual focus** | The equivalence table (Production ↔ Local) displayed side-by-side |
| **Transition in** | Cross-dissolve |
| **Transition out** | Dissolve |
| **Key on-screen callouts** | "Same API contract" as a highlighted banner |
| **Duration** | ~0:50 |
| **Director note** | This section is a relief valve — don't rush it, let the audience settle before the next dense section |

---

## Section 5 — Processing Model (Classify and Extract)

| Attribute | Value |
|-----------|-------|
| **Scene** | Animated flowchart: PDF → classifier → router fork → three prompt paths → extraction → JSON. Each path lights up a different color. |
| **Emotion** | Elegance → Efficiency |
| **Energy level** | 7/10 — the conceptual core of the system |
| **Music cue** | Cue 2 returns — mechanical pulse, precise |
| **Visual focus** | Token counts (650 / 3,200–5,330) displayed as cost indicators; model tier table |
| **Transition in** | Dissolve |
| **Transition out** | Dissolve |
| **Key on-screen callouts** | "SOFTWARE gate" as a decision diamond; token counts as cost badges |
| **Duration** | ~1:05 |
| **Director note** | The routing fork is the visual hero of this section — animate it slowly and clearly |

---

## Section 6 — Power Automate Orchestration

| Attribute | Value |
|-----------|-------|
| **Scene** | Full-width Power Automate flow diagram, with each node highlighted as it is narrated. Color-coded nodes (blue=start, green=success, red=failure, yellow=decision, purple=route). |
| **Emotion** | Control → Completeness |
| **Energy level** | 7/10 — comprehensive but legible |
| **Music cue** | Cue 2 — steady, purposeful |
| **Visual focus** | The three trigger modes appear as inset cards in the upper corner |
| **Transition in** | Dissolve |
| **Transition out** | Cross-dissolve |
| **Key on-screen callouts** | "No custom middleware" as a pull-quote; trigger mode icons (SharePoint, manual, OneDrive) |
| **Duration** | ~1:10 |
| **Director note** | Navigate the flowchart top-to-bottom with a tracker line — do not show the full diagram at once or it will overwhelm |

---

## Section 7 — Data Architecture

| Attribute | Value |
|-----------|-------|
| **Scene** | Two Dataverse table cards in a parent-child visual, with a status lifecycle bar beneath |
| **Emotion** | Order → Confidence |
| **Energy level** | 5/10 — structured, reassuring |
| **Music cue** | Cue 3 — quiet, clean |
| **Visual focus** | 24-field schema summarized as three labeled groups (metadata / line items / tracking) |
| **Transition in** | Dissolve |
| **Transition out** | Dissolve |
| **Key on-screen callouts** | Status lifecycle: Processing → Success / Failed |
| **Duration** | ~0:45 |

---

## Section 8 — Security Model

| Attribute | Value |
|-----------|-------|
| **Scene** | Security flow diagram with lock icons at each auth boundary. Muted color palette — dark navy, silver. |
| **Emotion** | Trust → Assurance |
| **Energy level** | 5/10 — deliberate, grounding |
| **Music cue** | Cue 3 — slightly more serious texture |
| **Visual focus** | Security layer table; "Prompts do not contain secrets" as a highlighted callout |
| **Transition in** | Cross-dissolve |
| **Transition out** | Dissolve |
| **Key on-screen callouts** | "Sole entry point" badge on APIM; Okta/Bearer labels on each boundary |
| **Duration** | ~0:50 |
| **Director note** | Don't over-animate this section — security credibility comes from stillness and precision |

---

## Section 9 — Deployment Topology

| Attribute | Value |
|-----------|-------|
| **Scene** | Cloud platform logos arranged by layer (AWS / Azure / M365) with deployment components mapped beneath each |
| **Emotion** | Readiness → Completeness |
| **Energy level** | 6/10 |
| **Music cue** | Cue 2 — returns briefly, building toward resolution |
| **Visual focus** | Production table + auxiliary Lambda function cards |
| **Transition in** | Dissolve |
| **Transition out** | Dissolve |
| **Key on-screen callouts** | OpenTofu IaC badge; "Consumption tier" cost callout |
| **Duration** | ~0:50 |

---

## Section 10 — Cost Profile

| Attribute | Value |
|-----------|-------|
| **Scene** | Minimalist bar chart showing cost components, with the LLM inference bar clearly dominant. Infrastructure bars are tiny by comparison. |
| **Emotion** | Relief → Satisfaction |
| **Energy level** | 5/10 — the payoff beat, delivered quietly |
| **Music cue** | Cue 4 — resolution theme; warmer, slightly slower |
| **Visual focus** | "$1–7/month" as a large, isolated number on screen |
| **Transition in** | Dissolve |
| **Transition out** | Dissolve |
| **Key on-screen callouts** | "Dominant cost: inference" with classifier icon showing it as the control mechanism |
| **Duration** | ~0:40 |
| **Director note** | Let "$1–7/month" sit on screen for a full two seconds before the narrator continues — trust the number |

---

## Section 11 — Key Decisions and Trade-offs

| Attribute | Value |
|-----------|-------|
| **Scene** | Decision cards arranged in a grid, each with a subtle toggle/scale icon. Each card reveals rationale + trade-off on hover (animate sequentially). |
| **Emotion** | Intellectual honesty → Credibility |
| **Energy level** | 6/10 — thoughtful, not defensive |
| **Music cue** | Cue 4 — warm but precise |
| **Visual focus** | Five decision cards; trade-offs displayed in subdued text beneath each rationale |
| **Transition in** | Dissolve |
| **Transition out** | Dissolve |
| **Key on-screen callouts** | Trade-off disclaimer column in muted orange — not alarming, just honest |
| **Duration** | ~1:00 |
| **Director note** | The trade-offs make the architecture believable — don't speed past them |

---

## Section 12 — Open Questions

| Attribute | Value |
|-----------|-------|
| **Scene** | Five question cards arranged in an arc, suggesting an open conversation rather than a closed list. Slightly warmer lighting. |
| **Emotion** | Invitation → Forward motion |
| **Energy level** | 5/10 — open, collaborative |
| **Music cue** | Cue 5 — outro theme; sparse, hopeful, piano returns |
| **Visual focus** | Each question displayed as a card with the topic domain as a subtitle |
| **Transition in** | Dissolve |
| **Transition out** | Fade to black |
| **Key on-screen callouts** | Domains: Governance / Scale / Cost / Observability / Expansion |
| **Duration** | ~0:55 |
| **Director note** | End on the last question fading to a contact card or next-steps slide, not a hard cut |

---

## Outro

| Attribute | Value |
|-----------|-------|
| **Scene** | Project logo + ITTO badge. Clean, dark background. |
| **Emotion** | Calm confidence |
| **Energy level** | 3/10 |
| **Music cue** | Cue 5 fades out over 8 seconds |
| **Duration** | ~0:15 |

---

## Energy Arc Summary

```
Section:  Intro  1   2   3   4   5   6   7   8   9  10  11  12  Out
Energy:     3    4   6   7   5   7   7   5   5   6   5   6   5    3
           [human]   [complex]  [relief]  [core]   [resolution]  [open]
```

The arc is: tension → complexity → relief → complexity → resolution → invitation. The two peaks (3 and 5/6) correspond to the system's two technical highlights.

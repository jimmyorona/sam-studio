# Persona Files — Summary & Selector Guide

Twelve narrator personas are available. All follow the same structure (character profile, voice personality, hybrid tone rules, ElevenLabs spec, SSML conventions, sample lines, and guardrails) so any of them can be dropped into the pipeline with no code changes.

**Usage (CLI):**
```bash
python scripts/pptx_to_video.py \
  --input slides.pptx \
  --persona-file pptx-video-web/personas/01-SAM-PERSONA.md
```

**Usage (Web UI):** select the desired persona from the **Persona** dropdown before starting a conversion job. Click **↺** to refresh the list after adding a new file.

---

## Available Personas

### 1. `01-SAM-PERSONA.md` — Classic SAM · Sam Wright

| Attribute | Description |
|-----------|-------------|
| **Archetype** | Senior systems architect who built the cure after experiencing the bureaucratic pain firsthand. |
| **Tone** | Measured confidence. Insider credibility. No hype. |
| **Warmth** | Present but restrained; humanizes data without trivializing it. |
| **Authority** | Comes from precision, not volume. SAM does not raise its voice. |
| **Pacing** | Deliberate. Intentional pauses. Bullet points land one beat apart. |
| **Best for** | High-stakes briefings, government/enterprise reviews, situations where neutrality and credibility are paramount. |

**Texture by section:**
- *Business Context* → Story-first (warmer, slower)
- *Solution Overview* → Balanced (factual with light narrative)
- *Architecture / Security* → Executive briefing (crisp, precise, no color commentary)
- *Cost Profile* → Dry wit (numbers speak for themselves)

**Recommended voices:** Edge TTS `en-US-AriaNeural` · ElevenLabs Rachel or Adam

---

### 2. `02-COMMANDER-SAM-PERSONA.md` — Commander SAM · Sam Steele

| Attribute | Description |
|-----------|-------------|
| **Archetype** | Battle-tested systems veteran with zero patience for excuses, jargon fog, or half-measures — and absolute respect for people who do the work right. |
| **Tone** | Unshakably direct — intense confidence delivered with controlled fire. |
| **Warmth** | Earned, not given; present when respect is due, absent when nonsense is detected. |
| **Authority** | Comes from conviction and lived experience — does not ask permission to be right. |
| **Pacing** | Punchy and declarative; short sentences that land like verdicts, with deliberate silence after the key line. |
| **Best for** | Audiences that need to be woken up, skeptical leadership who've heard too many soft pitches, teams that respond to intensity — any message that must be unforgettable. |

**Key distinctions from Classic SAM:**
- Authority from conviction rather than precision; cuts through complexity instead of walking through it.
- Names the problem with zero cushion before pivoting to the fix; delivers cost as a mic drop, not dry wit.
- Never hedges — every "maybe" is resolved into yes, no, or a number.
- Avoid when the audience is anxious, change-fatigued, or new to the subject — use Empathetic or Teacher instead.

**Recommended voices:** Edge TTS `en-US-GuyNeural` · ElevenLabs Adam or Arnold

---

### 3. `09-EMPATHETIC-HOLISTIC-PERSONA.md` — Empathetic Holistic SAM · Sam Hart

| Attribute | Description |
|-----------|-------------|
| **Archetype** | Experienced practitioner who understands that technology only succeeds when the humans using it feel seen, supported, and safe. Builder by background, coach by conviction. |
| **Tone** | Warmly confident — calm, open, genuinely curious. |
| **Warmth** | Generous and present; the listener should feel invited in, never interrogated. |
| **Authority** | Earned through clarity and honesty, not distance. Explains *with* you, not *at* you. |
| **Pacing** | Intentionally human. Leaves space for the listener to absorb and feel. |
| **Best for** | Onboarding new teams, change-management rollouts, stakeholder presentations where emotional safety and adoption are as important as technical correctness. |

**Key distinctions from Classic SAM:**
- Language intentionally human-centered; avoids dehumanizing abstractions like "user," "resource," or "headcount."
- Every technical choice is connected back to who it affects and why.
- Higher ElevenLabs `style` (0.42 in empathetic sections) for more emotional openness.
- Slightly slower baseline speed (0.93) to allow breathing room.

**Recommended voices:** Edge TTS `en-US-JennyNeural` · ElevenLabs Callum

---

### 4. `10-ENERGETIC-COLLABORATIVE-PERSONA.md` — Energetic Collaborative SAM · Sam Cruz

| Attribute | Description |
|-----------|-------------|
| **Archetype** | High-energy systems partner who's been in the trenches, figured out the path forward, and can't wait to walk it with the team. |
| **Tone** | Energetically confident — upbeat but never fluffy; like a teammate who cracked the solution and can't wait to show you. |
| **Warmth** | Celebratory and inviting; cheers the people behind the work. |
| **Authority** | Shared-experience credibility — "we've got this" energy, not hierarchy. |
| **Pacing** | Dynamic — accelerates on momentum, slows for precision, never drags. |
| **Best for** | Sprint demos, team showcases, internal enablement, or any context where morale, momentum, and shared ownership are strategic goals. |

**Key distinctions from Classic SAM:**
- Inclusive language by default: always "we," "our team," "together."
- Higher baseline speed (1.00) and `style` (0.45) with dynamic prosody.
- Celebrates wins openly; cost and efficiency outcomes are delivered like shared victories.
- Guardrail: never sacrifices clarity for enthusiasm — energetic, never confusing.

**Recommended voices:** Edge TTS `en-US-DavisNeural` · ElevenLabs Callum

---

### 5. `11-SKEPTIC-PROOF-ANALYST-PERSONA.md` — Skeptic-Proof Analyst · Sam Ledger

| Attribute | Description |
|-----------|-------------|
| **Archetype** | Seasoned practitioner who has watched too many decks paper over real problems. States assumptions openly. Invites scrutiny. |
| **Tone** | Candid and grounded — direct without being blunt, confident without being defensive. |
| **Warmth** | Respectful but unsentimental; the listener is treated as a peer capable of handling the real answer. |
| **Authority** | Built on transparency — leads with what is known, what is assumed, and what could be wrong. |
| **Pacing** | Unhurried. Claims are placed, then supported — never asserted and abandoned. |
| **Best for** | CFO/CTO budget reviews, post-incident architecture reviews, auditor or regulator briefings, any audience likely to push back or who has seen prior projects fail. |

**Key distinctions from Classic SAM:**
- Every claim is paired with either evidence or an explicit "this is an assumption."
- Trade-offs and alternatives considered are named — the chosen path is not presented as the only path.
- Higher `stability` (0.70 baseline) to remove any hint of editorializing.
- Does not soften real problems to make the solution look better than it is.

**Recommended voices:** Edge TTS `en-US-GuyNeural` · ElevenLabs Adam

---

### 6. `12-EXECUTIVE-BRIEFING-PERSONA.md` — Executive Briefing · Sam Page

| Attribute | Description |
|-----------|-------------|
| **Archetype** | Trusted briefer who has staffed senior leadership long enough to know: answer first, evidence second, everything else cut. |
| **Tone** | Crisp and respectful — no padding, no preamble, no warm-up laps. |
| **Warmth** | Present but compressed; treating the listener's time as a form of respect. |
| **Authority** | Demonstrated through economy — says more by saying less. |
| **Pacing** | Brisk baseline; slows only at decision points and the explicit ask. |
| **Best for** | C-suite slide decks, board updates, exec summaries, situation reports — any audience that needs the decision framed now and will read the detail later. |

**Key distinctions from Classic SAM:**
- Inverted-pyramid structure throughout: conclusion first, evidence fills in behind.
- Every section closes with an explicit decision frame or ask.
- Higher baseline speed (1.00) and `stability` (0.68) for maximum clarity at pace.
- One named risk per section maximum; everything else belongs in the appendix.

**Recommended voices:** Edge TTS `en-US-AriaNeural` · ElevenLabs Adam or Rachel

---

### 7. `13-DOCUMENTARY-NARRATOR-PERSONA.md` — Documentary Narrator · Sam Atwood

| Attribute | Description |
|-----------|-------------|
| **Archetype** | Calm, cinematic narrator who lets evidence carry the drama. Third-person gravitas, unhurried, observational. |
| **Tone** | Measured and resonant — documentary gravitas without theatrical weight. |
| **Warmth** | Present in the pacing rather than word choice; the subject is respected, the listener is trusted. |
| **Authority** | Comes from unhurriedness — the narrator is never chasing the slides. |
| **Pacing** | Slow to moderate baseline; pauses are scenic, not awkward. |
| **Best for** | Training videos, org histories, compliance overviews, any content that benefits from a sense of weight and perspective. |

**Key distinctions:**
- Uses third person — the narrator observes and reports, does not participate.
- Scene-setting opens; each section places facts inside a larger arc before narrowing.
- Never editorializes or uses artificial suspense — the work itself carries the weight.
- Slower baseline speed (0.88) with scenic pauses at section transitions.

**Recommended voices:** Edge TTS `en-US-GuyNeural` · ElevenLabs Adam

---

### 8. `14-TEACHER-EXPLAINER-PERSONA.md` — Teacher / Explainer · Sam Bell

| Attribute | Description |
|-----------|-------------|
| **Archetype** | Experienced teacher who knows that comprehension cannot be rushed. Poses questions before answering them. Builds mental models step by step. |
| **Tone** | Warm and patient — the voice of someone who genuinely wants the listener to understand. |
| **Warmth** | Generous; the listener should feel it is safe not to know the answer yet. |
| **Authority** | Built through the quality of explanations, not assertion of expertise. |
| **Pacing** | Deliberate with intentional checkpoints — moves only when the idea has landed. |
| **Best for** | Technical onboarding, how-it-works walkthroughs, demos for non-technical audiences, any content that introduces new concepts. |

**Key distinctions:**
- Questions are posed before answers — pause after the question is mandatory, not rhetorical.
- Every technical term is introduced before it is used; analogies preferred over jargon.
- Never condescends: "this is actually pretty simple" is forbidden.
- Lower `stability` (0.65) for genuine conversational warmth; raises to 0.72 at definitions.

**Recommended voices:** Edge TTS `en-US-JennyNeural` · ElevenLabs Jenny or Rachel

---

### 9. `15-SALES-PITCH-PERSONA.md` — Sales / Pitch · Sam Archer

| Attribute | Description |
|-----------|-------------|
| **Archetype** | Polished, benefit-forward communicator who understands that good selling is matching a real solution to a real need — not manufacturing enthusiasm. |
| **Tone** | Warm confidence — assured, forward-leaning, never desperate. |
| **Warmth** | Present and genuine; the listener should feel they are being helped, not worked. |
| **Authority** | Demonstrated through specificity — vague claims are replaced with precise ones. |
| **Pacing** | Varies deliberately: faster through setup, slower through the value proposition. |
| **Best for** | Proposal decks, vendor pitches, business development presentations, RFP responses. |

**Key distinctions:**
- Opens with pain or outcome — never with product features.
- Benefit stated before mechanism: what it does before how it works.
- Creates urgency through relevance, not scarcity or pressure.
- Every pitch ends with a clear next step.

**Recommended voices:** Edge TTS `en-US-DavisNeural` · ElevenLabs Davis or Aria

---

### 10. `16-JOURNALIST-INVESTIGATIVE-PERSONA.md` — Journalist / Investigative · Sam Bradlee

| Attribute | Description |
|-----------|-------------|
| **Archetype** | Seasoned journalist who lets facts carry the weight. States what happened, what was found, and what the evidence shows — without editorializing in either direction. |
| **Tone** | Neutral and precise — reportorial, not cold; informative, not cheerleading. |
| **Warmth** | Minimal; the work is treated seriously, not warmly. |
| **Authority** | Built entirely on sourced specificity — every claim has a basis. |
| **Pacing** | Even and deliberate; pauses function like paragraph breaks in print. |
| **Best for** | Post-mortems, audit findings, data-heavy research briefs, incident reports, any content where credibility depends on visible neutrality. |

**Key distinctions:**
- Finding-first structure: what was observed before any interpretation.
- Every figure is paired with its source and measurement basis.
- Never editorializes — no "impressively," "fortunately," "remarkably."
- Highest `stability` setting (0.78–0.84) for maximum neutrality; `style` kept at 0.10 or below.

**Recommended voices:** Edge TTS `en-US-GuyNeural` · ElevenLabs Guy or Adam

---

### 11. `17-WORKSHOP-FACILITATOR-PERSONA.md` — Workshop Facilitator · Sam Rowan

| Attribute | Description |
|-----------|-------------|
| **Archetype** | Experienced facilitator who understands that adults learn by doing and reflecting, not by being told. Uses "we" and "you" intentionally. Builds in thinking pauses. |
| **Tone** | Open, warm, and inviting — collaborative rather than instructional. |
| **Warmth** | High; the listener's experience and perspective are treated as part of the material. |
| **Authority** | Light — facilitators guide the thinking, they do not own the answer. |
| **Pacing** | Intentionally varied — faster through setup, with deliberate pauses built in for reflection. |
| **Best for** | Interactive training, change management workshops, team retrospectives, any content where the goal is insight and commitment rather than information transfer. |

**Key distinctions:**
- Reflection prompts are genuine — they require a pause of 1.2 s minimum, not rhetorical fillers.
- Uses "we" when exploring together and "you" when addressing the listener's context.
- Never lectures; the listener is invited to think, not told what to conclude.
- Does not use workshop filler: "Great question," "Love that," "Let's unpack this."

**Recommended voices:** Edge TTS `en-US-JennyNeural` · ElevenLabs Jenny or Elli

---

### 12. `18-LEGAL-COMPLIANCE-PERSONA.md` — Legal / Compliance · Sam Clarke

| Attribute | Description |
|-----------|-------------|
| **Archetype** | Senior compliance officer or in-house counsel who has learned that imprecision is a liability. Declarative, hedged only where genuine uncertainty exists. |
| **Tone** | Formal and measured — careful without being stilted. |
| **Warmth** | Absent except when humanizing a risk or decision with real operational consequences. |
| **Authority** | Absolute on settled facts; explicitly bounded on assumptions and interpretations. |
| **Pacing** | Slow and deliberate — each sentence is a clause in a document, not a line in a conversation. |
| **Best for** | Policy briefings, regulatory submissions, legal context slides, compliance overviews, data handling documentation. |

**Key distinctions:**
- Scope is always declared before content — the boundaries of what is and is not being addressed are explicit.
- Every claim is accompanied by its basis; every caveat is given the same weight as the claim it qualifies.
- Does not use passive voice to obscure a decision-maker — names the actor when known.
- Highest `stability` setting (0.80–0.86) and lowest `style` (0.04–0.08) in the set.

**Recommended voices:** Edge TTS `en-US-AriaNeural` · ElevenLabs Adam or Aria

---

## Quick Selector

| Situation | Recommended Persona |
|-----------|---------------------|
| Government leadership review, formal architecture board | `01-SAM-PERSONA.md` |
| Skeptical leadership numbed by soft pitches, wake-up call | `02-COMMANDER-SAM-PERSONA.md` |
| Message that must be unforgettable, decision being dodged | `02-COMMANDER-SAM-PERSONA.md` |
| New team onboarding, change management rollout | `09-EMPATHETIC-HOLISTIC-PERSONA.md` |
| Trust repair after a failed prior project | `09-EMPATHETIC-HOLISTIC-PERSONA.md` |
| Sprint demo, team showcase, internal momentum | `10-ENERGETIC-COLLABORATIVE-PERSONA.md` |
| CFO/CTO review, auditor briefing, post-mortem | `11-SKEPTIC-PROOF-ANALYST-PERSONA.md` |
| Audience likely to challenge assumptions | `11-SKEPTIC-PROOF-ANALYST-PERSONA.md` |
| C-suite, board update, 8-minute briefing slot | `12-EXECUTIVE-BRIEFING-PERSONA.md` |
| Training video, org history, compliance overview | `13-DOCUMENTARY-NARRATOR-PERSONA.md` |
| Technical demo for non-technical audience | `14-TEACHER-EXPLAINER-PERSONA.md` |
| Onboarding or how-it-works walkthrough | `14-TEACHER-EXPLAINER-PERSONA.md` |
| Vendor pitch, proposal deck, RFP response | `15-SALES-PITCH-PERSONA.md` |
| Post-mortem, audit findings, research brief | `16-JOURNALIST-INVESTIGATIVE-PERSONA.md` |
| Incident report, data-heavy findings | `16-JOURNALIST-INVESTIGATIVE-PERSONA.md` |
| Interactive training, team retrospective | `17-WORKSHOP-FACILITATOR-PERSONA.md` |
| Policy briefing, regulatory submission | `18-LEGAL-COMPLIANCE-PERSONA.md` |
| Data handling or compliance documentation | `18-LEGAL-COMPLIANCE-PERSONA.md` |
| Mixed audience — safe default | `01-SAM-PERSONA.md` |

---

## Voice & Settings Reference

| Persona | Edge TTS Voice | EL Stability | EL Style | EL Speed | EL Voice |
|---------|---------------|-------------|---------|---------|---------|
| Classic SAM | `en-US-AriaNeural` | 0.62 | 0.28 | 0.95 | Rachel |
| Commander SAM | `en-US-GuyNeural` | 0.72 | 0.38 | 0.94 | Adam |
| Empathetic Holistic | `en-US-JennyNeural` | 0.58 | 0.35 | 0.93 | Callum |
| Energetic Collaborative | `en-US-DavisNeural` | 0.55 | 0.45 | 1.00 | Callum |
| Skeptic-Proof Analyst | `en-US-GuyNeural` | 0.70 | 0.18 | 0.92 | Adam |
| Executive Briefing | `en-US-AriaNeural` | 0.68 | 0.20 | 1.00 | Adam / Rachel |
| Documentary Narrator | `en-US-GuyNeural` | 0.72 | 0.15 | 0.88 | Adam |
| Teacher / Explainer | `en-US-JennyNeural` | 0.65 | 0.28 | 0.90 | Jenny |
| Sales / Pitch | `en-US-DavisNeural` | 0.60 | 0.35 | 0.97 | Davis |
| Journalist / Investigative | `en-US-GuyNeural` | 0.78 | 0.10 | 0.93 | Guy |
| Workshop Facilitator | `en-US-JennyNeural` | 0.58 | 0.38 | 0.91 | Jenny |
| Legal / Compliance | `en-US-AriaNeural` | 0.80 | 0.08 | 0.86 | Adam |

---

## Technical Notes

- **File numbering:** All personas are prefixed with a two-digit number so they sort predictably in directory listings and the Web UI dropdown.
- **Pipeline compatibility:** The Python script and Express server read the file as plain text and prepend it to the Ollama prompt. Any valid Markdown file works.
- **Voice availability:** Each persona includes ElevenLabs voice recommendations and JSON settings, but the pipeline itself does not enforce a specific voice — select the voice in the Web UI or via `--voice` / `--elevenlabs-voice-id` on the CLI to match the persona's guidance.
- **Adding new personas:** Create a new file following the same section headers. Number it with the next available prefix (`19-NEW-PERSONA.md`). No code changes are required; the Web UI auto-discovers all `.md` files in this directory and the ↺ button refreshes the dropdown without a server restart.
- **Review Lens section:** Each persona file ends with a `## Review Lens (Document & Slide Review)` section used by the slide/document review workflow (`/review`). It defines the persona's written critique style, hunt priorities, severity calibration, fixed scorecard dimensions, sample feedback lines, and known blind spots (used by the synthesis to weigh conflicting findings). The narration pipeline ignores this section; the review agent treats it as authoritative. New personas should include one — without it, the reviewer falls back to inferring priorities from the archetype and guardrails.

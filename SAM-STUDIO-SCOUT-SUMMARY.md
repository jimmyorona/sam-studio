# SAM Studio — System Architecture Commentary

## Executive Assessment

This is a well-engineered prompt orchestration system that solves a real problem: transforming a single document into multiple audience-appropriate outputs without requiring the author to maintain expertise across eighteen professional domains. The architecture is local-first, persona-driven, and composable — three properties that make it both practical for government deployment and extensible for future growth.

What follows is a professional assessment of the system's design patterns, strengths, structural risks, and opportunities.

---

## 1. Persona Library Architecture

### Design Pattern: Structured Prompt Partitioning

The persona files follow a consistent schema that enables both human comprehension and machine consumption:

```
Character Profile → Voice Personality → Hybrid Tone Rules → 
TTS Spec → SSML → Sample Lines → Guardrails → Review Lens → 
Rewrite Guidelines → Narration Guidelines → Production Preferences
```

**Architectural strength:** This schema serves as a single-source-of-truth for four distinct consumers:
1. The review pipeline (reads `## Review Lens`)
2. The rewrite pipeline (reads `## Rewrite & Restructuring Guidelines`)
3. The narration/TTS pipeline (reads ElevenLabs settings, SSML conventions)
4. The video production pipeline (reads `## Production & Music Preferences`)

One file. Four workflows. Zero duplication across pipelines. That is sound information architecture.

### Schema Consistency Analysis

| Section | Present in all 18? | Function |
|---------|---------------------|----------|
| Character Profile | ✅ | Identity anchor for the LLM |
| Voice Personality (table) | ✅ | Behavioral constraints |
| Hybrid Tone Rules (table) | ✅ | Per-section modulation |
| ElevenLabs Settings (JSON) | ✅ | TTS parameter control |
| Sample Lines | ✅ | Few-shot style examples |
| "What SAM Never Does" | ✅ | Hard negative constraints |
| Review Lens | ✅ | Scoring rubric + hunt priorities |
| Rewrite Guidelines | ✅ | Structural transformation rules |
| Scorecard Calibration Rubric | ✅ | Grounds 1-5 scoring |
| Known Blind Spots | ✅ | Self-aware limitation disclosure |

**Commentary:** The schema discipline is exceptional. Every persona file is a drop-in replacement for any other — no code changes, no pipeline modifications. The `PERSONA-README.md` explicitly notes this: *"Any valid Markdown file works."* This is a hallmark of mature systems thinking: the interface is stable; the implementations vary.

### Persona Differentiation Analysis

The 18 personas span a well-considered spectrum:

| Axis | Range |
|------|-------|
| **Formality** | Legal/Compliance (highest) ← → Energetic Collaborative (lowest) |
| **Warmth** | Empathetic Holistic (highest) ← → Security Auditor (lowest) |
| **Speed/Economy** | Executive Briefing (fastest) ← → Documentary Narrator (slowest) |
| **Evidence Demand** | Skeptic-Proof Analyst (highest) ← → Sales/Pitch (lowest) |
| **Audience Assumption** | Teacher/Explainer (novice) ← → Legal/Compliance (expert) |
| **Action Orientation** | Commander (verdict-first) ← → Journalist (finding-first, no recommendation) |

**Key insight:** The personas are not just tone variations — they encode fundamentally different *epistemic standards*. The Skeptic-Proof Analyst demands sourced evidence for every claim. The Sales/Pitch persona accepts strong claims at their defensible edge. The Legal/Compliance persona qualifies everything. These are different theories of what constitutes a "good" document, not different ways of saying the same thing.

**Architectural implication:** This means multi-persona review isn't redundant — it's structurally complementary. Each persona surfaces a different class of deficiency that the others are blind to by design. The `Known blind spots` section in each file makes this explicit, which is unusually self-aware system design.

---

## 2. Prompt Action Analysis: REVIEW-DOCUMENT.md

### Design Pattern: Constrained Output Templating with Persona Injection

The review prompt establishes:
1. **Role assignment** — "You are an expert document reviewer"
2. **Identity source** — persona brief as the authoritative definition of "who you are"
3. **Interpretation rules** — which persona sections to obey, which to ignore
4. **Output schema** — exact markdown structure (verdict → strengths → findings → questions → scorecard)
5. **Behavioral constraints** — cite locations, stay actionable, don't rewrite wholesale

### Strengths

**Explicit interpretation hierarchy:**
```
AUTHORITATIVE: ## Review Lens section
ADOPT: Character Profile, tone, guardrails
IGNORE: TTS mechanics (ElevenLabs, SSML, voices)
```

This solves a real problem: the persona files were designed for TTS narration, but the review pipeline needs only the analytical framework. The prompt explicitly tells the model which sections carry authority for *this* task. Without this instruction, the LLM might attempt to produce SSML tags or voice settings in a text review — a common failure mode in multi-purpose prompt systems.

**Fixed output schema:** The markdown template eliminates structural variance between runs. Whether you use Commander Sam or Empathetic Holistic, the output follows the same bones:
- Verdict → Strengths → Findings → Questions → Scorecard

This makes outputs comparable across personas and enables the synthesis pass described in `README.md` (where multiple persona reviews are merged into consensus findings).

**Fallback behavior defined:** *"If the persona brief has no Review Lens section, infer the review priorities from the archetype and guardrails."* This graceful degradation means new persona files work immediately without requiring a Review Lens section — they just won't be as precisely targeted.

### Structural Risks

**Risk 1: Scorecard dimension anchoring**

The prompt says: *"Use the dimensions from the persona's Review Lens section."* Each persona defines 5-7 unique scorecard dimensions. This means scores are **not comparable across personas** — a 4/5 on "Verdict placement" (Commander) has no relationship to a 4/5 on "Trust Boundary Separation" (Security Auditor).

**Implication:** The synthesis pass in `reviewer_synth.py` must handle heterogeneous scorecards. If it attempts to average scores across personas, the result is meaningless. The `README.md` describes "consensus findings" and "conflicts" — which suggests the synthesis operates on findings (comparable) rather than scores (incomparable). That's the correct design choice.

**Risk 2: Severity calibration drift**

Each persona defines its own severity calibration:
- Commander: Critical = "an unresolved maybe on a load-bearing claim"
- Legal/Compliance: Critical = "a statement that creates legal or regulatory exposure"
- Design Critique: Critical = "illegible slides due to low contrast"

These are **fundamentally different risk domains**. A "Critical" from Legal/Compliance carries different organizational weight than a "Critical" from Design Critique. The system does not normalize severity across personas — which is arguably correct (each expert's "critical" means something different), but users should understand this.

**Risk 3: Context window pressure**

The prompt requires: persona file (~3-5K tokens) + REVIEW-DOCUMENT.md (~1.5K tokens) + full document content (variable). For a 20-slide PPTX extracted to markdown, the total input may reach 15-25K tokens. The `README.md` notes "automatic context sizing" — the model's full window is used. This is sound engineering, but the quality of findings on slide 18 may degrade if the persona + document + prompt exceeds the model's effective attention span.

---

## 3. Prompt Action Analysis: REWRITE-DOCUMENT.md

### Design Pattern: Voice Transformation with Structural License

The rewrite prompt establishes:
1. **Identity assignment** — "You are an expert writer"
2. **Quality bar** — "the rewrite must be something THIS persona's own review would score 5/5"
3. **Structural freedom** — may reorder, merge, split slides when persona demands it
4. **Fact preservation** — "NEVER invent data, numbers, sources, or claims"
5. **Gap handling** — `[NEEDS: ...]` placeholders instead of fabrication
6. **Output schema** — `## Slide N: <title>` + content + `**Speaker notes:**` + `## Rewrite notes`

### Strengths

**Self-referential quality constraint:** *"The rewrite must be something THIS persona's own review would score 5/5 on every scorecard dimension."* This is elegant — it creates a closed-loop quality definition without requiring a separate rubric. The persona's Review Lens *is* the rubric. The rewrite pipeline is implicitly guided by the same standards the review pipeline would apply.

**Structural license with provenance:** *"When content moves, append the source in the heading: `## Slide 1: <title> (source: slide 5)`."* This preserves traceability. An author receiving a rewrite can see exactly what moved and from where — critical for maintaining editorial control over AI-generated restructuring.

**Fact preservation as a hard constraint:** The ALL-CAPS emphasis — *"NEVER invent data"* — signals that this rule overrides persona behavior. Even a Sales/Pitch persona that wants stronger claims cannot fabricate numbers. The `[NEEDS: ...]` mechanism provides an escape valve: the persona signals what's missing without filling the gap with fiction.

**Format-aware behavior:** The prompt distinguishes between presentations (slide structure + speaker notes) and prose documents (heading structure, no speaker notes). This prevents the common failure of generating speaker notes for a memo or treating an email like a slide deck.

### Structural Risks

**Risk 1: Persona-driven structural decisions may be unwelcome**

The prompt grants full restructuring authority: *"You may reorder, merge, or split slides when the persona's structure demands it."* Commander Sam will delete agenda slides. Executive Briefing will move the conclusion to slide 1. Documentary Narrator will add bridge slides.

For users who want voice transformation *without* structural changes, there is no constraint mechanism. The prompt does not offer a "preserve structure, transform voice only" mode.

**Recommendation:** Consider adding an optional user instruction: *"Preserve the existing slide order; rewrite content and speaker notes only."*

**Risk 2: Speaker notes length variance**

Different personas produce radically different speaker note lengths:
- Executive Briefing: 2-3 sentences per slide (economy)
- Documentary Narrator: 6-8 sentences per slide (scene-setting)
- Teacher/Explainer: 8-12 sentences per slide (scaffolding)

For video production (where narration length determines slide duration), this variance is a feature. For PPTX export (where speaker notes appear in a fixed panel), long notes may be unwieldy. The system handles this implicitly — but users should understand that persona choice directly affects output verbosity.

**Risk 3: `[NEEDS: ...]` density in sparse source documents**

If the source document is thin (e.g., a 4-slide architecture diagram with minimal text), a persona with high evidentiary standards (Skeptic-Proof Analyst, Legal/Compliance, Financial Controller) will produce a rewrite that is mostly placeholders. The output may contain more `[NEEDS: ...]` markers than actual content — which is *correct behavior* (the persona won't fabricate) but may frustrate users expecting a complete draft.

The persona files handle this through their `## Placeholder & Draft Behavior` section:
- Some personas prefer strict placeholders (Legal, Journalist, Security)
- Some prefer draft proposals (Energetic Collaborative, Sales/Pitch, Change Manager)

This is well-designed differentiation — but users may not realize that persona choice determines placeholder-vs-draft behavior.

---

## 4. System-Level Architecture Assessment

### What Works Exceptionally Well

**1. Single persona file, multiple consumers**

The decision to encode TTS, review, rewrite, and production preferences in one file eliminates synchronization problems. When a persona is updated, all four pipelines pick up the change simultaneously. No deployment coordination required.

**2. Local-first with no vendor lock-in**

Ollama backend, Edge TTS (free), optional ElevenLabs. The system runs entirely on-premises if needed — critical for government data handling. No document content traverses external boundaries unless the user explicitly configures a cloud LLM.

**3. Composable pipeline stages**

Review → Rewrite → Narrate → Produce are independent stages. A user can stop at any point. This respects different use cases: some users only need a review; some need a full video. The architecture doesn't force traversal of the entire pipeline.

**4. Self-aware personas with declared blind spots**

Every persona file ends with `Known blind spots` and recommends pairing with a complementary persona. This is unusually mature prompt engineering — most systems pretend their prompts have no weaknesses. Here, the limitations are first-class design elements that guide multi-persona composition.

**5. Graceful degradation**

- No Review Lens? → Infer from archetype
- No persona file? → Scout asks for one
- Missing data in source? → `[NEEDS: ...]` placeholder
- Single persona selected? → Skip synthesis pass

The system handles partial inputs without failing.

### Architectural Concerns

**1. Prompt-persona coupling**

The REVIEW and REWRITE prompts contain interpretation rules that assume a specific persona file schema. If a persona file omits `## Review Lens` or uses non-standard section headers, the prompt's interpretation hierarchy breaks silently. There is no schema validation — the system relies on author discipline.

**Mitigation (current):** `PERSONA-README.md` documents the expected schema. The consistent structure across 18 files demonstrates that discipline is holding.

**Mitigation (future):** A lightweight schema validator (even a grep for required section headers) could catch malformed persona files at upload time.

**2. No versioning or change tracking on persona files**

Persona files are plain markdown in a directory. If a persona's Review Lens is updated (e.g., new scorecard dimensions added), prior reviews generated with the old lens become incomparable to new reviews. There is no mechanism to record which persona version produced which output.

**3. Synthesis pass is a single point of interpretation risk**

The `reviewer_synth.py` merge logic takes N heterogeneous persona reviews and produces one synthesis. This is the most complex reasoning step in the system — and the one with the least structural scaffolding. The prompt for synthesis must handle:
- Different severity definitions across personas
- Conflicting recommendations (Commander says "cut slide 3"; Teacher says "expand slide 3")
- Weighting by declared blind spots

The README describes this as "consensus findings, conflicts (weighted by each persona's known blind spots), and a top-5 priority-fix list." That's an ambitious synthesis task. Its quality depends heavily on the synthesis prompt — which is not visible in the provided files.

---

## 5. Comparison to Industry Patterns

| Pattern | SAM Studio Implementation | Industry Standard |
|---------|---------------------------|-------------------|
| Multi-agent review | Parallel persona fan-out + synthesis | LangChain multi-agent, CrewAI |
| Persona injection | Full markdown file prepended to prompt | System messages, few-shot examples |
| Output templating | Fixed markdown schema in prompt | JSON schema, function calling |
| Quality grounding | Self-referential scorecard ("what 5 looks like") | RLHF reward models, rubric-based eval |
| Fact preservation | Hard constraint + `[NEEDS: ...]` escape valve | RAG grounding, citation requirements |
| Pipeline orchestration | Express + Python subprocess bridge | LangGraph, Semantic Kernel |

**Assessment:** The system uses a simpler orchestration layer (Express + subprocess) than framework-heavy alternatives (LangChain, LangGraph), but achieves comparable compositional power through well-structured prompts. The trade-off is intentional: fewer dependencies, more portable, easier to audit for government compliance. The prompt engineering carries load that other systems push to framework code.

---

## 6. Recommendations

### Near-Term (Low Effort, High Value)

1. **Add a "structure-preserving" flag to REWRITE-DOCUMENT.md** — let users opt out of structural changes when they only want voice transformation
2. **Document the synthesis prompt** — the merge logic in `reviewer_synth.py` is the highest-risk reasoning step; its prompt should be visible and versioned alongside the persona files
3. **Add persona file version headers** — a simple `Version: 1.2 | Last updated: 2026-06-15` in the YAML front matter enables output provenance tracking

### Medium-Term (Moderate Effort)

4. **Build a persona compatibility matrix** — document which persona pairs produce the most useful multi-lens reviews (e.g., Security + Legal for compliance; Sales + Skeptic for balanced pitches)
5. **Add a "review the rewrite" auto-pass** — after a rewrite completes, automatically run the same persona's review against its own output to verify it meets the 5/5 scorecard standard it claims
6. **Create a lightweight persona schema validator** — check for required sections at upload time; surface warnings for missing `## Review Lens` or `## Rewrite & Restructuring Guidelines`

### Long-Term (Strategic)

7. **Parameterize persona intensity** — allow users to dial a persona's severity between 1 (gentle) and 5 (uncompromising) without switching personas entirely
8. **Build a review history layer** — track which documents were reviewed by which personas at which versions, enabling trend analysis ("our decks consistently fail on Evidence Coverage")
9. **Consider persona specialization forks** — the current 18 are domain-general; specialized forks (e.g., "Security Auditor — Cloud Migration" or "Financial Controller — SaaS Procurement") could deepen expertise without expanding the core library

---

## Summary Verdict

This is a thoughtfully designed prompt orchestration system that punches above its architectural weight class. The persona library is the strongest element — consistently structured, genuinely differentiated, self-aware about limitations, and composable across four pipeline stages from a single source file.

The REVIEW and REWRITE prompts are well-constrained, with clear interpretation hierarchies, fixed output schemas, and appropriate escape valves for missing data. The main risks are in the synthesis layer (complex reasoning with limited structural scaffolding) and in the implicit coupling between prompt interpretation rules and persona file schema.

For a government agency context — where data residency, auditability, and local-first deployment matter — this architecture makes sound trade-offs. It avoids heavy framework dependencies, runs entirely on-premises, and produces outputs that are human-readable, editable, and exportable at every stage.

The system's fundamental insight is correct: **the persona file is the interface contract, and everything else is pipeline.** That separation of concerns is what makes it work.
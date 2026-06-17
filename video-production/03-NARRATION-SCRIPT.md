how # Full Narration Script
## SAM-PDF-Flow — Architecture Overview
### ElevenLabs / Adobe Premiere Production Draft v1.0

**Voice:** SAM persona (see 01-SAM-PERSONA.md)
**Target runtime:** ~9:30–11:00
**Word count:** ~1,820 spoken words
**Pacing reference:** 145 wpm average; slower in story sections, tighter in technical sections

---

> **Script notation:**
> - `<break time="Xs"/>` — timed pause for ElevenLabs SSML
> - `<emphasis level="moderate">word</emphasis>` — key term on first use
> - `<emphasis level="strong">word</emphasis>` — punchline or KPI
> - `[VISUAL CUE]` — director marker, not spoken
> - *(italics)* — tone/delivery note, not spoken

---

## INTRO
*(Story-first. Slow, deliberate. Let the silence work.)*
*(~0:20 / ~45 words)*

[VISUAL CUE: Fade from black. Government office aerial.]

Somewhere in a federal agency right now, someone is reading a PDF.
<break time="0.8s"/>
And typing what they see.
<break time="0.6s"/>
Line by line. Field by field.
<break time="1.0s"/>
That is the problem this system solves.

[VISUAL CUE: Hard cut to title card — SAM-PDF-Flow / ITTO Enterprise Architecture]

---

## SECTION 1 — Business Context
*(Story-first. Empathy first, urgency second. Do not rush.)*
*(~0:50 / ~115 words)*

[VISUAL CUE: Split screen — person at desk with PDF / clean JSON data stream]

Federal procurement teams process <emphasis level="moderate">vendor quotes</emphasis>, <emphasis level="moderate">invoices</emphasis>, and government contract forms — <emphasis level="moderate">SF-1449</emphasis>, <emphasis level="moderate">SF-26</emphasis>, <emphasis level="moderate">OF-347</emphasis> — by hand.
<break time="0.6s"/>
Manual data entry into Dataverse is the current bottleneck.
<break time="0.4s"/>
It is slow.
<break time="0.3s"/>
It is inconsistent.
<break time="0.3s"/>
And it does not scale with volume.
<break time="0.9s"/>

[VISUAL CUE: Dissolve to pipeline arrow — SharePoint → Dataverse]

<emphasis level="strong">SAM-PDF-Flow eliminates that bottleneck.</emphasis>
<break time="0.6s"/>
A document lands in SharePoint.
<break time="0.4s"/>
Structured data arrives in Dataverse.
<break time="0.4s"/>
No manual transcription.

---

## SECTION 2 — Solution Overview
*(Balanced. Factual but with connective tissue. Build momentum.)*
*(~0:55 / ~135 words)*

[VISUAL CUE: Animated pipeline diagram. Characteristics appear as bullets.]

SAM-PDF-Flow is an <emphasis level="moderate">event-driven document extraction pipeline</emphasis>.
<break time="0.5s"/>
It uses LLM inference to convert unstructured procurement documents into validated, schema-compliant JSON — and loads the results directly into Dataverse.
<break time="0.9s"/>

Five characteristics define how it works.
<break time="0.5s"/>

[VISUAL CUE: Each chip appears on its narration cue]

It is <emphasis level="moderate">event-driven</emphasis> — triggered the moment a file is created in SharePoint.
<break time="0.4s"/>
It uses <emphasis level="moderate">two-stage inference</emphasis> — a lightweight classifier gates every expensive extraction call.
<break time="0.4s"/>
It is <emphasis level="moderate">contract-first</emphasis> — a 24-field JSON schema defines the output before any prompt is written.
<break time="0.4s"/>
It is <emphasis level="moderate">environment-portable</emphasis> — the same API contract runs in production and on a developer laptop.
<break time="0.4s"/>
And it uses <emphasis level="moderate">low-code orchestration</emphasis> — Power Automate coordinates the entire pipeline with no custom middleware.

---

## SECTION 3 — Production Architecture
*(Executive briefing. Precise, sequential, no color commentary.)*
*(~1:20 / ~195 words)*

[VISUAL CUE: Sequence diagram — components light up left to right as narrated]

The production architecture flows through seven components.
<break time="0.7s"/>

A file lands in <emphasis level="moderate">SharePoint</emphasis>.
<break time="0.3s"/>
<emphasis level="moderate">Power Automate</emphasis> picks up the creation event, retrieves the file bytes, and base64-encodes them.
<break time="0.6s"/>

That payload travels to <emphasis level="moderate">Azure API Management</emphasis> — the sole entry point for the system.
<break time="0.4s"/>
APIM handles subscription key authentication, rate limiting, and TLS termination.
<break time="0.6s"/>

[VISUAL CUE: "Stage 1" label appears — blue]

Stage one is classification.
<break time="0.4s"/>
APIM forwards the request to the <emphasis level="moderate">Docling Server</emphasis> running on ECS Fargate.
<break time="0.4s"/>
The server returns four routing fields — document class, document subtype, content type, and size tier.
<break time="0.8s"/>

[VISUAL CUE: "Stage 2" label appears — orange]

Stage two is extraction.
<break time="0.4s"/>
Power Automate selects the appropriate prompt based on the classification result.
<break time="0.4s"/>
The Docling Server authenticates to <emphasis level="moderate">Okta</emphasis> using client credentials, obtains a bearer token, and calls the <emphasis level="moderate">UGAP LLM API</emphasis> — the enterprise Claude endpoint.
<break time="0.6s"/>
The extracted JSON travels back through APIM to Power Automate.
<break time="0.6s"/>

The result is written to SharePoint, loaded into <emphasis level="moderate">Dataverse</emphasis>, and a Teams notification is sent.
<break time="0.5s"/>
The <emphasis level="strong">Docling Server is the only component that touches the LLM.</emphasis>
<break time="0.4s"/>
Power Automate never calls the model directly.

---

## SECTION 4 — Local Development
*(Balanced. A breath. Approachability and portability are the story.)*
*(~0:50 / ~115 words)*

[VISUAL CUE: Developer laptop with four-node connection chain]

The local development stack mirrors the production API contract exactly.
<break time="0.6s"/>

Vue.js on port 5173 talks to an Express server on 3000.
<break time="0.3s"/>
Express calls a Flask server on 8080.
<break time="0.3s"/>
Flask calls <emphasis level="moderate">Ollama</emphasis> on 11434.
<break time="0.7s"/>

[VISUAL CUE: Equivalence table — Production ↔ Local]

In production, the Docling Server handles document parsing and LLM post-processing.
<break time="0.4s"/>
Locally, Flask with MarkItDown — and pdfplumber as a fallback — does the same job.
<break time="0.5s"/>
The UGAP enterprise Claude endpoint becomes Ollama running Qwen or Llama locally.
<break time="0.7s"/>

Prompts developed against a local model can be promoted to production against Claude <emphasis level="strong">without changing the request payload or the response parsing.</emphasis>
<break time="0.5s"/>
The abstraction boundary is the API contract — not the model.

---

## SECTION 5 — Processing Model: Classify and Extract
*(Balanced rising to executive briefing. The conceptual core of the system.)*
*(~1:05 / ~150 words)*

[VISUAL CUE: Animated flowchart — PDF → classifier → fork → three prompt paths → JSON]

The pipeline uses a <emphasis level="moderate">two-stage inference pattern</emphasis> to balance cost and accuracy.
<break time="0.8s"/>

Stage one — classification — costs roughly <emphasis level="strong">650 tokens</emphasis>.
<break time="0.4s"/>
It returns four routing fields that determine everything that happens next.
<break time="0.7s"/>

[VISUAL CUE: SOFTWARE gate decision diamond highlighted]

The most important of those fields is content type.
<break time="0.5s"/>
Only documents classified as <emphasis level="moderate">SOFTWARE</emphasis> reach extraction.
<break time="0.4s"/>
Everything else is routed to a failure path — no extraction token spend occurs.
<break time="0.8s"/>

[VISUAL CUE: Model tier table]

Stage two — extraction — runs between <emphasis level="strong">3,200 and 5,330 tokens</emphasis> depending on prompt complexity.
<break time="0.6s"/>
Three model tiers handle the range.
<break time="0.4s"/>
<emphasis level="moderate">Claude Haiku 4.5</emphasis> handles simple, one-to-three page quotes.
<break time="0.3s"/>
<emphasis level="moderate">Claude Sonnet 4.6</emphasis> handles balanced, one-to-ten page documents.
<break time="0.3s"/>
<emphasis level="moderate">Claude Opus 4.6</emphasis> handles enterprise contracts of ten pages or more.
<break time="0.6s"/>
Each tier receives a prompt variant calibrated to its capability — not just a parameter switch.

---

## SECTION 6 — Power Automate Orchestration
*(Executive briefing. Comprehensive but legible. Control is the theme.)*
*(~1:10 / ~160 words)*

[VISUAL CUE: Flow diagram — nodes highlight top to bottom as narrated]

Power Automate owns the full pipeline logic.
<break time="0.5s"/>
No custom middleware sits between the flow and the API.
<break time="0.9s"/>

The flow begins with one of three trigger modes.
<break time="0.5s"/>
A <emphasis level="moderate">SharePoint folder watch</emphasis> processes PDFs automatically as they are dropped into the PDF Inbox.
<break time="0.4s"/>
A <emphasis level="moderate">manual file pick</emphasis> lets a user trigger processing on demand.
<break time="0.4s"/>
An <emphasis level="moderate">OneDrive folder watch</emphasis> extends that automatic coverage to personal storage.
<break time="0.7s"/>

All three converge on the same core pipeline after retrieving the file bytes.
<break time="0.7s"/>

The flow encodes the document, calls the classifier, and checks the result.
<break time="0.4s"/>
If the document fails the SOFTWARE gate, it moves to a failed folder and sends a Teams alert.
<break time="0.5s"/>
If it passes, the flow selects the extraction prompt based on document subtype, calls the Docling Server, and parses the response.
<break time="0.6s"/>
The extracted JSON is saved to SharePoint.
<break time="0.3s"/>
A staging record is created in Dataverse.
<break time="0.3s"/>
Line item rows are written in a loop.
<break time="0.3s"/>
The PDF moves to the processed folder.
<break time="0.3s"/>
A Teams notification confirms success.

---

## SECTION 7 — Data Architecture
*(Executive briefing. Structured, reassuring. Order is the theme.)*
*(~0:45 / ~105 words)*

[VISUAL CUE: Two Dataverse table cards in parent-child layout]

The data model is deliberately minimal.
<break time="0.6s"/>

Two tables.
<break time="0.5s"/>
<emphasis level="moderate">sam_importstaging</emphasis> — one record per document — tracks the processing lifecycle: filename, status, document class, content type, and any error message.
<break time="0.6s"/>
<emphasis level="moderate">sam_softwarelicensequeue</emphasis> — one row per extracted line item — carries description, vendor, SKU, quantity, pricing, and license dates.
<break time="0.8s"/>

Status flows in one direction: <emphasis level="moderate">Processing</emphasis>, then <emphasis level="strong">Success</emphasis> or <emphasis level="strong">Failed</emphasis>.
<break time="0.7s"/>

The extraction schema defines <emphasis level="strong">24 fields</emphasis> across three groups: metadata, line items, and tracking.
<break time="0.5s"/>
Every LLM response is validated against that schema before any write occurs.
<break time="0.4s"/>
The schema is the contract — not the prompt, not the model.

---

## SECTION 8 — Security Model
*(Executive briefing. Deliberate and still. Trust comes from precision.)*
*(~0:50 / ~120 words)*

[VISUAL CUE: Security flow — lock icons at each auth boundary]

The security model is layered and explicit.
<break time="0.8s"/>

Power Automate calls Azure APIM using a <emphasis level="moderate">subscription key</emphasis>.
<break time="0.4s"/>
APIM enforces HTTPS only and rate-limits requests to 30 per minute.
<break time="0.6s"/>
The Docling Server has no public endpoint.
<break time="0.4s"/>
<emphasis level="strong">APIM is the sole entry point.</emphasis>
<break time="0.8s"/>

LLM access is handled entirely server-side.
<break time="0.4s"/>
The Docling Server authenticates to Okta using <emphasis level="moderate">OAuth2 client credentials</emphasis> and attaches the bearer token to every UGAP request.
<break time="0.6s"/>
Power Automate authenticates to SharePoint and Dataverse via service principal with connection references and secure strings.
<break time="0.7s"/>

Prompts do not contain secrets.
<break time="0.4s"/>
Authentication credentials are stored in environment variables or Azure Key Vault — never in request payloads.

---

## SECTION 9 — Deployment Topology
*(Executive briefing. Completeness. Platform confidence.)*
*(~0:50 / ~120 words)*

[VISUAL CUE: Cloud platform logos arranged by layer — AWS / Azure / M365]

The production deployment spans three platforms, each contributing what it does best.
<break time="0.7s"/>

The <emphasis level="moderate">Docling Server</emphasis> runs on <emphasis level="moderate">AWS ECS Fargate</emphasis> — Dockerized, provisioned with OpenTofu infrastructure-as-code.
<break time="0.5s"/>
The API gateway runs on <emphasis level="moderate">Azure APIM</emphasis> in Consumption tier — pay-per-call, OpenAPI-driven.
<break time="0.5s"/>
Orchestration runs on <emphasis level="moderate">Power Automate</emphasis>, included in the existing M365 licensing.
<break time="0.5s"/>
<emphasis level="moderate">Dataverse</emphasis> is the data store — also included in M365.
<break time="0.5s"/>
LLM inference runs through the <emphasis level="moderate">UGAP enterprise Claude API</emphasis>, Okta-authenticated.
<break time="0.7s"/>

Three auxiliary Lambda functions extend the architecture: an S3 helper for presigned URL generation, a model router for AI-powered classification, and a legacy model recommender for heuristic tier selection.

---

## SECTION 10 — Cost Profile
*(Dry wit allowed. Let the numbers land. Do not narrate the chart.)*
*(~0:40 / ~90 words)*

[VISUAL CUE: Bar chart — infrastructure bars tiny, inference bar dominant]

The infrastructure cost is not the story.
<break time="0.7s"/>

Azure APIM on Consumption tier: <emphasis level="strong">thirty-five cents to three dollars and fifty cents a month.</emphasis>
<break time="0.5s"/>
Power Automate and Dataverse: included in M365.
<break time="0.5s"/>
Total infrastructure: <emphasis level="strong">one to seven dollars a month.</emphasis>
<break time="1.2s"/>

[VISUAL CUE: "$1–7/month" holds full screen for 2 seconds]

The dominant cost driver is LLM inference.
<break time="0.5s"/>
Which is exactly why the two-stage classifier exists — cheap classification gates every expensive extraction call.
<break time="0.4s"/>
Smaller models handle simpler documents. The expensive model earns its price.

---

## SECTION 11 — Key Decisions and Trade-offs
*(Balanced. Intellectual honesty is the point. Do not speed past the trade-offs.)*
*(~1:00 / ~145 words)*

[VISUAL CUE: Decision cards in a grid — rationale + trade-off revealed sequentially]

Five architectural decisions define this system — and each one came with a deliberate trade-off.
<break time="0.9s"/>

A <emphasis level="moderate">single API contract across environments</emphasis> means prompts and clients are portable between local development and production. The trade-off: local model quality is directional, not equivalent.
<break time="0.7s"/>

<emphasis level="moderate">Power Automate as orchestrator</emphasis> eliminates custom middleware and leverages existing M365 licensing. The trade-off: the flow is constrained to platform expression capabilities.
<break time="0.7s"/>

<emphasis level="moderate">Two-stage classify-then-extract</emphasis> controls cost by gating extraction. The trade-off: one additional LLM round-trip, and classification errors propagate.
<break time="0.7s"/>

<emphasis level="moderate">Prompt variants per model tier</emphasis> calibrate instructions to each model's capability. The trade-off: more prompt files to maintain.
<break time="0.7s"/>

<emphasis level="moderate">APIM as sole entry point</emphasis> centralizes authentication and observability. The trade-off: an additional network hop and an Azure dependency.
<break time="0.6s"/>

None of these decisions are free. All of them are deliberate.

---

## SECTION 12 — Open Questions
*(Story-first. Invitation. The architecture is solid — the conversation is open.)*
*(~0:55 / ~130 words)*

[VISUAL CUE: Five question cards in an arc — warm lighting]

Every architecture reaches a point where the honest answer is: <emphasis level="moderate">we don't know yet.</emphasis>
<break time="0.8s"/>
These are the open questions worth bringing to the table.
<break time="0.9s"/>

As the prompt library grows beyond procurement — what is the right ownership model?
<break time="0.4s"/>
Per-team registries, or a shared catalog with governance at the center?
<break time="0.8s"/>

When multiple bureaus need different extraction schemas or default values — what changes?
<break time="0.8s"/>

When extraction fails, what is the acceptable cost ceiling for automated retry at a higher model tier?
<break time="0.8s"/>

Where should LLM telemetry land — token usage, validation rates, prompt IDs — Power BI, Splunk, or an existing agency dashboard?
<break time="0.8s"/>

And which document types come next?
<break time="0.4s"/>
Labor invoices, contract modifications, non-PDF formats?
<break time="1.0s"/>

These are not gaps in the system.
<break time="0.4s"/>
They are the next conversation.

---

## OUTRO
*(Calm confidence. Let the music carry it out.)*
*(~0:15 / ~20 words)*

[VISUAL CUE: Project logo + ITTO badge on dark background. Music fades over 8 seconds.]

SAM-PDF-Flow.
<break time="0.6s"/>
Software Asset Management — automated, validated, and ready for production.

---

## Word Count by Section

| Section | Words | Est. Time |
|---------|-------|-----------|
| Intro | 45 | 0:20 |
| 1 — Business Context | 115 | 0:50 |
| 2 — Solution Overview | 135 | 0:55 |
| 3 — Production Architecture | 195 | 1:20 |
| 4 — Local Development | 115 | 0:50 |
| 5 — Processing Model | 150 | 1:05 |
| 6 — Power Automate | 160 | 1:10 |
| 7 — Data Architecture | 105 | 0:45 |
| 8 — Security Model | 120 | 0:50 |
| 9 — Deployment Topology | 120 | 0:50 |
| 10 — Cost Profile | 90 | 0:40 |
| 11 — Key Decisions | 145 | 1:00 |
| 12 — Open Questions | 130 | 0:55 |
| Outro | 20 | 0:15 |
| **Total** | **~1,845** | **~10:45** |

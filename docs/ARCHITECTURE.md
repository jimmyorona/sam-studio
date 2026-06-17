# SAM Slide Suite — Workflow & Architecture Diagrams

These Mermaid diagrams show how the **web UI**, the **Express API services**, the
**Python subprocess bridges**, and the **local LLM / TTS** pieces interact.

GitHub renders Mermaid natively. For other viewers, paste a block into
<https://mermaid.live>.

---

## 1. Component topology

How the layers connect: the Vue SPA talks only to Express; Express spawns
short-lived Python helpers that call Ollama and the media tools.

```mermaid
flowchart LR
    subgraph Browser["Browser — Vue 3 SPA (:5174 dev / served by Express in prod)"]
        UI["Mode tabs: Review · Rewrite · Narrate · Produce"]
        LP["LeftPanel: document · personas · voice · model · context · run"]
        ST["store.js — shared reactive state + fetch/SSE"]
        UI --- LP --- ST
    end

    subgraph Express["Express API server (:3001) — one in-memory jobs Map + SSE"]
        REVAPI["POST /api/review · /api/rewrite"]
        NARAPI["POST /api/narrate"]
        SYNAPI["POST /api/jobs/:id/synthesize"]
        PREV["POST /api/tts-preview"]
        SSE["GET /api/jobs/:id/stream (SSE)"]
        CAT["GET /api/personas · /api/models · /api/voices · /api/prereqs"]
        REP["GET /api/reviews/:slug/reports"]
        EXP["GET /api/export/:slug/:report.(docx|pptx)"]
        DL["GET /api/jobs/:id/download (mp4)"]
    end

    subgraph Py["Python subprocess bridges (spawned per job)"]
        RS["reviewer_synth.py (run / export)"]
        PV["pptx_to_video.py (narrate / produce)"]
        EX["extract.py (PPTX/PDF/DOCX/MD/TXT)"]
    end

    subgraph Local["Local services"]
        OLL["Ollama (:11434)<br/>/api/chat · /api/show · /api/tags"]
        TTS["TTS: Edge · ElevenLabs · Supertonic"]
        MEDIA["LibreOffice · Marp · ffmpeg"]
    end

    DISK[("reviews/&lt;slug&gt;/ · web/outputs/")]

    ST -- "HTTP + multipart" --> REVAPI & NARAPI & SYNAPI & PREV & CAT & REP & EXP & DL
    ST -- "EventSource" --> SSE

    REVAPI -- spawn --> RS
    EXP -- spawn --> RS
    NARAPI -- spawn --> PV
    SYNAPI -- spawn --> PV
    CAT -- "/api/tags" --> OLL

    RS --> EX
    PV --> EX
    RS -- "/api/chat · /api/show" --> OLL
    PV -- "/api/chat · /api/show" --> OLL
    PV --> TTS
    PV --> MEDIA

    RS -- "stdout @@markers" --> Express
    PV -- "stdout logs" --> Express
    Express -- "typed SSE events" --> SSE

    RS --> DISK
    PV --> DISK
    REP --> DISK
    EXP --> DISK
    DL --> DISK
```

---

## 2. Review / Rewrite workflow

Multi-persona fan-out, optional synthesis, and review-informed rewrite. Express
parses the helper's `@@STATE`/`@@REPORT`/`@@DONE` stdout markers into typed SSE
events.

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser (store.js)
    participant E as Express (:3001)
    participant R as reviewer_synth.py
    participant O as Ollama (:11434)
    participant D as reviews/&lt;slug&gt;/

    B->>E: POST /api/review (file|text, personas[], model, context?)
    E->>R: spawn run --personas … --model … [--context-file]
    E-->>B: { jobId, docSlug }
    B->>E: GET /api/jobs/:id/stream (SSE)

    R->>R: extract.py → _extracted.md
    R->>O: POST /api/show (detect max context → num_ctx)
    par up to 3 personas in parallel
        R->>O: POST /api/chat (persona brief + context + slides, num_ctx)
        O-->>R: persona review markdown
        R->>D: write <persona>.md
        R-->>E: @@STATE/@@REPORT  (→ SSE persona/report events)
    end

    alt 2+ reviewers succeeded
        R->>O: POST /api/chat (merge reviews → synthesis)
        O-->>R: synthesis markdown
        R->>D: write 00-SYNTHESIS.md
    else single reviewer
        R->>R: skip synthesis (nothing to merge)
    end
    R-->>E: @@DONE state=complete  (→ SSE done)

    B->>E: GET /api/reviews/:slug/reports
    E->>D: read report markdown
    E-->>B: { reports[] } → render tabs + compare

    Note over B,R: Rewrite reuses this flow with mode=rewrite.<br/>Prior review findings for the same slug are auto-injected,<br/>and "Advise" adds [DRAFT:] content for each [NEEDS:] gap.

    B->>E: GET /api/export/:slug/:report.(docx|pptx)
    E->>R: spawn export --format …
    R-->>E: file bytes
    E-->>B: download
```

---

## 3. Narrate / Produce workflow

Two phases that share one job id: phase 1 generates an editable script; phase 2
synthesizes audio and assembles the MP4.

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser (store.js)
    participant E as Express (:3001)
    participant P as pptx_to_video.py
    participant O as Ollama (:11434)
    participant T as TTS + ffmpeg

    rect rgb(230,240,255)
    Note over B,T: Phase 1 — Narrate (LLM only)
    B->>E: POST /api/narrate (file, model, voice, context?)
    E->>P: spawn (extract + render images + narrate)
    E-->>B: { jobId }
    B->>E: GET /api/jobs/:id/stream (SSE)
    P->>O: POST /api/show (detect max context → num_ctx)
    loop each slide (stateful history)
        P->>O: POST /api/chat (cross-slide memory, num_ctx)
        O-->>P: slide narration
    end
    P-->>E: status narrated  (→ SSE done)
    B->>E: GET /api/jobs/:id/narrations
    E-->>B: { script } → editable raw / per-slide view
    end

    opt per-slide voice preview
        B->>E: POST /api/tts-preview (text, voice)
        E->>T: synthesize sample
        T-->>E: audio
        E-->>B: audio blob (play in browser)
    end

    rect rgb(230,255,235)
    Note over B,T: Phase 2 — Produce (TTS + assembly)
    B->>E: POST /api/jobs/:id/synthesize (edited script)
    E->>P: resume job (strip cues → TTS → ffmpeg)
    P->>T: synthesize per-slide audio + assemble 1920×1080 H.264/AAC
    T-->>P: final.mp4
    P-->>E: status done  (→ SSE done)
    B->>E: GET /api/jobs/:id/download
    E-->>B: stream MP4 (inline <video> + download)
    end
```

---

## Notes

- **One server, one SSE channel.** Every mode reuses the in-memory `jobs` Map and
  `GET /api/jobs/:id/stream`; review/rewrite add typed `persona`/`report`/`slug`
  events on top of the generic `log`/`done` events.
- **Subprocess bridge pattern.** Python does the heavy lifting and streams stdout;
  Node never embeds a second long-running server.
- **Context window.** Both bridges call Ollama `/api/show` and pass the model's
  max `num_ctx`, so stacked review prompts and stateful narration history aren't
  truncated (`REVIEWER_NUM_CTX` / `NARRATE_NUM_CTX` override).

# Graph Report - /home2/jorona/projects/sam-studio  (2026-07-20)

## Corpus Check
- 82 files · ~158,044 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 391 nodes · 568 edges · 65 communities (19 shown, 46 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 59 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Architecture Documentation and Diagrams
- Video Production and TTS Pipeline
- Python Scripts and CLI Tools
- Web Server Dependencies
- Vue UI Components and Store
- Review/Rewrite Export Functions
- Narrate/Produce Store Actions
- Markdown Report Rendering
- Model/Voice Preview UI
- App Shell and Tabs
- Video Assembly Helpers
- Rewrite Output UI
- Settings Drawer
- UI Screenshots
- Docker and Packaging
- Document Extractor Core
- Produce Output UI
- Job State Management
- Entrypoint Scripts
- Placeholder Mode
- TTS Preview Support
- Subprocess Bridge Concept
- Server Entrypoint
- Video Pipeline Entry
- Drafts State
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63

## God Nodes (most connected - your core abstractions)
1. `main()` - 22 edges
2. `toast()` - 15 edges
3. `Persona library (personas/)` - 15 edges
4. `run()` - 12 edges
5. `docs/ARCHITECTURE.md` - 12 edges
6. `pptx_to_video.py` - 12 edges
7. `reviewer_synth.py` - 11 edges
8. `Rewrite mode` - 10 edges
9. `Express server (:3001)` - 10 edges
10. `log()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `docs/ARCHITECTURE.md` --semantically_similar_to--> `docs/ARCHITECTURE.pdf`  [INFERRED] [semantically similar]
  docs/ARCHITECTURE.md → docs/ARCHITECTURE.pdf
- `docs/UI-WALKTHROUGH.md` --semantically_similar_to--> `docs/UI-WALKTHROUGH.pdf`  [INFERRED] [semantically similar]
  docs/UI-WALKTHROUGH.md → docs/UI-WALKTHROUGH.pdf
- `UI screenshot: review empty state` --conceptually_related_to--> `UI walkthrough with screenshots`  [INFERRED]
  docs/ui/01-review-empty.png → README.md
- `UI screenshot: review configuration` --conceptually_related_to--> `UI walkthrough with screenshots`  [INFERRED]
  docs/ui/02-review-config.png → README.md
- `UI screenshot: review running` --conceptually_related_to--> `UI walkthrough with screenshots`  [INFERRED]
  docs/ui/03-review-running.png → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **SAM Studio four pipeline modes** — review_mode, rewrite_mode, narrate_mode, produce_mode [INFERRED 0.85]
- **Subprocess bridge pattern implementation** — express_server, reviewer_synth_py, pptx_to_video_py [INFERRED 0.85]
- **Persona library consumers across modes** — persona_library, review_mode, rewrite_mode, narrate_mode, produce_mode [INFERRED 0.85]
- **TTS provider implementations** — tts_providers, edge_tts, elevenlabs_tts, supertonic_tts [INFERRED 0.85]
- **UI walkthrough screenshot set** — docs_ui_01_review_empty_image, docs_ui_02_review_config_image, docs_ui_03_review_running_image, docs_ui_04_review_fail_image, docs_ui_05_review_complete_image, docs_ui_06_rewrite_image, docs_ui_07_narrate_image, docs_ui_08_produce_image, docs_ui_09_history_image [INFERRED 0.75]

## Communities (65 total, 46 thin omitted)

### Community 0 - "Architecture Documentation and Diagrams"
Cohesion: 0.07
Nodes (47): Architecture Mermaid diagrams, persona-reviewer agent, /review skill, Background context injection, Cross-slide memory, docs/ARCHITECTURE.md, docs/ARCHITECTURE.pdf, docs/MERGE-PROMPT.md (+39 more)

### Community 1 - "Video Production and TTS Pipeline"
Cohesion: 0.11
Nodes (39): build_chat_history(), build_concat_list(), check_marp(), check_ollama(), check_prerequisites(), concatenate_segments(), extract_slide_texts(), find_chrome() (+31 more)

### Community 2 - "Python Scripts and CLI Tools"
Cohesion: 0.05
Nodes (23): ACCEPTED_EXTENSIONS, app, cors, DIST_DIR, express, fs, http, https (+15 more)

### Community 3 - "Web Server Dependencies"
Cohesion: 0.06
Nodes (32): concurrently, cors, dompurify, @elevenlabs/elevenlabs-js, express, marked, multer, vite (+24 more)

### Community 4 - "Vue UI Components and Store"
Cohesion: 0.08
Nodes (23): dragOver, hasRewrite, narrateOk, onContextFile(), onDrop(), onPick(), personaBadge, previewing (+15 more)

### Community 5 - "Review/Rewrite Export Functions"
Cohesion: 0.17
Nodes (23): _add_md_runs(), clear_stale_outputs(), doc_slug(), export(), extract_content(), gather_review_findings(), gemini_chat(), log() (+15 more)

### Community 6 - "Narrate/Produce Store Actions"
Cohesion: 0.17
Nodes (16): run(), clearContextFile(), clearDocument(), docSupportsNarrate(), firstSummaryLine(), loadPersonas(), NARRATE_EXTS, personaLabel() (+8 more)

### Community 7 - "Markdown Report Rendering"
Cohesion: 0.11
Nodes (13): html, props, SEVERITY, active, activeReport, cmpA, cmpB, compare (+5 more)

### Community 8 - "Model/Voice Preview UI"
Cohesion: 0.19
Nodes (10): preview(), refreshModels(), preview(), previewIdx, slideSections, slot, view, previewSlide() (+2 more)

### Community 9 - "App Shell and Tabs"
Cohesion: 0.20
Nodes (7): done, showSettings, TABS, onProvider(), dismissToast(), loadTtsStatus(), loadVoices()

### Community 10 - "Video Assembly Helpers"
Cohesion: 0.25
Nodes (9): assembleVideoFromManifest(), getAudioDuration(), mixMusicIntoVideo(), pushLog(), resolveSlideAudio(), runFFmpeg(), synthesizeEdgeTTSSlides(), synthesizeElevenLabsSDKSlides() (+1 more)

### Community 11 - "Rewrite Output UI"
Cohesion: 0.22
Nodes (7): active, draftCount, placeholders, report, slides, slot, acceptRewriteDrafts()

### Community 12 - "Settings Drawer"
Cohesion: 0.46
Nodes (7): emit, refreshingModels, refreshModels(), resetDefaults(), save(), loadModels(), persistSettings()

### Community 13 - "UI Screenshots"
Cohesion: 0.29
Nodes (7): UI screenshot: review empty state, UI screenshot: review configuration, UI screenshot: review running, docs/ui-deck.html, docs/UI-WALKTHROUGH.md, docs/UI-WALKTHROUGH.pdf, UI walkthrough with screenshots

### Community 14 - "Docker and Packaging"
Cohesion: 0.40
Nodes (6): Automatic context sizing (num_ctx), Docker package with bundled Ollama, Docker image, docker/README.md, llama3.1:8b model, Ollama local backend

### Community 15 - "Document Extractor Core"
Cohesion: 0.73
Nodes (5): extract_docx(), extract_pdf(), extract_pptx(), main(), Path

### Community 16 - "Produce Output UI"
Cohesion: 0.40
Nodes (5): hasScript, personaName, produce(), slot, startProduce()

### Community 17 - "Job State Management"
Cohesion: 0.40
Nodes (5): docSlug(), finish(), makeJobId(), personaDisplayName(), startReviewJob()

## Knowledge Gaps
- **144 isolated node(s):** `entrypoint.sh script`, `make_video.sh script`, `name`, `version`, `description` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **46 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Edge TTS` connect `Architecture Documentation and Diagrams` to `Video Production and TTS Pipeline`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `docs/ARCHITECTURE.md` connect `Architecture Documentation and Diagrams` to `Docker and Packaging`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `Persona library (personas/)` (e.g. with `Classic SAM persona` and `Commander SAM persona`) actually correct?**
  _`Persona library (personas/)` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `entrypoint.sh script`, `make_video.sh script`, `name` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Architecture Documentation and Diagrams` be split into smaller, more focused modules?**
  _Cohesion score 0.06753246753246753 - nodes in this community are weakly interconnected._
- **Should `Video Production and TTS Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.11219512195121951 - nodes in this community are weakly interconnected._
- **Should `Python Scripts and CLI Tools` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
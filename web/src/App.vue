<template>
  <div class="app" :data-theme="dark ? 'dark' : 'light'">
    <header class="header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-icon">▶</span>
          <span class="logo-text">PPTX / MD <span class="dim">→</span> Narrated Video</span>
        </div>
        <div class="header-sub">AI narration · Edge TTS · ElevenLabs · Supertonic · Ollama · FFmpeg · Markdown</div>
        <button class="theme-toggle" @click="toggleTheme" :title="dark ? 'Switch to light mode' : 'Switch to dark mode'">
          {{ dark ? '☀' : '☾' }}
        </button>
      </div>
    </header>

    <main class="main">
      <!-- ── Step 1: Drop Zone ── -->
      <section class="card">
        <h2 class="card-title">1. Select Presentation</h2>
        <div
          class="dropzone"
          :class="{ 'dropzone--over': dragging, 'dropzone--has-file': file }"
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
          @drop.prevent="onDrop"
          @click="$refs.fileInput.click()"
        >
          <input ref="fileInput" type="file" accept=".pptx,.md" hidden @change="onFileChange" />
          <template v-if="file">
            <div class="dz-icon">{{ fileIcon }}</div>
            <div class="dz-name">{{ file.name }}</div>
            <div class="dz-size">{{ (file.size / 1024 / 1024).toFixed(1) }} MB</div>
            <div class="dz-type-badge">{{ fileTypeBadge }}</div>
            <button class="dz-clear" @click.stop="clearFile">✕ Remove</button>
          </template>
          <template v-else>
            <div class="dz-icon">📁</div>
            <div class="dz-prompt">Drop a <strong>.pptx</strong> or <strong>.md</strong> file here, or click to browse</div>
          </template>
        </div>
      </section>

      <!-- ── Step 2: Options ── -->
      <section class="card">
        <h2 class="card-title">
          2. Options
          <button class="toggle-btn" @click="showOptions = !showOptions">
            {{ showOptions ? '▲ Hide' : '▼ Show' }}
          </button>
        </h2>

        <!-- Narrator Persona — always visible -->
        <div class="persona-row">
          <div class="persona-header">
            <span class="persona-label">Narrator Persona</span>
            <div class="select-row">
              <select
                class="opt-input opt-select"
                :value="persona.selected"
                @change="onPersonaSelect($event.target.value)"
              >
                <option value="">None (generic)</option>
                <option v-for="p in personaPresets" :key="p.filename" :value="p.filename">
                  {{ p.label }}{{ personaSituations[p.filename] ? ' — ' + personaSituations[p.filename] : '' }}
                </option>
                <option value="__custom__">Custom…</option>
              </select>
              <button class="refresh-btn" title="Refresh persona list" @click="fetchPersonas">↺</button>
              <button v-if="persona.text" class="persona-clear" @click="onPersonaSelect('')">✕</button>
            </div>
          </div>
          <textarea
            v-model="persona.text"
            class="opt-input opt-textarea"
            rows="4"
            placeholder="Paste a character brief, voice instructions, or tone guide. Prepended to every slide narration prompt."
            @focus="onPersonaTextFocus"
          />
          <span v-if="persona.text" class="opt-hint">{{ persona.text.length }} chars · prepended to every narration prompt</span>
          <div class="attach-row">
            <label class="attach-btn">
              <input type="file" accept=".md,.txt" hidden @change="onPersonaFileChange" />
              📎 Attach .md / .txt
            </label>
            <template v-if="persona.file">
              <span class="attach-name">{{ persona.file.name }}</span>
              <button class="persona-clear" @click="clearPersonaFile">✕</button>
            </template>
          </div>
          <div v-if="persona.file" class="file-mode-row">
            <span class="file-mode-label">Attachment:</span>
            <div class="tts-pill file-mode-pill">
              <label class="tts-pill-option" :class="{ active: persona.fileMode === 'append' }">
                <input type="radio" v-model="persona.fileMode" value="append" hidden />
                Append after text
              </label>
              <label class="tts-pill-option" :class="{ active: persona.fileMode === 'file-only' }">
                <input type="radio" v-model="persona.fileMode" value="file-only" hidden />
                Use file only
              </label>
            </div>
          </div>
        </div>

        <!-- Reference Context — always visible -->
        <div class="persona-row">
          <div class="persona-header">
            <span class="persona-label">Reference Context</span>
            <button v-if="context.text" class="persona-clear" @click="context.text = ''">✕</button>
          </div>
          <textarea
            v-model="context.text"
            class="opt-input opt-textarea"
            rows="3"
            placeholder="Paste background material — architecture docs, glossaries, summaries. Injected into every slide prompt as a reference document."
          />
          <span v-if="context.text" class="opt-hint">{{ context.text.length }} chars · injected as reference document in every narration prompt</span>
          <div class="attach-row">
            <label class="attach-btn">
              <input type="file" accept=".md,.txt" hidden @change="onContextFileChange" />
              📎 Attach .md / .txt
            </label>
            <template v-if="context.file">
              <span class="attach-name">{{ context.file.name }}</span>
              <button class="persona-clear" @click="clearContextFile">✕</button>
            </template>
          </div>
          <div v-if="context.file" class="file-mode-row">
            <span class="file-mode-label">Attachment:</span>
            <div class="tts-pill file-mode-pill">
              <label class="tts-pill-option" :class="{ active: context.fileMode === 'append' }">
                <input type="radio" v-model="context.fileMode" value="append" hidden />
                Append after text
              </label>
              <label class="tts-pill-option" :class="{ active: context.fileMode === 'file-only' }">
                <input type="radio" v-model="context.fileMode" value="file-only" hidden />
                Use file only
              </label>
            </div>
          </div>
        </div>

        <div v-show="showOptions" class="options-grid">
          <!-- Ollama URL -->
          <label class="opt-label">
            Ollama URL
            <input v-model="opts.ollamaUrl" class="opt-input" @blur="fetchModels" />
          </label>

          <!-- Model -->
          <label class="opt-label">
            Narration Model
            <div class="select-row">
              <select v-model="opts.model" class="opt-input opt-select">
                <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
                <option value="">-- custom --</option>
              </select>
              <button class="refresh-btn" title="Refresh model list from Ollama" @click="fetchModels">↺</button>
              <input
                v-if="opts.model === ''"
                v-model="opts.customModel"
                class="opt-input"
                placeholder="e.g. qwen2.5:14b"
              />
            </div>
            <span v-if="modelError" class="opt-hint error">{{ modelError }}</span>
            <span v-else class="opt-hint">{{ modelHint }}</span>
          </label>

          <!-- Voice engine -->
          <div class="tts-toggle-row opt-full">
            <span class="tts-toggle-label">Voice engine</span>
            <div class="tts-pill">
              <label class="tts-pill-option" :class="{ active: opts.ttsProvider === 'edge' }">
                <input type="radio" v-model="opts.ttsProvider" value="edge" hidden />
                Edge TTS <span class="tts-pill-sub">local · free</span>
              </label>
              <label class="tts-pill-option" :class="{ active: opts.ttsProvider === 'elevenlabs' }">
                <input type="radio" v-model="opts.ttsProvider" value="elevenlabs" hidden />
                ElevenLabs <span class="tts-pill-sub">Python · urllib</span>
              </label>
              <label class="tts-pill-option" :class="{ active: opts.ttsProvider === 'elevenlabs-js' }">
                <input type="radio" v-model="opts.ttsProvider" value="elevenlabs-js" hidden />
                ElevenLabs SDK <span class="tts-pill-sub">Node.js · official</span>
              </label>
              <label class="tts-pill-option" :class="{ active: opts.ttsProvider === 'supertonic' }">
                <input type="radio" v-model="opts.ttsProvider" value="supertonic" hidden />
                Supertonic <span class="tts-pill-sub">on-device · offline</span>
              </label>
            </div>
          </div>

          <!-- Edge TTS Voice (shown when provider = edge) -->
          <label v-if="opts.ttsProvider === 'edge'" class="opt-label opt-full">
            Edge TTS Voice
            <div class="select-row">
              <select v-model="opts.voiceMode" class="opt-input opt-select">
                <option value="recommended">Recommended voices</option>
                <option value="all">All en-US/en-GB voices</option>
                <option value="custom">Custom voice ID</option>
              </select>
            </div>
            <div class="select-row" style="margin-top:6px">
              <select
                v-if="opts.voiceMode !== 'custom'"
                v-model="opts.voice"
                class="opt-input opt-select"
              >
                <option v-for="v in displayedVoices" :key="v.name" :value="v.name">
                  {{ v.name }} — {{ v.gender }}{{ v.style ? ' · ' + v.style : '' }}
                </option>
              </select>
              <input
                v-else
                v-model="opts.voice"
                class="opt-input"
                placeholder="e.g. en-AU-NatashaNeural"
              />
            </div>
          </label>

          <!-- ElevenLabs options (shown when provider = elevenlabs or elevenlabs-js) -->
          <template v-else-if="opts.ttsProvider === 'elevenlabs' || opts.ttsProvider === 'elevenlabs-js'">
            <div v-if="opts.ttsProvider === 'elevenlabs-js'" class="opt-full sdk-note">
              Synthesis runs via the official <code class="voice-code">@elevenlabs/elevenlabs-js</code> Node.js SDK.
              Python handles extraction, rendering, and narration; Node synthesises audio and assembles the video.
            </div>
            <label class="opt-label opt-full">
              ElevenLabs API Key
              <input
                v-model="el.apiKey"
                type="password"
                class="opt-input"
                placeholder="sk-..."
                autocomplete="off"
              />
              <span class="opt-hint">Stored in browser only — never sent to our server as plain text</span>
            </label>

            <label class="opt-label opt-full">
              ElevenLabs Voice
              <div class="select-row">
                <select v-if="elVoices.length" v-model="el.voiceId" class="opt-input opt-select">
                  <option v-for="v in elVoices" :key="v.voice_id" :value="v.voice_id">
                    {{ v.name }}{{ v.category ? '  —  ' + v.category : '' }}
                  </option>
                </select>
                <input v-else v-model="el.voiceId" class="opt-input" placeholder="pNInz6obpgDQGcFmaJgB" />
                <button
                  class="refresh-btn"
                  :disabled="elVoicesFetching"
                  :title="el.apiKey ? 'Fetch voices from ElevenLabs' : 'Enter API key first'"
                  @click="fetchElVoices"
                >{{ elVoicesFetching ? '…' : '↺' }}</button>
              </div>
              <span v-if="elVoicesError" class="opt-hint error">{{ elVoicesError }}</span>
              <span v-else-if="elVoices.length" class="opt-hint">
                {{ elVoices.length }} voices loaded · ID:&nbsp;<code class="voice-code">{{ el.voiceId }}</code>
              </span>
              <span v-else class="opt-hint">
                Adam&nbsp;<code class="voice-code">pNInz6obpgDQGcFmaJgB</code>
                &nbsp;·&nbsp;Rachel&nbsp;<code class="voice-code">21m00Tcm4TlvDq8ikWAM</code>
                &nbsp;·&nbsp;Josh&nbsp;<code class="voice-code">TxGEqnHWrfWFTfGW9XjX</code>
              </span>
            </label>

            <label class="opt-label">
              Model
              <select v-model="el.model" class="opt-input opt-select">
                <option value="eleven_multilingual_v2">Multilingual v2 (recommended)</option>
                <option value="eleven_turbo_v2_5">Turbo v2.5 (fast, lower cost)</option>
                <option value="eleven_v3">v3 (highest quality)</option>
              </select>
            </label>

            <label class="opt-label">
              Stability&nbsp;<code class="voice-code">{{ el.stability }}</code>
              <input type="range" v-model.number="el.stability" min="0" max="1" step="0.05" class="opt-range" />
            </label>

            <label class="opt-label">
              Similarity Boost&nbsp;<code class="voice-code">{{ el.similarity }}</code>
              <input type="range" v-model.number="el.similarity" min="0" max="1" step="0.05" class="opt-range" />
            </label>

            <label class="opt-label">
              Style&nbsp;<code class="voice-code">{{ el.style }}</code>
              <input type="range" v-model.number="el.style" min="0" max="1" step="0.05" class="opt-range" />
            </label>

            <label class="opt-label">
              Speed&nbsp;<code class="voice-code">{{ el.speed }}x</code>
              <input type="range" v-model.number="el.speed" min="0.7" max="1.2" step="0.05" class="opt-range" />
            </label>

            <label class="opt-label opt-check">
              <input type="checkbox" v-model="el.speakerBoost" />
              Speaker Boost
            </label>
          </template>

          <!-- Supertonic options (shown when provider = supertonic) -->
          <template v-else-if="opts.ttsProvider === 'supertonic'">
            <div class="opt-full sdk-note">
              Runs fully on-device via ONNX — no API key, no network. The model
              (~200&nbsp;MB) downloads automatically on first use.
            </div>

            <label class="opt-label opt-full">
              Supertonic Voice
              <div class="select-row">
                <select v-model="st.voice" class="opt-input opt-select">
                  <option v-for="v in stVoices" :key="v" :value="v">{{ v }}</option>
                </select>
                <button
                  class="refresh-btn"
                  :disabled="stVoicesFetching"
                  title="Reload voice list from the installed model"
                  @click="fetchSupertonicVoices"
                >{{ stVoicesFetching ? '…' : '↺' }}</button>
              </div>
              <span class="opt-hint">F# = female · M# = male</span>
            </label>

            <label class="opt-label">
              Language
              <input v-model="st.lang" class="opt-input" placeholder="en" />
            </label>

            <label class="opt-label">
              Steps&nbsp;<code class="voice-code">{{ st.steps }}</code>
              <input type="range" v-model.number="st.steps" min="2" max="16" step="1" class="opt-range" />
            </label>

            <label class="opt-label">
              Speed&nbsp;<code class="voice-code">{{ st.speed }}x</code>
              <input type="range" v-model.number="st.speed" min="0.7" max="1.3" step="0.05" class="opt-range" />
            </label>
          </template>

          <!-- Background Music -->
          <div class="opt-full" style="margin-top: 8px; padding-top: 16px; border-top: 1px solid var(--border);">
            <label class="opt-check" style="margin-bottom: 10px;">
              <input type="checkbox" v-model="music.enabled" />
              Generate background music (ElevenLabs)
            </label>
            <template v-if="music.enabled">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span class="persona-label">Music Prompt</span>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <button
                      class="refresh-btn"
                      :disabled="!file || generatingMusicPrompt"
                      :title="file ? 'Auto-generate from slides + persona' : 'Upload a file first'"
                      @click="generateMusicPrompt"
                    >
                      {{ generatingMusicPrompt ? '…' : '✨ Generate Prompt' }}
                    </button>
                    <button v-if="music.prompt" class="persona-clear" @click="music.prompt = ''">✕</button>
                  </div>
                </div>
                <textarea
                  v-model="music.prompt"
                  class="opt-input opt-textarea"
                  rows="5"
                  placeholder="Describe the music — genre, mood, tempo, instrumentation..."
                />
                <span v-if="music.prompt" class="opt-hint">{{ music.prompt.length }} chars · sent to ElevenLabs</span>
                <span v-if="musicPromptError" class="opt-hint error">{{ musicPromptError }}</span>
              </div>
              <div class="options-grid" style="margin-top: 12px;">
                <label class="opt-label">
                  Duration (seconds)
                  <input v-model.number="music.duration" type="number" min="10" max="600" step="10" class="opt-input opt-short" />
                  <span class="opt-hint">Length of generated track</span>
                </label>
                <label class="opt-label">
                  Mix level (dB)
                  <input v-model.number="music.volume" type="number" min="-40" max="0" step="2" class="opt-input opt-short" />
                  <span class="opt-hint">Negative = under narration</span>
                </label>
              </div>
              <template v-if="opts.ttsProvider !== 'elevenlabs' && opts.ttsProvider !== 'elevenlabs-js'">
                <label class="opt-label opt-full" style="margin-top: 10px;">
                  ElevenLabs API Key
                  <input v-model="el.apiKey" type="password" class="opt-input" placeholder="sk-..." autocomplete="off" />
                  <span class="opt-hint">Required for music generation</span>
                </label>
              </template>
            </template>
          </div>

          <!-- Marp Theme (markdown only) -->
          <label v-if="isMarkdown" class="opt-label">
            Slide Theme
            <select v-model="opts.theme" class="opt-input opt-select">
              <option value="default">Default (clean white)</option>
              <option value="gaia">Gaia (dark elegant)</option>
              <option value="uncover">Uncover (minimal)</option>
            </select>
            <span class="opt-hint">Marp theme applied to Markdown slides</span>
          </label>

          <!-- Pause -->
          <label class="opt-label">
            Pause after slide (s)
            <input v-model.number="opts.pause" type="number" min="0" max="10" step="0.5" class="opt-input opt-short" />
          </label>

          <!-- DPI -->
          <label class="opt-label">
            Slide image DPI
            <input v-model.number="opts.dpi" type="number" min="72" max="300" step="1" class="opt-input opt-short" />
            <span class="opt-hint">150 = 1920×1080 equivalent for most slides</span>
          </label>

          <!-- Animation FPS -->
          <label class="opt-label">
            Animation FPS
            <input v-model.number="opts.animFps" type="number" min="1" max="30" step="1" class="opt-input opt-short" />
            <span class="opt-hint">Frames/sec for [FRAME]-tagged slides (default: 8)</span>
          </label>

          <!-- Keep temp -->
          <label class="opt-label opt-check">
            <input v-model="opts.keepTemp" type="checkbox" />
            Keep temp files (debug mode)
          </label>
        </div>
      </section>

      <!-- ── Step 3: Convert ── -->
      <section class="card">
        <h2 class="card-title">3. Convert</h2>

        <div class="review-mode-row">
          <label class="review-toggle">
            <input
              type="checkbox"
              v-model="reviewMode"
              :disabled="jobStatus === 'running' || jobStatus === 'narrating'"
            />
            <span>Review &amp; edit narration before generating video</span>
          </label>
        </div>

        <div class="convert-row">
          <button
            class="convert-btn"
            :disabled="!file || jobStatus === 'running' || jobStatus === 'narrating'"
            @click="reviewMode ? startNarrate() : startConvert()"
          >
            <span v-if="jobStatus === 'running' || jobStatus === 'narrating'" class="spinner"></span>
            {{ convertBtnLabel }}
          </button>
          <div v-if="jobStatus" class="status-badge" :class="`status-${jobStatus}`">
            {{ statusLabel }}
          </div>
        </div>

        <!-- Progress log -->
        <div v-if="logs.length" class="log-panel">
          <div class="log-header">
            <span>Processing log</span>
            <button class="log-clear" @click="logs = []">Clear</button>
          </div>
          <div ref="logEl" class="log-body">
            <div v-for="(line, i) in logs" :key="i" class="log-line" :class="lineClass(line)">{{ line }}</div>
          </div>
        </div>

        <!-- Download -->
        <div v-if="jobStatus === 'done'" class="download-row">
          <a class="download-btn" :href="`/api/jobs/${jobId}/download`" :download="downloadName">
            ⬇  Download MP4
          </a>
          <span class="download-hint">{{ downloadName }}</span>
        </div>

        <!-- Error -->
        <div v-if="jobStatus === 'error'" class="error-msg">
          <strong>Conversion failed.</strong> {{ jobError || 'Check the log above for details.' }}
        </div>
      </section>

      <!-- ── Step 4: Review Narration Script (review mode only) ── -->
      <section v-if="reviewMode && script" class="card">
        <h2 class="card-title">
          4. Review Narration Script
          <span class="review-slide-count">{{ slideCount }} slide{{ slideCount === 1 ? '' : 's' }} · {{ wordCount(script) }} words</span>
        </h2>
        <p class="review-intro">
          Edit the full narration script below. Keep one <code>## SLIDE N</code> header per slide — the voice is synthesized per slide using its section. You can add cues:
          <code>[VISUAL CUE: …]</code> and <code>*(tone note)*</code> are never spoken;
          <code>&lt;break time="0.8s"/&gt;</code> and <code>&lt;emphasis&gt;…&lt;/emphasis&gt;</code> are sent as SSML to ElevenLabs (stripped for Edge TTS).
        </p>

        <div class="script-toolbar">
          <div class="script-preview-row">
            <label class="script-preview-label">Preview slide</label>
            <select
              v-model.number="previewSlideIdx"
              class="script-preview-select"
              :disabled="jobStatus === 'running'"
            >
              <option v-for="n in slideCount" :key="n" :value="n - 1">Slide {{ n }}</option>
            </select>
            <button
              class="preview-btn"
              :class="{ 'preview-btn--playing': previewPlayingSlide === previewSlideIdx }"
              :disabled="previewLoading.has(previewSlideIdx) || jobStatus === 'running'"
              :title="previewPlayingSlide === previewSlideIdx ? 'Stop preview' : 'Preview selected slide'"
              @click="playPreview(previewSlideIdx)"
            >
              <span v-if="previewLoading.has(previewSlideIdx)" class="preview-spinner"></span>
              <span v-else>{{ previewPlayingSlide === previewSlideIdx ? '■' : '▶' }}</span>
            </button>
          </div>
        </div>

        <textarea
          v-model="script"
          class="opt-input opt-textarea script-textarea"
          rows="24"
          :disabled="jobStatus === 'running'"
          spellcheck="true"
          placeholder="## SLIDE 1&#10;&#10;Narration for slide 1…"
        />

        <div class="review-actions">
          <button
            class="convert-btn"
            :disabled="jobStatus === 'running' || !script"
            @click="startSynthesize"
          >
            <span v-if="jobStatus === 'running'" class="spinner"></span>
            {{ jobStatus === 'running' ? 'Generating…' : '▶  Generate Video' }}
          </button>
          <div v-if="jobStatus === 'done'" class="download-row" style="margin-top:0">
            <a class="download-btn" :href="`/api/jobs/${jobId}/download`" :download="downloadName">
              ⬇  Download MP4
            </a>
            <span class="download-hint">{{ downloadName }}</span>
          </div>
        </div>

        <div v-if="jobStatus === 'error'" class="error-msg" style="margin-top:12px">
          <strong>Generation failed.</strong> {{ jobError || 'Check the log in step 3 for details.' }}
        </div>
      </section>

      <!-- ── Prerequisites helper ── -->
      <section class="card prereq-card">
        <h2 class="card-title">Prerequisites</h2>
        <div class="prereq-grid">
          <div v-for="p in prereqStatus" :key="p.name" class="prereq-item">
            <span class="prereq-icon">{{ p.ok === null ? '⏳' : p.ok ? '✅' : '❌' }}</span>
            <span class="prereq-name">{{ p.name }}</span>
            <span v-if="!p.ok && p.ok !== null" class="prereq-hint">{{ p.hint }}</span>
          </div>
        </div>
        <button class="check-btn" @click="checkPrereqs">Check prerequisites</button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';

// ── Theme ──
const dark = ref(localStorage.getItem('theme') !== 'light');
function toggleTheme() {
  dark.value = !dark.value;
  localStorage.setItem('theme', dark.value ? 'dark' : 'light');
}

// ── State ──
const file = ref(null);
const dragging = ref(false);
const showOptions = ref(true);

const opts = ref({
  ollamaUrl: 'http://localhost:11434',
  model: 'llama3.2:3b',
  customModel: '',
  ttsProvider: 'edge',
  voice: 'en-US-AriaNeural',
  voiceMode: 'recommended',
  pause: 1.0,
  dpi: 150,
  animFps: 8,
  theme: 'default',
  keepTemp: false,
});

// ── Persona + context state ──
const context = ref({ text: '', file: null, fileContent: '', fileMode: 'append' });
const persona = ref({ selected: '', text: '', file: null, fileContent: '', fileMode: 'append' });
const personaPresets = ref([]);
const personaSituations = {
  '01-SAM-PERSONA.md':                      "Gov't leadership · architecture board",
  '09-EMPATHETIC-HOLISTIC-PERSONA.md':      'Sensitive rollout · new team onboarding',
  '10-ENERGETIC-COLLABORATIVE-PERSONA.md':  'Sprint demo · team showcase',
  '11-SKEPTIC-PROOF-ANALYST-PERSONA.md':    'CFO/CTO review · auditor · post-mortem',
  '12-EXECUTIVE-BRIEFING-PERSONA.md':       'C-suite · board update · 8-min slot',
};

async function fetchPersonas() {
  try {
    const res = await fetch('/api/personas');
    const data = await res.json();
    personaPresets.value = data.personas || [];
  } catch { /* non-fatal */ }
}

function onPersonaTextFocus() {
  if (!persona.value.selected || persona.value.selected === '') {
    persona.value.selected = '__custom__';
  }
}

function onPersonaSelect(filename) {
  persona.value.selected = filename;
  if (filename === '__custom__' || filename === '') {
    if (filename === '') persona.value.text = '';
    return;
  }
  const preset = personaPresets.value.find(p => p.filename === filename);
  persona.value.text = preset ? preset.content : '';
}

async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function resolveTextField(field) {
  const text = (field.text || '').trim();
  const fileContent = field.fileContent || '';
  if (!fileContent) return text;
  if (!text || field.fileMode === 'file-only') return fileContent;
  return text + '\n\n' + fileContent;
}

async function onPersonaFileChange(e) {
  const f = e.target.files[0];
  if (!f) return;
  persona.value.file = f;
  persona.value.fileContent = await readFileAsText(f);
  e.target.value = '';
}

function clearPersonaFile() {
  persona.value.file = null;
  persona.value.fileContent = '';
}

async function onContextFileChange(e) {
  const f = e.target.files[0];
  if (!f) return;
  context.value.file = f;
  context.value.fileContent = await readFileAsText(f);
  e.target.value = '';
}

function clearContextFile() {
  context.value.file = null;
  context.value.fileContent = '';
}

// ── ElevenLabs state ──
const el = ref({
  apiKey: localStorage.getItem('el_api_key') || '',
  voiceId: 'pNInz6obpgDQGcFmaJgB',
  model: 'eleven_multilingual_v2',
  stability: 0.5,
  similarity: 0.75,
  style: 0.0,
  speed: 1.0,
  speakerBoost: true,
});

watch(() => el.value.apiKey, val => {
  if (val) localStorage.setItem('el_api_key', val);
  else localStorage.removeItem('el_api_key');
});

const music = ref({
  enabled: false,
  prompt: `Sparse ambient piano, single repeated motif in D minor, melancholy but not dramatic.
Slow tempo, 58 BPM. No percussion. Subtle room reverb, intimate mic placement.
Thin string pad enters at 0:30, barely audible — adds warmth without momentum.
No resolution. Ends unresolved on a suspended chord, fading into silence.
Cinematic, understated. PBS documentary tone.
Duration: 70 seconds.`,
  duration: 70,
  volume: -20,
});

const generatingMusicPrompt = ref(false);
const musicPromptError = ref('');

const elVoices = ref([]);
const elVoicesFetching = ref(false);
const elVoicesError = ref('');

// ── Supertonic (local, on-device ONNX) ──
const st = ref({
  voice: 'M1',
  lang: 'en',
  steps: 8,
  speed: 1.0,
});
const stVoices = ref(['F1', 'F2', 'F3', 'F4', 'F5', 'M1', 'M2', 'M3', 'M4', 'M5']);
const stVoicesFetching = ref(false);

function appendSupertonicFields(form) {
  form.append('stVoice', st.value.voice);
  form.append('stLang',  st.value.lang);
  form.append('stSteps', String(st.value.steps));
  form.append('stSpeed', String(st.value.speed));
}

async function fetchSupertonicVoices() {
  stVoicesFetching.value = true;
  try {
    const r = await fetch('/api/supertonic-voices');
    const data = await r.json();
    if (Array.isArray(data.voices) && data.voices.length) {
      stVoices.value = data.voices;
      if (!stVoices.value.includes(st.value.voice)) st.value.voice = stVoices.value[0];
    }
  } catch { /* keep fallback list */ } finally {
    stVoicesFetching.value = false;
  }
}

async function fetchElVoices() {
  if (!el.value.apiKey.trim()) {
    elVoicesError.value = 'Enter your API key first';
    return;
  }
  elVoicesFetching.value = true;
  elVoicesError.value = '';
  try {
    const r = await fetch('/api/elevenlabs-voices', {
      headers: { 'X-ElevenLabs-Key': el.value.apiKey },
    });
    if (!r.ok) {
      const body = await r.json().catch(() => ({}));
      throw new Error(body.error || `Server returned HTTP ${r.status} — is the server running?`);
    }
    const data = await r.json();
    elVoices.value = data.voices || [];
    // Keep current selection if it exists in the list; otherwise pick first
    if (elVoices.value.length && !elVoices.value.find(v => v.voice_id === el.value.voiceId)) {
      el.value.voiceId = elVoices.value[0].voice_id;
    }
  } catch (err) {
    elVoicesError.value = err.message;
  } finally {
    elVoicesFetching.value = false;
  }
}

async function generateMusicPrompt() {
  if (!file.value) return;
  generatingMusicPrompt.value = true;
  musicPromptError.value = '';

  const form = new FormData();
  form.append('file', file.value);
  form.append('ollamaUrl', opts.value.ollamaUrl);
  form.append('model', opts.value.model === '' ? opts.value.customModel : opts.value.model);
  form.append('personaText', resolveTextField(persona.value));
  form.append('contextText', resolveTextField(context.value));

  try {
    const res = await fetch('/api/generate-music-prompt', { method: 'POST', body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    music.value.prompt = data.prompt;
  } catch (err) {
    musicPromptError.value = err.message;
  } finally {
    generatingMusicPrompt.value = false;
  }
}

const models = ref(['llama3.2:3b', 'qwen2.5:14b', 'nemotron-mini']);
const modelError = ref('');
const allVoices = ref([]);

const RECOMMENDED_VOICES = [
  { name: 'en-US-AnaNeural',                  gender: 'Female', locale: 'en-US', style: 'Cute' },
  { name: 'en-US-AndrewMultilingualNeural',    gender: 'Male',   locale: 'en-US', style: 'Warm, Confident' },
  { name: 'en-US-AndrewNeural',               gender: 'Male',   locale: 'en-US', style: 'Warm, Confident' },
  { name: 'en-US-AriaNeural',                 gender: 'Female', locale: 'en-US', style: 'Positive, Confident' },
  { name: 'en-US-AvaMultilingualNeural',       gender: 'Female', locale: 'en-US', style: 'Expressive, Caring' },
  { name: 'en-US-AvaNeural',                  gender: 'Female', locale: 'en-US', style: 'Expressive, Caring' },
  { name: 'en-US-BrianMultilingualNeural',     gender: 'Male',   locale: 'en-US', style: 'Approachable, Casual' },
  { name: 'en-US-BrianNeural',                gender: 'Male',   locale: 'en-US', style: 'Approachable, Casual' },
  { name: 'en-US-ChristopherNeural',          gender: 'Male',   locale: 'en-US', style: 'Reliable, Authority' },
  { name: 'en-US-EmmaMultilingualNeural',      gender: 'Female', locale: 'en-US', style: 'Cheerful, Clear' },
  { name: 'en-US-EmmaNeural',                 gender: 'Female', locale: 'en-US', style: 'Cheerful, Clear' },
  { name: 'en-US-EricNeural',                 gender: 'Male',   locale: 'en-US', style: 'Rational' },
  { name: 'en-US-GuyNeural',                  gender: 'Male',   locale: 'en-US', style: 'Passion' },
  { name: 'en-US-JennyNeural',                gender: 'Female', locale: 'en-US', style: 'Friendly, Considerate' },
  { name: 'en-US-MichelleNeural',             gender: 'Female', locale: 'en-US', style: 'Friendly, Pleasant' },
  { name: 'en-US-RogerNeural',                gender: 'Male',   locale: 'en-US', style: 'Lively' },
  { name: 'en-US-SteffanNeural',              gender: 'Male',   locale: 'en-US', style: 'Rational' },
  { name: 'en-GB-RyanNeural',                 gender: 'Male',   locale: 'en-GB', style: '' },
  { name: 'en-GB-SoniaNeural',                gender: 'Female', locale: 'en-GB', style: '' },
  { name: 'en-AU-NatashaNeural',              gender: 'Female', locale: 'en-AU', style: '' },
];

const displayedVoices = computed(() => {
  if (opts.value.voiceMode === 'recommended') return RECOMMENDED_VOICES;
  if (opts.value.voiceMode === 'all') {
    const en = allVoices.value.filter(v => v.locale.startsWith('en-US') || v.locale.startsWith('en-GB'));
    return en.length ? en : RECOMMENDED_VOICES;
  }
  return RECOMMENDED_VOICES;
});

const modelHint = computed(() => {
  const m = opts.value.model;
  if (m === 'llama3.2:3b') return 'Fast (~5s/slide) — good for quick drafts';
  if (m === 'qwen2.5:14b') return 'Better quality (~15s/slide) — recommended for production';
  return '';
});

// ── Job state ──
const jobId = ref(null);
const jobStatus = ref(''); // '' | 'narrating' | 'narrated' | 'running' | 'done' | 'error'
const jobError = ref('');
const logs = ref([]);
const logEl = ref(null);

// ── Review mode state ──
const reviewMode = ref(false);
const narrations = ref([]);            // raw per-slide narrations from server (for previews)
const script = ref('');                // single editable narration script
const slideCount = ref(0);
const previewSlideIdx = ref(0);

const statusLabel = computed(() => ({
  narrating: 'Narrating…',
  narrated:  'Ready to review',
  running:   'Converting…',
  done:      'Done!',
  error:     'Failed',
}[jobStatus.value] || ''));

const convertBtnLabel = computed(() => {
  if (jobStatus.value === 'running')                            return 'Converting…';
  if (jobStatus.value === 'narrating')                          return 'Narrating…';
  if (reviewMode.value && jobStatus.value === 'narrated')       return '↺  Re-narrate';
  if (reviewMode.value)                                         return '▶  Narrate Slides';
  return '▶  Generate Video';
});

const downloadName = computed(() => {
  if (!file.value) return 'video.mp4';
  return file.value.name.replace(/\.(pptx|md)$/i, '.mp4');
});

// ── Prerequisites ──
const prereqStatus = ref([
  { name: 'soffice (LibreOffice)', ok: null, hint: 'sudo apt install libreoffice' },
  { name: 'pdftoppm (poppler)', ok: null, hint: 'sudo apt install poppler-utils' },
  { name: 'ffmpeg', ok: null, hint: 'sudo apt install ffmpeg' },
  { name: 'edge-tts (Python) — Edge TTS only', ok: null, hint: 'pip install edge-tts python-pptx' },
  { name: 'Ollama', ok: null, hint: 'Run: ollama serve' },
  { name: 'Marp CLI (Markdown slides)', ok: null, hint: 'npm i -g @marp-team/marp-cli' },
]);

// ── File helpers ──
function isAccepted(f) {
  const n = f.name.toLowerCase();
  return n.endsWith('.pptx') || n.endsWith('.md');
}

const isMarkdown = computed(() => !!file.value && file.value.name.toLowerCase().endsWith('.md'));

const fileIcon = computed(() => {
  if (!file.value) return '📁';
  return isMarkdown.value ? '📝' : '📊';
});

const fileTypeBadge = computed(() => {
  if (!file.value) return '';
  return isMarkdown.value ? 'Markdown' : 'PowerPoint';
});

// ── File handling ──
function onDrop(e) {
  dragging.value = false;
  const f = e.dataTransfer.files[0];
  if (f && isAccepted(f)) file.value = f;
}

function onFileChange(e) {
  file.value = e.target.files[0] || null;
}

function clearFile() {
  file.value = null;
  jobId.value = null;
  jobStatus.value = '';
  logs.value = [];
  narrations.value = [];
  script.value = '';
  slideCount.value = 0;
  previewSlideIdx.value = 0;
}

// ── Fetch Ollama models ──
async function fetchModels() {
  modelError.value = '';
  try {
    const res = await fetch(`/api/models?ollamaUrl=${encodeURIComponent(opts.value.ollamaUrl)}`);
    const data = await res.json();
    if (data.models && data.models.length) {
      models.value = data.models;
      if (!data.models.includes(opts.value.model)) opts.value.model = data.models[0];
    } else {
      modelError.value = 'No models found — is Ollama running?';
    }
  } catch {
    modelError.value = 'Cannot reach Ollama';
  }
}

// ── Fetch voices ──
async function fetchVoices() {
  try {
    const res = await fetch('/api/voices');
    const data = await res.json();
    if (data.voices) allVoices.value = data.voices;
  } catch {
    // non-fatal — fall back to recommended list
  }
}

// ── Convert ──
async function startConvert() {
  if (!file.value || jobStatus.value === 'running') return;

  if ((opts.value.ttsProvider === 'elevenlabs' || opts.value.ttsProvider === 'elevenlabs-js') && !el.value.apiKey.trim()) {
    jobStatus.value = 'error';
    jobError.value = 'ElevenLabs API key is required. Add it in Options → ElevenLabs API Key.';
    return;
  }

  if (music.value.enabled && !el.value.apiKey.trim()) {
    jobStatus.value = 'error';
    jobError.value = 'ElevenLabs API key is required for music generation. Add it in Options.';
    return;
  }

  jobStatus.value = 'running';
  jobError.value = '';
  logs.value = [];

  const form = new FormData();
  form.append('file', file.value);
  form.append('ollamaUrl', opts.value.ollamaUrl);
  form.append('model', opts.value.model === '' ? opts.value.customModel : opts.value.model);
  form.append('ttsProvider', opts.value.ttsProvider);
  form.append('voice', opts.value.voice);
  form.append('pause', String(opts.value.pause));
  form.append('dpi', String(opts.value.dpi));
  form.append('animFps', String(opts.value.animFps));
  form.append('theme', opts.value.theme);
  form.append('keepTemp', opts.value.keepTemp ? 'true' : 'false');
  form.append('personaText', resolveTextField(persona.value));
  form.append('contextText', resolveTextField(context.value));

  if (opts.value.ttsProvider === 'elevenlabs' || opts.value.ttsProvider === 'elevenlabs-js') {
    form.append('elApiKey',    el.value.apiKey);
    form.append('elVoiceId',   el.value.voiceId);
    form.append('elModel',     el.value.model);
    form.append('elStability', String(el.value.stability));
    form.append('elSimilarity',String(el.value.similarity));
    form.append('elStyle',     String(el.value.style));
    form.append('elSpeed',     String(el.value.speed));
    form.append('elSpeakerBoost', el.value.speakerBoost ? 'true' : 'false');
  } else if (opts.value.ttsProvider === 'supertonic') {
    appendSupertonicFields(form);
  }

  if (music.value.enabled) {
    form.append('musicEnabled', 'true');
    form.append('musicPrompt', music.value.prompt);
    form.append('musicDuration', String(music.value.duration));
    form.append('musicVolume', String(music.value.volume));
    if (opts.value.ttsProvider === 'edge') {
      form.append('elApiKey', el.value.apiKey);
    }
  }

  let id;
  try {
    const res = await fetch('/api/convert', { method: 'POST', body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    id = data.jobId;
    jobId.value = id;
  } catch (err) {
    jobStatus.value = 'error';
    jobError.value = err.message;
    return;
  }

  // Stream logs via SSE
  const es = new EventSource(`/api/jobs/${id}/stream`);

  es.onmessage = async e => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'log') {
      logs.value.push(msg.line);
      await nextTick();
      if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight;
    } else if (msg.type === 'done') {
      jobStatus.value = msg.status;
      jobError.value = msg.error || '';
      es.close();
    }
  };

  es.onerror = () => {
    if (jobStatus.value === 'running') {
      jobStatus.value = 'error';
      jobError.value = 'Lost connection to server';
    }
    es.close();
  };
}

// ── Word count helper ──
function wordCount(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

// Pull the body of a "## SLIDE N" section out of the editable script.
function extractSlideSection(scriptText, slideNumber) {
  const lines = String(scriptText || '').split(/\r?\n/);
  const headerRe = /^\s*##\s*SLIDE\s+(\d+)\s*(?:[—\-:].*)?$/i;
  let inTarget = false;
  const buf = [];
  for (const line of lines) {
    const m = line.match(headerRe);
    if (m) {
      if (inTarget) break;
      inTarget = parseInt(m[1], 10) === slideNumber;
      continue;
    }
    if (inTarget) buf.push(line);
  }
  return buf.join('\n').trim();
}

// ── Voice preview ──
const previewLoading = ref(new Set());
const previewPlayingSlide = ref(null);
const previewAudio = ref(null);

async function playPreview(i) {
  // Toggle off if already playing this slide
  if (previewAudio.value && previewPlayingSlide.value === i) {
    previewAudio.value.pause();
    previewAudio.value = null;
    previewPlayingSlide.value = null;
    return;
  }
  // Stop any other playback
  if (previewAudio.value) {
    previewAudio.value.pause();
    previewAudio.value = null;
    previewPlayingSlide.value = null;
  }

  previewLoading.value = new Set([...previewLoading.value, i]);

  try {
    const section = extractSlideSection(script.value, i + 1) || narrations.value[i] || '';
    if (!section.trim()) {
      previewLoading.value = new Set([...previewLoading.value].filter(x => x !== i));
      return;
    }
    const body = {
      text: section,
      ttsProvider: opts.value.ttsProvider,
      voice: opts.value.voice,
    };
    if (opts.value.ttsProvider === 'elevenlabs' || opts.value.ttsProvider === 'elevenlabs-js') {
      body.elApiKey     = el.value.apiKey;
      body.elVoiceId    = el.value.voiceId;
      body.elModel      = el.value.model;
      body.elStability  = String(el.value.stability);
      body.elSimilarity = String(el.value.similarity);
      body.elStyle      = String(el.value.style);
      body.elSpeed      = String(el.value.speed);
      body.elSpeakerBoost = el.value.speakerBoost ? 'true' : 'false';
    } else if (opts.value.ttsProvider === 'supertonic') {
      body.stVoice = st.value.voice;
      body.stLang  = st.value.lang;
      body.stSteps = String(st.value.steps);
      body.stSpeed = String(st.value.speed);
    }

    const r = await fetch('/api/tts-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`Preview failed (HTTP ${r.status})`);

    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    previewAudio.value = audio;
    previewPlayingSlide.value = i;

    audio.onended = () => {
      previewPlayingSlide.value = null;
      previewAudio.value = null;
      URL.revokeObjectURL(url);
    };
    audio.play();
  } catch {
    // non-fatal — clear state silently
    previewPlayingSlide.value = null;
  } finally {
    const s = new Set(previewLoading.value);
    s.delete(i);
    previewLoading.value = s;
  }
}

// ── Narrate (Phase 1: LLM only) ──
async function startNarrate() {
  if (!file.value || jobStatus.value === 'running' || jobStatus.value === 'narrating') return;

  if ((opts.value.ttsProvider === 'elevenlabs' || opts.value.ttsProvider === 'elevenlabs-js') && !el.value.apiKey.trim()) {
    jobStatus.value = 'error';
    jobError.value = 'ElevenLabs API key is required. Add it in Options → ElevenLabs API Key.';
    return;
  }

  if (music.value.enabled && !el.value.apiKey.trim()) {
    jobStatus.value = 'error';
    jobError.value = 'ElevenLabs API key is required for music generation. Add it in Options.';
    return;
  }

  jobStatus.value = 'narrating';
  jobError.value = '';
  logs.value = [];
  narrations.value = [];
  script.value = '';
  slideCount.value = 0;
  previewSlideIdx.value = 0;

  const form = new FormData();
  form.append('file', file.value);
  form.append('ollamaUrl', opts.value.ollamaUrl);
  form.append('model', opts.value.model === '' ? opts.value.customModel : opts.value.model);
  form.append('ttsProvider', opts.value.ttsProvider);
  form.append('voice', opts.value.voice);
  form.append('pause', String(opts.value.pause));
  form.append('dpi', String(opts.value.dpi));
  form.append('animFps', String(opts.value.animFps));
  form.append('theme', opts.value.theme);
  form.append('keepTemp', opts.value.keepTemp ? 'true' : 'false');
  form.append('personaText', resolveTextField(persona.value));
  form.append('contextText', resolveTextField(context.value));

  if (opts.value.ttsProvider === 'elevenlabs' || opts.value.ttsProvider === 'elevenlabs-js') {
    form.append('elApiKey',     el.value.apiKey);
    form.append('elVoiceId',    el.value.voiceId);
    form.append('elModel',      el.value.model);
    form.append('elStability',  String(el.value.stability));
    form.append('elSimilarity', String(el.value.similarity));
    form.append('elStyle',      String(el.value.style));
    form.append('elSpeed',      String(el.value.speed));
    form.append('elSpeakerBoost', el.value.speakerBoost ? 'true' : 'false');
  } else if (opts.value.ttsProvider === 'supertonic') {
    appendSupertonicFields(form);
  }

  if (music.value.enabled) {
    form.append('musicEnabled', 'true');
    form.append('musicPrompt', music.value.prompt);
    form.append('musicDuration', String(music.value.duration));
    form.append('musicVolume', String(music.value.volume));
    if (opts.value.ttsProvider === 'edge') {
      form.append('elApiKey', el.value.apiKey);
    }
  }

  let id;
  try {
    const res = await fetch('/api/narrate', { method: 'POST', body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    id = data.jobId;
    jobId.value = id;
  } catch (err) {
    jobStatus.value = 'error';
    jobError.value = err.message;
    return;
  }

  const es = new EventSource(`/api/jobs/${id}/stream`);
  es.onmessage = async e => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'log') {
      logs.value.push(msg.line);
      await nextTick();
      if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight;
    } else if (msg.type === 'done') {
      es.close();
      if (msg.status === 'narrated') {
        try {
          const r = await fetch(`/api/jobs/${id}/narrations`);
          const data = await r.json();
          narrations.value = [...(data.narrations || [])];
          script.value = data.script || narrations.value
            .map((t, i) => `## SLIDE ${i + 1}\n\n${(t || '').trim()}`)
            .join('\n\n');
          slideCount.value = narrations.value.length;
          previewSlideIdx.value = 0;
          jobStatus.value = 'narrated';
        } catch (err) {
          jobStatus.value = 'error';
          jobError.value = `Failed to load narrations: ${err.message}`;
        }
      } else {
        jobStatus.value = msg.status;
        jobError.value = msg.error || '';
      }
    }
  };
  es.onerror = () => {
    if (jobStatus.value === 'narrating') {
      jobStatus.value = 'error';
      jobError.value = 'Lost connection to server';
    }
    es.close();
  };
}

// ── Synthesize (Phase 2: TTS + assembly) ──
async function startSynthesize() {
  if (!script.value.trim() || jobStatus.value === 'running') return;

  jobStatus.value = 'running';
  jobError.value = '';

  try {
    const res = await fetch(`/api/jobs/${jobId.value}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script: script.value,
        musicEnabled: music.value.enabled,
        musicVolume: music.value.volume,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
  } catch (err) {
    jobStatus.value = 'error';
    jobError.value = err.message;
    return;
  }

  const es = new EventSource(`/api/jobs/${jobId.value}/stream`);
  es.onmessage = async e => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'log') {
      logs.value.push(msg.line);
      await nextTick();
      if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight;
    } else if (msg.type === 'done') {
      jobStatus.value = msg.status;
      jobError.value = msg.error || '';
      es.close();
    }
  };
  es.onerror = () => {
    if (jobStatus.value === 'running') {
      jobStatus.value = 'error';
      jobError.value = 'Lost connection to server';
    }
    es.close();
  };
}

// ── Prereq check ──
async function checkPrereqs() {
  prereqStatus.value.forEach(p => (p.ok = null));
  try {
    const provider = opts.value.ttsProvider === 'elevenlabs-js' ? 'elevenlabs' : opts.value.ttsProvider;
    const res = await fetch(`/api/prereqs?ttsProvider=${encodeURIComponent(provider)}`);
    const data = await res.json();
    prereqStatus.value = data.results;
  } catch {
    prereqStatus.value.forEach(p => (p.ok = false));
  }
}

function lineClass(line) {
  if (line.includes('ERROR') || line.includes('error')) return 'log-error';
  if (line.includes('Done!') || line.includes('Complete')) return 'log-done';
  if (line.includes('Step')) return 'log-step';
  return '';
}

// ── Init ──
onMounted(() => {
  fetchModels();
  fetchVoices();
  fetchPersonas();
  fetchSupertonicVoices();
});
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── CSS custom properties — dark (default) ── */
.app[data-theme="dark"] {
  --bg:           #0d1117;
  --surface:      #161b22;
  --surface2:     #21262d;
  --border:       #30363d;
  --text:         #e6edf3;
  --muted:        #8b949e;
  --dimmer:       #484f58;
  --blue:         #1f6feb;
  --blue-hover:   #388bfd;
  --blue-bg:      #0d2850;
  --green:        #238636;
  --green-hover:  #2ea043;
  --green-bg:     #0d3320;
  --red:          #da3633;
  --red-text:     #f85149;
  --red-bg:       #3d0c0c;
  --run-bg:       #1b3a6b;
  --run-text:     #58a6ff;
  --log-step:     #58a6ff;
  --log-done:     #3fb950;
}

/* ── CSS custom properties — light ── */
.app[data-theme="light"] {
  --bg:           #f6f8fa;
  --surface:      #ffffff;
  --surface2:     #eaeef2;
  --border:       #d0d7de;
  --text:         #1f2328;
  --muted:        #656d76;
  --dimmer:       #9ba1a8;
  --blue:         #0969da;
  --blue-hover:   #0860ca;
  --blue-bg:      #ddf4ff;
  --green:        #1a7f37;
  --green-hover:  #157130;
  --green-bg:     #dafbe1;
  --red:          #cf222e;
  --red-text:     #cf222e;
  --red-bg:       #ffebe9;
  --run-bg:       #ddf4ff;
  --run-text:     #0550ae;
  --log-step:     #0550ae;
  --log-done:     #1a7f37;
}

body { font-family: system-ui, -apple-system, sans-serif; min-height: 100vh; }

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  transition: background 0.2s, color 0.2s;
}

/* ── Header ── */
.header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 24px; }
.header-inner {
  max-width: 860px; margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  align-items: center;
  gap: 2px 12px;
}
.logo { display: flex; align-items: center; gap: 10px; font-size: 1.25rem; font-weight: 700; grid-column: 1; grid-row: 1; }
.logo-icon { color: var(--blue); font-size: 1rem; }
.logo-text { color: var(--text); }
.dim { color: var(--dimmer); }
.header-sub { font-size: 0.8rem; color: var(--muted); grid-column: 1; grid-row: 2; }

/* Theme toggle */
.theme-toggle {
  grid-column: 2; grid-row: 1 / 3;
  background: none;
  border: 1px solid var(--border);
  color: var(--muted);
  width: 36px; height: 36px;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.theme-toggle:hover { background: var(--surface2); color: var(--text); border-color: var(--muted); }

/* ── Main ── */
.main { max-width: 860px; margin: 0 auto; padding: 24px 16px; width: 100%; display: flex; flex-direction: column; gap: 16px; }

/* ── Cards ── */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 20px; transition: background 0.2s, border-color 0.2s; }
.card-title { font-size: 0.95rem; font-weight: 600; color: var(--text); margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }

/* Options section toggle */
.toggle-btn { margin-left: auto; background: none; border: 1px solid var(--border); color: var(--muted); padding: 2px 10px; border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
.toggle-btn:hover { background: var(--surface2); color: var(--text); }

/* ── Drop zone ── */
.dropzone {
  border: 2px dashed var(--border);
  border-radius: 8px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.dropzone:hover, .dropzone--over { border-color: var(--blue); background: var(--blue-bg); }
.dropzone--has-file { border-color: var(--green); background: var(--green-bg); }
.dz-icon { font-size: 2.5rem; margin-bottom: 8px; }
.dz-prompt { color: var(--muted); font-size: 0.95rem; }
.dz-name { font-size: 1rem; font-weight: 600; color: var(--text); margin-bottom: 4px; }
.dz-size { font-size: 0.8rem; color: var(--muted); margin-bottom: 12px; }
.dz-type-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: var(--surface2); color: var(--muted); border: 1px solid var(--border); margin-bottom: 10px; }
.dz-clear { background: none; border: 1px solid var(--red); color: var(--red-text); padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.dz-clear:hover { background: var(--red-bg); }

/* ── Options ── */
.options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 600px) { .options-grid { grid-template-columns: 1fr; } }
.opt-label { display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--muted); font-weight: 500; }
.opt-input {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  padding: 7px 10px;
  font-size: 0.875rem;
  width: 100%;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.opt-input:focus { outline: none; border-color: var(--blue); }
.opt-select { cursor: pointer; }
.opt-short { max-width: 100px; }
.opt-hint { font-size: 0.75rem; color: var(--dimmer); }
.opt-hint.error { color: var(--red-text); }
.opt-check { flex-direction: row; align-items: center; gap: 8px; color: var(--muted); cursor: pointer; grid-column: span 2; }
.opt-full { grid-column: span 2; }
.opt-range { width: 100%; accent-color: var(--blue); cursor: pointer; margin-top: 2px; }
.select-row { display: flex; gap: 8px; }
.voice-code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.72rem; background: var(--surface2); padding: 1px 5px; border-radius: 3px; border: 1px solid var(--border); color: var(--text); }

/* ── TTS provider toggle ── */
.tts-toggle-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.tts-toggle-label { font-size: 0.8rem; font-weight: 600; color: var(--muted); white-space: nowrap; }
.tts-pill {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface2);
}
.tts-pill-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 7px 18px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
  transition: background 0.15s, color 0.15s;
  line-height: 1.2;
  user-select: none;
}
.tts-pill-option + .tts-pill-option { border-left: 1px solid var(--border); }
.tts-pill-option:hover { background: var(--border); color: var(--text); }
.tts-pill-option.active { background: var(--blue); color: #fff; }
.tts-pill-option.active .tts-pill-sub { color: rgba(255,255,255,0.7); }
.tts-pill-sub { font-size: 0.68rem; font-weight: 400; color: var(--dimmer); margin-top: 1px; }

/* ── Narrator persona ── */
.persona-row {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.persona-header { display: flex; flex-direction: column; gap: 6px; }
.persona-label { font-size: 0.8rem; font-weight: 600; color: var(--muted); }
.persona-clear {
  background: none;
  border: 1px solid var(--border);
  color: var(--muted);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.75rem;
  white-space: nowrap;
}
.persona-clear:hover { background: var(--red-bg); border-color: var(--red); color: var(--red-text); }
.refresh-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--muted);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.85rem;
  line-height: 1;
}
.refresh-btn:hover { background: var(--surface2); color: var(--text); }
.opt-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.78rem;
  line-height: 1.5;
  margin-top: 2px;
}

/* ── SDK note ── */
.sdk-note {
  padding: 8px 12px;
  background: var(--blue-bg);
  border: 1px solid var(--blue);
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--muted);
  line-height: 1.5;
}

/* ── File attachment ── */
.attach-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
.attach-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
  font-size: 0.78rem; color: var(--muted); cursor: pointer;
  background: var(--surface2); white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  user-select: none;
}
.attach-btn:hover { background: var(--border); color: var(--text); }
.attach-name {
  font-size: 0.75rem; color: var(--text);
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: var(--surface2); border: 1px solid var(--border); border-radius: 4px;
  padding: 2px 8px; max-width: 220px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.file-mode-row { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.file-mode-label { font-size: 0.75rem; color: var(--dimmer); white-space: nowrap; }
.file-mode-pill .tts-pill-option { padding: 4px 12px; font-size: 0.75rem; }

/* ── Convert ── */
.convert-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.convert-btn {
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}
.convert-btn:hover:not(:disabled) { background: var(--blue-hover); }
.convert-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.status-badge { padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.status-running { background: var(--run-bg); color: var(--run-text); }
.status-done { background: var(--green-bg); color: var(--green); }
.status-error { background: var(--red-bg); color: var(--red-text); }

/* ── Log ── */
.log-panel { margin-top: 16px; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
.log-header { background: var(--surface2); padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--muted); }
.log-clear { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 0.75rem; }
.log-clear:hover { color: var(--text); }
.log-body { max-height: 320px; overflow-y: auto; padding: 10px 12px; background: var(--bg); font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.78rem; line-height: 1.6; }
.log-line { white-space: pre-wrap; word-break: break-all; color: var(--muted); }
.log-step { color: var(--log-step); }
.log-done { color: var(--log-done); font-weight: 600; }
.log-error { color: var(--red-text); }

/* ── Download ── */
.download-row { margin-top: 16px; display: flex; align-items: center; gap: 16px; }
.download-btn {
  background: var(--green);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s;
}
.download-btn:hover { background: var(--green-hover); }
.download-hint { font-size: 0.8rem; color: var(--muted); }

/* ── Error ── */
.error-msg { margin-top: 12px; padding: 10px 14px; background: var(--red-bg); border: 1px solid var(--red); border-radius: 6px; color: var(--red-text); font-size: 0.85rem; }

/* ── Status badge extras ── */
.status-narrating { background: var(--run-bg); color: var(--run-text); }
.status-narrated  { background: var(--blue-bg); color: var(--blue); }

/* ── Review mode toggle ── */
.review-mode-row { margin-bottom: 14px; }
.review-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text);
  cursor: pointer;
  user-select: none;
}
.review-toggle input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; accent-color: var(--blue); }
.review-toggle input:disabled { cursor: not-allowed; }

/* ── Review narration card ── */
.review-slide-count {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--dimmer);
  font-family: 'SF Mono', 'Fira Code', monospace;
}
.review-intro { font-size: 0.85rem; color: var(--muted); margin-bottom: 20px; line-height: 1.5; }
.narration-item { margin-bottom: 14px; }
.narration-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}
.narration-slide-label { font-size: 0.8rem; font-weight: 600; color: var(--text); }
.narration-header-right { display: flex; align-items: center; gap: 8px; }
.narration-word-count {
  font-size: 0.72rem;
  color: var(--dimmer);
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* ── Voice preview button ── */
.preview-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--muted);
  cursor: pointer;
  font-size: 0.7rem;
  line-height: 1;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.preview-btn:hover:not(:disabled) { background: var(--blue-bg); border-color: var(--blue); color: var(--blue); }
.preview-btn--playing { background: var(--blue); border-color: var(--blue); color: #fff; }
.preview-btn--playing:hover:not(:disabled) { background: var(--blue-hover); border-color: var(--blue-hover); }
.preview-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.preview-spinner {
  width: 10px;
  height: 10px;
  border: 1.5px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.narration-textarea { min-height: 90px; resize: vertical; line-height: 1.55; }

/* ── Single-script editor ── */
.script-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 8px;
}
.script-preview-row { display: flex; align-items: center; gap: 8px; }
.script-preview-label { font-size: 0.78rem; color: var(--muted); }
.script-preview-select {
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--text);
}
.script-textarea {
  min-height: 480px;
  resize: vertical;
  line-height: 1.6;
  font-family: 'SF Mono', 'Fira Code', ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.85rem;
  white-space: pre-wrap;
}
.review-intro code {
  font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 0.78rem;
  background: var(--surface2);
  padding: 1px 5px;
  border-radius: 4px;
  color: var(--text);
}
.review-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

/* ── Prerequisites ── */
.prereq-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.prereq-item { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; }
.prereq-icon { width: 20px; text-align: center; }
.prereq-name { font-weight: 500; color: var(--text); min-width: 180px; }
.prereq-hint { color: var(--muted); font-size: 0.78rem; font-style: italic; }
.check-btn { background: var(--surface2); border: 1px solid var(--border); color: var(--muted); padding: 6px 16px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
.check-btn:hover { background: var(--border); color: var(--text); }
</style>

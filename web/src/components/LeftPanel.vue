<template>
  <aside class="left">
    <!-- 2.1 Document input -->
    <section class="block">
      <h3>📄 Document</h3>
      <div v-if="!store.doc">
        <div
          class="dropzone" :class="{ over: dragOver }"
          @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="onDrop"
          @click="$refs.fileInput.click()"
        >
          <div class="dz-title">Drop file here or click to browse</div>
          <div class="dz-sub">PPTX · PDF · DOCX · MD · TXT</div>
          <input ref="fileInput" type="file" hidden
                 accept=".pptx,.pdf,.docx,.md,.txt" @change="onPick" />
        </div>
        <div class="or">— OR —</div>
        <textarea v-model="store.pasteText" class="paste" rows="3" placeholder="Paste text…"></textarea>
        <button class="mini" :disabled="!store.pasteText.trim()" @click="usePaste">Use pasted text</button>
      </div>
      <div v-else class="doc-confirm">
        <span class="ok">✓ {{ store.doc.name }}</span>
        <span v-if="store.doc.ext && !narrateOk && (store.mode === 'narrate' || store.mode === 'produce')" class="warn">
          Narrate/Produce need PPTX or MD
        </span>
        <button class="x" title="Clear" @click="clearDocument">✕</button>
      </div>
    </section>

    <!-- 2.2 Persona selection -->
    <section class="block" v-if="store.mode !== 'produce'">
      <h3>👤 Personas</h3>
      <div v-if="store.mode === 'review'" class="row">
        <button class="mini" @click="selectAll">Select All</button>
        <button class="mini" @click="clearPersonas">Clear</button>
      </div>
      <ul class="personas">
        <li v-for="p in store.personas" :key="p.filename">
          <label>
            <input v-if="store.mode === 'review'" type="checkbox" :value="p.filename"
                   v-model="store.selectedPersonas" />
            <input v-else type="radio" name="persona" :value="p.filename"
                   v-model="store.selectedPersona" />
            <span class="p-name">{{ p.label.replace(/ Persona$/, '') }}</span>
            <span class="p-sum" v-if="p.summary">{{ p.summary }}</span>
          </label>
        </li>
      </ul>
    </section>
    <section class="block" v-else>
      <h3>👤 Persona</h3>
      <div class="badge-ro">{{ personaBadge }}</div>
    </section>

    <!-- Advise (rewrite only) -->
    <section class="block" v-if="store.mode === 'rewrite'">
      <h3>🧩 Advise</h3>
      <label class="check">
        <input type="checkbox" v-model="store.adviseNeeds" />
        <span>Draft content for <code>[NEEDS:]</code> gaps</span>
      </label>
      <p class="hint">The persona proposes <code>[DRAFT:]</code> values for each gap the review flagged — clearly marked for you to confirm.</p>
    </section>

    <!-- Narration source (narrate only) -->
    <section class="block" v-if="store.mode === 'narrate'">
      <h3>🎚️ Narration source</h3>
      <label class="radio-line">
        <input type="radio" value="document" v-model="store.narrateSource" />
        <span>Uploaded document</span>
      </label>
      <label class="radio-line" :class="{ muted: !hasRewrite }">
        <input type="radio" value="rewrite" :disabled="!hasRewrite" v-model="store.narrateSource" />
        <span>Rewrite output{{ hasRewrite ? '' : ' (run Rewrite first)' }}</span>
      </label>
    </section>

    <!-- 2.3 Voice (narrate + produce) -->
    <section class="block" v-if="store.mode === 'narrate' || store.mode === 'produce'">
      <h3>🎤 Voice</h3>
      <label class="field">Provider
        <select v-model="store.voice.provider" :disabled="store.mode === 'produce'" @change="onProvider">
          <option value="edge" :disabled="!store.ttsStatus.edge">
            Edge TTS{{ store.ttsStatus.edge ? '' : ' (not installed)' }}
          </option>
          <option value="elevenlabs">ElevenLabs</option>
          <option value="supertonic" :disabled="!store.ttsStatus.supertonic">
            Supertonic{{ store.ttsStatus.supertonic ? '' : ' (not installed)' }}
          </option>
        </select>
      </label>
      <p v-if="!providerAvailable" class="warn-hint">
        {{ providerName }} isn't installed on the server — pick Edge TTS, or
        <code>pip install {{ store.voice.provider }}</code> and reload.
      </p>
      <label class="field">Voice
        <select v-model="store.voice.voice" :disabled="store.mode === 'produce'">
          <option v-for="v in voiceOptions" :key="voiceVal(v)" :value="voiceVal(v)">{{ voiceLabel(v) }}</option>
        </select>
      </label>
      <button class="mini" :disabled="store.mode === 'produce' || previewing" @click="preview">
        {{ previewing ? '…' : '▶ Preview' }}
      </button>
    </section>

    <!-- 2.4 Model -->
    <section class="block">
      <h3>🤖 Model
        <button v-if="store.settings.provider === 'ollama'" class="refresh" :disabled="refreshingModels" title="Reload models from Ollama"
                @click="refreshModels">{{ refreshingModels ? '…' : '⟳' }}</button>
      </h3>
      <select v-model="store.settings.model" class="full">
        <option v-for="m in store.models" :key="m" :value="m">{{ m }}</option>
      </select>
      <div v-if="store.settings.provider === 'ollama' && store.modelError" class="err">{{ store.modelError }}</div>
    </section>

    <!-- 2.5 Context (collapsible) -->
    <section class="block" v-if="store.mode !== 'produce'">
      <h3 class="collapse" @click="showContext = !showContext">
        📎 Context (optional) <span>{{ showContext ? '▾' : '▸' }}</span>
      </h3>
      <div v-if="showContext">
        <div v-if="store.contextFile" class="ctx-file">
          <span class="ok">✓ {{ store.contextFile.name }}</span>
          <button class="x" title="Remove" @click="clearContextFile">✕</button>
        </div>
        <button v-else class="mini" @click="$refs.ctxInput.click()">📎 Attach .md / .txt</button>
        <input ref="ctxInput" type="file" hidden accept=".md,.markdown,.txt" @change="onContextFile" />
        <textarea v-model="store.context" class="paste" rows="3" placeholder="…or paste background context"></textarea>
      </div>
    </section>

    <!-- 2.6 Run -->
    <section class="block run">
      <button class="run-btn" :disabled="runDisabled" @click="run">
        <span v-if="running">⏳ Running…</span>
        <span v-else>{{ runLabel }}</span>
      </button>
      <div v-if="runHint" class="run-hint">{{ runHint }}</div>
    </section>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  store, setDocument, setPastedDocument, clearDocument, docSupportsNarrate,
  startReview, startNarrate, startProduce, previewSlide, loadVoices, loadModels,
  setContextFile, clearContextFile, rewriteOutput, toast,
} from '../store.js';

const dragOver = ref(false);
const showContext = ref(false);
const previewing = ref(false);
const refreshingModels = ref(false);

async function refreshModels() {
  refreshingModels.value = true;
  try {
    await loadModels();
    if (!store.modelError) toast(`Loaded ${store.models.length} model${store.models.length === 1 ? '' : 's'}`);
    else toast(store.modelError, 'error');
  } finally {
    refreshingModels.value = false;
  }
}

const narrateOk = computed(() => docSupportsNarrate());
const hasRewrite = computed(() => !!rewriteOutput());

function onDrop(e) { dragOver.value = false; if (e.dataTransfer.files[0]) setDocument(e.dataTransfer.files[0]); }
function onPick(e) { if (e.target.files[0]) setDocument(e.target.files[0]); }
function usePaste() { setPastedDocument(store.pasteText.trim(), ''); }

async function onContextFile(e) {
  const f = e.target.files[0];
  if (!f) return;
  try { await setContextFile(f); }
  catch (err) { toast(`Could not read context file: ${err.message}`, 'error'); }
  e.target.value = '';
}

function selectAll() { store.selectedPersonas = store.personas.map(p => p.filename); }
function clearPersonas() { store.selectedPersonas = []; }

const personaBadge = computed(() => {
  const f = store.selectedPersona;
  const p = store.personas.find(x => x.filename === f);
  return p ? p.label.replace(/ Persona$/, '') : '(none — set in Narrate)';
});

// voice options from fetched catalogue, fallback to a sensible default
const voiceOptions = computed(() => store.voices.length ? store.voices : ['en-US-AriaNeural', 'en-US-ChristopherNeural']);
function voiceVal(v) { return typeof v === 'string' ? v : (v.id || v.name || v.value); }
function voiceLabel(v) { return typeof v === 'string' ? v : (v.label || v.name || v.id); }
function onProvider() { loadVoices(store.voice.provider); }

let previewAudio = null;       // retained so it isn't GC'd mid-playback
let previewUrl = null;

async function preview() {
  // Stop any in-flight preview so a new voice doesn't overlap the previous clip.
  if (previewAudio) { previewAudio.pause(); previewAudio = null; }
  if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }

  previewing.value = true;
  try {
    const sample = store.narrate.script
      ? store.narrate.script.replace(/^##.*$/gm, '').trim().slice(0, 200)
      : 'This is a short preview of the selected voice.';
    previewUrl = await previewSlide(sample || 'Preview of the selected voice.');
    previewAudio = new Audio(previewUrl);
    previewAudio.onended = () => {
      if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
      previewAudio = null;
    };
    await previewAudio.play();
  } catch (e) {
    toast(e.message, 'error');
  } finally {
    previewing.value = false;
  }
}

const providerAvailable = computed(() => {
  const p = store.voice.provider;
  if (p === 'supertonic') return store.ttsStatus.supertonic;
  if (p === 'edge') return store.ttsStatus.edge;
  return true;   // elevenlabs is key-gated, handled at run time
});
const providerName = computed(() => ({
  edge: 'Edge TTS', elevenlabs: 'ElevenLabs', supertonic: 'Supertonic',
}[store.voice.provider] || store.voice.provider));

const running = computed(() => store[store.mode]?.status === 'running');

const runLabel = computed(() => ({
  review: '▶ Run Review', rewrite: '▶ Rewrite Deck',
  narrate: '▶ Generate Script', produce: '▶ Produce Video',
}[store.mode]));

const runDisabled = computed(() => {
  if (running.value) return true;
  if (store.mode === 'produce') return !store.narrate.script.trim();
  if (store.mode === 'narrate') {
    if (!providerAvailable.value) return true;
    if (store.narrateSource === 'rewrite') return !hasRewrite.value;   // uses rewrite md
    return !store.doc || !narrateOk.value;
  }
  if (!store.doc) return true;
  if (store.mode === 'review') return store.selectedPersonas.length < 1;
  if (store.mode === 'rewrite' && !store.selectedPersona) return true;
  return false;
});

const runHint = computed(() => {
  if (store.mode === 'narrate' && !providerAvailable.value) return `${providerName.value} isn't installed — choose another voice provider.`;
  if (store.mode === 'narrate' && store.narrateSource === 'rewrite') return hasRewrite.value ? 'Narrating the rewritten deck.' : 'Run a Rewrite first to narrate its output.';
  if (store.mode === 'narrate' && store.doc && !narrateOk.value) return 'Narrate requires a PPTX or MD file.';
  if (store.mode === 'produce' && !store.narrate.script.trim()) return 'Generate a narration script in Narrate first.';
  return '';
});

function run() {
  if (store.mode === 'review') startReview('review');
  else if (store.mode === 'rewrite') startReview('rewrite');
  else if (store.mode === 'narrate') startNarrate();
  else if (store.mode === 'produce') startProduce();
}
</script>

<style scoped>
.left {
  width: 320px; flex: 0 0 320px; height: 100%; overflow-y: auto;
  background: var(--bg-panel); border-right: 1px solid var(--border);
  padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-5);
}
.block h3 { font-size: 14px; margin: 0 0 var(--space-3); display: flex; justify-content: space-between; }
.collapse { cursor: pointer; }
.refresh {
  background: transparent; border: 1px solid var(--border); color: var(--accent);
  border-radius: var(--radius-sm); width: 24px; height: 22px; line-height: 1;
  cursor: pointer; font-size: 14px; padding: 0;
}
.refresh:disabled { opacity: .5; cursor: progress; }
.dropzone {
  border: 1.5px dashed var(--border); border-radius: var(--radius-md);
  padding: var(--space-5); text-align: center; cursor: pointer; transition: border-color .15s;
}
.dropzone.over, .dropzone:hover { border-color: var(--accent); }
.dz-title { font-size: 13px; }
.dz-sub { font-size: 11px; color: var(--text-secondary); margin-top: 6px; }
.or { text-align: center; color: var(--text-secondary); font-size: 12px; margin: var(--space-3) 0; }
.paste, .full, select, input[type=text] {
  width: 100%; background: var(--bg-chrome); color: var(--text-primary);
  border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px; font-size: 13px;
}
.paste { resize: vertical; font-family: var(--font-mono); }
.field { display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: var(--space-3); }
.field select { margin-top: 4px; }
.row { display: flex; gap: var(--space-2); margin-bottom: var(--space-2); }
.mini {
  background: transparent; color: var(--accent); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 5px 10px; font-size: 12px; cursor: pointer; margin-top: 6px;
}
.mini:disabled { opacity: .4; cursor: not-allowed; }
.personas { list-style: none; margin: 0; padding: 0; max-height: 260px; overflow-y: auto; }
.personas label { display: grid; grid-template-columns: auto 1fr; gap: 4px 8px; align-items: baseline; padding: 5px 2px; cursor: pointer; }
.personas input { grid-row: span 2; }
.p-name { font-weight: 600; font-size: 13px; }
.p-sum { grid-column: 2; font-size: 11px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.doc-confirm, .ctx-file { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
.ctx-file { margin-bottom: var(--space-2); }
.ok { color: var(--success); font-size: 13px; }
.warn { color: var(--warning); font-size: 11px; }
.x { background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-left: auto; }
.badge-ro { background: var(--bg-chrome); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px 10px; font-size: 13px; }
.radio-line { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 3px 0; }
.radio-line.muted { color: var(--text-secondary); cursor: not-allowed; }
.check { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
.check code, .hint code { font-family: var(--font-mono); font-size: 12px; }
.hint { font-size: 11px; color: var(--text-secondary); margin: 6px 0 0; }
.warn-hint { font-size: 11px; color: var(--warning); margin: 6px 0 0; }
.warn-hint code { font-family: var(--font-mono); }
.err, .run-hint { font-size: 11px; color: var(--warning); margin-top: 6px; }
.err { color: var(--danger); }
.run { margin-top: auto; }
.run-btn {
  width: 100%; background: var(--accent); color: #fff; border: none;
  border-radius: var(--radius-md); padding: 12px; font-size: 14px; font-weight: 600; cursor: pointer;
}
.run-btn:disabled { opacity: .4; cursor: not-allowed; }
</style>

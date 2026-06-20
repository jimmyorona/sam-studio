// SAM Studio — shared reactive store (SCREEN-LAYOUT §10, §17.2)
// One reactive object holds document + selections + per-mode results so work
// persists across tab switches. API helpers wrap the Express endpoints.
import { reactive } from 'vue';

const NARRATE_EXTS = ['.pptx', '.md'];                                   // converter pipeline
const REVIEW_EXTS = ['.pptx', '.pdf', '.docx', '.md', '.txt'];          // reviewer bridge

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem('sam-studio-settings') || '{}');
  } catch {
    return {};
  }
}

const saved = loadSettings();

export const store = reactive({
  // ── global ──
  mode: 'review',                       // review | rewrite | narrate | produce
  settings: {
    provider: saved.provider || 'ollama',
    geminiApiKey: saved.geminiApiKey || '',
    ollamaUrl: saved.ollamaUrl || 'http://localhost:11434',
    model: saved.model || 'llama3.2:3b',
    theme: saved.theme || 'mixed',
    concurrency: saved.concurrency || 3,
    ttsProvider: saved.ttsProvider || 'edge',
    elApiKey: saved.elApiKey || '',
  },

  // ── shared document state ──
  doc: null,                            // { file, name, ext, slideCount, text, slug }
  pasteText: '',

  // ── catalogues (fetched once) ──
  personas: [],                         // [{ filename, label, summary }]
  models: ['llama3.2:3b'],
  voices: [],
  ttsStatus: { edge: true, elevenlabs: true, supertonic: true },  // optimistic until loaded
  modelError: '',

  // ── selections ──
  selectedPersonas: [],                 // filenames (multi for review)
  selectedPersona: '',                  // single (rewrite/narrate)
  voice: { provider: 'edge', voice: 'en-US-AriaNeural', style: '' },
  context: '',
  contextFile: null,                    // { name, content } — attached .md/.txt
  adviseNeeds: false,                   // rewrite: draft content for [NEEDS:] gaps
  narrateSource: 'document',            // 'document' | 'rewrite' — narration input

  // ── per-mode results ──
  review: { jobId: null, status: 'idle', error: '', personas: [], reports: [], slug: null, logs: [] },
  rewrite: { jobId: null, status: 'idle', error: '', reports: [], slug: null, logs: [] },
  narrate: { jobId: null, status: 'idle', error: '', script: '', narrations: [], slideCount: 0, logs: [] },
  produce: { status: 'idle', error: '', logs: [], videoUrl: null, settings: { pause: 1.0, animFps: 8, dpi: 150 } },

  // ── toasts ──
  toasts: [],
});

// ── persistence ──
export function persistSettings() {
  localStorage.setItem('sam-studio-settings', JSON.stringify(store.settings));
}

// ── toasts ──
let toastId = 0;
export function toast(message, kind = 'success') {
  const id = ++toastId;
  store.toasts.push({ id, message, kind });
  if (kind === 'success') setTimeout(() => dismissToast(id), 5000);
}
export function dismissToast(id) {
  const i = store.toasts.findIndex(t => t.id === id);
  if (i !== -1) store.toasts.splice(i, 1);
}

// ── helpers ──
export function fileExt(name) {
  const m = /\.[a-z0-9]+$/i.exec(name || '');
  return m ? m[0].toLowerCase() : '';
}
export function docSupportsNarrate() {
  return store.doc && NARRATE_EXTS.includes(store.doc.ext);
}
export function docSupportsReview() {
  return store.doc && REVIEW_EXTS.includes(store.doc.ext);
}

// ── catalogue loading ──
export async function loadPersonas() {
  try {
    const r = await fetch('/api/personas');
    const d = await r.json();
    store.personas = (d.personas || []).map(p => ({
      filename: p.filename,
      label: p.label,
      summary: firstSummaryLine(p.content),
    }));
  } catch {
    store.personas = [];
  }
}
function firstSummaryLine(content) {
  for (const line of (content || '').split('\n')) {
    const m = /^\*\*(?:Archetype|Role):\*\*\s*(.+)/.exec(line.trim());
    if (m) return m[1].trim();
  }
  return '';
}

export async function loadModels() {
  store.modelError = '';
  if (store.settings.provider === 'gemini') {
    const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    store.models = geminiModels;
    if (!geminiModels.includes(store.settings.model)) {
      store.settings.model = 'gemini-2.5-flash';
    }
    return;
  }
  try {
    const r = await fetch(`/api/models?ollamaUrl=${encodeURIComponent(store.settings.ollamaUrl)}`);
    const d = await r.json();
    if (d.models && d.models.length) {
      store.models = d.models;
      if (!d.models.includes(store.settings.model)) store.settings.model = d.models[0];
    } else {
      store.modelError = 'No models found — is Ollama running?';
    }
  } catch {
    store.modelError = 'Cannot reach Ollama';
  }
}

export async function loadTtsStatus() {
  try {
    store.ttsStatus = await fetch('/api/tts-status').then(r => r.json());
  } catch { /* keep optimistic defaults */ }
}

export async function loadVoices(provider = 'edge') {
  try {
    const url = provider === 'supertonic' ? '/api/supertonic-voices' : '/api/voices';
    const r = await fetch(url);
    const d = await r.json();
    store.voices = d.voices || [];
  } catch {
    store.voices = [];
  }
}

// ── document upload (client-side; the file is sent with each job) ──
export function setDocument(file) {
  const ext = fileExt(file.name);
  store.doc = { file, name: file.name, ext, slideCount: null, text: null, slug: slugify(file.name) };
}
export function setPastedDocument(text, title) {
  store.doc = {
    file: null, name: title || 'Pasted text', ext: '.txt',
    slideCount: null, text, slug: title ? slugify(title) : `pasted-${Date.now().toString(36)}`,
  };
}
export function clearDocument() {
  store.doc = null;
  store.pasteText = '';
}

// ── context (typed text + optional attached .md/.txt file) ──
export async function setContextFile(file) {
  const content = await file.text();
  store.contextFile = { name: file.name, content };
}
export function clearContextFile() {
  store.contextFile = null;
}
export function resolvedContext() {
  const parts = [];
  if (store.contextFile?.content?.trim()) parts.push(store.contextFile.content.trim());
  if (store.context.trim()) parts.push(store.context.trim());
  return parts.join('\n\n');
}
function slugify(name) {
  return name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'document';
}

// ── SSE helper ──
function streamJob(jobId, { onLog, onEvent, onDone }) {
  const es = new EventSource(`/api/jobs/${jobId}/stream`);
  es.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'log') onLog?.(msg.line);
    else if (msg.type === 'done') { onDone?.(msg); es.close(); }
    else onEvent?.(msg);
  };
  es.onerror = () => es.close();
  return es;
}

// ── Review / Rewrite ──
export async function startReview(mode) {
  const slot = store[mode];
  slot.status = 'running';
  slot.error = '';
  slot.logs = [];
  slot.reports = [];
  if (mode === 'review') slot.personas = [];

  const personas = mode === 'review' ? store.selectedPersonas : [store.selectedPersona];
  const form = new FormData();
  if (store.doc.file) form.append('file', store.doc.file);
  else { form.append('text', store.doc.text); form.append('title', store.doc.name); }
  form.append('personas', personas.join(','));
  form.append('model', store.settings.model);
  form.append('ollamaUrl', store.settings.ollamaUrl);
  form.append('provider', store.settings.provider);
  form.append('geminiApiKey', store.settings.geminiApiKey);
  const ctx = resolvedContext();
  if (ctx) form.append('context', ctx);
  if (mode === 'rewrite' && store.adviseNeeds) form.append('advise', '1');

  let jobId, slug;
  try {
    const r = await fetch(`/api/${mode}`, { method: 'POST', body: form });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
    const d = await r.json();
    jobId = d.jobId; slug = d.docSlug;
  } catch (err) {
    slot.status = 'error'; slot.error = err.message;
    toast(`${mode} failed: ${err.message}`, 'error');
    return;
  }
  slot.jobId = jobId;
  slot.slug = slug;

  // seed persona state for the progress view
  if (mode === 'review') {
    slot.personas = store.selectedPersonas.map(f => ({
      slug: f.replace(/\.md$/i, '').toLowerCase(),
      name: personaLabel(f), state: 'queued',
    }));
  }

  streamJob(jobId, {
    onLog: line => slot.logs.push(line),
    onEvent: msg => {
      if (msg.type === 'slug') slot.slug = msg.slug;
      else if (msg.type === 'persona') {
        const p = (slot.personas || []).find(x => x.slug === msg.slug);
        if (p) p.state = msg.state;
      }
    },
    onDone: async msg => {
      if (msg.status === 'error') {
        slot.status = 'error'; slot.error = msg.error || 'Failed';
        toast(`${mode} failed`, 'error');
        return;
      }
      try {
        // Scope to the reports THIS job produced — the slug dir may also hold
        // reports from earlier runs on the same document (other personas /
        // a stale synthesis). The job snapshot lists only this run's outputs.
        const snap = await fetch(`/api/reviews/jobs/${jobId}`).then(r => r.json()).catch(() => ({}));
        const produced = new Set((snap.reports || []).map(r => r.slug));
        const all = await fetch(`/api/reviews/${slot.slug}/reports`).then(r => r.json()).then(d => d.reports || []);
        slot.reports = produced.size ? all.filter(rp => produced.has(rp.slug)) : all;
      } catch { /* leave reports empty */ }
      slot.status = 'done';
      toast(`${mode === 'review' ? 'Review' : 'Rewrite'} complete`);
    },
  });
}

function personaLabel(filename) {
  const found = store.personas.find(p => p.filename === filename);
  if (found) return found.label;
  const base = filename.replace(/^\d+-/, '').replace(/-PERSONA\.md$/i, '').replace(/\.md$/, '');
  return base.split('-').map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// Is a rewrite available to narrate from?
export function rewriteOutput() {
  if (store.rewrite.status !== 'done') return null;
  return store.rewrite.reports.find(r => r.slug.startsWith('rewrite-')) || null;
}

// Convert a rewrite report into a Marp-friendly deck: one `## Slide N` section
// per slide separated by `---` (so both Marp image rendering and the narration
// slide-split agree), with speaker notes, NEEDS/DRAFT markers, and the trailing
// `## Rewrite notes` section dropped from the on-slide content.
export function rewriteToDeck(md) {
  const slides = [];
  for (const sec of md.split(/^## /m).slice(1)) {
    const heading = sec.split('\n', 1)[0];
    if (/^rewrite notes\b/i.test(heading.trim())) continue;
    let body = sec;
    const sn = body.search(/\*\*Speaker notes:?\*\*/i);
    if (sn !== -1) body = body.slice(0, sn);
    body = body
      .replace(/^\s*---+\s*$/gm, '')                       // drop stray rules
      .replace(/\[NEEDS:[^\]]*\]/gi, '')                   // drop unfilled gaps
      .replace(/\[DRAFT:\s*([^\]]*)\]/gi, '$1')            // accept drafts inline
      .trim();
    slides.push('## ' + body);
  }
  return slides.join('\n\n---\n\n') || '## Slide 1\n\n(empty rewrite)';
}

// ── Narrate (phase 1: LLM script) ──
export async function startNarrate() {
  const slot = store.narrate;
  slot.status = 'running';
  slot.error = ''; slot.logs = []; slot.script = ''; slot.narrations = []; slot.slideCount = 0;

  const form = new FormData();
  const rep = store.narrateSource === 'rewrite' ? rewriteOutput() : null;
  if (rep) {
    const deck = rewriteToDeck(rep.content);
    const name = `${store.doc?.slug || 'rewrite'}-rewrite.md`;
    form.append('file', new File([deck], name, { type: 'text/markdown' }));
  } else {
    form.append('file', store.doc.file);
  }
  form.append('ollamaUrl', store.settings.ollamaUrl);
  form.append('model', store.settings.model);
  form.append('provider', store.settings.provider);
  form.append('geminiApiKey', store.settings.geminiApiKey);
  form.append('ttsProvider', store.voice.provider);
  form.append('voice', store.voice.voice);
  // Supertonic's voice is the stVoice field (F1/M1/…), not `voice`.
  if (store.voice.provider === 'supertonic') form.append('stVoice', store.voice.voice);
  if (store.settings.elApiKey) form.append('elApiKey', store.settings.elApiKey);
  const narrCtx = resolvedContext();
  if (narrCtx) form.append('contextText', narrCtx);
  if (store.selectedPersona) {
    const p = store.personas.find(x => x.filename === store.selectedPersona);
    if (p) form.append('personaText', personaLabel(store.selectedPersona));
  }

  let jobId;
  try {
    const r = await fetch('/api/narrate', { method: 'POST', body: form });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
    jobId = (await r.json()).jobId;
  } catch (err) {
    slot.status = 'error'; slot.error = err.message;
    toast(`Narrate failed: ${err.message}`, 'error');
    return;
  }
  slot.jobId = jobId;

  streamJob(jobId, {
    onLog: line => slot.logs.push(line),
    onDone: async msg => {
      if (msg.status === 'narrated') {
        try {
          const d = await (await fetch(`/api/jobs/${jobId}/narrations`)).json();
          slot.narrations = [...(d.narrations || [])];
          slot.script = d.script || slot.narrations.map((t, i) => `## SLIDE ${i + 1}\n\n${(t || '').trim()}`).join('\n\n');
          slot.slideCount = slot.narrations.length;
          slot.status = 'done';
          toast('Narration script ready');
        } catch (err) {
          slot.status = 'error'; slot.error = `Failed to load narrations: ${err.message}`;
        }
      } else {
        slot.status = msg.status === 'done' ? 'done' : 'error';
        slot.error = msg.error || '';
      }
    },
  });
}

// ── Produce (phase 2: TTS + assembly), reuses the narrate jobId ──
export async function startProduce() {
  const slot = store.produce;
  const nar = store.narrate;
  if (!nar.jobId || !nar.script.trim()) {
    toast('Generate a narration script first', 'error');
    return;
  }
  slot.status = 'running'; slot.error = ''; slot.logs = []; slot.videoUrl = null;

  try {
    const r = await fetch(`/api/jobs/${nar.jobId}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: nar.script }),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
  } catch (err) {
    slot.status = 'error'; slot.error = err.message;
    toast(`Produce failed: ${err.message}`, 'error');
    return;
  }

  streamJob(nar.jobId, {
    onLog: line => slot.logs.push(line),
    onDone: msg => {
      if (msg.status === 'done') {
        slot.status = 'done';
        slot.videoUrl = `/api/jobs/${nar.jobId}/download`;
        toast('Video complete');
      } else {
        slot.status = 'error'; slot.error = msg.error || 'Failed';
        toast('Produce failed', 'error');
      }
    },
  });
}

// ── accept Advise drafts: fold [DRAFT: …] into the slide content, drop the
//    paired [NEEDS: …] marker, persist so exports use the accepted version ──
export async function acceptRewriteDrafts() {
  const slot = store.rewrite;
  const rep = slot.reports.find(r => r.slug.startsWith('rewrite-')) || slot.reports[0];
  if (!rep) return;
  const accepted = rep.content
    .replace(/\[NEEDS:[^\]]*\]\s*\[DRAFT:\s*([^\]]*)\]/gi, '$1')   // accept paired
    .replace(/\[DRAFT:\s*([^\]]*)\]/gi, '$1');                      // accept lone drafts
  try {
    const r = await fetch(`/api/reviews/${slot.slug}/${rep.slug}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: accepted }),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
    rep.content = accepted;
    toast('Draft recommendations accepted');
  } catch (e) {
    toast(`Could not save accepted drafts: ${e.message}`, 'error');
  }
}

// ── per-slide TTS preview ──
export async function previewSlide(text) {
  const body = { text, ttsProvider: store.voice.provider, voice: store.voice.voice };
  if (store.voice.provider.startsWith('elevenlabs')) body.elApiKey = store.settings.elApiKey;
  if (store.voice.provider === 'supertonic') body.stVoice = store.voice.voice;  // F1/M1/… not `voice`
  const r = await fetch('/api/tts-preview', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Preview failed (HTTP ${r.status})`);
  return URL.createObjectURL(await r.blob());
}

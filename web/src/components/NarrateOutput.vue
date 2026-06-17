<template>
  <div class="out">
    <div v-if="slot.status === 'idle' || (slot.status === 'running' && !slot.logs.length)" class="empty">
      <div class="icon">🎬</div>
      <p>Upload a document and select a persona + voice, then click Generate Script.</p>
      <p class="sub">The model generates narration for every slide using cross-slide memory. You can edit the script before producing video.</p>
    </div>

    <div v-else-if="slot.status === 'running'" class="running">
      <div class="bar"><div class="fill indeterminate"></div></div>
      <p>Generating narration…</p>
      <pre class="log">{{ slot.logs.slice(-14).join('\n') }}</pre>
    </div>

    <div v-else-if="slot.status === 'done'" class="results">
      <div class="head">
        <span>Narration Script</span>
        <div class="toggle">
          <button :class="{ active: view === 'raw' }" @click="view = 'raw'">Raw Edit</button>
          <button :class="{ active: view === 'slide' }" @click="view = 'slide'">Slide View</button>
        </div>
      </div>

      <textarea v-if="view === 'raw'" v-model="slot.script" class="raw" spellcheck="false"></textarea>

      <div v-else class="slides">
        <div v-for="(s, i) in slideSections" :key="i" class="card">
          <div class="card-h">## SLIDE {{ s.num }}</div>
          <textarea v-model="s.text" rows="5" @input="syncFromSections"></textarea>
          <button class="mini" :disabled="previewIdx === i" @click="preview(i, s.text)">
            {{ previewIdx === i ? '⏸ Playing' : '▶ Preview Slide ' + s.num }}
          </button>
        </div>
      </div>

      <details class="legend">
        <summary>Directorial Cue Legend</summary>
        <ul>
          <li><code>[VISUAL CUE: …]</code> — not spoken</li>
          <li><code>*(tone)*</code> — not spoken</li>
          <li><code>&lt;break/&gt;</code> — SSML pause (ElevenLabs only)</li>
          <li><code>&lt;emphasis&gt;…&lt;/emphasis&gt;</code> — SSML (ElevenLabs)</li>
        </ul>
      </details>

      <div class="exportbar">
        <button class="btn ghost" @click="store.mode = 'produce'">→ Produce Video</button>
      </div>
    </div>

    <div v-else-if="slot.status === 'error'" class="error">
      <p>❌ {{ slot.error }}</p>
      <pre class="log">{{ slot.logs.slice(-10).join('\n') }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { store, previewSlide, toast } from '../store.js';

const slot = computed(() => store.narrate);
const view = ref('slide');
const previewIdx = ref(null);
let audio = null;

const slideSections = ref([]);

function parse() {
  const lines = (slot.value.script || '').split(/\r?\n/);
  const re = /^\s*##\s*SLIDE\s+(\d+)/i;
  const out = []; let cur = null;
  for (const ln of lines) {
    const m = ln.match(re);
    if (m) { cur = { num: parseInt(m[1], 10), text: '' }; out.push(cur); }
    else if (cur) cur.text += (cur.text ? '\n' : '') + ln;
  }
  out.forEach(s => (s.text = s.text.trim()));
  slideSections.value = out;
}
watch(() => slot.value.script, parse, { immediate: true });

function syncFromSections() {
  slot.value.script = slideSections.value.map(s => `## SLIDE ${s.num}\n\n${s.text}`).join('\n\n');
}

async function preview(i, text) {
  if (audio) { audio.pause(); audio = null; }
  if (previewIdx.value === i) { previewIdx.value = null; return; }
  try {
    const url = await previewSlide(text.replace(/\[VISUAL CUE:[^\]]*\]/gi, '').replace(/\*\([^)]*\)\*/g, '').trim());
    audio = new Audio(url);
    previewIdx.value = i;
    audio.onended = () => { previewIdx.value = null; };
    audio.play();
  } catch (e) {
    toast(e.message, 'error');
    previewIdx.value = null;
  }
}
</script>

<style scoped>
.out { height: 100%; overflow-y: auto; padding: var(--space-6); }
.empty { max-width: 460px; margin: 12% auto; text-align: center; color: var(--text-secondary); }
.empty .icon { font-size: 48px; }
.empty .sub { font-size: 13px; }
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.toggle button { background: none; border: 1px solid var(--border); color: var(--text-secondary); padding: 5px 10px; cursor: pointer; font-size: 12px; }
.toggle button:first-child { border-radius: var(--radius-sm) 0 0 var(--radius-sm); }
.toggle button:last-child { border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
.toggle button.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.raw { width: 100%; min-height: 420px; background: var(--bg-card); color: var(--text-card); border: 1px solid var(--border-card); border-radius: var(--radius-md); padding: var(--space-4); font-family: var(--font-mono); font-size: 13px; resize: vertical; }
.slides { display: flex; flex-direction: column; gap: var(--space-4); }
.card { background: var(--bg-card); border: 1px solid var(--border-card); border-radius: var(--radius-md); padding: var(--space-4); }
.card-h { font-weight: 700; color: var(--text-card); margin-bottom: var(--space-2); }
.card textarea { width: 100%; background: var(--bg-card-alt); color: var(--text-card); border: 1px solid var(--border-card); border-radius: var(--radius-sm); padding: 10px; font-family: var(--font-mono); font-size: 13px; resize: vertical; }
.mini { margin-top: 8px; background: transparent; color: var(--accent); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 5px 10px; font-size: 12px; cursor: pointer; }
.legend { margin-top: var(--space-4); font-size: 12px; color: var(--text-secondary); }
.legend code { font-family: var(--font-mono); }
.exportbar { margin-top: var(--space-4); }
.btn.ghost { background: transparent; color: var(--accent); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 14px; cursor: pointer; font-size: 13px; }
.bar { height: 8px; background: var(--bg-card-alt); border-radius: 6px; overflow: hidden; }
.fill.indeterminate { width: 40%; height: 100%; background: var(--accent); animation: slide 1.2s infinite; }
@keyframes slide { 0% { margin-left: -40%; } 100% { margin-left: 100%; } }
.log { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); background: var(--bg-card-alt); padding: 10px; border-radius: var(--radius-sm); white-space: pre-wrap; margin-top: 14px; }
.error { color: var(--danger); }
</style>

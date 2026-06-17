<template>
  <div class="out">
    <div v-if="!hasScript" class="empty">
      <div class="icon">🎥</div>
      <p>Generate a narration script in the Narrate tab first, then return here to produce video.</p>
    </div>

    <div v-else-if="slot.status === 'idle' || slot.status === 'error'" class="preflight">
      <h3>🎬 Video Production</h3>
      <table class="summary">
        <tr><td>Document</td><td>{{ store.doc?.name || '—' }}</td></tr>
        <tr><td>Persona</td><td>{{ personaName }}</td></tr>
        <tr><td>Voice</td><td>{{ store.voice.voice }} ({{ store.voice.provider }})</td></tr>
        <tr><td>Script</td><td>✓ {{ store.narrate.slideCount }} slides</td></tr>
      </table>
      <h4>Settings</h4>
      <label class="field">Pause between slides (s)
        <input type="number" step="0.1" v-model.number="slot.settings.pause" /></label>
      <label class="field">Animation FPS
        <input type="number" v-model.number="slot.settings.animFps" /></label>
      <label class="field">DPI (image render)
        <input type="number" v-model.number="slot.settings.dpi" /></label>
      <p v-if="slot.status === 'error'" class="error">❌ {{ slot.error }}</p>
      <button class="btn" @click="produce">▶ Produce Video</button>
    </div>

    <div v-else-if="slot.status === 'running'" class="running">
      <h3>🎬 Producing Video…</h3>
      <div class="bar"><div class="fill indeterminate"></div></div>
      <pre class="log" ref="logEl">{{ slot.logs.join('\n') }}</pre>
      <button class="btn ghost" disabled>⏳ Working…</button>
    </div>

    <div v-else-if="slot.status === 'done'" class="complete">
      <h3>✅ Video Complete</h3>
      <video :src="slot.videoUrl" controls class="player"></video>
      <div class="actions">
        <a class="btn" :href="slot.videoUrl" download>📥 Download MP4</a>
        <button class="btn ghost" @click="slot.status = 'idle'">▶ Produce Again</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { store, startProduce } from '../store.js';

const slot = computed(() => store.produce);
const hasScript = computed(() => !!store.narrate.script.trim());

const personaName = computed(() => {
  const p = store.personas.find(x => x.filename === store.selectedPersona);
  return p ? p.label.replace(/ Persona$/, '') : '—';
});

function produce() { startProduce(); }
</script>

<style scoped>
.out { height: 100%; overflow-y: auto; padding: var(--space-6); }
.empty { max-width: 460px; margin: 12% auto; text-align: center; color: var(--text-secondary); }
.empty .icon { font-size: 48px; }
.preflight, .running, .complete { max-width: 640px; }
h3 { margin-top: 0; }
.summary { width: 100%; border-collapse: collapse; margin-bottom: var(--space-4); }
.summary td { padding: 6px 0; border-bottom: 1px solid var(--border); }
.summary td:first-child { color: var(--text-secondary); width: 140px; }
.field { display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: var(--space-3); }
.field input { display: block; margin-top: 4px; width: 160px; background: var(--bg-chrome); color: var(--text-primary); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 7px; }
.btn { background: var(--accent); color: #fff; border: none; border-radius: var(--radius-sm); padding: 10px 16px; cursor: pointer; text-decoration: none; font-size: 13px; display: inline-block; margin-top: var(--space-3); }
.btn.ghost { background: transparent; color: var(--accent); border: 1px solid var(--border); }
.bar { height: 8px; background: var(--bg-card-alt); border-radius: 6px; overflow: hidden; margin: var(--space-3) 0; }
.fill.indeterminate { width: 40%; height: 100%; background: var(--accent); animation: slide 1.2s infinite; }
@keyframes slide { 0% { margin-left: -40%; } 100% { margin-left: 100%; } }
.log { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); background: var(--bg-card-alt); padding: 12px; border-radius: var(--radius-sm); white-space: pre-wrap; max-height: 320px; overflow-y: auto; }
.player { width: 100%; border-radius: var(--radius-md); background: #000; }
.actions { display: flex; gap: var(--space-3); margin-top: var(--space-4); }
.error { color: var(--danger); }
</style>

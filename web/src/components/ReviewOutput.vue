<template>
  <div class="out">
    <!-- empty -->
    <div v-if="slot.status === 'idle'" class="empty">
      <div class="icon">📋</div>
      <p>Upload a document and select your review panel, then click Run Review.</p>
      <p class="sub">Each persona independently critiques the deck, then results are synthesized into consensus findings.</p>
    </div>

    <!-- running -->
    <div v-else-if="slot.status === 'running'" class="running">
      <div class="bar"><div class="fill" :style="{ width: pct + '%' }"></div></div>
      <div class="pctline">{{ pct }}%</div>
      <ul class="status">
        <li v-for="p in slot.personas" :key="p.slug">
          <span class="mark">{{ stateIcon(p.state) }}</span> {{ p.name }}
          <span class="dots"></span> <span class="st">{{ p.state }}</span>
        </li>
        <li v-if="hasSynthesis"><span class="mark">{{ synthIcon }}</span> Synthesis <span class="dots"></span>
          <span class="st">{{ synthState }}</span></li>
      </ul>
      <pre class="log">{{ slot.logs.slice(-12).join('\n') }}</pre>
    </div>

    <!-- results -->
    <div v-else-if="slot.status === 'done'" class="results">
      <div class="tabs">
        <button v-for="r in slot.reports" :key="r.slug"
                :class="{ active: active === r.slug }" @click="active = r.slug">{{ r.name }}</button>
      </div>
      <div class="content">
        <Markdown :source="activeReport?.content || ''" />
      </div>
      <div class="exportbar">
        <a class="btn" :href="`/api/export/${slot.slug}/${active}.docx`">📥 Export DOCX</a>
        <button class="btn ghost" @click="compare = !compare">🔀 Compare</button>
      </div>
    </div>

    <div v-else-if="slot.status === 'error'" class="error">
      <p>❌ {{ slot.error }}</p>
      <pre class="log">{{ slot.logs.slice(-10).join('\n') }}</pre>
    </div>

    <!-- compare overlay -->
    <div v-if="compare" class="overlay">
      <div class="ov-bar">
        Compare:
        <select v-model="cmpA"><option v-for="r in slot.reports" :key="r.slug" :value="r.slug">{{ r.name }}</option></select>
        vs
        <select v-model="cmpB"><option v-for="r in slot.reports" :key="r.slug" :value="r.slug">{{ r.name }}</option></select>
        <button class="btn ghost" @click="compare = false">✕ Close</button>
      </div>
      <div class="ov-body">
        <div class="ov-pane"><Markdown :source="byslug(cmpA)?.content || ''" /></div>
        <div class="ov-pane"><Markdown :source="byslug(cmpB)?.content || ''" /></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { store } from '../store.js';
import Markdown from './Markdown.vue';

const slot = computed(() => store.review);
const active = ref(null);
const compare = ref(false);
const cmpA = ref(null);
const cmpB = ref(null);

watch(() => slot.value.reports, reports => {
  if (reports.length && !reports.find(r => r.slug === active.value)) active.value = reports[0].slug;
  if (reports.length >= 2) { cmpA.value = reports[0].slug; cmpB.value = reports[1].slug; }
}, { deep: true });

const activeReport = computed(() => slot.value.reports.find(r => r.slug === active.value));
function byslug(s) { return slot.value.reports.find(r => r.slug === s); }

// A synthesis (merge) pass only runs when 2+ personas are reviewing.
const hasSynthesis = computed(() => slot.value.personas.length > 1);

const pct = computed(() => {
  const ps = slot.value.personas;
  if (!ps.length) return 5;
  const done = ps.filter(p => p.state === 'done' || p.state === 'error').length;
  const total = ps.length + (hasSynthesis.value ? 1 : 0);
  return Math.min(95, Math.round((done / total) * 100) || 5);
});
const synthState = computed(() => {
  const allDone = slot.value.personas.length && slot.value.personas.every(p => p.state === 'done' || p.state === 'error');
  return allDone ? 'running' : 'pending';
});
const synthIcon = computed(() => synthState.value === 'running' ? '◌' : '·');
function stateIcon(s) { return s === 'done' ? '✓' : s === 'running' ? '◌' : s === 'error' ? '✕' : '·'; }
</script>

<style scoped>
.out { height: 100%; overflow-y: auto; padding: var(--space-6); }
.empty { max-width: 460px; margin: 12% auto; text-align: center; color: var(--text-secondary); }
.empty .icon { font-size: 48px; }
.empty .sub { font-size: 13px; }
.bar { height: 10px; background: var(--bg-card-alt); border-radius: 6px; overflow: hidden; }
.fill { height: 100%; background: var(--accent); transition: width .3s; }
.pctline { font-weight: 600; margin: 6px 0 16px; }
.status { list-style: none; padding: 0; font-family: var(--font-mono); font-size: 13px; }
.status li { display: flex; align-items: center; gap: 8px; padding: 3px 0; }
.dots { flex: 1; border-bottom: 1px dotted var(--border); }
.st { color: var(--text-secondary); }
.log { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); background: var(--bg-card-alt); padding: 10px; border-radius: var(--radius-sm); white-space: pre-wrap; margin-top: 14px; }
.tabs { display: flex; gap: 4px; flex-wrap: wrap; border-bottom: 1px solid var(--border-card); margin-bottom: var(--space-4); }
.tabs button { background: none; border: none; padding: 8px 14px; cursor: pointer; color: var(--text-card-secondary); border-bottom: 2px solid transparent; font-size: 13px; }
.tabs button.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }
.content { background: var(--bg-card); border-radius: var(--radius-md); padding: var(--space-5); }
.exportbar { display: flex; gap: var(--space-3); margin-top: var(--space-4); }
.btn { background: var(--accent); color: #fff; border: none; border-radius: var(--radius-sm); padding: 8px 14px; cursor: pointer; text-decoration: none; font-size: 13px; }
.btn.ghost { background: transparent; color: var(--accent); border: 1px solid var(--border); }
.error { color: var(--danger); }
.overlay { position: fixed; inset: 0; background: var(--bg-body); z-index: 50; display: flex; flex-direction: column; }
.ov-bar { display: flex; align-items: center; gap: 10px; padding: var(--space-4); border-bottom: 1px solid var(--border); }
.ov-bar .btn { margin-left: auto; }
.ov-body { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); overflow: hidden; }
.ov-pane { background: var(--bg-card); overflow-y: auto; padding: var(--space-5); }
</style>

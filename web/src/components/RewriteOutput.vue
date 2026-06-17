<template>
  <div class="out">
    <div v-if="slot.status === 'idle'" class="empty">
      <div class="icon">✏️</div>
      <p>Upload a document and select a persona, then click Rewrite Deck.</p>
      <p class="sub">The persona rewrites every slide in its voice, with speaker notes. Missing data becomes [NEEDS: …] placeholders.</p>
    </div>

    <div v-else-if="slot.status === 'running'" class="running">
      <div class="bar"><div class="fill indeterminate"></div></div>
      <p>Rewriting…</p>
      <pre class="log">{{ slot.logs.slice(-12).join('\n') }}</pre>
    </div>

    <div v-else-if="slot.status === 'done'" class="results">
      <div class="head">Rewrite by: {{ report?.name?.replace(/ Rewrite$/, '') }}</div>
      <div class="tabs">
        <button v-for="(s, i) in slides" :key="i" :class="{ active: active === i }" @click="active = i">
          {{ s.title }}
        </button>
      </div>
      <div class="content">
        <Markdown :source="highlighted(slides[active]?.body || '')" />
      </div>
      <div v-if="placeholders.length" class="needs">
        Placeholders ({{ placeholders.length }}): {{ placeholders.join(' · ') }}
      </div>
      <div class="exportbar">
        <a class="btn" :href="`/api/export/${slot.slug}/${report.slug}.pptx`">📥 Export PPTX</a>
        <a class="btn ghost" :href="`/api/export/${slot.slug}/${report.slug}.docx`">📥 Export DOCX</a>
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
import { store } from '../store.js';
import Markdown from './Markdown.vue';

const slot = computed(() => store.rewrite);
const active = ref(0);

const report = computed(() => slot.value.reports.find(r => r.slug.startsWith('rewrite-')) || slot.value.reports[0]);

const slides = computed(() => {
  const md = report.value?.content || '';
  const out = [];
  for (const sec of md.split(/^## /m).slice(1)) {
    const nl = sec.indexOf('\n');
    const heading = (nl === -1 ? sec : sec.slice(0, nl)).trim();
    const body = nl === -1 ? '' : sec.slice(nl + 1).trim();
    const short = heading.replace(/^Slide\s+(\d+).*/i, 'Slide $1').slice(0, 16) || heading.slice(0, 16);
    out.push({ title: short, heading, body });
  }
  return out;
});

const placeholders = computed(() => {
  const md = report.value?.content || '';
  return [...md.matchAll(/\[NEEDS:\s*([^\]]+)\]/gi)].map(m => m[1].trim());
});

function highlighted(body) {
  return body.replace(/\*\*Speaker notes:?\*\*/i, '\n\n--- Speaker Notes ---\n');
}

watch(report, () => { active.value = 0; });
</script>

<style scoped>
.out { height: 100%; overflow-y: auto; padding: var(--space-6); }
.empty { max-width: 460px; margin: 12% auto; text-align: center; color: var(--text-secondary); }
.empty .icon { font-size: 48px; }
.empty .sub { font-size: 13px; }
.head { font-weight: 600; margin-bottom: var(--space-3); }
.tabs { display: flex; gap: 4px; overflow-x: auto; border-bottom: 1px solid var(--border-card); margin-bottom: var(--space-4); }
.tabs button { background: none; border: none; padding: 8px 12px; cursor: pointer; white-space: nowrap; color: var(--text-card-secondary); border-bottom: 2px solid transparent; font-size: 13px; }
.tabs button.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }
.content { background: var(--bg-card); border-radius: var(--radius-md); padding: var(--space-5); }
.needs { margin-top: var(--space-3); padding: 8px 12px; background: rgba(210,153,34,.12); border: 1px dashed var(--warning); border-radius: var(--radius-sm); font-size: 12px; color: var(--warning); }
.exportbar { display: flex; gap: var(--space-3); margin-top: var(--space-4); }
.btn { background: var(--accent); color: #fff; border: none; border-radius: var(--radius-sm); padding: 8px 14px; cursor: pointer; text-decoration: none; font-size: 13px; }
.btn.ghost { background: transparent; color: var(--accent); border: 1px solid var(--border); }
.bar { height: 8px; background: var(--bg-card-alt); border-radius: 6px; overflow: hidden; }
.fill.indeterminate { width: 40%; height: 100%; background: var(--accent); animation: slide 1.2s infinite; }
@keyframes slide { 0% { margin-left: -40%; } 100% { margin-left: 100%; } }
.log { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); background: var(--bg-card-alt); padding: 10px; border-radius: var(--radius-sm); white-space: pre-wrap; margin-top: 14px; }
.error { color: var(--danger); }
</style>

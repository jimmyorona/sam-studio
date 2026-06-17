<template>
  <div class="app">
    <!-- top bar -->
    <header class="topbar">
      <div class="title">SAM Slide Suite</div>
      <nav class="tabs" role="tablist">
        <button
          v-for="t in TABS" :key="t.id" role="tab"
          :class="{ active: store.mode === t.id }"
          :aria-selected="store.mode === t.id"
          @click="store.mode = t.id"
        >
          {{ t.label }}<span v-if="done[t.id]" class="check">✓</span>
        </button>
      </nav>
      <button class="gear" @click="showSettings = true" title="Settings">⚙️</button>
    </header>

    <!-- body -->
    <div class="body">
      <LeftPanel />
      <main class="right" role="tabpanel">
        <ReviewOutput v-show="store.mode === 'review'" />
        <RewriteOutput v-show="store.mode === 'rewrite'" />
        <NarrateOutput v-show="store.mode === 'narrate'" />
        <ProduceOutput v-show="store.mode === 'produce'" />
      </main>
    </div>

    <SettingsDrawer v-if="showSettings" @close="showSettings = false" />

    <!-- toasts -->
    <div class="toasts" aria-live="polite">
      <div v-for="t in store.toasts" :key="t.id" class="toast" :class="t.kind" @click="dismissToast(t.id)">
        {{ t.kind === 'success' ? '✅' : '❌' }} {{ t.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted, onBeforeUnmount } from 'vue';
import { store, dismissToast, loadPersonas, loadModels, loadVoices } from './store.js';
import LeftPanel from './components/LeftPanel.vue';
import ReviewOutput from './components/ReviewOutput.vue';
import RewriteOutput from './components/RewriteOutput.vue';
import NarrateOutput from './components/NarrateOutput.vue';
import ProduceOutput from './components/ProduceOutput.vue';
import SettingsDrawer from './components/SettingsDrawer.vue';

const TABS = [
  { id: 'review', label: 'Review' },
  { id: 'rewrite', label: 'Rewrite' },
  { id: 'narrate', label: 'Narrate' },
  { id: 'produce', label: 'Produce' },
];

const showSettings = ref(false);

// workflow checkmarks
const done = computed(() => ({
  review: store.review.status === 'done',
  rewrite: store.rewrite.status === 'done',
  narrate: store.narrate.status === 'done',
  produce: store.produce.status === 'done',
}));

// theme class on <body>
watchEffect(() => {
  document.body.className = `theme-${store.settings.theme}`;
});

// keyboard shortcuts (SCREEN-LAYOUT §16)
function onKey(e) {
  if (e.key === 'Escape') { showSettings.value = false; return; }
  if (e.ctrlKey && e.key >= '1' && e.key <= '4') {
    e.preventDefault();
    store.mode = TABS[Number(e.key) - 1].id;
  }
}

onMounted(async () => {
  window.addEventListener('keydown', onKey);
  await Promise.all([loadPersonas(), loadModels(), loadVoices('edge')]);
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style>
@import './theme.css';

.app { display: flex; flex-direction: column; height: 100%; }

.topbar {
  display: flex; align-items: center; gap: var(--space-5);
  background: var(--bg-chrome); border-bottom: 1px solid var(--border);
  padding: 0 var(--space-5); height: 52px; flex: 0 0 52px;
}
.title { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.tabs { display: flex; gap: 4px; background: var(--bg-panel); border-radius: 999px; padding: 4px; }
.tabs button {
  background: none; border: none; color: var(--text-secondary);
  padding: 6px 16px; border-radius: 999px; cursor: pointer; font-size: 14px; font-weight: 600;
}
.tabs button.active { background: var(--accent); color: #fff; }
.check { margin-left: 6px; color: var(--success); }
.tabs button.active .check { color: #fff; }
.gear { margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer; }

.body { flex: 1; display: flex; min-height: 0; }
.right { flex: 1; min-width: 0; background: var(--bg-body); }

.toasts { position: fixed; top: var(--space-4); right: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); z-index: 80; }
.toast { padding: 10px 16px; border-radius: var(--radius-sm); cursor: pointer; box-shadow: var(--shadow); font-size: 13px; color: #fff; }
.toast.success { background: var(--success); }
.toast.error { background: var(--danger); }

@media (max-width: 900px) {
  .body { flex-direction: column; }
}
</style>

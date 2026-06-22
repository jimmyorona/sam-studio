<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="drawer">
      <div class="d-head">
        <h3>⚙️ Settings</h3>
        <button class="x" @click="$emit('close')">✕</button>
      </div>

      <label class="field">Model Provider
        <select v-model="store.settings.provider" @change="loadModels">
          <option value="ollama">Ollama</option>
          <option value="gemini">Google Gemini</option>
        </select>
      </label>

      <div v-if="store.settings.provider === 'ollama'">
        <label class="field">Ollama URL
          <input type="text" v-model="store.settings.ollamaUrl" /></label>
      </div>

      <div v-if="store.settings.provider === 'gemini'">
        <label class="field">Gemini API Key
          <input type="password" v-model="store.settings.geminiApiKey" /></label>
      </div>

      <div class="field">Default Model
        <div class="model-row">
          <select v-model="store.settings.model">
            <option v-for="m in store.models" :key="m" :value="m">{{ m }}</option>
          </select>
          <button v-if="store.settings.provider === 'ollama'" class="refresh" :disabled="refreshingModels" title="Reload models from Ollama"
                  @click="refreshModels">{{ refreshingModels ? '…' : '⟳' }}</button>
        </div>
        <div v-if="store.settings.provider === 'ollama' && store.modelError" class="model-err">{{ store.modelError }}</div>
      </div>

      <div class="field">Theme
        <div class="radios">
          <label><input type="radio" value="mixed" v-model="store.settings.theme" /> Mixed</label>
          <label><input type="radio" value="light" v-model="store.settings.theme" /> Light</label>
          <label><input type="radio" value="dark" v-model="store.settings.theme" /> Dark</label>
        </div>
      </div>

      <label class="field">Review Concurrency
        <input type="number" min="1" max="8" v-model.number="store.settings.concurrency" /></label>

      <label class="field">TTS Provider
        <select v-model="store.settings.ttsProvider">
          <option value="edge">Edge TTS</option>
          <option value="elevenlabs">ElevenLabs</option>
          <option value="supertonic">Supertonic</option>
        </select>
      </label>

      <label class="field">ElevenLabs Key
        <input type="password" v-model="store.settings.elApiKey" /></label>

      <div class="actions">
        <button class="btn" @click="save">Save</button>
        <button class="btn ghost" @click="resetDefaults">Reset Defaults</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { store, persistSettings, loadModels, toast } from '../store.js';

const emit = defineEmits(['close']);

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

async function save() {
  persistSettings();
  await loadModels();
  toast('Settings saved');
  emit('close');
}

function resetDefaults() {
  store.settings.provider = 'ollama';
  store.settings.geminiApiKey = '';
  store.settings.ollamaUrl = 'http://localhost:11434';
  store.settings.model = 'llama3.2:3b';
  store.settings.theme = 'mixed';
  store.settings.concurrency = 3;
  store.settings.ttsProvider = 'edge';
  store.settings.elApiKey = '';
  persistSettings();
  loadModels();
}
</script>

<style scoped>
.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 60; display: flex; justify-content: flex-end; }
.drawer { width: 360px; max-width: 90vw; height: 100%; background: var(--bg-chrome); border-left: 1px solid var(--border); padding: var(--space-5); overflow-y: auto; }
.d-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.d-head h3 { margin: 0; }
.x { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 16px; }
.field { display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: var(--space-4); }
.field input, .field select { display: block; width: 100%; margin-top: 4px; background: var(--bg-panel); color: var(--text-primary); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px; }
.model-row { display: flex; gap: var(--space-2); margin-top: 4px; }
.model-row select { flex: 1; margin-top: 0; }
.refresh {
  flex: 0 0 auto; background: transparent; border: 1px solid var(--border);
  color: var(--accent); border-radius: var(--radius-sm); width: 36px; cursor: pointer; font-size: 15px;
}
.refresh:disabled { opacity: .5; cursor: progress; }
.model-err { font-size: 11px; color: var(--danger); margin-top: 4px; }
.radios { display: flex; gap: var(--space-4); margin-top: 6px; }
.radios label { color: var(--text-primary); }
.actions { display: flex; gap: var(--space-3); margin-top: var(--space-5); }
.btn { background: var(--accent); color: #fff; border: none; border-radius: var(--radius-sm); padding: 9px 16px; cursor: pointer; }
.btn.ghost { background: transparent; color: var(--accent); border: 1px solid var(--border); }
</style>

<template>
  <div class="md" v-html="html"></div>
</template>

<script setup>
import { computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const props = defineProps({ source: { type: String, default: '' } });

// Inline severity badges (SCREEN-LAYOUT §3.3) before markdown parsing.
const SEVERITY = {
  critical: '🔴', high: '🟠', major: '🟠', medium: '🟡',
  minor: '🟡', low: '🔵', suggestion: '⚪',
};
function badge(text) {
  return text.replace(/\*\*Severity:\*\*\s*([A-Za-z]+)/g, (_, sev) => {
    const icon = SEVERITY[sev.toLowerCase()] || '';
    return `**Severity:** ${icon} ${sev}`;
  });
}

const html = computed(() =>
  DOMPurify.sanitize(marked.parse(badge(props.source || ''), { breaks: true, gfm: true }))
);
</script>

<style scoped>
.md { color: var(--text-card); line-height: 1.6; font-size: 14px; }
.md :deep(h1) { font-size: 22px; margin: 0 0 12px; }
.md :deep(h2) { font-size: 18px; margin: 20px 0 10px; }
.md :deep(h3) { font-size: 15px; margin: 16px 0 8px; }
.md :deep(p) { margin: 8px 0; }
.md :deep(ul), .md :deep(ol) { padding-left: 22px; margin: 8px 0; }
.md :deep(li) { margin: 4px 0; }
.md :deep(blockquote) {
  border-left: 3px solid var(--accent);
  margin: 10px 0; padding: 4px 14px; color: var(--text-card-secondary);
}
.md :deep(code) {
  font-family: var(--font-mono); font-size: 13px;
  background: var(--bg-card-alt); padding: 1px 5px; border-radius: 4px;
}
.md :deep(pre) { background: var(--bg-card-alt); padding: 12px; border-radius: var(--radius-sm); overflow-x: auto; }
.md :deep(table) { border-collapse: collapse; margin: 12px 0; width: 100%; }
.md :deep(th), .md :deep(td) { border: 1px solid var(--border-card); padding: 6px 10px; text-align: left; }
.md :deep(th) { background: var(--bg-card-alt); }
.md :deep(a) { color: var(--accent); }
</style>

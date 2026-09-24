<script setup>
import { computed, onUnmounted, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { projects, posts } from '../content.js'
import { setSignature } from '../wave.js'

// One page for a project spec sheet, a post, and anything that is not found.
const props = defineProps({ kind: String, slug: String })

const list = computed(() =>
  props.kind === 'work' ? projects : props.kind === 'writing' ? posts : [],
)
const index = computed(() => list.value.findIndex((i) => i.slug === props.slug))
const item = computed(() => list.value[index.value])
const back = computed(() =>
  props.kind === 'writing' ? { to: '/writing', label: 'writing' } : { to: '/', label: 'index' },
)

// Spec sheet: the known fields first, then every other frontmatter key as its
// own row, so adding `client: ...` to a file adds a row with no code change.
const SHOWN = new Set(['title', 'summary', 'slug', 'html', 'sig', 'order', 'year', 'date', 'stack'])
const specs = computed(() => {
  const i = item.value
  if (!i) return []
  return [
    ['year', i.year],
    ['date', i.date],
    ['stack', i.stack],
    ...Object.entries(i).filter(([k]) => !SHOWN.has(k)),
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => [k, [].concat(v).join(' / ')])
})

// The band takes on this project's shape while you read about it.
watchEffect(() => setSignature(item.value?.sig ?? null))
onUnmounted(() => setSignature(null))

const title = computed(() => `${item.value?.title ?? 'Not found'} — Jake Martinez`)
const description = computed(() => item.value?.summary ?? 'Nothing at this address.')
useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
  ],
})

const pad = (n) => String(n).padStart(2, '0')
</script>

<template>
  <article :key="slug" class="entry rise">
    <nav class="label">
      <RouterLink :to="back.to">← {{ back.label }}</RouterLink>
      <span v-if="item" class="count">{{ pad(index + 1) }} / {{ pad(list.length) }}</span>
    </nav>

    <template v-if="item">
      <h1 class="display">{{ item.title }}</h1>
      <p v-if="item.summary" class="summary">{{ item.summary }}</p>

      <dl v-if="specs.length" class="specs">
        <div v-for="[k, v] in specs" :key="k" class="spec">
          <dt>{{ k }}</dt>
          <dd>
            <a v-if="v.startsWith('http')" :href="v" target="_blank" rel="noopener">{{
              v.replace(/^https?:\/\//, '')
            }}</a>
            <template v-else>{{ v }}</template>
          </dd>
        </div>
      </dl>

      <!-- Markdown from src/content, written by the site owner: trusted. -->
      <div class="prose" v-html="item.html"></div>
    </template>

    <template v-else>
      <h1 class="display">Not found</h1>
      <p class="summary">Nothing at this address.</p>
    </template>
  </article>
</template>

<style scoped>
.entry {
  max-width: 42rem;
  padding: 1rem 0 3rem;
}

.summary {
  margin: 0 0 2rem;
  font-size: 0.8rem;
  line-height: 1.9;
  letter-spacing: 0.04em;
  color: var(--accent-2);
}

.specs {
  margin: 0 0 2.5rem;
  border-top: 1px solid var(--rule);
}

.spec {
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 1rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--rule);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
}

.spec dt {
  text-transform: uppercase;
  color: var(--muted);
}

.spec dd {
  margin: 0;
}

.spec a,
.prose :deep(a) {
  color: var(--accent);
  text-decoration-color: rgb(var(--accent-rgb) / 35%);
  text-underline-offset: 3px;
}

.prose {
  font-size: 0.74rem;
  line-height: 1.95;
  letter-spacing: 0.03em;
}

.prose :deep(h2),
.prose :deep(h3) {
  margin: 2.5rem 0 0.8rem;
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
}

.prose :deep(p),
.prose :deep(ul),
.prose :deep(ol) {
  margin: 0 0 1.1rem;
}

.prose :deep(code) {
  padding: 0.1em 0.35em;
  border: 1px solid var(--rule);
  font-family: inherit;
  font-size: 0.92em;
}

.prose :deep(pre) {
  overflow-x: auto;
  padding: 1rem;
  border: 1px solid var(--rule);
}

.prose :deep(pre code) {
  padding: 0;
  border: 0;
}

.prose :deep(blockquote) {
  margin: 0 0 1.1rem;
  padding-left: 1rem;
  border-left: 1px solid var(--accent-2);
  color: var(--muted);
}

.prose :deep(img) {
  max-width: 100%;
  height: auto;
}

@media (max-width: 640px) {
  .spec {
    grid-template-columns: 5.5rem 1fr;
  }
}
</style>

<script setup>
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { posts } from '../content.js'

const description = 'Notes and longer writing by Jake Martinez.'
useHead({
  title: 'Writing — Jake Martinez',
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: 'Writing — Jake Martinez' },
    { property: 'og:description', content: description },
  ],
})

const pad = (n) => String(n).padStart(2, '0')
</script>

<template>
  <section class="writing rise">
    <nav class="label">
      <RouterLink to="/">← index</RouterLink>
      <span class="count">{{ pad(posts.length) }}</span>
    </nav>
    <h1 class="display">Writing</h1>

    <ul v-if="posts.length" class="posts">
      <li v-for="p in posts" :key="p.slug">
        <RouterLink class="post" :to="`/writing/${p.slug}`">
          <span class="date">{{ p.date }}</span>
          <span class="post-title">{{ p.title }}</span>
          <span v-if="p.summary" class="post-summary">{{ p.summary }}</span>
        </RouterLink>
      </li>
    </ul>
    <p v-else class="empty">Nothing yet.</p>
  </section>
</template>

<style scoped>
.writing {
  max-width: 42rem;
  padding: 1rem 0 3rem;
}

.posts {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
}

.post {
  display: grid;
  grid-template-columns: 6.5rem 1fr;
  gap: 0.3rem 1rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--rule);
  color: inherit;
  text-decoration: none;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.date {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  color: var(--muted);
  transition: color 0.25s ease;
}

.post-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-size: 1.4rem;
  line-height: 1.1;
}

.post-summary {
  grid-column: 2;
  font-size: 0.64rem;
  line-height: 1.8;
  color: var(--muted);
}

.post:focus-visible {
  outline: none;
  transform: translateX(5px);
}

.post:focus-visible .date {
  color: var(--accent);
}

@media (hover: hover) {
  .post:hover {
    transform: translateX(5px);
  }

  .post:hover .date {
    color: var(--accent);
  }
}

.empty {
  font-size: 0.7rem;
  color: var(--muted);
}

@media (max-width: 640px) {
  .post {
    grid-template-columns: 1fr;
  }

  .post-summary {
    grid-column: 1;
  }
}
</style>

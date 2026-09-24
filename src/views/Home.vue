<script setup>
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { projects, posts } from '../content.js'
import { setSignature } from '../wave.js'

const NAME = ['Jake', 'Martinez']
const CONTACT = [
  { label: 'email', href: '#' },
  { label: 'github', href: 'https://github.com/JakeMartinezz' },
]

// Projects come from src/content/work/*.md; the last row is the writing index.
const WORK = [
  ...projects.map((p) => ({
    title: p.title,
    stack: [].concat(p.stack ?? []),
    year: String(p.year ?? '—').slice(-2),
    to: `/work/${p.slug}`,
    sig: p.sig,
  })),
  { title: 'Writing', stack: ['notes'], year: posts[0]?.date.slice(2, 4) ?? '—', to: '/writing' },
]

const description = 'Jake Martinez, design engineer. Selected work and writing.'
useHead({
  title: 'Jake Martinez',
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: 'Jake Martinez' },
    { property: 'og:description', content: description },
  ],
})

const pad = (n) => String(n).padStart(2, '0')
</script>

<template>
  <div class="home">
    <!-- The visible name sits at the bottom; screen readers get it first. -->
    <h1 class="sr-only">Jake Martinez, design engineer</h1>

    <section class="middle">
      <div class="brief">
        <h2 class="label"><span>Now</span></h2>
        <p class="brief-text">
          Building small, fast tools — mostly Vue, Rust and whatever the
          problem actually needs.
        </p>
        <p class="brief-status">
          <span class="dot" aria-hidden="true"></span>
          open to select work
        </p>
      </div>

      <section class="index">
        <h2 class="label">
          <span>Selected work</span>
          <span class="count">{{ pad(WORK.length) }}</span>
        </h2>
        <ul class="work" @mouseleave="setSignature(null)" @focusout="setSignature(null)">
          <li
            v-for="(item, i) in WORK"
            :key="item.to"
            class="work-row"
            @mouseenter="setSignature(item.sig)"
            @focusin="setSignature(item.sig)"
          >
            <RouterLink class="work-link" :to="item.to">
              <span class="num">{{ pad(i + 1) }}</span>
              <span class="work-title">{{ item.title }}</span>
              <span class="tags">
                <span v-for="t in item.stack" :key="t" class="tag">{{ t }}</span>
              </span>
              <span class="year">{{ item.year }}</span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </section>

    <footer class="foot">
      <p class="name" aria-hidden="true">
        <span
          v-for="(word, i) in NAME"
          :key="word"
          class="name-line"
          :style="{ '--d': `${i * 90}ms` }"
          >{{ word }}</span
        >
      </p>
      <nav class="contact" aria-label="Contact">
        <a
          v-for="link in CONTACT"
          :key="link.label"
          class="contact-link"
          :href="link.href"
          :target="link.href.startsWith('http') ? '_blank' : null"
          :rel="link.href.startsWith('http') ? 'noopener' : null"
        >
          {{ link.label }}
        </a>
      </nav>
    </footer>
  </div>
</template>

<style scoped>
@property --r1 {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

@property --r2 {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

.home {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 1.75rem;
}

/* --- brief left, work index right --- */
.middle {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 3rem;
}

.brief {
  max-width: 24rem;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.7s ease 0.25s,
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.25s;
}

.ready .brief {
  opacity: 1;
  transform: none;
}

.brief-text {
  margin: 0 0 1.1rem;
  font-size: 0.72rem;
  line-height: 1.9;
  letter-spacing: 0.06em;
  color: var(--fg);
}

.brief-status {
  margin: 0 0 1.5rem;
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  color: var(--accent-2);
}

.index {
  width: min(28rem, 100%);
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.7s ease 0.15s,
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
}

.ready .index {
  opacity: 1;
  transform: none;
}

.work {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
}

.work-row {
  border-bottom: 1px solid var(--rule);
  transition:
    opacity 0.35s ease,
    background 0.35s ease,
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Hovering or tabbing to one row pushes the others back — focus, not
   decoration. Pure CSS; hover is gated so a tap on touch does not leave the
   list stuck dimmed. */
.work:has(.work-link:focus-visible) .work-row:not(:focus-within) {
  opacity: 0.3;
}

.work-row:focus-within {
  background: linear-gradient(90deg, transparent, rgb(var(--accent-rgb) / 5%));
  transform: translateX(5px);
}

@media (hover: hover) {
  .work:hover .work-row:not(:hover) {
    opacity: 0.3;
  }

  .work-row:hover {
    background: linear-gradient(90deg, transparent, rgb(var(--accent-rgb) / 5%));
    transform: translateX(5px);
  }
}

.work-link {
  display: grid;
  grid-template-columns: 1.9rem 1fr auto 1.8rem;
  align-items: baseline;
  gap: 0.7rem;
  padding: 0.8rem 0.5rem 0.8rem 0;
  color: inherit;
  text-decoration: none;
}

/* The row itself is the focus indicator: it slides, lights up, dims the rest. */
.work-link:focus-visible {
  outline: none;
}

.num,
.year {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  color: var(--muted);
  transition: color 0.25s ease;
}

.year {
  text-align: right;
}

.work-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-size: 1.4rem;
  letter-spacing: 0.01em;
}

.tags {
  display: flex;
  gap: 0.35rem;
}

.tag {
  padding: 0.1rem 0.4rem;
  border: 1px solid var(--rule);
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  color: var(--muted);
  transition:
    border-color 0.25s ease,
    color 0.25s ease;
}

.work-row:hover .num,
.work-row:hover .year,
.work-link:focus-visible .num,
.work-link:focus-visible .year {
  color: var(--accent);
}

.work-row:hover .tag,
.work-link:focus-visible .tag {
  border-color: rgb(var(--accent-rgb) / 30%);
  color: var(--accent-2);
}

/* --- name, pinned bottom left --- */
.foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

/* The gradient is clipped to the glyphs, so the padding box has to be big
   enough to hold the italic's overhang — otherwise the ink falls outside the
   painted area and the letters get cut. Negative margins keep the layout put. */
.name {
  margin: -0.16em -0.12em;
  padding: 0.16em 0.12em;
  display: flex;
  flex-direction: column;
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  /* Scales with height too, so short laptop screens still fit on one viewport. */
  font-size: clamp(3.25rem, min(12vw, 15vh), 10rem);
  line-height: 0.96;
  letter-spacing: -0.01em;
  background: linear-gradient(98deg, var(--fg) 22%, var(--accent) 72%, var(--accent-2) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 44px rgb(var(--accent-rgb) / 10%));
  /* Two mask layers, one per line, each sweeping on its own clock. The
     background stays on .name so both words share a single colour ramp. */
  --mask: linear-gradient(96deg, #000 var(--r1), transparent calc(var(--r1) + 22%)),
    linear-gradient(96deg, #000 var(--r2), transparent calc(var(--r2) + 22%));
  -webkit-mask-image: var(--mask);
  mask-image: var(--mask);
  -webkit-mask-size: 100% 50%;
  mask-size: 100% 50%;
  -webkit-mask-position:
    0 0,
    0 100%;
  mask-position:
    0 0,
    0 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  transition:
    --r1 1.6s cubic-bezier(0.22, 1, 0.36, 1) 0.3s,
    --r2 1.6s cubic-bezier(0.22, 1, 0.36, 1) 0.45s;
}

.ready .name {
  --r1: 122%;
  --r2: 122%;
}

.name-line {
  display: block;
}

.name-line:last-child {
  padding-left: 0.6em;
}

/* --- contact --- */
.contact {
  display: flex;
  gap: 1.25rem;
  padding-bottom: 0.6em;
}

.contact-link {
  position: relative;
  font-size: 0.63rem;
  letter-spacing: 0.16em;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.25s ease;
}

.contact-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 100%;
  height: 1px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.contact-link:hover,
.contact-link:focus-visible {
  color: var(--accent);
}

.contact-link:hover::after,
.contact-link:focus-visible::after {
  transform: scaleX(1);
}

@media (max-width: 640px) {
  .middle {
    grid-template-columns: minmax(0, 1fr);
    gap: 2.25rem;
  }

  .name-line:last-child {
    padding-left: 0.3em;
  }
}
</style>

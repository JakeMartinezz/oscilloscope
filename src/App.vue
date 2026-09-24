<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import * as wave from './wave.js'

const ROLE = 'design engineer'
const PLACE = 'utc-3'
const GITHUB = 'JakeMartinezz'
const BUILD = __BUILD_ID__

useHead({
  meta: [
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Jake Martinez' },
    { name: 'twitter:card', content: 'summary' },
  ],
})

const route = useRoute()
const page = ref(null)
const coordsEl = ref(null)
const canvasEl = ref(null)
const ready = ref(false)
const clock = ref('--:--:--')
const fps = ref(null)
const viewport = ref('0×0')
const push = ref(null)

const pad = (n, w = 4) => String(n).padStart(w, '0')

// CSS owns the scale; read it back on mount so pointer maths and the canvas
// buffer agree with what is on screen. Nothing here touches window at module
// scope: this file is also rendered at build time.
let zoom = 1
let last = null

// Glow position and readout are written to the DOM directly:
// pointer movement never triggers a Vue re-render.
function trackPointer(e) {
  // clientX is viewport px; inside the zoomed subtree one local px is zoom
  // screen px, so divide or the glow lands past the cursor.
  page.value?.style.setProperty('--mx', `${e.clientX / zoom}px`)
  page.value?.style.setProperty('--my', `${e.clientY / zoom}px`)
  if (coordsEl.value) {
    coordsEl.value.textContent = `x:${pad(e.clientX)} y:${pad(e.clientY)}`
  }
  if (last) wave.kick(Math.hypot(e.clientX - last.x, e.clientY - last.y))
  last = { x: e.clientX, y: e.clientY }
}

const measure = () => (viewport.value = `${window.innerWidth}×${window.innerHeight}`)
const onResize = () => {
  measure()
  wave.resize()
}
const readAccent = () =>
  wave.setStroke(getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb'))

function ago(iso) {
  const m = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000))
  return m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`
}

// Last public push, straight from the GitHub API. Unauthenticated, 60 req/h
// per visitor IP, which one request per visit never gets near. Fails silent.
async function loadPush() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB}/events/public?per_page=30`)
    if (!res.ok) return
    const e = (await res.json()).find((e) => e.type === 'PushEvent')
    if (e) {
      push.value = {
        repo: e.repo.name.split('/').pop(),
        url: `https://github.com/${e.repo.name}`,
        ago: ago(e.created_at),
      }
    }
  } catch {}
}

let raf
let tick
let scheme
onMounted(() => {
  zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zoom')) || 1
  wave.attach(canvasEl.value, zoom, matchMedia('(prefers-reduced-motion: reduce)').matches)
  readAccent()
  // The stroke colour lives in CSS; re-read it when the theme flips.
  scheme = matchMedia('(prefers-color-scheme: light)')
  scheme.addEventListener('change', readAccent)
  measure()
  window.addEventListener('resize', onResize)

  const setClock = () => {
    // Jake's time, not the visitor's: the label next to it says utc-3.
    // IANA 'Etc/GMT+3' is UTC-3 (the sign is inverted by POSIX convention).
    clock.value = new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Etc/GMT+3' })
  }
  setClock()
  tick = setInterval(setClock, 1000)

  let frames = 0
  let since = performance.now()
  let prev = performance.now()
  const loop = (now) => {
    frames++
    const dt = Math.min((now - prev) / 1000, 0.1) // clamp, so a stalled tab does not jump
    prev = now
    wave.frame(dt)

    if (now - since >= 1000) {
      // Keep the last real number when the tab is hidden and rAF stops:
      // a frozen count is honest, a 0 reads as broken.
      if (frames > 0) fps.value = Math.round((frames * 1000) / (now - since))
      frames = 0
      since = now
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)

  requestAnimationFrame(() => (ready.value = true))
  loadPush()
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  scheme?.removeEventListener('change', readAccent)
  clearInterval(tick)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div ref="page" class="page" :class="{ ready }" @pointermove="trackPointer">
    <!-- instrument chrome, fixed to the viewport -->
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="glow" aria-hidden="true"></div>
    <div class="grain" aria-hidden="true"></div>
    <div class="band" aria-hidden="true">
      <!-- Only on the home page: elsewhere it lands on top of body text. -->
      <span v-if="route.path === '/'" class="band-label">[ activity ]</span>
      <canvas ref="canvasEl" class="wave"></canvas>
    </div>

    <div class="ruler ruler-x" aria-hidden="true"></div>
    <div class="ruler ruler-y" aria-hidden="true"></div>
    <span v-for="c in 4" :key="c" :class="`bracket b${c}`" aria-hidden="true"></span>

    <header class="bar bar-top">
      <RouterLink to="/" class="mark" aria-label="Jake Martinez, home">JM</RouterLink>
      <span class="meta">[ {{ ROLE }} ]</span>
      <span class="meta right">
        <span class="dot" aria-hidden="true"></span>
        online / {{ PLACE }} {{ clock }}
      </span>
    </header>

    <main class="main">
      <RouterView />
    </main>

    <div class="bar bar-status">
      <span ref="coordsEl" class="readout pointer-only">x:0000 y:0000</span>
      <span class="readout">vw:{{ viewport }}</span>
      <span class="readout pointer-only">{{ fps ?? '--' }}fps</span>
      <a v-if="push" class="readout" :href="push.url" target="_blank" rel="noopener"
        >push:{{ push.repo }} {{ push.ago }} ago</a
      >
      <span class="readout right">build {{ BUILD }}</span>
    </div>
  </div>
</template>

<style scoped>
.page {
  --mx: 50vw;
  --my: 55vh;
  position: relative;
  min-height: calc(100svh / var(--zoom));
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: clamp(1.5rem, 3vw, 2.75rem);
  gap: 1.75rem;
  /* Rows slide right on hover; never let that become a horizontal scroll. */
  overflow-x: clip;
}

.main {
  position: relative;
  z-index: 2;
  display: grid;
}

/* --- chrome: grid, glow, grain, band, rulers, corner brackets ---
   All fixed, so the frame stays on the viewport while long pages scroll. */
.grid-bg,
.glow,
.grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

/* Ambient waveform across the middle. Drifts on its own, swells with the
   pointer, eases back to rest. Logic in src/wave.js. */
.band {
  position: fixed;
  left: 0;
  right: 0;
  top: 50%;
  height: clamp(130px, 20vh, 260px);
  translate: 0 -50%;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.4s ease 0.5s;
}

.ready .band {
  opacity: 1;
}

.band-label {
  position: absolute;
  top: 0;
  left: clamp(1.5rem, 3vw, 2.75rem);
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  color: var(--muted);
  opacity: 0.5;
}

.wave {
  display: block;
  width: 100%;
  height: 100%;
}

.ruler {
  position: fixed;
  background-repeat: repeat;
  opacity: 0;
  transition: opacity 0.9s ease 0.4s;
}

.ready .ruler {
  opacity: 0.5;
}

.ruler-x {
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background-image: repeating-linear-gradient(
    to right,
    var(--accent-2) 0 1px,
    transparent 1px 12px
  );
}

.ruler-y {
  top: 0;
  bottom: 0;
  left: 0;
  width: 6px;
  background-image: repeating-linear-gradient(
    to bottom,
    var(--accent-2) 0 1px,
    transparent 1px 12px
  );
}

/* Blueprint grid: hairlines every 16px, heavier rules every 96px. */
.grid-bg {
  background-image:
    linear-gradient(rgb(var(--accent-rgb) / 6%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--accent-rgb) / 6%) 1px, transparent 1px),
    linear-gradient(rgb(var(--accent-rgb) / 2%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--accent-rgb) / 2%) 1px, transparent 1px);
  background-size:
    96px 96px,
    96px 96px,
    16px 16px,
    16px 16px;
  mask-image: radial-gradient(95% 80% at 26% 74%, #000 4%, transparent 62%);
  opacity: 0;
  transition: opacity 1.2s ease 0.2s;
}

/* One knob for how present the grid is. 0.55 is barely-there on purpose. */
.ready .grid-bg {
  opacity: 0.55;
}

/* Soft light around the pointer. Two knobs: the radius and the alpha. */
.glow {
  background: radial-gradient(
    600px circle at var(--mx) var(--my),
    rgb(var(--glow-rgb) / 3%),
    transparent 60%
  );
}

.grain {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.035;
  mix-blend-mode: overlay;
}

.bracket {
  position: fixed;
  width: 14px;
  height: 14px;
  border: 1px solid var(--accent-2);
  opacity: 0;
  transition: opacity 0.6s ease 0.5s;
}

.ready .bracket {
  opacity: 0.55;
}

.b1 {
  top: 14px;
  left: 14px;
  border-right: 0;
  border-bottom: 0;
}
.b2 {
  top: 14px;
  right: 14px;
  border-left: 0;
  border-bottom: 0;
}
.b3 {
  bottom: 14px;
  left: 14px;
  border-right: 0;
  border-top: 0;
}
.b4 {
  bottom: 14px;
  right: 14px;
  border-left: 0;
  border-top: 0;
}

/* --- bars --- */
.bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: baseline;
  gap: 1.25rem;
}

.bar-top {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--rule);
}

.meta {
  white-space: nowrap;
  font-size: 0.63rem;
  letter-spacing: 0.14em;
  color: var(--muted);
}

.mark {
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  color: var(--accent);
  text-decoration: none;
}

.right {
  margin-left: auto;
}

.bar-status {
  gap: 1.5rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--rule);
  opacity: 0;
  transition: opacity 0.8s ease 0.45s;
}

.ready .bar-status {
  opacity: 1;
}

.readout {
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.25s ease;
}

a.readout:hover {
  color: var(--accent);
}

/* No cursor, no coordinates: x/y and fps only mean something with a pointer. */
@media (hover: none) {
  .pointer-only {
    display: none;
  }
}

@media (max-width: 640px) {
  /* The role and the clock do not fit on one line; the clock wins. */
  .bar-top .meta:not(.right),
  .band-label {
    display: none;
  }

  .bracket {
    display: none;
  }

  .grid-bg {
    background-size:
      64px 64px,
      64px 64px,
      16px 16px,
      16px 16px;
  }

  .bar-status {
    gap: 0.9rem;
    flex-wrap: wrap;
  }
}
</style>

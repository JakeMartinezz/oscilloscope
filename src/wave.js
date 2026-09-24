// Ambient waveform across the middle of the page. One band per page, so this
// module is the state: App drives frame(), views call setSignature().

// Value noise. hash() is deterministic per integer node but seeded per load,
// so the wave never repeats and is different every visit.
const SEED = Math.random() * 1000

function hash(i) {
  const s = Math.sin((i + SEED) * 127.1) * 43758.5453
  return s - Math.floor(s)
}

function octave(x) {
  const i = Math.floor(x)
  const f = x - i
  const t = f * f * (3 - 2 * f) // smoothstep, so nodes join without corners
  return (hash(i) * (1 - t) + hash(i + 1) * t) * 2 - 1
}

const REST = { k: 1, rough: 0 }
let target = REST
let k = 1
let rough = 0

// Three octaves: long swell, mid ripple, fine texture. `rough` moves weight
// from the swell to the texture; the weights always sum to 1.
function noise(x) {
  return (
    octave(x / 1050) * (0.74 - rough) +
    octave(x / 380 + 9.3) * 0.2 +
    octave(x / 160 + 21.7) * (0.06 + rough)
  )
}

let canvas = null
let zoom = 1
let still = false
let worldX = Math.random() * 1e5
let amp = 1
let stroke = 'rgba(157,246,202,0.16)'
let dirty = true

export function attach(el, z, reduced) {
  canvas = el
  zoom = z
  still = reduced
  resize()
}

export function resize() {
  if (!canvas) return
  // devicePixelRatio ignores CSS zoom, so fold it in or the line renders soft.
  const dpr = Math.min(window.devicePixelRatio || 1, 2) * zoom
  canvas.width = Math.round(canvas.clientWidth * dpr)
  canvas.height = Math.round(canvas.clientHeight * dpr)
  canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
  dirty = true
}

// Space-separated channels, as stored in --accent-rgb.
export function setStroke(rgb) {
  stroke = `rgba(${rgb.trim().split(/\s+/).join(',')},0.16)`
  dirty = true
}

// Pointer speed swells the amplitude, so the band answers to the cursor.
export function kick(speed) {
  if (!still) amp = Math.min(2.4, amp + speed / 260)
}

export function setSignature(sig) {
  target = sig ?? REST
  dirty = true
}

export function frame(dt) {
  if (!canvas) return
  if (still) {
    // Reduced motion: no drift, no easing, and only redraw when something changed.
    if (!dirty) return
    k = target.k
    rough = target.rough
  } else {
    worldX += dt * 190 // px per second
    k += (target.k - k) * 0.06
    rough += (target.rough - rough) * 0.06
    amp += (1 - amp) * 0.045 // eases back to rest every frame
  }
  dirty = false

  const ctx = canvas.getContext('2d')
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  // Cap the swell at whatever still fits inside the canvas, so a fast pointer
  // never pushes the peaks past the edge and clips them.
  const reach = h * 0.3
  const a = Math.min(amp, (h / 2 - 2) / reach)

  ctx.clearRect(0, 0, w, h)
  ctx.beginPath()
  for (let x = 0; x <= w; x += 3) {
    // Stretch around the centre, so a signature change morphs in place.
    const y = h / 2 + noise(worldX + (x - w / 2) * k) * reach * a
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1.2
  ctx.stroke()
}

import { marked } from 'marked'
import { parse } from './frontmatter.js'

// Markdown in src/content/, bundled at build time. The filename is the slug.
function load(files) {
  return Object.entries(files).map(([path, raw]) => {
    const { meta, body } = parse(raw)
    const slug = path.split('/').pop().replace(/\.md$/, '')
    return { ...meta, slug, html: marked.parse(body) }
  })
}

// Each project gets its own wave shape, derived from its slug so it is stable
// across visits: k stretches the wave, rough shifts weight to the fine octave.
function signature(slug) {
  let h = 0
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return { k: 0.55 + ((h % 1000) / 1000) * 1.5, rough: (((h >>> 10) % 1000) / 1000) * 0.3 }
}

// Glob options must be literals: Vite reads them at build time.
export const projects = load(import.meta.glob('./content/work/*.md', { query: '?raw', import: 'default', eager: true }))
  .map((p) => ({ ...p, sig: signature(p.slug) }))
  // Optional `order:` wins; otherwise newest year first.
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || String(b.year).localeCompare(String(a.year)))

export const posts = load(import.meta.glob('./content/writing/*.md', { query: '?raw', import: 'default', eager: true })).sort((a, b) =>
  String(b.date).localeCompare(String(a.date)),
)

// Just enough frontmatter for flat `key: value` lines and `[a, b]` lists.
// ponytail: no nesting, no quoting rules. Swap for a YAML parser if a file needs more.
export function parse(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  const meta = {}
  if (m) {
    for (const line of m[1].split(/\r?\n/)) {
      const i = line.indexOf(':')
      if (i < 1) continue
      let value = line.slice(i + 1).trim()
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      }
      meta[line.slice(0, i).trim()] = value
    }
  }
  return { meta, body: m ? raw.slice(m[0].length) : raw }
}

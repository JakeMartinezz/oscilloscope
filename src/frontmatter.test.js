// node --test src/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from './frontmatter.js'

test('flat keys, lists, urls with colons, body', () => {
  const { meta, body } = parse(
    '---\ntitle: A: B\nstack: [vue, rust ]\nlink: https://x.dev\n---\n# Hi\n',
  )
  assert.deepEqual(meta, { title: 'A: B', stack: ['vue', 'rust'], link: 'https://x.dev' })
  assert.equal(body, '# Hi\n')
})

test('no frontmatter, CRLF', () => {
  assert.deepEqual(parse('plain'), { meta: {}, body: 'plain' })
  assert.deepEqual(parse('---\r\ndate: 2026-01-01\r\n---\r\nx').meta, { date: '2026-01-01' })
})

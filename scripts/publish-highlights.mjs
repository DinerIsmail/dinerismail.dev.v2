#!/usr/bin/env node
// Start a book review from an exported highlights file.
//
// Finds the book in highlights/, creates content/books/<slug>/index.mdx with
// the review front matter and the highlights underneath, then moves the
// highlights file to highlights/published/ (where the export scripts put books
// that already have a review).
//
// Usage:
//   npm run highlights:publish -- --book "deep work"
//   npm run highlights:publish -- --book "deep work" --slug deep-work

import fs from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { slugify } from './lib/highlights.mjs'

const { values: args } = parseArgs({
  options: {
    book: { type: 'string' },
    slug: { type: 'string' },
    out: { type: 'string', default: 'highlights' },
  },
})

const REVIEWS_DIR = path.join('content', 'books')

// Front matter written by toMarkdown() in lib/highlights.mjs: JSON-quoted
// title and author
function parseHighlightsFile(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return null
  const meta = Object.fromEntries(
    match[1].split('\n').map((line) => {
      const [key, ...value] = line.split(':')
      return [key.trim(), JSON.parse(value.join(':').trim())]
    }),
  )
  return { ...meta, body: match[2].trim() }
}

// Highlights are plain text, but MDX treats { and < as JSX
const escapeMdx = (text) => text.replace(/[{}<]/g, (char) => `\\${char}`)

async function findBook(term) {
  const files = (await fs.readdir(args.out).catch(() => [])).filter((file) =>
    file.endsWith('.md'),
  )
  const books = []
  for (const file of files) {
    const book = parseHighlightsFile(
      await fs.readFile(path.join(args.out, file), 'utf8'),
    )
    if (!book) continue
    const slug = path.basename(file, '.md')
    if (
      book.title.toLowerCase().includes(term.toLowerCase()) ||
      slug.includes(term.toLowerCase())
    )
      books.push({ ...book, file })
  }
  if (books.length === 1) return books[0]
  if (!books.length)
    console.error(`No unpublished highlights matching "${term}" in ${args.out}/`)
  else
    console.error(
      `More than one book matches "${term}":\n${books.map((book) => `  ${book.title}`).join('\n')}`,
    )
  process.exit(1)
}

async function main() {
  if (!args.book) {
    console.error('Pass --book <term> with part of the title or slug')
    process.exit(1)
  }
  const book = await findBook(args.book)

  // Drop the subtitle: "Deep Work: Rules for Focused Success" -> "Deep Work"
  const title = book.title.split(':')[0].trim()
  const slug = args.slug ?? slugify(title)
  const dir = path.join(REVIEWS_DIR, slug)
  const file = path.join(dir, 'index.mdx')
  if (
    await fs.access(dir).then(
      () => true,
      () => false,
    )
  ) {
    console.error(`${dir} already exists`)
    process.exit(1)
  }

  const today = new Date().toISOString().slice(0, 10)
  const review = `---
title: ${JSON.stringify(title)}
description: ''
date: '${today}'
author: ${JSON.stringify(book.author)}
# rating: 5
# isbn: '' # fetches the cover from Open Library
# cover: '' # or a cover image URL, for books without an ISBN
---

## Thoughts

${escapeMdx(book.body)}
`
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(file, review)

  const publishedDir = path.join(args.out, 'published')
  await fs.mkdir(publishedDir, { recursive: true })
  await fs.rename(
    path.join(args.out, book.file),
    path.join(publishedDir, book.file),
  )

  console.log(`${file}  <- ${path.join(args.out, book.file)}`)
  console.log(
    'Fill in the description and your thoughts, and trim the highlights.',
  )
}

main()

#!/usr/bin/env node
// Export Kindle highlights to one markdown file per book.
//
// Reads "My Clippings.txt" from a USB-connected Kindle. That file records every
// highlight and note made on the device, including sideloaded and Send to
// Kindle epubs, which never show up in Amazon's online notebook.
//
// Usage:
//   npm run highlights
//   npm run highlights -- --book "you are here"
//   npm run highlights -- --clippings ~/Desktop/My\ Clippings.txt --out ~/notes
//
// To skip books, list them in scripts/kindle-highlights-ignore.txt, one per
// line (part of the title or the slug).

import fs from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import {
  selectBooks,
  slugify,
  toMarkdown,
  writeBooks,
} from './lib/highlights.mjs'

const { values: args } = parseArgs({
  options: {
    clippings: {
      type: 'string',
      default: '/Volumes/Kindle/documents/My Clippings.txt',
    },
    out: { type: 'string', default: 'highlights' },
    book: { type: 'string' },
  },
})

const SEPARATOR = '=========='
const IGNORE_FILE = path.join(
  import.meta.dirname,
  'kindle-highlights-ignore.txt',
)

// "Title (Author)" -> { title, author }. The author is the last parenthesised
// group, since titles can contain parentheses too.
function parseTitleLine(line) {
  const match = line.match(/^(.*)\(([^()]*)\)\s*$/)
  if (!match) return { title: line.trim(), author: '' }
  let author = match[2].trim()
  // Calibre-converted books often store "Last, First"
  const parts = author.split(',').map((part) => part.trim())
  if (parts.length === 2 && !author.includes(';'))
    author = `${parts[1]} ${parts[0]}`
  return { title: match[1].trim(), author }
}

// "- Your Highlight on page 12 | Location 170-172 | Added on ..." or
// "- Your Note at location 172 | Added on ..."
function parseMetaLine(line) {
  const type = line.match(/Your (Highlight|Note|Bookmark)/i)?.[1].toLowerCase()
  const location = line.match(/location (\d+)(?:-(\d+))?/i)
  const page = line.match(/page (\d+)/i)
  const start = Number(location?.[1] ?? page?.[1] ?? 0)
  const end = Number(location?.[2] ?? start)
  return { type, start, end }
}

function parseClippings(raw) {
  return raw
    .replace(/^﻿/, '')
    .replace(/\r\n/g, '\n')
    .split(SEPARATOR)
    .map((block, index) => {
      const lines = block.replace(/﻿/g, '').trim().split('\n')
      if (lines.length < 2) return null
      const { title, author } = parseTitleLine(lines[0])
      const meta = parseMetaLine(lines[1])
      const text = lines.slice(2).join('\n').trim()
      return { title, author, ...meta, text, index }
    })
    .filter(
      (clip) =>
        clip &&
        clip.text &&
        (clip.type === 'highlight' || clip.type === 'note') &&
        // Publisher export limits replace the text with this message
        !/clipping limit/i.test(clip.text),
    )
}

const overlaps = (a, b) => a.start <= b.end && b.start <= a.end

// Kindle appends a fresh entry every time a highlight is extended or trimmed,
// leaving the old version behind. Drop any highlight that a later, overlapping
// one replaced: extended (contains it), trimmed (inside it), or re-made at the
// same starting location.
function dedupeHighlights(highlights) {
  const replaces = (later, earlier) =>
    later.index > earlier.index &&
    overlaps(later, earlier) &&
    (later.start === earlier.start ||
      later.text.includes(earlier.text) ||
      earlier.text.includes(later.text))
  return highlights.filter(
    (h) => !highlights.some((other) => replaces(other, h)),
  )
}

function bookToMarkdown(book) {
  const highlights = dedupeHighlights(
    book.clips.filter((clip) => clip.type === 'highlight'),
  ).sort((a, b) => a.start - b.start || a.index - b.index)
  const notes = book.clips.filter((clip) => clip.type === 'note')

  // Attach each note to the highlight it was made on, if there is one
  const attached = new Map()
  const loose = []
  for (const note of notes) {
    const target = highlights.findLast(
      (h) => h.start <= note.start && note.start <= h.end,
    )
    if (target)
      attached.set(target, [...(attached.get(target) ?? []), note.text])
    else loose.push(note.text)
  }

  return {
    markdown: toMarkdown(
      book,
      highlights.map((h) => ({ text: h.text, notes: attached.get(h) ?? [] })),
      loose,
    ),
    highlightCount: highlights.length,
    noteCount: notes.length,
  }
}

async function main() {
  let raw
  try {
    raw = await fs.readFile(args.clippings, 'utf8')
  } catch (error) {
    const hint =
      error.code === 'EPERM' || error.code === 'EACCES'
        ? 'macOS is blocking access to removable drives. Allow your terminal app under\nSystem Settings > Privacy & Security > Files & Folders > Removable Volumes, then restart it.'
        : 'Connect your Kindle over USB, or pass --clippings <path>.'
    console.error(`Couldn't read ${args.clippings} (${error.code})\n${hint}`)
    process.exit(1)
  }

  const books = new Map()
  for (const clip of parseClippings(raw)) {
    const slug = slugify(clip.title)
    if (!books.has(slug))
      books.set(slug, { title: clip.title, author: clip.author, clips: [] })
    books.get(slug).clips.push(clip)
  }

  const selected = await selectBooks(books, {
    ignoreFile: IGNORE_FILE,
    book: args.book,
  })
  await writeBooks(
    selected.map(([slug, book]) => [slug, bookToMarkdown(book)]),
    args.out,
  )
}

main()

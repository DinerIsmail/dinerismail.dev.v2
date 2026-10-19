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

// Matches part of a book's title or its slug, ignoring case
const matches = (slug, book, term) =>
  book.title.toLowerCase().includes(term.toLowerCase()) ||
  slug.includes(term.toLowerCase())

// One entry per line; blank lines and # comments are skipped
async function readIgnoreList() {
  const raw = await fs.readFile(IGNORE_FILE, 'utf8').catch(() => '')
  return raw
    .split('\n')
    .map((line) => line.replace(/#.*/, '').trim())
    .filter(Boolean)
}

function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

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

function toMarkdown(book) {
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
    if (target) attached.set(target, [...(attached.get(target) ?? []), note])
    else loose.push(note)
  }

  const quote = (text) =>
    text
      .split('\n')
      .map((line) => `> ${line}`.trimEnd())
      .join('\n')

  const sections = highlights.map((h) => {
    const notesFor = (attached.get(h) ?? []).map(
      (note) => `*Note: ${note.text}*`,
    )
    return [quote(h.text), ...notesFor].join('\n\n')
  })

  let markdown = `---\ntitle: ${JSON.stringify(book.title)}\nauthor: ${JSON.stringify(book.author)}\n---\n\n## Highlights\n\n${sections.join('\n\n')}\n`
  if (loose.length) {
    markdown += `\n## Notes\n\n${loose.map((note) => `- ${note.text}`).join('\n')}\n`
  }
  return {
    markdown,
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

  const ignored = await readIgnoreList()
  const selected = [...books].filter(([slug, book]) => {
    if (ignored.some((term) => matches(slug, book, term))) {
      console.log(`Skipping ${book.title} (ignored)`)
      return false
    }
    return !args.book || matches(slug, book, args.book)
  })
  if (!selected.length) {
    console.error(
      args.book ? `No book matching "${args.book}"` : 'No highlights found',
    )
    process.exit(1)
  }

  const reviewsDir = path.join('content', 'books')
  const reviewSlugs = await fs.readdir(reviewsDir).catch(() => [])
  // Review slugs are often shorter than the Kindle title's ("digital-minimalism"
  // vs "digital-minimalism-choosing-a-focused-life..."), so match on whole-word
  // prefixes in either direction
  const isPrefix = (short, long) =>
    long === short || long.startsWith(`${short}-`)
  const findReview = (slug) =>
    reviewSlugs.find(
      (review) => isPrefix(review, slug) || isPrefix(slug, review),
    )

  const publishedDir = path.join(args.out, 'published')
  await fs.mkdir(publishedDir, { recursive: true })
  for (const [slug, book] of selected) {
    const { markdown, highlightCount, noteCount } = toMarkdown(book)
    // Books that already have a review on the site go in published/, and any
    // copy left over from before the review existed is removed
    const reviewSlug = findReview(slug)
    const review = reviewSlug && path.join(reviewsDir, reviewSlug)
    const isPublished = Boolean(review)
    const unpublishedFile = path.join(args.out, `${slug}.md`)
    const file = isPublished
      ? path.join(publishedDir, `${slug}.md`)
      : unpublishedFile
    await fs.writeFile(file, markdown)
    if (isPublished) await fs.rm(unpublishedFile, { force: true })
    console.log(
      `${file}  (${highlightCount} highlights, ${noteCount} notes)${isPublished ? `  -> review: ${review}` : ''}`,
    )
  }
}

main()

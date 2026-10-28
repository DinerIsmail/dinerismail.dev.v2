// Shared by the highlight export scripts: picking books, rendering markdown
// and writing one file per book.

import fs from 'node:fs/promises'
import path from 'node:path'

export function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Matches part of a book's title or its slug, ignoring case
const matches = (slug, book, term) =>
  book.title.toLowerCase().includes(term.toLowerCase()) ||
  slug.includes(term.toLowerCase())

// One entry per line; blank lines and # comments are skipped
async function readIgnoreList(file) {
  const raw = await fs.readFile(file, 'utf8').catch(() => '')
  return raw
    .split('\n')
    .map((line) => line.replace(/#.*/, '').trim())
    .filter(Boolean)
}

// Drops ignored books and, with --book, everything that doesn't match it.
// Exits if nothing is left.
export async function selectBooks(books, { ignoreFile, book: term }) {
  const ignored = await readIgnoreList(ignoreFile)
  const selected = [...books].filter(([slug, book]) => {
    if (ignored.some((ignore) => matches(slug, book, ignore))) {
      console.log(`Skipping ${book.title} (ignored)`)
      return false
    }
    return !term || matches(slug, book, term)
  })
  if (!selected.length) {
    console.error(term ? `No book matching "${term}"` : 'No highlights found')
    process.exit(1)
  }
  return selected
}

// highlights: [{ text, notes: [text] }] in reading order
// looseNotes: notes that aren't attached to a highlight
export function toMarkdown(book, highlights, looseNotes = []) {
  const quote = (text) =>
    text
      .split('\n')
      .map((line) => `> ${line}`.trimEnd())
      .join('\n')

  const sections = highlights.map((h) =>
    [quote(h.text), ...h.notes.map((note) => `*Note: ${note}*`)].join('\n\n'),
  )

  let markdown = `---\ntitle: ${JSON.stringify(book.title)}\nauthor: ${JSON.stringify(book.author)}\n---\n\n## Highlights\n\n${sections.join('\n\n')}\n`
  if (looseNotes.length) {
    markdown += `\n## Notes\n\n${looseNotes.map((note) => `- ${note}`).join('\n')}\n`
  }
  return markdown
}

// Writes each book to <out>/<slug>.md, or <out>/published/<slug>.md when it
// already has a review on the site. books: [[slug, { markdown, highlightCount,
// noteCount }]]
export async function writeBooks(books, out) {
  const reviewsDir = path.join('content', 'books')
  const reviewSlugs = await fs.readdir(reviewsDir).catch(() => [])
  // Review slugs are often shorter than the book's title ("digital-minimalism"
  // vs "digital-minimalism-choosing-a-focused-life..."), so match on whole-word
  // prefixes in either direction
  const isPrefix = (short, long) =>
    long === short || long.startsWith(`${short}-`)
  const findReview = (slug) =>
    reviewSlugs.find(
      (review) => isPrefix(review, slug) || isPrefix(slug, review),
    )

  const publishedDir = path.join(out, 'published')
  await fs.mkdir(publishedDir, { recursive: true })
  for (const [slug, { markdown, highlightCount, noteCount }] of books) {
    // Any copy left over from before the review existed is removed
    const reviewSlug = findReview(slug)
    const review = reviewSlug && path.join(reviewsDir, reviewSlug)
    const isPublished = Boolean(review)
    const unpublishedFile = path.join(out, `${slug}.md`)
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

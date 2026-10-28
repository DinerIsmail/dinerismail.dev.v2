#!/usr/bin/env node
// Export Google Play Books highlights to one markdown file per book.
//
// With "Save notes, highlights and bookmarks in Google Drive" turned on in the
// Play Books settings, Play Books keeps a Google Doc per book in a "Play Books
// Notes" folder on Drive. This reads those docs through the Drive and Docs
// APIs. Drive for desktop only syncs link files for Google Docs, not their
// contents, so they can't be read from disk.
//
// One-time setup:
//   1. In https://console.cloud.google.com create a project and enable the
//      Google Drive API and Google Docs API.
//   2. Under Google Auth Platform, configure the consent screen (External,
//      Testing) and add your Google account as a test user.
//   3. Create an OAuth client of type "Desktop app", download its JSON and save
//      it as ~/.config/play-books-highlights/credentials.json
//   The first run opens a browser to sign in. The token is saved next to the
//   credentials; Google expires it every 7 days while the app is in Testing,
//   after which the browser opens again.
//
// Usage:
//   npm run highlights:play-books
//   npm run highlights:play-books -- --book "mate"
//   npm run highlights:play-books -- --folder "My Notes" --out ~/notes
//
// To skip books, list them in scripts/play-books-highlights-ignore.txt, one per
// line (part of the title or the slug).

import { execFile } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { parseArgs } from 'node:util'
import {
  selectBooks,
  slugify,
  toMarkdown,
  writeBooks,
} from './lib/highlights.mjs'

const CONFIG_DIR = path.join(os.homedir(), '.config', 'play-books-highlights')

const { values: args } = parseArgs({
  options: {
    credentials: {
      type: 'string',
      default: path.join(CONFIG_DIR, 'credentials.json'),
    },
    folder: { type: 'string', default: 'Play Books Notes' },
    out: { type: 'string', default: 'highlights' },
    book: { type: 'string' },
  },
})

const TOKEN_FILE = path.join(CONFIG_DIR, 'token.json')
const IGNORE_FILE = path.join(
  import.meta.dirname,
  'play-books-highlights-ignore.txt',
)
const SCOPE = 'https://www.googleapis.com/auth/drive.readonly'

async function readCredentials() {
  try {
    const json = JSON.parse(await fs.readFile(args.credentials, 'utf8'))
    return json.installed ?? json.web
  } catch (error) {
    console.error(
      `Couldn't read OAuth client credentials at ${args.credentials} (${error.code ?? error.message})\nSee the setup steps at the top of scripts/play-books-highlights.mjs.`,
    )
    process.exit(1)
  }
}

async function requestToken(client, params) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: client.client_id,
      client_secret: client.client_secret,
      ...params,
    }),
  })
  const json = await response.json()
  if (!response.ok)
    throw new Error(`${json.error}: ${json.error_description ?? ''}`)
  return json
}

// Loopback OAuth flow with PKCE: serve the redirect on a random local port and
// open the consent page in the browser
async function signIn(client) {
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url')
  const state = crypto.randomBytes(16).toString('hex')

  const server = http.createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const redirectUri = `http://127.0.0.1:${server.address().port}`

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.search = new URLSearchParams({
    client_id: client.client_id,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  })
  console.log(`Opening the browser to sign in to Google:\n${authUrl}\n`)
  execFile('open', [authUrl.toString()])

  const code = await new Promise((resolve, reject) => {
    server.on('request', (req, res) => {
      const params = new URL(req.url, redirectUri).searchParams
      if (!params.has('code') && !params.has('error')) {
        res.writeHead(404).end()
        return
      }
      const ok = params.get('state') === state && params.has('code')
      res
        .writeHead(200, { 'Content-Type': 'text/plain' })
        .end(
          ok
            ? 'Signed in. You can close this tab.'
            : 'Sign-in failed. Check the terminal.',
        )
      server.close()
      if (ok) resolve(params.get('code'))
      else reject(new Error(`Sign-in failed: ${params.get('error')}`))
    })
  })

  return requestToken(client, {
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })
}

// Reuses the saved refresh token, signing in again when there isn't one or
// Google has revoked it
async function getAccessToken() {
  const client = await readCredentials()
  const saved = JSON.parse(
    await fs.readFile(TOKEN_FILE, 'utf8').catch(() => '{}'),
  )
  if (saved.refresh_token) {
    try {
      const token = await requestToken(client, {
        refresh_token: saved.refresh_token,
        grant_type: 'refresh_token',
      })
      return token.access_token
    } catch (error) {
      console.log(`Saved sign-in no longer works (${error.message})`)
    }
  }
  const token = await signIn(client)
  await fs.mkdir(CONFIG_DIR, { recursive: true })
  await fs.writeFile(
    TOKEN_FILE,
    JSON.stringify({ refresh_token: token.refresh_token }),
    { mode: 0o600 },
  )
  return token.access_token
}

function googleApi(accessToken) {
  return async (url) => {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const json = await response.json()
    if (!response.ok) throw new Error(json.error?.message ?? response.status)
    return json
  }
}

async function listDriveFiles(get, query) {
  const files = []
  let pageToken
  do {
    const url = new URL('https://www.googleapis.com/drive/v3/files')
    url.search = new URLSearchParams({
      q: `${query} and trashed = false`,
      fields: 'nextPageToken, files(id, name)',
      pageSize: '1000',
      ...(pageToken && { pageToken }),
    })
    const page = await get(url)
    files.push(...page.files)
    pageToken = page.nextPageToken
  } while (pageToken)
  return files
}

// Each paragraph as { text, link, highlighted }. "highlighted" means some of it
// has a background colour, which is how the docs mark the highlighted passage.
function paragraphs(content = []) {
  return content.flatMap((element) => {
    if (element.table)
      return element.table.tableRows.flatMap((row) =>
        row.tableCells.flatMap((cell) => paragraphs(cell.content)),
      )
    if (!element.paragraph) return []
    const runs = element.paragraph.elements
      .map((el) => el.textRun)
      .filter(Boolean)
    return [
      {
        text: runs
          .map((run) => run.content)
          .join('')
          .replace(/\v/g, '\n')
          .trim(),
        link: runs.some((run) => run.textStyle?.link),
        highlighted: runs.some(
          (run) => run.content.trim() && run.textStyle?.backgroundColor?.color,
        ),
      },
    ]
  })
}

const isDate = (text) =>
  /^[A-Z][a-z]+ \d{1,2}, \d{4}$/.test(text) || // October 12, 2015
  /^\d{1,2} [A-Z][a-z]+ \d{4}$/.test(text) // 12 October 2015

// Linked page numbers like "12" or "xiv"
const isPageLink = (p) => p.link && /^[\divxlc]+$/i.test(p.text)

// The doc holds a header with the book's details, then one table per
// annotation: the highlighted passage, any note on it, the date it was made
// and a link to its page in the book.
function parseDoc(doc, title) {
  const highlights = []
  let author = ''

  for (const element of doc.body.content) {
    if (!element.table) continue
    const paras = paragraphs([element]).filter((p) => p.text)
    const isAnnotation = paras.some((p) => isDate(p.text) || isPageLink(p))

    if (!isAnnotation) {
      // The header table lists the title, then the author
      const titleIndex = paras.findIndex((p) => p.text === title)
      const next = paras[titleIndex + 1]?.text
      if (!author && titleIndex !== -1 && next && !/\d/.test(next))
        author = next
      continue
    }

    const body = paras.filter((p) => !isDate(p.text) && !isPageLink(p))
    if (!body.length) continue
    // Without highlight colours to go by, the passage comes first
    const quoted = body.some((p) => p.highlighted)
      ? body.filter((p) => p.highlighted)
      : body.slice(0, 1)
    highlights.push({
      text: quoted.map((p) => p.text).join('\n'),
      notes: body.filter((p) => !quoted.includes(p)).map((p) => p.text),
    })
  }

  return { author, highlights }
}

// Runs fn over items, a few at a time
async function mapLimit(items, limit, fn) {
  const results = []
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await fn(items[index])
    }
  }
  await Promise.all(Array.from({ length: limit }, worker))
  return results
}

async function main() {
  const get = googleApi(await getAccessToken())

  const escape = (text) => text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  const folders = await listDriveFiles(
    get,
    `name = '${escape(args.folder)}' and mimeType = 'application/vnd.google-apps.folder'`,
  )
  if (!folders.length) {
    console.error(
      `No "${args.folder}" folder on Google Drive. Turn on "Save notes, highlights and bookmarks in Google Drive" in the Play Books settings, or pass --folder <name>.`,
    )
    process.exit(1)
  }
  const docs = (
    await Promise.all(
      folders.map((folder) =>
        listDriveFiles(
          get,
          `'${folder.id}' in parents and mimeType = 'application/vnd.google-apps.document'`,
        ),
      ),
    )
  ).flat()

  // Docs are named 'Notes from "<title>"'
  const books = new Map()
  for (const doc of docs) {
    const title = doc.name.match(/^Notes from "(.*)"$/s)?.[1] ?? doc.name
    books.set(slugify(title), { title, docId: doc.id })
  }

  const selected = await selectBooks(books, {
    ignoreFile: IGNORE_FILE,
    book: args.book,
  })
  const exported = await mapLimit(selected, 5, async ([slug, book]) => {
    const doc = await get(
      `https://docs.googleapis.com/v1/documents/${book.docId}`,
    )
    const { author, highlights } = parseDoc(doc, book.title)
    return [
      slug,
      {
        markdown: toMarkdown({ title: book.title, author }, highlights),
        highlightCount: highlights.length,
        noteCount: highlights.flatMap((h) => h.notes).length,
      },
    ]
  })
  for (const [slug, book] of exported)
    if (!book.highlightCount) console.log(`Skipping ${slug} (no highlights)`)
  await writeBooks(
    exported.filter(([, book]) => book.highlightCount),
    args.out,
  )
}

main()

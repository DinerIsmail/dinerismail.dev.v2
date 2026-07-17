import fs from 'node:fs/promises'
import path from 'node:path'

import {
  defineCollection,
  defineConfig,
  type Context,
  type Meta,
} from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import { remarkPlugins } from '@prose-ui/core'
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
} from '@shikijs/transformers'
import { toc } from 'mdast-util-toc'
import readingTime from 'reading-time'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import { remark } from 'remark'
import * as z from 'zod'

type MdxDocument = { content: string; _meta: Meta }

async function transformMdx<T extends MdxDocument>(
  document: T,
  context: Context,
) {
  // Parse markdown to extract TOC before compilation
  const processor = remark()
  const tree = processor.parse(document.content)
  const tableOfContents = toc(tree)

  // Compile MDX as usual
  const mdx = await compileMDX(context, document, {
    remarkPlugins: remarkPlugins(),
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: 'material-theme-palenight',
          transformers: [
            transformerMetaHighlight(),
            transformerMetaWordHighlight(),
            transformerNotationDiff({
              matchAlgorithm: 'v3',
            }),
          ],
          onVisitLine(node: any) {
            // Prevent lines from collapsing in `display: grid` mode, and allow empty
            // lines to be copy/pasted
            if (node.children.length === 0) {
              node.children = [{ type: 'text', value: ' ' }]
            }
          },
          onVisitHighlightedLine(node: any) {
            node.properties.className.push('line--highlighted')
          },
          onVisitHighlightedWord(node: any) {
            node.properties.className = ['word--highlighted']
          },
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['subheading-anchor'],
            ariaLabel: 'Link to section',
          },
        },
      ],
    ],
  })

  return {
    ...document,
    mdx,
    readingTime: readingTime(document.content).text,
    toc: tableOfContents.map ? tocToPlainObject(tableOfContents.map) : null,
  }
}

// Fetch a book cover from the Open Library Covers API into public/assets/covers,
// keyed by slug so it only downloads once and gets committed with the repo.
async function fetchCover(isbn: string, slug: string): Promise<string | null> {
  const publicUrl = `/assets/covers/${slug}.jpg`
  const filePath = path.join('public', 'assets', 'covers', `${slug}.jpg`)
  try {
    await fs.access(filePath)
    return publicUrl
  } catch {
    // Not cached yet, fetch below
  }
  try {
    const response = await fetch(
      `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`,
    )
    if (!response.ok) {
      console.warn(`No Open Library cover found for ISBN ${isbn} (${slug})`)
      return null
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    // Open Library occasionally serves a tiny placeholder instead of a 404
    if (buffer.length < 1000) return null
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, buffer)
    return publicUrl
  } catch (error) {
    console.warn(`Failed to fetch cover for ISBN ${isbn} (${slug})`, error)
    return null
  }
}

// Fetch a site favicon via Google's favicon service into public/assets/favicons,
// keyed by slug so it only downloads once and gets committed with the repo.
async function fetchFavicon(url: string, slug: string): Promise<string | null> {
  const publicUrl = `/assets/favicons/${slug}.png`
  const filePath = path.join('public', 'assets', 'favicons', `${slug}.png`)
  try {
    await fs.access(filePath)
    return publicUrl
  } catch {
    // Not cached yet, fetch below
  }
  try {
    const domain = new URL(url).hostname
    const response = await fetch(
      `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    )
    if (!response.ok) {
      console.warn(`No favicon found for ${domain} (${slug})`)
      return null
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    // Google serves a generic globe placeholder for unknown domains
    if (buffer.length < 100) return null
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, buffer)
    return publicUrl
  } catch (error) {
    console.warn(`Failed to fetch favicon for ${url} (${slug})`, error)
    return null
  }
}

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    content: z.string(),
  }),
  transform: transformMdx,
})

const books = defineCollection({
  name: 'books',
  directory: 'content/books',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    description: z.string(),
    date: z.string(),
    content: z.string(),
    rating: z.number().min(1).max(5).optional(),
    isbn: z.string().optional(),
  }),
  transform: async (document, context) => {
    const transformed = await transformMdx(document, context)
    const coverImage = document.isbn
      ? await fetchCover(document.isbn, document._meta.path)
      : null
    return { ...transformed, coverImage }
  },
})

const links = defineCollection({
  name: 'links',
  directory: 'content/links',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    url: z.url(),
    date: z.string(),
    content: z.string(),
  }),
  transform: async (document) => {
    const favicon = await fetchFavicon(document.url, document._meta.path)
    return {
      ...document,
      note: document.content.trim(),
      domain: new URL(document.url).hostname.replace(/^www\./, ''),
      favicon,
    }
  },
})

export default defineConfig({
  content: [posts, books, links],
})

// Helper function to convert TOC AST to serializable object
function tocToPlainObject(list: ReturnType<typeof toc>['map']): any[] | null {
  if (!list || list.type !== 'list') return null

  return list.children
    .filter((item): item is any => item.type === 'listItem')
    .map((item: any) => {
      const paragraph = item.children?.find(
        (child: any) => child.type === 'paragraph',
      )
      if (!paragraph) return null

      const link = paragraph.children?.find(
        (child: any) => child.type === 'link',
      )
      const text = link
        ? link.children
            ?.filter((child: any) => child.type === 'text')
            .map((child: any) => child.value)
            .join('') || ''
        : paragraph.children
            ?.filter((child: any) => child.type === 'text')
            .map((child: any) => child.value)
            .join('') || ''

      const url =
        link?.url ||
        `#${text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '')}`

      // Check for nested list (subheadings)
      const nestedList = item.children?.find(
        (child: any) => child.type === 'list',
      )
      const children = nestedList ? tocToPlainObject(nestedList) : null

      return {
        value: text,
        url,
        ...(children && { children }),
      }
    })
    .filter((item): item is any => item !== null)
}

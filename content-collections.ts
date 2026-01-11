import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import { remarkPlugins } from '@prose-ui/core'
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
} from '@shikijs/transformers'
import { toc } from 'mdast-util-toc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import { remark } from 'remark'
import * as z from 'zod'

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
  }),
  transform: async (document, context) => {
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
      toc: tableOfContents.map ? tocToPlainObject(tableOfContents.map) : null,
    }
  },
})

export default defineConfig({
  collections: [posts],
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

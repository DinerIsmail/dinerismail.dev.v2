import { mdxComponents } from '@prose-ui/react'
import type { MDXComponents } from 'mdx/types'

// Prose UI's stylesheet styles the `.blockquote` class, but its mdxComponents
// map doesn't include the blockquote element, so markdown `>` quotes render
// unstyled without this override. Spread directly because
// `createMdxComponents` only types Prose UI's own component keys.
export const proseMdxComponents: MDXComponents = {
  ...mdxComponents,
  blockquote: (props: React.ComponentProps<'blockquote'>) => (
    <blockquote className="blockquote" {...props} />
  ),
}

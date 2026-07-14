import { createMdxComponents } from '@prose-ui/react'

// Prose UI's stylesheet styles the `.blockquote` class, but its mdxComponents
// map doesn't include the blockquote element, so markdown `>` quotes render
// unstyled without this override.
export const proseMdxComponents = createMdxComponents({
  blockquote: (props: React.ComponentProps<'blockquote'>) => (
    <blockquote className="blockquote" {...props} />
  ),
})

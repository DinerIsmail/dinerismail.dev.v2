import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

import { TableOfContents } from '@/components/TableOfContents'
import { buttonVariants } from '@/components/ui/button'
import { seo } from '@/lib/seo'
import { cn, formatDate } from '@/lib/utils'
import { MDXContent } from '@content-collections/mdx/react'
import { mdxComponents } from '@prose-ui/react'
import { allPosts } from 'content-collections'

export const Route = createFileRoute('/articles/$slug')({
  beforeLoad: () => ({
    allPosts,
  }),
  loader: async ({ params, context: { allPosts } }) => {
    const slug = params.slug
    const post = allPosts.find((post) => post._meta.path === slug)
    if (!post) {
      throw redirect({
        to: '/articles',
      })
    }

    return { post }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          ...seo({
            title: `${loaderData?.post.title} | Diner Ismail`,
            description: loaderData?.post.description,
          }),
        ]
      : [],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { post } = Route.useLoaderData()
  return (
    <section className="relative">
      <Link
        to="/articles"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-0 left-[-200px] hidden xl:inline-flex',
        )}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        See all posts
      </Link>

      <article className="prose-ui max-w-3xl">
        <div className="mb-8">
          <h1 className="font-heading inline-block text-4xl leading-tight lg:text-5xl">
            {post.title}
          </h1>
          {post.date && (
            <time
              dateTime={post.date}
              className="text-muted-foreground block text-sm"
            >
              Published on {formatDate(post.date)}
            </time>
          )}
        </div>
        <MDXContent code={post.mdx} components={mdxComponents} />
        <hr className="mt-12" />

        <div className="flex justify-center py-6 lg:py-10">
          <Link
            to="/articles"
            className={cn(buttonVariants({ variant: 'ghost' }))}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            See all posts
          </Link>
        </div>
      </article>

      {post.toc && (
        <aside className="absolute top-0 left-[calc(100%+3rem)] hidden h-full w-64 xl:block">
          <div className="sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <TableOfContents toc={post.toc} />
          </div>
        </aside>
      )}
    </section>
  )
}

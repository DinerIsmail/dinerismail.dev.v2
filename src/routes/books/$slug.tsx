import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { ChevronLeft, Star } from 'lucide-react'

import { TableOfContents } from '@/components/TableOfContents'
import { buttonVariants } from '@/components/ui/button'
import { seo } from '@/lib/seo'
import { cn, formatDate } from '@/lib/utils'
import { proseMdxComponents } from '@/components/prose-mdx-components'
import { MDXContent } from '@content-collections/mdx/react'
import { allBooks } from 'content-collections'

export const Route = createFileRoute('/books/$slug')({
  beforeLoad: () => ({
    allBooks,
  }),
  loader: async ({ params, context: { allBooks } }) => {
    const slug = params.slug
    const book = allBooks.find((book) => book._meta.path === slug)
    if (!book) {
      throw redirect({
        to: '/books',
      })
    }

    return { book }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          ...seo({
            title: `${loaderData?.book.title} | Diner Ismail`,
            description: loaderData?.book.description,
          }),
        ]
      : [],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { book } = Route.useLoaderData()
  return (
    <section className="relative">
      <Link
        to="/books"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-0 -left-50 hidden xl:inline-flex',
        )}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        See all books
      </Link>

      <article className="prose-ui max-w-3xl">
        <div className="mb-8 flex flex-row items-start gap-6">
          {book.coverImage && (
            <img
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              className="w-28 shrink-0 rounded-sm shadow-lg sm:w-32"
            />
          )}
          <div>
            <h1 className="font-heading inline-block text-4xl leading-tight lg:text-5xl">
              {book.title}
            </h1>
            <p className="text-muted-foreground text-lg">by {book.author}</p>
            <div className="text-muted-foreground mt-1 flex items-center gap-3 text-sm">
              {book.date && (
                <time dateTime={book.date}>
                  Finished on {formatDate(book.date)}
                </time>
              )}
              {book.rating && (
                <span
                  className="flex items-center gap-0.5"
                  aria-label={`Rated ${book.rating} out of 5`}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3.5 w-3.5',
                        i < book.rating!
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground/40',
                      )}
                    />
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
        <MDXContent code={book.mdx} components={proseMdxComponents} />
        <hr className="mt-12" />

        <div className="flex justify-center py-6 lg:py-10">
          <Link
            to="/books"
            className={cn(buttonVariants({ variant: 'ghost' }))}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            See all books
          </Link>
        </div>
      </article>

      {book.toc && (
        <aside className="absolute top-0 left-[calc(100%+3rem)] hidden h-full w-64 xl:block">
          <div className="sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <TableOfContents toc={book.toc} />
          </div>
        </aside>
      )}
    </section>
  )
}

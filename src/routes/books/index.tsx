import { BookCard } from '@/components/BookCard'
import { seo } from '@/lib/seo'
import { sortedBooks } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/books/')({
  head: () => ({
    meta: [
      ...seo({
        title: 'Books | Diner Ismail',
        description:
          'Notes, thoughts and highlights from books I have been reading.',
      }),
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <h2 className="mb-4 text-2xl font-semibold">Book notes</h2>
      <p className="text-muted-foreground mb-8">
        Notes, thoughts and highlights from books I&apos;ve been reading. Less
        polished than articles, more useful than a star rating.
      </p>
      <section className="flex w-full flex-col items-start gap-4">
        <ul className="group/list flex w-full flex-col gap-8 md:gap-10">
          {sortedBooks.map((book) => (
            <li key={book._meta.path}>
              <BookCard
                title={book.title}
                author={book.author}
                description={book.description}
                slug={book._meta.path}
                date={book.date}
                readingTime={book.readingTime}
                coverImage={book.coverImage}
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

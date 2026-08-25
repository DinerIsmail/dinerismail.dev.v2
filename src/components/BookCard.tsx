import { Link } from '@tanstack/react-router'

type BookCardProps = {
  title: string
  author: string
  description: string
  slug: string
  date: string
  readingTime?: string
  coverImage?: string | null
}

export function BookCard({
  title,
  author,
  description,
  slug,
  date,
  readingTime,
  coverImage,
}: BookCardProps) {
  return (
    <article className="group relative transition-all">
      <div className="absolute -inset-x-4 -inset-y-3 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-4 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg" />
      <Link
        to="/books/$slug"
        params={{ slug }}
        className="group relative z-10 flex w-full flex-row gap-4 rounded-md p-0 transition-all duration-300 ease-out"
      >
        {coverImage && (
          <img
            src={coverImage}
            alt={`Cover of ${title}`}
            className="h-28 w-auto shrink-0 self-start rounded-sm shadow-md"
            loading="lazy"
          />
        )}
        <div className="flex flex-col items-start gap-2">
          <h3 className="group-hover:text-accent text-lg font-semibold transition-colors">
            {title}
            <span className="text-muted-foreground font-normal">
              {' '}
              by {author}
            </span>
          </h3>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>
              {new Date(date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            {readingTime && (
              <>
                <span className="text-muted-foreground">•</span>
                <span>{readingTime}</span>
              </>
            )}
          </div>
          <p className="text-muted-foreground text-base">{description}</p>
        </div>
      </Link>
    </article>
  )
}

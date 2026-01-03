import { Link } from '@tanstack/react-router'
import { format } from 'timeago.js'

type BlogPostCardProps = {
  title: string
  description: string
  slug: string
  date: string
  readingTime?: string
}

export function BlogPostCard({
  title,
  description,
  slug,
  date,
  readingTime,
}: BlogPostCardProps) {
  return (
    <article className="group relative transition-all">
      <div className="absolute -inset-x-4 -inset-y-3 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-4 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg" />
      <Link
        to="/blog/$slug"
        params={{ slug }}
        className="group relative z-10 flex w-full flex-col rounded-md p-0 transition-all duration-300 ease-out"
      >
        <div className="flex flex-col items-start gap-2">
          <h3 className="group-hover:text-accent text-lg font-semibold transition-colors">
            {title}
          </h3>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>{format(new Date(date))}</span>
            {readingTime && (
              <>
                <span className="text-muted-foreground">•</span>
                <span>{readingTime}</span>
              </>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-2 text-base">{description}</p>
      </Link>
    </article>
  )
}

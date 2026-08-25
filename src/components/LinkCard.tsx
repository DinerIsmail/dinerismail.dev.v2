import { ArrowUpRight } from 'lucide-react'

type LinkCardProps = {
  title: string
  url: string
  note?: string
  domain: string
  favicon?: string | null
}

export function LinkCard({ title, url, note, domain, favicon }: LinkCardProps) {
  return (
    <article className="group relative transition-all">
      <div className="absolute -inset-x-4 -inset-y-3 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-4 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg" />
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="group relative z-10 flex w-full flex-col items-start gap-2 rounded-md p-0 transition-all duration-300 ease-out"
      >
        <h3 className="group-hover:text-accent text-lg font-semibold transition-colors">
          {title}
          <ArrowUpRight
            className="ml-1 inline-block size-4 align-baseline transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </h3>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          {favicon && (
            <img
              src={favicon}
              alt=""
              className="size-4 rounded-sm"
              loading="lazy"
            />
          )}
          <span>{domain}</span>
        </div>
        {note && <p className="text-muted-foreground text-base">{note}</p>}
      </a>
    </article>
  )
}

import { LinkCard } from '@/components/LinkCard'
import { seo } from '@/lib/seo'
import { sortedLinks } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/links/')({
  head: () => ({
    meta: [
      ...seo({
        title: 'Links | Diner Ismail',
        description:
          'Interesting things I have read around the web, with a note on why they are worth your time.',
      }),
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <h2 className="mb-4 text-2xl font-semibold">Links</h2>
      <p className="text-muted-foreground mb-8">
        Interesting things I&apos;ve read around the web, with a note on why
        they&apos;re worth your time.
      </p>
      <section className="flex w-full flex-col items-start gap-4">
        <ul className="group/list flex w-full flex-col gap-8 md:gap-10">
          {sortedLinks.map((link) => (
            <li key={link._meta.path}>
              <LinkCard
                title={link.title}
                url={link.url}
                note={link.note}
                domain={link.domain}
                favicon={link.favicon}
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

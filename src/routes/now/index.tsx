import GoodreadsWidget from '@/components/GoodreadsWidget'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/now/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <h1 className="mb-2">What I'm doing now</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Updated January 2nd 2026
      </p>
      <ul className="mb-8 list-inside list-disc">
        <li>Rebuilding this website with Tanstack Start + Tailwind/shadcn</li>
        <li>
          Working on Resilience Web and onboarding a new volunteer engineer
        </li>
        <li>Trying to build a habit of journalling</li>
        <li>Playing Ghost of Tsushima on PC</li>
      </ul>
      <GoodreadsWidget />
    </div>
  )
}

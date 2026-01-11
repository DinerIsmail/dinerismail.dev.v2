import { BlogList } from '@/components/BlogList'
import Hero from '@/components/Hero'
import { cn, lastFivePosts } from '@/lib/utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="flex flex-col gap-12">
      <Hero />
      <div className="flex flex-col gap-4">
        <h2 className="mb-4 text-2xl font-semibold">Recent blog posts</h2>
        <BlogList posts={lastFivePosts} />
        <div>
          <Link
            to="/blog"
            className={cn(
              'group flex items-center',
              'mt-6 ml-0',
              'hover:text-primary',
            )}
          >
            Read all articles
            <ArrowRight
              className={cn(
                'text-accent ml-1 h-4 w-4',
                'transition-all duration-300 ease-out group-hover:ml-3',
              )}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

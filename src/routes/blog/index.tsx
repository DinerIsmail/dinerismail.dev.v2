import { createFileRoute } from '@tanstack/react-router'
import { BlogList } from '@/components/BlogList'
import { sortedPosts } from '@/lib/utils'

export const Route = createFileRoute('/blog/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-8">Blog</h2>
      <BlogList posts={sortedPosts} />
    </>
  )
}

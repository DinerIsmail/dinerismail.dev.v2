import { BlogList } from '@/components/BlogList'
import { sortedPosts } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/articles/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <h2 className="mb-8 text-2xl font-semibold">Articles</h2>
      <BlogList posts={sortedPosts} />
    </>
  )
}

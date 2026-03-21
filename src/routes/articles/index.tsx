import { useState } from 'react'
import { BlogList } from '@/components/BlogList'
import { sortedPosts } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/articles/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [search, setSearch] = useState('')

  const filteredPosts = sortedPosts.filter((post) => {
    const query = search.toLowerCase()
    return (
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query)
    )
  })

  return (
    <>
      <h2 className="mb-8 text-2xl font-semibold">Articles</h2>
      <input
        type="text"
        placeholder="Search articles..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border-muted bg-background text-foreground placeholder:text-muted-foreground mb-8 w-full rounded-lg border px-4 py-2 text-base outline-none transition-colors focus:border-accent"
      />
      <BlogList posts={filteredPosts} />
    </>
  )
}

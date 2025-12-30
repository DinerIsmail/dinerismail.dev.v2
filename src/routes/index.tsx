import { createFileRoute } from '@tanstack/react-router'
import Hero from '@/components/Hero'
import { BlogList } from '@/components/BlogList'
import { allPosts } from 'content-collections'

export const Route = createFileRoute('/')({ component: App })

function App() {

  return (
    <div className="flex flex-col gap-12">
      <Hero />
      <BlogList posts={allPosts} />
    </div>
  )
}

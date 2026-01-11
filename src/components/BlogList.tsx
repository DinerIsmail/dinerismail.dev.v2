import type { Posts } from '@/lib/utils'
import { BlogPostCard } from './BlogPostCard'

type BlogListProps = {
  posts: Posts
}

export function BlogList({ posts }: BlogListProps) {
  return (
    <section className="flex w-full flex-col items-start gap-4">
      <ul className="group/list flex w-full flex-col gap-8 md:gap-10">
        {posts.map((post) => (
          <li key={post._meta.path}>
            <BlogPostCard
              title={post.title}
              description={post.description}
              slug={post._meta.path}
              date={post.date}
              readingTime={post.readingTime}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

import { BlogPostCard } from "./BlogPostCard";
import type { Posts } from "@/lib/utils";

type BlogListProps = {
  posts: Posts;
};

export function BlogList({ posts }: BlogListProps) {
  return (
    <section className="flex flex-col items-start w-full gap-4">
      <ul className="group/list flex flex-col w-full gap-8 md:gap-10">
        {posts.map((post) => (
          <li key={post._meta.path}>
            <BlogPostCard
              title={post.title}
              description={post.description}
              slug={post._meta.path}
              date={post.date}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

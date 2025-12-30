import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BlogPostCard } from "./BlogPostCard";
import { cn } from "@/lib/utils";
import type { Posts } from "@/lib/utils";

type BlogListProps = {
  posts: Posts;
};

export function BlogList({ posts }: BlogListProps) {
  return (
    <section className="flex flex-col items-start w-full gap-4">
      <h2 className="text-2xl font-semibold">Recent blog posts</h2>
      <ul className="flex flex-col w-full gap-2 md:gap-8">
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
      <div>
        <Link
          to="/blog"
          className={cn(
            "flex items-center group",
            "ml-0 md:ml-4",
            "hover:text-primary"
          )}
        >
          Read all articles
          <ArrowRight
            className={cn(
              "ml-1 h-4 w-4 text-purple-500",
              "group-hover:ml-3 transition-all duration-300 ease-out"
            )}
          />
        </Link>
      </div>
    </section>
  );
}

import { createFileRoute } from '@tanstack/react-router'
import Hero from '@/components/Hero'
import { BlogList } from '@/components/BlogList'
import { lastFivePosts } from '@/lib/utils'
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute('/')({ component: App })

function App() {

  return (
    <div className="flex flex-col gap-12">
      <Hero />
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Recent blog posts</h2>
        <BlogList posts={lastFivePosts} />
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
      </div>
    </div>
  )
}

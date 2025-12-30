import { Link } from "@tanstack/react-router";
import { format } from "timeago.js";
import { cn } from "@/lib/utils";

type BlogPostCardProps = {
  title: string;
  description: string;
  slug: string;
  date: string;
  readingTime?: string;
};

export function BlogPostCard({
  title,
  description,
  slug,
  date,
  readingTime,
}: BlogPostCardProps) {
  return (
    <article>
      <Link
        to="/blog/$slug"
        params={{ slug }}
        className={cn(
          "flex flex-col w-full p-0 md:p-4 rounded-md transition-all duration-300 ease-out",
          "hover:bg-muted hover:scale-[1.025]",
          "group"
        )}
      >
        <div className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold group-hover:underline">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{format(new Date(date))}</span>
            {readingTime && (
              <>
                <span className="text-muted-foreground">•</span>
                <span>{readingTime}</span>
              </>
            )}
          </div>
        </div>
        <p className="mt-2 text-base text-muted-foreground">{description}</p>
      </Link>
    </article>
  );
}


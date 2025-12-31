import { cn } from "@/lib/utils";

type TocItem = {
  value: string;
  url: string;
  children?: TocItem[];
};

interface TableOfContentsProps {
  toc: TocItem[] | null;
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  if (!toc || toc.length === 0) {
    return null;
  }

  return (
    <nav className="text-sm">
      <h2 className="mb-4 font-semibold">Table of Contents</h2>
      <ul className="space-y-2">
        {toc.map((item) => (
          <TocItem key={item.url} item={item} />
        ))}
      </ul>
    </nav>
  );
}

function TocItem({ item, depth = 0 }: { item: TocItem; depth?: number }) {
  return (
    <li>
      <a
        href={item.url}
        className={cn(
          "block text-muted-foreground hover:text-foreground transition-colors",
          depth === 0 && "font-medium",
          depth > 0 && "ml-4"
        )}
      >
        {item.value}
      </a>
      {item.children && item.children.length > 0 && (
        <ul className="mt-2 space-y-1">
          {item.children.map((child) => (
            <TocItem key={child.url} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}


"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS } from "@/lib/constants";

export function SortBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "hot";

  const basePath = pathname.startsWith("/category/") ? pathname : "/";

  function sortHref(sort: string) {
    if (sort === "hot") return basePath;
    return `${basePath}?sort=${sort}`;
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2">
      {SORT_OPTIONS.map((option) => (
        <Link
          key={option}
          href={sortHref(option)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
            currentSort === option
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option}
        </Link>
      ))}
    </div>
  );
}

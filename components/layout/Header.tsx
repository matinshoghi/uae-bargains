"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/AuthButton";
import { SORT_OPTIONS } from "@/lib/constants";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "hot";

  // Build sort link preserving the current path (e.g. /category/electronics)
  const basePath = pathname.startsWith("/category/") ? pathname : "/";

  function sortHref(sort: string) {
    if (sort === "hot") return basePath;
    return `${basePath}?sort=${sort}`;
  }

  const showSortTabs = pathname === "/" || pathname.startsWith("/category/");

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            UAE Bargains
          </Link>

          {showSortTabs && (
            <nav className="hidden items-center gap-1 md:flex">
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
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:flex">
            <Link href="/deals/new">
              <Plus className="mr-1 h-4 w-4" />
              Post Deal
            </Link>
          </Button>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export function CategoryBarClient({ categories }: { categories: Category[] }) {
  const pathname = usePathname();

  // Extract active category slug from pathname like /category/electronics
  const activeCategorySlug = pathname.startsWith("/category/")
    ? pathname.split("/")[2]
    : null;

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
      <Link
        href="/"
        className={cn(
          "shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
          !activeCategorySlug
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-muted-foreground hover:text-foreground"
        )}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
            activeCategorySlug === category.slug
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {category.label}
        </Link>
      ))}
    </div>
  );
}

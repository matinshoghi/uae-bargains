"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SORT_LABELS: Record<string, string> = {
  hot: "Hot Deals",
  new: "Newest Deals",
  top: "Popular Deals",
};

export function FeedHeader({
  sort,
  hideExpired,
}: {
  sort: string;
  hideExpired: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = sort ?? "hot";

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) {
        sp.delete(key);
      } else {
        sp.set(key, value);
      }
    }
    // Clean defaults
    if (sp.get("sort") === "hot") sp.delete("sort");
    const qs = sp.toString();
    return qs ? `/?${qs}` : "/";
  }

  function handleSort(sort: string) {
    router.push(buildUrl({ sort: sort === "hot" ? undefined : sort }));
  }

  function handleToggleExpired() {
    router.push(
      buildUrl({
        hide_expired: hideExpired ? undefined : "1",
      })
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-end justify-between border-b-2 border-foreground pb-3">
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
          {SORT_LABELS[currentSort] ?? "Hot Deals"}
        </h1>

        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={hideExpired}
              onChange={handleToggleExpired}
              className="accent-foreground h-3.5 w-3.5"
            />
            Hide expired
          </label>

          <DropdownMenu>
            <DropdownMenuTrigger className="font-display flex items-center gap-1 rounded-sm border-2 border-foreground px-3 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background">
              {SORT_LABELS[currentSort] ?? "Hot Deals"}
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleSort(key)}
                  className={currentSort === key ? "font-semibold" : ""}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

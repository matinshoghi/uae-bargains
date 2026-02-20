"use client";

import { useSearchParams, useRouter } from "next/navigation";
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
  top: "Top Deals",
};

export function FeedHeader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSort = searchParams.get("sort") ?? "hot";

  function handleSort(sort: string) {
    if (sort === "hot") {
      router.push("/");
    } else {
      router.push(`/?sort=${sort}`);
    }
  }

  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold">{SORT_LABELS[currentSort] ?? "Hot Deals"}</h1>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
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
  );
}

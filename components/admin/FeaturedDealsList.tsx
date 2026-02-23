"use client";

import { useTransition } from "react";
import { toggleFeaturedDeal } from "@/lib/actions/admin";
import type { DealWithRelations } from "@/lib/types";

interface FeaturedDealsListProps {
  deals: DealWithRelations[];
}

export function FeaturedDealsList({ deals }: FeaturedDealsListProps) {
  const featured = deals.filter((d) => d.is_featured);
  const rest = deals.filter((d) => !d.is_featured);

  return (
    <div className="space-y-6">
      {featured.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Currently Pinned ({featured.length})
          </h2>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {featured.map((deal) => (
              <DealRow key={deal.id} deal={deal} />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          All Active Deals
        </h2>
        {rest.length === 0 ? (
          <p className="text-sm text-muted-foreground">No unpinned deals.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {rest.map((deal) => (
              <DealRow key={deal.id} deal={deal} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DealRow({ deal }: { deal: DealWithRelations }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleFeaturedDeal(deal.id, !deal.is_featured);
    });
  }

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{deal.title}</p>
        <p className="text-xs text-muted-foreground">
          {deal.categories?.label ?? "—"} &middot; score {deal.hot_score}
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
          deal.is_featured
            ? "bg-primary text-primary-foreground hover:bg-primary/80"
            : "border border-border bg-background hover:bg-accent"
        }`}
      >
        {isPending ? "…" : deal.is_featured ? "Unpin" : "Pin"}
      </button>
    </li>
  );
}

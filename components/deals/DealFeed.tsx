import { DealCard } from "./DealCard";
import { LoadMoreButton } from "./LoadMoreButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { DEALS_PER_PAGE } from "@/lib/constants";
import type { DealWithRelations } from "@/lib/types";

interface DealFeedProps {
  initialDeals: DealWithRelations[];
  sort: string;
  categorySlug?: string;
  userVotes?: Record<string, number>;
  isLoggedIn?: boolean;
}

export function DealFeed({
  initialDeals,
  sort,
  categorySlug,
  userVotes = {},
  isLoggedIn = false,
}: DealFeedProps) {
  if (initialDeals.length === 0) {
    return <EmptyState />;
  }

  // Pages fetch DEALS_PER_PAGE + 1 — the extra item tells us if there are more
  const hasMore = initialDeals.length > DEALS_PER_PAGE;
  const visibleDeals = hasMore ? initialDeals.slice(0, DEALS_PER_PAGE) : initialDeals;

  return (
    <div className="space-y-3">
      {visibleDeals.map((deal) => (
        <DealCard
          key={deal.id}
          deal={deal}
          userVote={(userVotes[deal.id] as 1 | -1) ?? null}
          isLoggedIn={isLoggedIn}
        />
      ))}

      {hasMore && (
        <LoadMoreButton
          sort={sort}
          categorySlug={categorySlug}
          initialOffset={DEALS_PER_PAGE}
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  );
}

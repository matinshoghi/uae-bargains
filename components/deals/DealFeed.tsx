import { DealCard } from "./DealCard";
import { LoadMoreButton } from "./LoadMoreButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { DEALS_PER_PAGE } from "@/lib/constants";
import type { DealWithRelations } from "@/lib/types";

interface DealFeedProps {
  initialDeals: DealWithRelations[];
  sort: string;
  categorySlug?: string;
  currentPage?: number;
  userVotes?: Record<string, number>;
  isLoggedIn?: boolean;
}

export function DealFeed({
  initialDeals,
  sort,
  categorySlug,
  currentPage = 1,
  userVotes = {},
  isLoggedIn = false,
}: DealFeedProps) {
  if (initialDeals.length === 0) {
    return <EmptyState />;
  }

  // Pages fetch (currentPage * DEALS_PER_PAGE) + 1 — the extra item tells us if there are more
  const totalVisible = currentPage * DEALS_PER_PAGE;
  const hasMore = initialDeals.length > totalVisible;
  const visibleDeals = hasMore ? initialDeals.slice(0, totalVisible) : initialDeals;

  return (
    <div>
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
          initialOffset={totalVisible}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* Hidden pagination links for search engine crawlers */}
      {hasMore && (
        <nav aria-label="Pagination" className="sr-only">
          <a href={`/?sort=${sort}&page=${currentPage + 1}`}>Next page</a>
        </nav>
      )}
      {currentPage > 1 && (
        <nav aria-label="Previous page" className="sr-only">
          <a href={currentPage === 2 ? `/?sort=${sort}` : `/?sort=${sort}&page=${currentPage - 1}`}>
            Previous page
          </a>
        </nav>
      )}
    </div>
  );
}

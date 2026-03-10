import Link from "next/link";
import { DealCard } from "./DealCard";
import { LoadMoreButton } from "./LoadMoreButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { DEALS_PER_PAGE } from "@/lib/constants";
import { PlusCircle } from "lucide-react";
import type { DealWithRelations } from "@/lib/types";

interface DealFeedProps {
  initialDeals: DealWithRelations[];
  sort: string;
  categorySlug?: string;
  currentPage?: number;
  userVotes?: Record<string, number>;
  isLoggedIn?: boolean;
  hideExpired?: boolean;
}

export function DealFeed({
  initialDeals,
  sort,
  categorySlug,
  currentPage = 1,
  userVotes = {},
  isLoggedIn = false,
  hideExpired = false,
}: DealFeedProps) {
  if (initialDeals.length === 0) {
    return <EmptyState />;
  }

  // Pages fetch (currentPage * DEALS_PER_PAGE) + 1 — the extra item tells us if there are more
  const totalVisible = currentPage * DEALS_PER_PAGE;
  const hasMore = initialDeals.length > totalVisible;
  const visibleDeals = hasMore ? initialDeals.slice(0, totalVisible) : initialDeals;
  const isSparse = visibleDeals.length <= 5;

  return (
    <div>
      {visibleDeals.map((deal, index) => (
        <DealCard
          key={deal.id}
          deal={deal}
          userVote={(userVotes[deal.id] as 1 | -1) ?? null}
          isLoggedIn={isLoggedIn}
          isHero={sort === "hot" && currentPage === 1 && index === 0}
        />
      ))}

      {hasMore && (
        <LoadMoreButton
          sort={sort}
          categorySlug={categorySlug}
          initialOffset={totalVisible}
          isLoggedIn={isLoggedIn}
          hideExpired={hideExpired}
        />
      )}

      {/* Encourage posting when there are very few deals */}
      {isSparse && !hasMore && (
        <div className="mt-8 rounded-sm border-2 border-dashed border-foreground/15 px-6 py-8 text-center">
          <PlusCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">
            Know a great deal? Share it with the community!
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Help others save by posting deals you&apos;ve found.
          </p>
          <Link
            href="/deals/new"
            className="font-display mt-4 inline-block rounded-sm border-2 border-foreground px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background"
          >
            Post a Deal
          </Link>
        </div>
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

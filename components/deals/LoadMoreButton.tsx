"use client";

import { useState, useTransition } from "react";
import { fetchMoreDeals, fetchMoreInterleavedDeals } from "@/lib/actions/deals";
import { DealCard } from "./DealCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DEALS_PER_PAGE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { DealWithRelations } from "@/lib/types";

interface LoadMoreButtonProps {
  sort: string;
  categorySlug?: string;
  initialOffset: number;
  isLoggedIn?: boolean;
  hideExpired?: boolean;
  initialActiveOffset?: number;
  initialExpiredOffset?: number;
}

export function LoadMoreButton({
  sort,
  categorySlug,
  initialOffset,
  isLoggedIn = false,
  hideExpired = false,
  initialActiveOffset,
  initialExpiredOffset,
}: LoadMoreButtonProps) {
  const [deals, setDeals] = useState<DealWithRelations[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [offset, setOffset] = useState(initialOffset);
  const [activeOffset, setActiveOffset] = useState(initialActiveOffset ?? initialOffset);
  const [expiredOffset, setExpiredOffset] = useState(initialExpiredOffset ?? 0);
  const [hasMore, setHasMore] = useState(true);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      let newDeals: DealWithRelations[];

      if (hideExpired) {
        newDeals = await fetchMoreDeals({ sort, offset, categorySlug, hideExpired });
        setOffset((prev) => prev + newDeals.length);
      } else {
        const result = await fetchMoreInterleavedDeals({
          sort,
          activeOffset,
          expiredOffset,
          categorySlug,
        });
        newDeals = result.deals;
        setActiveOffset((prev) => prev + result.activeUsed);
        setExpiredOffset((prev) => prev + result.expiredUsed);
      }

      // Fetch user votes for the new deals
      if (isLoggedIn && newDeals.length > 0) {
        const supabase = createClient();
        const dealIds = newDeals.map((d) => d.id);
        const { data: votes } = await supabase
          .from("votes")
          .select("deal_id, vote_type")
          .in("deal_id", dealIds);

        if (votes) {
          const newVotes: Record<string, number> = {};
          for (const v of votes) {
            if (v.deal_id) newVotes[v.deal_id] = v.vote_type;
          }
          setUserVotes((prev) => ({ ...prev, ...newVotes }));
        }
      }

      setDeals((prev) => [...prev, ...newDeals]);
      if (newDeals.length < DEALS_PER_PAGE) setHasMore(false);
    });
  }

  return (
    <>
      {deals.map((deal) => (
        <DealCard
          key={deal.id}
          deal={deal}
          userVote={(userVotes[deal.id] as 1 | -1) ?? null}
          isLoggedIn={isLoggedIn}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more deals"
            )}
          </Button>
        </div>
      )}
    </>
  );
}

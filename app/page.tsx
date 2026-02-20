import { Suspense } from "react";
import { CategoryBar } from "@/components/layout/CategoryBar";
import { SortBar } from "@/components/layout/SortBar";
import { DealFeed } from "@/components/deals/DealFeed";
import { fetchDeals, getUserDealVotes } from "@/lib/queries/deals";
import { DEALS_PER_PAGE } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

function CategoryBarFallback() {
  return (
    <div className="flex gap-2 px-4 py-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-20 rounded-full" />
      ))}
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = "hot" } = await searchParams;

  const [deals, { userVotes, isLoggedIn }] = await Promise.all([
    fetchDeals({ sort, limit: DEALS_PER_PAGE + 1, offset: 0 }),
    getUserDealVotes(),
  ]);

  return (
    <>
      <Suspense fallback={<CategoryBarFallback />}>
        <CategoryBar />
      </Suspense>

      <Suspense>
        <SortBar />
      </Suspense>

      <div className="mx-auto max-w-3xl px-4 py-4">
        <DealFeed
          initialDeals={deals}
          sort={sort}
          userVotes={userVotes}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </>
  );
}

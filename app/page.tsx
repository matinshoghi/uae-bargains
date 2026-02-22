import { Suspense } from "react";
import { FeedHeader } from "@/components/layout/FeedHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { DealFeed } from "@/components/deals/DealFeed";
import { HeroBannerCarousel } from "@/components/home/HeroBanner";
import { fetchDeals, getUserDealVotes } from "@/lib/queries/deals";
import { fetchActiveBanners } from "@/lib/queries/banners";
import { DEALS_PER_PAGE } from "@/lib/constants";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = "hot" } = await searchParams;

  const [deals, { userVotes, isLoggedIn }, banners] = await Promise.all([
    fetchDeals({ sort, limit: DEALS_PER_PAGE + 1, offset: 0 }),
    getUserDealVotes(),
    fetchActiveBanners(),
  ]);

  return (
    <>
      {banners.length > 0 && <HeroBannerCarousel banners={banners} />}

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Mobile sidebar — shown above feed on small screens */}
        <div className="mb-6 lg:hidden">
          <Sidebar />
        </div>

        <div className="flex gap-8">
          {/* Deal feed */}
          <div className="min-w-0 flex-1">
            <Suspense>
              <FeedHeader />
            </Suspense>
            <DealFeed
              initialDeals={deals}
              sort={sort}
              userVotes={userVotes}
              isLoggedIn={isLoggedIn}
            />
          </div>

          {/* Sidebar — desktop only */}
          <aside className="hidden w-[300px] shrink-0 lg:block">
            <Sidebar />
          </aside>
        </div>
      </div>
    </>
  );
}

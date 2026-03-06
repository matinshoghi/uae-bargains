import { FeedHeader } from "@/components/layout/FeedHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { DealFeed } from "@/components/deals/DealFeed";
import { HeroBannerCarousel } from "@/components/home/HeroBanner";
import { fetchDeals, getUserDealVotes } from "@/lib/queries/deals";
import { fetchActiveBanners } from "@/lib/queries/banners";
import { getAnonymousVotes } from "@/lib/actions/votes";
import { DEALS_PER_PAGE } from "@/lib/constants";
import { HomeJsonLd } from "@/components/seo/HomeJsonLd";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const { sort = "hot", page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  // For crawlers: if ?page=N, load N pages worth of deals so all are in the HTML
  const limit = pageNum * DEALS_PER_PAGE + 1;

  const [deals, { userVotes, isLoggedIn }, banners] = await Promise.all([
    fetchDeals({ sort, limit, offset: 0 }),
    getUserDealVotes(),
    fetchActiveBanners(),
  ]);

  // For anonymous users, fetch their anonymous votes from cookie
  const effectiveVotes = isLoggedIn ? userVotes : await getAnonymousVotes();

  return (
    <div className="px-4 pb-6 sm:px-6 lg:px-8">
      <HomeJsonLd deals={deals.slice(0, DEALS_PER_PAGE)} />
      {banners.length > 0 && (
        <div className="mb-6">
          <HeroBannerCarousel banners={banners} />
        </div>
      )}

      <div className="flex gap-8">
        {/* Deal feed */}
        <div className="min-w-0 flex-1">
          <FeedHeader sort={sort} />
          <DealFeed
            initialDeals={deals}
            sort={sort}
            currentPage={pageNum}
            userVotes={effectiveVotes}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Sidebar — desktop only */}
        <aside className="hidden w-[300px] shrink-0 lg:block">
          <Sidebar />
        </aside>
      </div>

      {/* Mobile sidebar — shown below feed on small screens */}
      <div className="mt-8 lg:hidden">
        <Sidebar />
      </div>
    </div>
  );
}

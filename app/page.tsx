import { FeedHeader } from "@/components/layout/FeedHeader";
import { HomeSidebar } from "@/components/home/HomeSidebar";
import { DealFeed } from "@/components/deals/DealFeed";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ActivityTicker } from "@/components/home/ActivityTicker";
import { fetchDeals, getUserDealVotes } from "@/lib/queries/deals";
import { getAnonymousVotes } from "@/lib/actions/votes";
import { DEALS_PER_PAGE } from "@/lib/constants";
import { HomeJsonLd } from "@/components/seo/HomeJsonLd";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string; hide_expired?: string; category?: string }>;
}) {
  const { sort = "hot", page, hide_expired, category } = await searchParams;
  const hideExpired = hide_expired === "1";
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  // For crawlers: if ?page=N, load N pages worth of deals so all are in the HTML
  const limit = pageNum * DEALS_PER_PAGE + 1;

  const [deals, { userVotes, isLoggedIn }] = await Promise.all([
    fetchDeals({ sort, limit, offset: 0, hideExpired, categorySlug: category }),
    getUserDealVotes(),
  ]);

  // For anonymous users, fetch their anonymous votes from cookie
  const effectiveVotes = isLoggedIn ? userVotes : await getAnonymousVotes();

  return (
    <div>
      <HomeJsonLd deals={deals.slice(0, DEALS_PER_PAGE)} />

      {/* Full-bleed sections */}
      <HeroSection isLoggedIn={isLoggedIn} />
      <HowItWorks />
      <ActivityTicker />

      {/* Main content area */}
      <div>
        {/* Mobile sidebar — shown above feed on small screens */}
        <div className="px-4 py-4 lg:hidden">
          <HomeSidebar sort={sort} category={category} hideExpired={hideExpired} />
        </div>

        <div className="flex">
          {/* Left sidebar — desktop only */}
          <aside className="hidden w-[268px] shrink-0 border-r border-[#e4e3dd] bg-[#fafaf6] lg:block">
            <div className="sticky top-[52px] max-h-[calc(100vh-52px)] overflow-y-auto p-5">
              <HomeSidebar sort={sort} category={category} hideExpired={hideExpired} />
            </div>
          </aside>

          {/* Deal feed */}
          <div className="min-w-0 flex-1 px-4 py-5 sm:px-6">
            <FeedHeader sort={sort} category={category} />
            <DealFeed
              initialDeals={deals}
              sort={sort}
              categorySlug={category}
              currentPage={pageNum}
              userVotes={effectiveVotes}
              isLoggedIn={isLoggedIn}
              hideExpired={hideExpired}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

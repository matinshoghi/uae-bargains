import Image from "next/image";
import Link from "next/link";
import { Flame, MessageSquare, TrendingUp } from "lucide-react";
import type { DealWithRelations } from "@/lib/types";
import { cn, formatPriceShort, shortTimeAgo } from "@/lib/utils";

function getDealPriceLabel(deal: DealWithRelations): string | null {
  if (deal.price === 0) return "Free";
  if (deal.price != null) return formatPriceShort(deal.price);
  return null;
}

interface TrendingDealsSectionProps {
  deals: DealWithRelations[];
  variant?: "default" | "sidebar";
}

export function TrendingDealsSection({
  deals,
  variant = "default",
}: TrendingDealsSectionProps) {
  if (deals.length === 0) return null;
  const isSidebar = variant === "sidebar";
  const headingId = isSidebar
    ? "trending-deals-heading-sidebar"
    : "trending-deals-heading";

  return (
    <section
      className={cn(
        "border-[1.5px] border-[#e4e3dd] bg-card",
        isSidebar ? "p-4" : "p-5 sm:p-6"
      )}
      aria-labelledby={headingId}
    >
      <div className={cn("flex flex-wrap justify-between gap-3", isSidebar ? "items-start" : "items-end")}>
        <div>
          <p className="inline-flex items-center gap-1.5 bg-primary px-2 py-0.5 font-mono-display text-[11px] font-semibold uppercase tracking-[0.1em] text-primary-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            {isSidebar ? "Trending Now" : "Trending Right Now"}
          </p>
          <h2
            id={headingId}
            className={cn(
              "mt-2 font-heading font-black tracking-tight",
              isSidebar ? "text-xl" : "text-2xl"
            )}
          >
            {isSidebar ? "Top Community Picks" : "Keep Saving — Top Community Picks"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSidebar
              ? "Hottest active deals right now."
              : "The hottest active deals UAE shoppers are opening right now."}
          </p>
        </div>

        <Link
          href="/?sort=hot"
          className="font-mono-display text-xs uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {isSidebar ? "View all →" : "Browse all hot deals →"}
        </Link>
      </div>

      <div className={cn("mt-5 grid gap-3", !isSidebar && "sm:grid-cols-2")}>
        {deals.map((trendingDeal, index) => {
          const priceLabel = getDealPriceLabel(trendingDeal);

          return (
            <Link
              key={trendingDeal.id}
              href={`/deals/${trendingDeal.slug}`}
              className="group border-[1.5px] border-[#e4e3dd] bg-background p-3 transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:border-primary hover:shadow-[3px_3px_0_var(--primary)]"
            >
              <div className="flex gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden border-[1.5px] border-[#e4e3dd] bg-[#f7f6f2]">
                  {trendingDeal.image_url ? (
                    <Image
                      src={trendingDeal.image_url}
                      alt={trendingDeal.title}
                      fill
                      className="object-contain"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Flame className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="inline-flex items-center gap-1 font-mono-display text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    <Flame className="h-3 w-3 text-primary" />
                    #{index + 1} Trending
                  </p>
                  <h3 className="mt-1 line-clamp-2 font-display text-base font-bold leading-snug tracking-tight group-hover:text-[#5a8500]">
                    {trendingDeal.title}
                  </h3>

                  {trendingDeal.categories && (
                    <p className="mt-1 font-mono-display text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                      {trendingDeal.categories.label}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#e4e3dd] pt-2">
                <div className="flex items-center gap-3 font-mono-display text-[11px] text-muted-foreground">
                  <span>▲ {trendingDeal.upvote_count}</span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {trendingDeal.comment_count}
                  </span>
                  <span>{shortTimeAgo(trendingDeal.created_at)}</span>
                </div>

                {priceLabel && (
                  <span className="bg-primary px-2 py-0.5 font-mono-display text-[11px] font-semibold text-primary-foreground">
                    {priceLabel}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

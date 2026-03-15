import Link from "next/link";
import { ExternalLink, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoteButton } from "@/components/shared/VoteButton";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { PromoCodeBadge } from "@/components/deals/PromoCodeBadge";
import { ReportExpiredButton } from "@/components/deals/ReportExpiredButton";
import type { PlatformStats } from "@/lib/queries/platform-stats";
import { formatPrice } from "@/lib/utils";
import type { DealWithRelations } from "@/lib/types";

function isExpired(deal: DealWithRelations) {
  if (deal.status === "expired") return true;
  if (deal.expires_at && new Date(deal.expires_at) < new Date()) return true;
  return false;
}

interface DealDetailSidebarProps {
  deal: DealWithRelations;
  userVote: 1 | -1 | null;
  isLoggedIn: boolean;
  platformStats: PlatformStats;
  currentUserId?: string | null;
  hasReportedExpired?: boolean;
}

export function DealDetailSidebar({
  deal,
  userVote,
  isLoggedIn,
  platformStats,
  currentUserId,
  hasReportedExpired = false,
}: DealDetailSidebarProps) {
  const expired = isExpired(deal);
  const primaryCtaHref = isLoggedIn ? "/deals/new" : "/login";
  const primaryCtaLabel = isLoggedIn ? "Share a Deal →" : "Join the community →";

  return (
    <div className="space-y-4">
      {/* Action card */}
      <div className="border-[1.5px] border-[#e4e3dd] bg-card p-5 space-y-5">
        {/* Price block */}
        {(deal.price != null || deal.original_price != null) && (
          <div className="flex flex-wrap items-baseline gap-2.5">
            {deal.price != null && deal.price === 0 ? (
              <span className="bg-primary px-2.5 py-0.5 font-mono-display text-2xl font-bold text-primary-foreground">
                Free
              </span>
            ) : deal.price != null ? (
              <span className="bg-primary px-2.5 py-0.5 font-mono-display text-2xl font-bold text-primary-foreground">
                {formatPrice(deal.price)}
              </span>
            ) : null}

            {deal.original_price != null && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(deal.original_price)}
              </span>
            )}

            {deal.discount_percentage != null && deal.discount_percentage > 0 && (
              <Badge variant="outline" className="border-destructive text-lg text-destructive">
                -{deal.discount_percentage}%
              </Badge>
            )}
          </div>
        )}

        {/* CTA */}
        {deal.url && (
          expired ? (
            <Button disabled className="w-full">
              {deal.expired_reason === "out_of_stock" ? "This deal is out of stock" : "This deal has expired"}
            </Button>
          ) : (
            <Button asChild className="w-full">
              <a href={deal.url} target="_blank" rel="noopener noreferrer" aria-label={`Go to deal: ${deal.title}`}>
                Go to Deal <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )
        )}

        {/* Promo code */}
        {deal.promo_code && <PromoCodeBadge code={deal.promo_code} />}

        {/* Vote + Share row */}
        <div className="border-t border-[#e4e3dd] pt-4">
          <div className="flex justify-center">
            <VoteButton
              entityType="deal"
              entityId={deal.id}
              upvoteCount={deal.upvote_count}
              downvoteCount={deal.downvote_count}
              userVote={userVote}
              isLoggedIn={isLoggedIn}
              disabled={expired}
              variant="detail"
            />
          </div>
          <div className="mt-4 flex justify-center border-t border-[#e4e3dd] pt-4">
            <ShareButtons url={`/deals/${deal.slug}`} title={deal.title} />
          </div>
          {/* Community "Deal expired?" report link */}
          {!expired && isLoggedIn && currentUserId && currentUserId !== deal.user_id && (
            <div className="mt-3 flex justify-center">
              <ReportExpiredButton dealId={deal.id} hasReported={hasReportedExpired} />
            </div>
          )}
        </div>
      </div>

      {/* Metadata card */}
      {(deal.location || deal.expires_at) && (
        <div className="border-[1.5px] border-[#e4e3dd] bg-card p-5 space-y-3">
          {deal.expires_at && (
            <div className="flex items-center gap-2 font-mono-display text-xs text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                {expired
                  ? `Expired ${format(new Date(deal.expires_at.split("T")[0] + "T12:00:00"), "MMM d, yyyy")}`
                  : `Expires ${format(new Date(deal.expires_at.split("T")[0] + "T12:00:00"), "MMM d, yyyy")}`}
              </span>
            </div>
          )}
          {deal.location && (
            <div className="flex items-center gap-2 font-mono-display text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{deal.location}</span>
            </div>
          )}
        </div>
      )}

      {/* About HalaSaves */}
      <section className="hidden border-[1.5px] border-[#2a2d31] bg-[#17191d] p-5 text-white lg:block">
        <p className="font-mono-display text-[11px] uppercase tracking-[0.12em] text-white/45">
          About HalaSaves
        </p>
        <h3 className="mt-2 font-heading text-3xl font-black leading-[1.08] tracking-tight">
          Your neighbours <span className="text-primary">found it cheaper.</span>
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-white/70">
          A community-driven deals platform for the UAE. Real people sharing
          real deals.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/12 pt-4">
          <div className="text-center">
            <div className="font-mono-display text-3xl text-primary">{platformStats.dealsCount}</div>
            <p className="font-mono-display text-[11px] uppercase tracking-[0.12em] text-white/45">
              deals
            </p>
          </div>
          <div className="text-center">
            <div className="font-mono-display text-3xl text-primary">{platformStats.votesCount}</div>
            <p className="font-mono-display text-[11px] uppercase tracking-[0.12em] text-white/45">
              votes
            </p>
          </div>
          <div className="text-center">
            <div className="font-mono-display text-3xl text-primary">{platformStats.commentsCount}</div>
            <p className="font-mono-display text-[11px] uppercase tracking-[0.12em] text-white/45">
              comments
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-white/12 pt-4 text-center">
          <Link
            href={primaryCtaHref}
            className="block bg-primary px-4 py-3 text-base font-bold text-primary-foreground transition-colors hover:bg-[#d8ff6a]"
          >
            {primaryCtaLabel}
          </Link>
          <Link
            href="/"
            className="mt-3 inline-block text-[15px] text-white/65 transition-colors hover:text-white"
          >
            or browse more deals →
          </Link>
        </div>
      </section>
    </div>
  );
}

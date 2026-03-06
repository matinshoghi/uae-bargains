import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";
import { ExternalLink, MapPin, Calendar, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoteButton } from "@/components/shared/VoteButton";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { DealActions } from "@/components/deals/DealActions";
import { AdminDealActions } from "@/components/deals/AdminDealActions";
import { MarkdownRenderer } from "@/components/deals/MarkdownRenderer";
import { PromoCodeBadge } from "@/components/deals/PromoCodeBadge";
import { formatPrice } from "@/lib/utils";
import type { DealWithRelations } from "@/lib/types";

function isExpired(deal: DealWithRelations) {
  if (deal.status === "expired") return true;
  if (deal.expires_at && new Date(deal.expires_at) < new Date()) return true;
  return false;
}

function wasEdited(deal: DealWithRelations) {
  if (!deal.updated_at || !deal.created_at) return false;
  const created = new Date(deal.created_at).getTime();
  const updated = new Date(deal.updated_at).getTime();
  return updated - created > 60_000;
}

interface DealDetailProps {
  deal: DealWithRelations;
  userVote?: 1 | -1 | null;
  isLoggedIn?: boolean;
  currentUserId?: string | null;
  isAdmin?: boolean;
}

export function DealDetail({ deal, userVote = null, isLoggedIn = false, currentUserId, isAdmin = false }: DealDetailProps) {
  const expired = isExpired(deal);
  const isAuthor = !!deal.user_id && currentUserId === deal.user_id;
  const edited = wasEdited(deal);
  const isRemoved = deal.status === "removed";

  return (
    <article className="space-y-6 overflow-hidden">
      {/* Admin removal banner */}
      {isRemoved && isAdmin && (
        <div className="rounded-sm border-2 border-dashed border-red-500/30 bg-red-50 p-4 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            This deal is removed{deal.removed_by === "admin" ? " by a moderator" : " by the author"}.
          </p>
          {deal.removal_reason && (
            <p className="mt-1 text-sm text-red-500">Reason: {deal.removal_reason}</p>
          )}
        </div>
      )}

      {/* Category + Badges + Author Actions */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {deal.categories && (
          <Badge variant="outline">{deal.categories.label}</Badge>
        )}
        {deal.is_featured && (
          <Badge className="inline-flex items-center gap-1">
            <Award className="h-3 w-3" />
            Staff Pick
          </Badge>
        )}
        {expired && <Badge variant="destructive">Expired</Badge>}
        {isRemoved && <Badge variant="destructive">Removed</Badge>}
        <div className="ml-auto flex items-center gap-1">
          {isAdmin && (
            <AdminDealActions dealId={deal.id} isRemoved={isRemoved} isEdited={edited} />
          )}
          {isAuthor && !isRemoved && (
            <DealActions dealId={deal.id} />
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-4xl">{deal.title}</h1>

      {/* Image */}
      {deal.image_url && (
        deal.url ? (
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${deal.title} deal link in a new tab`}
            className="group block"
          >
            <div className="grain-overlay relative aspect-video w-full overflow-hidden rounded-sm border-2 border-foreground/10 bg-background transition-opacity group-hover:opacity-95">
              <Image
                src={deal.image_url}
                alt={deal.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          </a>
        ) : (
          <div className="grain-overlay relative aspect-video w-full overflow-hidden rounded-sm border-2 border-foreground/10 bg-background">
            <Image
              src={deal.image_url}
              alt={deal.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )
      )}

      {/* Price block */}
      {(deal.price != null || deal.original_price != null) && (
        <div className="flex items-baseline gap-3">
          {deal.price != null && deal.price === 0 ? (
            <Badge className="text-lg">Free</Badge>
          ) : deal.price != null ? (
            <span className="font-display text-2xl font-bold">
              <span className="inline-flex items-center rounded-sm bg-primary px-2 py-0.5 text-primary-foreground">
                {formatPrice(deal.price)}
              </span>
            </span>
          ) : null}

          {deal.original_price != null && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(deal.original_price)}
            </span>
          )}

          {deal.discount_percentage != null && deal.discount_percentage > 0 && (
            <Badge variant="outline">-{deal.discount_percentage}%</Badge>
          )}
        </div>
      )}

      {/* Promo code */}
      {deal.promo_code && (
        <PromoCodeBadge code={deal.promo_code} />
      )}

      {/* Description */}
      <MarkdownRenderer content={deal.description} />

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-3">
        {deal.url && (
          expired ? (
            <Button disabled>
              This deal has expired
            </Button>
          ) : (
            <Button asChild>
              <a href={deal.url} target="_blank" rel="noopener noreferrer" aria-label={`Go to deal: ${deal.title}`}>
                Go to Deal <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )
        )}

        {deal.location && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{deal.location}</span>
          </div>
        )}

        {deal.expires_at && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {expired
                ? `Expired ${format(new Date(deal.expires_at.split("T")[0] + "T12:00:00"), "MMM d, yyyy")}`
                : `Expires ${format(new Date(deal.expires_at.split("T")[0] + "T12:00:00"), "MMM d, yyyy")}`}
            </span>
          </div>
        )}
      </div>

      {/* Vote + Share */}
      <div className="border-t-2 border-foreground pt-4 space-y-2">
        <div className="flex items-center gap-3">
          <VoteButton
            entityType="deal"
            entityId={deal.id}
            upvoteCount={deal.upvote_count}
            downvoteCount={deal.downvote_count}
            userVote={userVote}
            isLoggedIn={isLoggedIn}
          />
          <ShareButtons url={`/deals/${deal.id}`} title={deal.title} />
        </div>

        {/* Posted by + Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {deal.profiles ? (
            <span className="font-display font-semibold text-foreground">
              {deal.profiles.username}
            </span>
          ) : (
            <span className="font-medium">[deleted]</span>
          )}
          <span>&middot;</span>
          <time dateTime={deal.created_at}>
            {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
          </time>
          {edited && (
            <span
              className="cursor-help"
              title={`Edited ${format(new Date(deal.updated_at), "MMM d, yyyy 'at' h:mm a")}`}
            >
              (edited)
            </span>
          )}
        </div>
      </div>

    </article>
  );
}

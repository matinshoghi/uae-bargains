import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  ImageIcon,
  Smartphone,
  UtensilsCrossed,
  Shirt,
  ShoppingCart,
  Plane,
  Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VoteButton } from "@/components/shared/VoteButton";
import { formatPriceShort } from "@/lib/utils";
import type { DealWithRelations } from "@/lib/types";

function isExpired(deal: DealWithRelations) {
  if (deal.status === "expired") return true;
  if (deal.expires_at && new Date(deal.expires_at) < new Date()) return true;
  return false;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  electronics: Smartphone,
  dining: UtensilsCrossed,
  fashion: Shirt,
  groceries: ShoppingCart,
  travel: Plane,
};

interface DealCardProps {
  deal: DealWithRelations;
  userVote?: 1 | -1 | null;
  isLoggedIn?: boolean;
}

export function DealCard({ deal, userVote = null, isLoggedIn = false }: DealCardProps) {
  const expired = isExpired(deal);
  const CategoryIcon = deal.categories
    ? CATEGORY_ICONS[deal.categories.slug] ?? Tag
    : null;

  return (
    <article
      className={`relative flex items-start gap-4 px-1 py-6 ${expired ? "opacity-60" : ""}`}
    >
      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        {/* Title */}
        <h3 className="text-[15px] font-semibold leading-snug">
          <Link
            href={`/deals/${deal.id}`}
            className="after:absolute after:inset-0"
          >
            {deal.title}
          </Link>
        </h3>

        {/* Description */}
        {deal.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {deal.description}
          </p>
        )}

        {/* Price row */}
        {(deal.price != null || deal.original_price != null) && (
          <div className="flex items-baseline gap-2">
            {deal.price != null && deal.price === 0 ? (
              <Badge className="bg-emerald-600 text-xs">Free</Badge>
            ) : deal.price != null ? (
              <span className="text-sm font-bold text-emerald-600">
                {formatPriceShort(deal.price)}
              </span>
            ) : null}

            {deal.original_price != null && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPriceShort(deal.original_price)}
              </span>
            )}

            {deal.discount_percentage != null &&
              deal.discount_percentage > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  -{deal.discount_percentage}%
                </Badge>
              )}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2.5 pt-1 text-xs text-muted-foreground">
          <div className="relative z-10">
            <VoteButton
              entityType="deal"
              entityId={deal.id}
              upvoteCount={deal.upvote_count}
              downvoteCount={deal.downvote_count}
              userVote={userVote}
              isLoggedIn={isLoggedIn}
            />
          </div>

          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{deal.comment_count}</span>
          </div>

          <span className="text-border">&middot;</span>

          <time dateTime={deal.created_at}>
            {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
          </time>

          <>
            <span className="text-border">&middot;</span>
            {deal.profiles ? (
              <Link
                href={`/user/${deal.profiles.username}`}
                className="relative z-10 hover:text-foreground hover:underline"
              >
                {deal.profiles.display_name ?? deal.profiles.username}
              </Link>
            ) : (
              <span>[deleted]</span>
            )}
          </>

          {deal.categories && CategoryIcon && (
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]"
            >
              <CategoryIcon className="h-3 w-3" />
              {deal.categories.label}
            </Badge>
          )}

          {expired && (
            <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
              Expired
            </Badge>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      <div className="shrink-0 self-center">
        {deal.image_url ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-xl border bg-muted/40 md:h-[100px] md:w-[100px]">
            <Image
              src={deal.image_url}
              alt={deal.title}
              fill
              className="object-contain p-1.5"
              sizes="(max-width: 768px) 80px, 100px"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border bg-muted md:h-[100px] md:w-[100px]">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
    </article>
  );
}

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VoteButton } from "@/components/shared/VoteButton";
import { formatPriceShort } from "@/lib/utils";
import type { DealWithRelations } from "@/lib/types";

function isExpired(deal: DealWithRelations) {
  if (deal.status === "expired") return true;
  if (deal.expires_at && new Date(deal.expires_at) < new Date()) return true;
  return false;
}

interface DealCardProps {
  deal: DealWithRelations;
  userVote?: 1 | -1 | null;
  isLoggedIn?: boolean;
}

export function DealCard({ deal, userVote = null, isLoggedIn = false }: DealCardProps) {
  const expired = isExpired(deal);

  return (
    <Link href={`/deals/${deal.id}`} className="block">
      <article
        className={`flex gap-4 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
          expired ? "opacity-60" : ""
        }`}
      >
        {/* Vote column (desktop) */}
        <div className="hidden shrink-0 md:flex">
          <VoteButton
            entityType="deal"
            entityId={deal.id}
            upvoteCount={deal.upvote_count}
            downvoteCount={deal.downvote_count}
            userVote={userVote}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Thumbnail */}
        <div className="hidden shrink-0 md:block">
          {deal.image_url ? (
            <div className="relative h-20 w-20 overflow-hidden rounded-lg border">
              <Image
                src={deal.image_url}
                alt={deal.title}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Category + time */}
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            {deal.categories && (
              <span className="font-medium">{deal.categories.label}</span>
            )}
            <span>&middot;</span>
            <time dateTime={deal.created_at}>
              {formatDistanceToNow(new Date(deal.created_at), {
                addSuffix: true,
              })}
            </time>
            {expired && (
              <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0">
                Expired
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug md:text-base">
            {deal.title}
          </h3>

          {/* Mobile image */}
          {deal.image_url && (
            <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-lg border md:hidden">
              <Image
                src={deal.image_url}
                alt={deal.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 0px"
                unoptimized
              />
            </div>
          )}

          {/* Price row */}
          {(deal.price != null || deal.original_price != null) && (
            <div className="mt-1.5 flex items-baseline gap-2">
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
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    -{deal.discount_percentage}%
                  </Badge>
                )}
            </div>
          )}

          {/* Bottom row: mobile votes + comments */}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {/* Mobile vote display */}
            <div className="md:hidden">
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
              <span>{deal.comment_count} comments</span>
            </div>

            {deal.profiles && (
              <>
                <span>&middot;</span>
                <Link
                  href={`/user/${deal.profiles.username}`}
                  className="hover:text-foreground hover:underline"
                >
                  {deal.profiles.display_name ?? deal.profiles.username}
                </Link>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

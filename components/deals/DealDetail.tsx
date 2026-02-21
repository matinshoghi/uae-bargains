import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { ExternalLink, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteButton } from "@/components/shared/VoteButton";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { formatPrice } from "@/lib/utils";
import type { DealWithRelations } from "@/lib/types";

function isExpired(deal: DealWithRelations) {
  if (deal.status === "expired") return true;
  if (deal.expires_at && new Date(deal.expires_at) < new Date()) return true;
  return false;
}

interface DealDetailProps {
  deal: DealWithRelations;
  userVote?: 1 | -1 | null;
  isLoggedIn?: boolean;
}

export function DealDetail({ deal, userVote = null, isLoggedIn = false }: DealDetailProps) {
  const expired = isExpired(deal);

  return (
    <article className="space-y-6">
      {/* Category + Time */}
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        {deal.categories && (
          <span className="font-medium">
            {deal.categories.label}
          </span>
        )}
        <span>&middot;</span>
        <time dateTime={deal.created_at}>
          {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
        </time>
        {expired && <Badge variant="destructive">Expired</Badge>}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold md:text-3xl">{deal.title}</h1>

      {/* Image */}
      {deal.image_url && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src={deal.image_url}
            alt={deal.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 768px"
            unoptimized
          />
        </div>
      )}

      {/* Price block */}
      {(deal.price != null || deal.original_price != null) && (
        <div className="flex items-baseline gap-3">
          {deal.price != null && deal.price === 0 ? (
            <Badge className="bg-emerald-600 text-lg">Free</Badge>
          ) : deal.price != null ? (
            <span className="text-2xl font-bold text-emerald-600">
              {formatPrice(deal.price)}
            </span>
          ) : null}

          {deal.original_price != null && (
            <span className="text-muted-foreground text-lg line-through">
              {formatPrice(deal.original_price)}
            </span>
          )}

          {deal.discount_percentage != null && deal.discount_percentage > 0 && (
            <Badge variant="secondary">-{deal.discount_percentage}%</Badge>
          )}
        </div>
      )}

      {/* Description */}
      <div className="whitespace-pre-line leading-relaxed">
        {deal.description}
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-3">
        {deal.url && (
          expired ? (
            <Button disabled>
              This deal has expired
            </Button>
          ) : (
            <Button asChild>
              <a href={deal.url} target="_blank" rel="noopener noreferrer">
                Go to Deal <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )
        )}

        {deal.location && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{deal.location}</span>
          </div>
        )}

        {deal.expires_at && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Calendar className="h-4 w-4" />
            <span>
              {expired
                ? `Expired ${format(new Date(deal.expires_at.split("T")[0] + "T12:00:00"), "MMM d, yyyy")}`
                : `Expires ${format(new Date(deal.expires_at.split("T")[0] + "T12:00:00"), "MMM d, yyyy")}`}
            </span>
          </div>
        )}
      </div>

      {/* Vote + Share + Posted by */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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

          {/* Posted by */}
          {deal.profiles && (
            <Link
              href={`/user/${deal.profiles.username}`}
              className="flex items-center gap-2 hover:opacity-80"
            >
              <span className="text-muted-foreground text-sm">Posted by</span>
              <Avatar className="h-6 w-6">
                <AvatarImage src={deal.profiles.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">
                  {(deal.profiles.display_name ?? deal.profiles.username)
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {deal.profiles.display_name ?? deal.profiles.username}
              </span>
            </Link>
          )}
        </div>
      </div>

    </article>
  );
}

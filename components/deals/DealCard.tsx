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
  Home,
  Dumbbell,
  HeartPulse,
  Car,
  BookOpen,
  Baby,
  PawPrint,
  Gamepad2,
  Sparkles,
  Award,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VoteButton } from "@/components/shared/VoteButton";
import { ShareIconButton } from "@/components/shared/ShareIconButton";
import { formatPriceShort } from "@/lib/utils";
import { stripMarkdown } from "@/lib/utils";
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
  home: Home,
  sports: Dumbbell,
  "health-beauty": HeartPulse,
  automotive: Car,
  office: BookOpen,
  toys: Baby,
  pets: PawPrint,
  "video-games": Gamepad2,
  hobby: Sparkles,
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
      className={`relative border-b-2 border-foreground/15 px-1 py-6 last:border-b-0 ${expired ? "opacity-60" : ""}`}
    >
      <div className="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-2">
        {/* Badges + Title — full width on mobile, left column on sm+ */}
        <div className="col-span-2 space-y-2 sm:col-span-1">
          {/* Top row: category badge + staff pick */}
          <div className="flex items-center gap-1.5">
            {deal.categories && CategoryIcon ? (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px]"
              >
                <CategoryIcon className="h-3 w-3" />
                {deal.categories.label}
              </Badge>
            ) : null}

            {deal.is_featured && (
              <Badge className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px]">
                <Award className="h-3 w-3" />
                Staff Pick
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display text-[22px] font-bold leading-snug tracking-tight">
            <Link
              href={`/deals/${deal.slug}`}
              className="after:absolute after:inset-0"
            >
              {deal.title}
            </Link>
          </h3>
        </div>

        {/* Description + Price + Meta — left column */}
        <div className="col-start-1 min-w-0 space-y-2">
          {/* Description */}
          {deal.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {stripMarkdown(deal.description)}
            </p>
          )}

          {/* Price row */}
          {(deal.price != null || deal.original_price != null) && (
            <div className="flex flex-wrap items-baseline gap-2">
              {deal.price != null && deal.price === 0 ? (
                <Badge className="text-[18px] px-1.5 py-0.5">Free</Badge>
              ) : deal.price != null ? (
                <span className="font-display text-[18px] font-bold text-primary-foreground">
                  <span className="inline-flex items-center rounded-sm border border-foreground bg-primary px-1.5 py-0.5">
                    {formatPriceShort(deal.price)}
                  </span>
                </span>
              ) : null}

              {deal.original_price != null && (
                <span className="text-[18px] text-muted-foreground line-through">
                  {formatPriceShort(deal.original_price)}
                </span>
              )}

              {deal.discount_percentage != null &&
                deal.discount_percentage > 0 && (
                  <Badge variant="outline" className="border-destructive px-1.5 py-0.5 text-[18px] text-destructive">
                    -{deal.discount_percentage}%
                  </Badge>
                )}
            </div>
          )}

          {/* Meta row 1: votes + comments + share */}
          <div className="flex items-center gap-2.5 pt-0.5 text-xs text-muted-foreground">
            <div className="relative z-10">
              <VoteButton
                entityType="deal"
                entityId={deal.id}
                upvoteCount={deal.upvote_count}
                downvoteCount={deal.downvote_count}
                userVote={userVote}
                isLoggedIn={isLoggedIn}
                disabled={expired}
              />
            </div>

            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{deal.comment_count}</span>
            </div>

            <ShareIconButton
              url={`/deals/${deal.slug}`}
              title={deal.title}
              className="relative z-10 text-muted-foreground transition-colors hover:text-foreground"
            />

            {expired && (
              <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                Expired
              </Badge>
            )}
          </div>

          {/* Meta row 2: timestamp + author */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <time dateTime={deal.created_at}>
              {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
            </time>

            <span className="text-foreground/20">&middot;</span>

            {deal.profiles ? (
              <span>{deal.profiles.username}</span>
            ) : (
              <span>[deleted user]</span>
            )}
          </div>
        </div>

        {/* Thumbnail — beside description on mobile, top-aligned on sm+ */}
        <div className="row-start-2 col-start-2 self-start sm:row-start-1 sm:row-span-2">
          <Link
            href={`/deals/${deal.slug}`}
            aria-label={`View details for ${deal.title}`}
            className="relative z-10 block"
          >
            {deal.image_url ? (
              <div className="relative h-28 w-28 overflow-hidden rounded-sm bg-black/5 sm:h-36 sm:w-36 md:h-[180px] md:w-[180px]">
                <Image
                  src={deal.image_url}
                  alt={deal.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 180px"
                />
              </div>
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-sm bg-black/5 sm:h-36 sm:w-36 md:h-[180px] md:w-[180px]">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </Link>
        </div>
      </div>
    </article>
  );
}

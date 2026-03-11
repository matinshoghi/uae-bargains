import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DealActions } from "@/components/deals/DealActions";
import { AdminDealActions } from "@/components/deals/AdminDealActions";
import { MarkdownRenderer } from "@/components/deals/MarkdownRenderer";
import { UserAvatar } from "@/components/shared/UserAvatar";
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
  currentUserId?: string | null;
  isAdmin?: boolean;
}

export function DealDetail({ deal, currentUserId, isAdmin = false }: DealDetailProps) {
  const expired = isExpired(deal);
  const isAuthor = !!deal.user_id && currentUserId === deal.user_id;
  const edited = wasEdited(deal);
  const isRemoved = deal.status === "removed";

  return (
    <article className="space-y-5 overflow-hidden">
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

      {/* Breadcrumb + badges + actions */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/" className="font-mono-display text-xs text-muted-foreground hover:text-foreground transition-colors">
          Home
        </Link>
        {deal.categories && (
          <>
            <span className="text-muted-foreground/40">→</span>
            <Badge variant="outline">{deal.categories.label}</Badge>
          </>
        )}
        {deal.is_featured && (
          <Badge
            className="inline-flex items-center gap-1"
            title="Hand-picked by the HalaSaves team."
          >
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
            <DealActions dealId={deal.id} dealSlug={deal.slug} />
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="font-heading text-2xl font-black tracking-tight md:text-4xl">
        {deal.title}
      </h1>

      {/* Author + Time */}
      <div className="flex items-center gap-2.5">
        {deal.profiles && (
          <UserAvatar
            src={deal.profiles.avatar_url}
            name={deal.profiles.username}
            size="sm"
          />
        )}
        <div className="flex items-center gap-1.5 font-mono-display text-xs text-muted-foreground">
          {deal.profiles ? (
            <span className="font-medium text-foreground">{deal.profiles.username}</span>
          ) : (
            <span className="font-medium">[deleted]</span>
          )}
          <span className="text-foreground/20">&middot;</span>
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

      {/* Image */}
      {deal.image_url && (
        deal.url ? (
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${deal.title} deal link in a new tab`}
            className="block"
          >
            <div className="grain-overlay relative aspect-video w-full overflow-hidden border-[1.5px] border-[#e4e3dd] bg-background">
              <Image
                src={deal.image_url}
                alt={deal.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 680px"
                priority
              />
            </div>
          </a>
        ) : (
          <div className="grain-overlay relative aspect-video w-full overflow-hidden border-[1.5px] border-[#e4e3dd] bg-background">
            <Image
              src={deal.image_url}
              alt={deal.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 680px"
              priority
            />
          </div>
        )
      )}

      {/* Description */}
      <MarkdownRenderer content={deal.description} />
    </article>
  );
}

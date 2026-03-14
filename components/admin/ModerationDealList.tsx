"use client";

import { useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  RotateCcw,
  ExternalLink,
  Pencil,
  MessageSquare,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { restoreDeal } from "@/lib/actions/admin";
import { pushDealToTelegram } from "@/lib/actions/telegram";
import type { DealWithRelations } from "@/lib/types";

type EffectiveStatus = "active" | "expired" | "removed";

function isExpired(deal: DealWithRelations) {
  if (deal.status === "expired") return true;
  if (deal.expires_at && new Date(deal.expires_at) < new Date()) return true;
  return false;
}

function getEffectiveStatus(deal: DealWithRelations): EffectiveStatus {
  if (deal.status === "removed") return "removed";
  if (isExpired(deal)) return "expired";
  return "active";
}

interface ModerationDealListProps {
  deals: DealWithRelations[];
  pushMap?: Record<string, string | null>;
}

export function ModerationDealList({ deals, pushMap }: ModerationDealListProps) {
  const [isPending, startTransition] = useTransition();

  function handleRestore(dealId: string) {
    startTransition(async () => {
      const result = await restoreDeal(dealId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Deal restored");
      }
    });
  }

  function handleTelegramPush(dealId: string) {
    startTransition(async () => {
      const result = await pushDealToTelegram(dealId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Sent to Telegram");
      }
    });
  }

  return (
    <div className="space-y-4">
      {deals.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No deals match your filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full table-fixed border-collapse text-sm">
            <colgroup>
              <col className="w-[48%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Deal</th>
                <th className="px-4 py-3 text-left font-semibold">Author</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-left font-semibold">Created</th>
                <th className="px-4 py-3 text-left font-semibold">Signals</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deals.map((deal) => {
                const status = getEffectiveStatus(deal);
                const lastPushedAt = pushMap?.[deal.id] ?? null;
                const telegramLabel = lastPushedAt
                  ? `Send to Telegram (last ${formatDistanceToNow(new Date(lastPushedAt), {
                      addSuffix: true,
                    })})`
                  : "Send to Telegram";

                return (
                  <tr key={deal.id} className="align-top">
                    <td className="px-4 py-3">
                      <div className="min-w-0 space-y-1">
                        <Link
                          href={`/deals/${deal.slug}`}
                          className="block truncate font-medium hover:underline"
                          title={deal.title}
                        >
                          {deal.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1">
                          <StatusBadge status={status} />
                          {deal.removed_by === "admin" && (
                            <Badge variant="outline" className="text-[10px]">
                              By Admin
                            </Badge>
                          )}
                        </div>
                        {deal.removal_reason && (
                          <p className="text-xs text-red-500">
                            Reason: {deal.removal_reason}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <span className="block truncate" title={deal.profiles?.username ?? "[deleted]"}>
                        {deal.profiles?.username ?? "[deleted]"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <span className="block truncate" title={deal.categories?.label ?? "—"}>
                        {deal.categories?.label ?? "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(deal.created_at), {
                        addSuffix: true,
                      })}
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      ▲{deal.upvote_count} ▼{deal.downvote_count} · {deal.comment_count}c
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon-xs"
                          className="text-muted-foreground"
                          title="View deal"
                        >
                          <Link href={`/deals/${deal.slug}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="ghost"
                          size="icon-xs"
                          className="text-muted-foreground"
                          title="Edit deal"
                        >
                          <Link href={`/admin/moderation/${deal.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="text-muted-foreground"
                              title="More actions"
                              disabled={isPending}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/deals/${deal.id}/comments`}>
                                <MessageSquare className="h-4 w-4" />
                                Manage comments
                              </Link>
                            </DropdownMenuItem>
                            {status === "active" && (
                              <DropdownMenuItem
                                onSelect={() => handleTelegramPush(deal.id)}
                              >
                                <Send className="h-4 w-4" />
                                {telegramLabel}
                              </DropdownMenuItem>
                            )}
                            {status === "removed" ? (
                              <DropdownMenuItem onSelect={() => handleRestore(deal.id)}>
                                <RotateCcw className="h-4 w-4" />
                                Restore deal
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: EffectiveStatus }) {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="outline"
          className="border-green-500/50 px-1.5 py-0 text-[10px] text-green-600 dark:text-green-400"
        >
          Active
        </Badge>
      );
    case "expired":
      return (
        <Badge
          variant="outline"
          className="border-yellow-500/50 px-1.5 py-0 text-[10px] text-yellow-600 dark:text-yellow-400"
        >
          Expired
        </Badge>
      );
    case "removed":
      return (
        <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
          Removed
        </Badge>
      );
    default:
      return null;
  }
}

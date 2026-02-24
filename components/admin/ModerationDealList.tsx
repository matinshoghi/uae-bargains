"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Search, Pencil, Trash2, RotateCcw, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REMOVAL_REASONS } from "@/lib/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { removeDeal, restoreDeal } from "@/lib/actions/admin";
import type { DealWithRelations } from "@/lib/types";

type StatusFilter = "all" | "active" | "expired" | "removed";

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Expired", value: "expired" },
  { label: "Removed", value: "removed" },
];

function isExpired(deal: DealWithRelations) {
  if (deal.status === "expired") return true;
  if (deal.expires_at && new Date(deal.expires_at) < new Date()) return true;
  return false;
}

function getEffectiveStatus(deal: DealWithRelations): StatusFilter {
  if (deal.status === "removed") return "removed";
  if (isExpired(deal)) return "expired";
  return "active";
}

export function ModerationDealList({ deals }: { deals: DealWithRelations[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [removeReason, setRemoveReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return deals.filter((deal) => {
      if (statusFilter !== "all" && getEffectiveStatus(deal) !== statusFilter) {
        return false;
      }
      if (search && !deal.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [deals, statusFilter, search]);

  function handleRemove() {
    if (!removeTarget) return;
    const dealId = removeTarget;
    startTransition(async () => {
      const result = await removeDeal(dealId, removeReason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Deal removed");
      }
      setRemoveTarget(null);
      setRemoveReason("");
    });
  }

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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background hover:bg-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} deal{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Deal list */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No deals match your filters.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {filtered.map((deal) => {
            const status = getEffectiveStatus(deal);
            return (
              <li key={deal.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{deal.title}</p>
                    <StatusBadge status={status} />
                    {deal.removed_by === "admin" && (
                      <Badge variant="outline" className="text-[10px]">
                        By Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {deal.profiles?.username ?? "[deleted]"} &middot;{" "}
                    {deal.categories?.label ?? "—"} &middot;{" "}
                    {formatDistanceToNow(new Date(deal.created_at), {
                      addSuffix: true,
                    })}{" "}
                    &middot; ▲{deal.upvote_count} ▼{deal.downvote_count}
                  </p>
                  {deal.removal_reason && (
                    <p className="mt-0.5 text-xs text-red-500">
                      Reason: {deal.removal_reason}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/deals/${deal.id}`}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title="View deal"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/moderation/${deal.id}/edit`}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title="Edit deal"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  {status === "removed" ? (
                    <button
                      onClick={() => handleRestore(deal.id)}
                      disabled={isPending}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                      title="Restore deal"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setRemoveTarget(deal.id)}
                      disabled={isPending}
                      className="rounded-md p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
                      title="Remove deal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Remove confirmation dialog */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRemoveTarget(null);
            setRemoveReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this deal?</AlertDialogTitle>
            <AlertDialogDescription>
              The deal will be hidden from the public feed. You can restore it
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <label className="text-sm font-medium">
              Reason
            </label>
            <Select value={removeReason} onValueChange={setRemoveReason}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a reason…" />
              </SelectTrigger>
              <SelectContent>
                {REMOVAL_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusBadge({ status }: { status: StatusFilter }) {
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

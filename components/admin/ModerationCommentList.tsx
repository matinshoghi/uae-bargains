"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { Search, Pencil, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  adminHideComment,
  adminUnhideComment,
  adminEditComment,
  adminDeleteComment,
} from "@/lib/actions/admin";
import type { AdminComment } from "@/lib/types";

type StatusFilter = "all" | "visible" | "hidden";

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Visible", value: "visible" },
  { label: "Hidden", value: "hidden" },
];

function toLocalDatetime(isoString: string): string {
  return format(new Date(isoString), "yyyy-MM-dd'T'HH:mm");
}

export function ModerationCommentList({
  comments,
}: {
  comments: AdminComment[];
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<AdminComment | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTimestamp, setEditTimestamp] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return comments.filter((c) => {
      if (statusFilter === "visible" && c.is_hidden) return false;
      if (statusFilter === "hidden" && !c.is_hidden) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchContent = c.content.toLowerCase().includes(q);
        const matchUser = c.profiles?.username?.toLowerCase().includes(q);
        if (!matchContent && !matchUser) return false;
      }
      return true;
    });
  }, [comments, statusFilter, search]);

  function handleToggleHide(comment: AdminComment) {
    startTransition(async () => {
      const action = comment.is_hidden ? adminUnhideComment : adminHideComment;
      const result = await action(comment.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(comment.is_hidden ? "Comment unhidden" : "Comment hidden");
      }
    });
  }

  function openEdit(comment: AdminComment) {
    setEditContent(comment.content);
    setEditTimestamp(toLocalDatetime(comment.created_at));
    setEditTarget(comment);
  }

  function handleSaveEdit() {
    if (!editTarget) return;
    startTransition(async () => {
      const fields: { content?: string; created_at?: string } = {};

      if (editContent.trim() && editContent.trim() !== editTarget.content) {
        fields.content = editContent.trim();
      }

      const newTimestamp = new Date(editTimestamp).toISOString();
      if (newTimestamp !== editTarget.created_at) {
        fields.created_at = newTimestamp;
      }

      if (Object.keys(fields).length === 0) {
        setEditTarget(null);
        return;
      }

      const result = await adminEditComment(editTarget.id, fields);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Comment updated");
      }
      setEditTarget(null);
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const commentId = deleteTarget;
    startTransition(async () => {
      const result = await adminDeleteComment(commentId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Comment deleted");
      }
      setDeleteTarget(null);
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
            placeholder="Search by content or username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} comment{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Comment list */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No comments match your filters.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {filtered.map((comment) => (
            <li key={comment.id} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {comment.content.length > 80
                      ? comment.content.slice(0, 80) + "…"
                      : comment.content}
                  </p>
                  <StatusBadge hidden={comment.is_hidden} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {comment.profiles?.username
                    ? `@${comment.profiles.username}`
                    : "[deleted]"}{" "}
                  &middot;{" "}
                  {comment.deals?.title
                    ? comment.deals.title.length > 40
                      ? comment.deals.title.slice(0, 40) + "…"
                      : comment.deals.title
                    : "[deleted deal]"}{" "}
                  &middot;{" "}
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/deals/${comment.deal_id}`}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  title="View deal"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleToggleHide(comment)}
                  disabled={isPending}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                  title={comment.is_hidden ? "Unhide comment" : "Hide comment"}
                >
                  {comment.is_hidden ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(comment)}
                  disabled={isPending}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                  title="Edit comment"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(comment.id)}
                  disabled={isPending}
                  className="rounded-md p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
                  title="Delete comment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Comment</DialogTitle>
            <DialogDescription>
              Modify the comment content or adjust the timestamp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Content</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                maxLength={2000}
                className="mt-1.5 block w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Timestamp</label>
              <input
                type="datetime-local"
                value={editTimestamp}
                onChange={(e) => setEditTimestamp(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the comment. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusBadge({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
        Hidden
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-green-500/50 px-1.5 py-0 text-[10px] text-green-600 dark:text-green-400"
    >
      Visible
    </Badge>
  );
}

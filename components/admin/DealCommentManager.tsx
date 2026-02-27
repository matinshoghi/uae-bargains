"use client";

import { useState, useTransition } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  MessageSquare,
  ThumbsUp,
  ChevronUp,
  Plus,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  adminEditComment,
  adminHideComment,
  adminUnhideComment,
  adminDeleteComment,
} from "@/lib/actions/admin";
import {
  commentAsSeedUser,
  voteCommentAsSeedUsers,
} from "@/lib/actions/seed";
import type { SeedUserWithProfile } from "@/lib/queries/seed";
import type { CommentWithProfile, CommentWithChildren } from "@/lib/types";

function toLocalDatetime(isoString: string): string {
  return format(new Date(isoString), "yyyy-MM-dd'T'HH:mm");
}

type Props = {
  dealId: string;
  comments: CommentWithProfile[];
  commentTree: CommentWithChildren[];
  seedUsers: SeedUserWithProfile[];
  seedVotedMap: Record<string, string[]>;
};

export function DealCommentManager({
  dealId,
  comments,
  commentTree,
  seedUsers,
  seedVotedMap,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Active inline panels (only one at a time)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);

  // Edit form state
  const [editContent, setEditContent] = useState("");
  const [editTimestamp, setEditTimestamp] = useState("");

  // Reply form state
  const [replyUserId, setReplyUserId] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyTimestamp, setReplyTimestamp] = useState("");

  // New comment form state
  const [newUserId, setNewUserId] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTimestamp, setNewTimestamp] = useState("");

  // Vote form state
  const [selectedVoterIds, setSelectedVoterIds] = useState<Set<string>>(
    new Set()
  );

  function clearPanels() {
    setEditingId(null);
    setReplyingToId(null);
    setVotingId(null);
  }

  function openEdit(comment: CommentWithProfile) {
    clearPanels();
    setEditContent(comment.content);
    setEditTimestamp(toLocalDatetime(comment.created_at));
    setEditingId(comment.id);
  }

  function openReply(commentId: string) {
    clearPanels();
    setReplyUserId(seedUsers[0]?.user_id ?? "");
    setReplyContent("");
    setReplyTimestamp("");
    setReplyingToId(commentId);
  }

  function openVote(commentId: string) {
    clearPanels();
    // Pre-select users who already voted
    const alreadyVoted = seedVotedMap[commentId] ?? [];
    setSelectedVoterIds(new Set(alreadyVoted));
    setVotingId(commentId);
  }

  function handleSaveEdit() {
    if (!editingId) return;
    const commentId = editingId;
    startTransition(async () => {
      const original = comments.find((c) => c.id === commentId);
      const fields: { content?: string; created_at?: string } = {};

      if (editContent.trim() && editContent.trim() !== original?.content) {
        fields.content = editContent.trim();
      }

      const newTs = new Date(editTimestamp).toISOString();
      if (newTs !== original?.created_at) {
        fields.created_at = newTs;
      }

      if (Object.keys(fields).length === 0) {
        setEditingId(null);
        return;
      }

      const result = await adminEditComment(commentId, fields);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Comment updated");
        setEditingId(null);
      }
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

  function handleToggleHide(comment: CommentWithProfile) {
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

  function handleReply() {
    if (!replyingToId) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("user_id", replyUserId);
      formData.set("deal_id", dealId);
      formData.set("content", replyContent.trim());
      formData.set("parent_id", replyingToId);
      if (replyTimestamp) {
        formData.set("created_at", replyTimestamp);
      }

      const result = await commentAsSeedUser(null, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Reply posted");
        setReplyingToId(null);
      }
    });
  }

  function handleNewComment(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.set("user_id", newUserId);
      formData.set("deal_id", dealId);
      formData.set("content", newContent.trim());
      if (newTimestamp) {
        formData.set("created_at", newTimestamp);
      }

      const result = await commentAsSeedUser(null, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Comment posted");
        setNewContent("");
        setNewTimestamp("");
      }
    });
  }

  function handleAddVotes() {
    if (!votingId) return;
    const commentId = votingId;
    const alreadyVoted = new Set(seedVotedMap[commentId] ?? []);
    const newVoters = Array.from(selectedVoterIds).filter(
      (id) => !alreadyVoted.has(id)
    );

    if (newVoters.length === 0) {
      toast.error("No new voters selected");
      return;
    }

    startTransition(async () => {
      const result = await voteCommentAsSeedUsers(commentId, newVoters);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`${newVoters.length} upvote(s) added`);
        setVotingId(null);
      }
    });
  }

  function renderComment(node: CommentWithChildren, depth: number) {
    const isEditing = editingId === node.id;
    const isReplying = replyingToId === node.id;
    const isVoting = votingId === node.id;
    const alreadyVoted = seedVotedMap[node.id] ?? [];

    return (
      <div key={node.id} className={depth > 0 ? "ml-8 border-l-2 border-border pl-4" : ""}>
        <div
          className={`rounded-lg border p-3 ${
            node.is_hidden
              ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30"
              : "border-border"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">
                {node.profiles?.username
                  ? `@${node.profiles.username}`
                  : "[deleted user]"}
              </span>
              <span className="text-muted-foreground" title={format(new Date(node.created_at), "PPpp")}>
                {formatDistanceToNow(new Date(node.created_at), {
                  addSuffix: true,
                })}
              </span>
              <span className="flex items-center gap-0.5 text-muted-foreground">
                <ChevronUp className="h-3.5 w-3.5" />
                {node.upvote_count - node.downvote_count}
              </span>
              {node.is_hidden && (
                <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                  Hidden
                </Badge>
              )}
              {node.is_edited && (
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                  Edited
                </Badge>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                onClick={() => openEdit(node)}
                disabled={isPending}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {node.depth < 1 && (
                <button
                  onClick={() => openReply(node.id)}
                  disabled={isPending}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                  title="Reply as seed user"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => openVote(node.id)}
                disabled={isPending}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                title="Add upvotes"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleToggleHide(node)}
                disabled={isPending}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                title={node.is_hidden ? "Unhide" : "Hide"}
              >
                {node.is_hidden ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => setDeleteTarget(node.id)}
                disabled={isPending}
                className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isEditing && (
            <p className="mt-1.5 whitespace-pre-wrap text-sm">{node.content}</p>
          )}

          {/* Inline edit form */}
          {isEditing && (
            <div className="mt-2 space-y-3 rounded-md border border-border bg-muted/30 p-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Content
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="mt-1 block w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Timestamp
                </label>
                <input
                  type="datetime-local"
                  value={editTimestamp}
                  onChange={(e) => setEditTimestamp(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit} disabled={isPending}>
                  {isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingId(null)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Inline reply form */}
          {isReplying && (
            <div className="mt-2 space-y-3 rounded-md border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Reply to this comment
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Reply as
                  </label>
                  <select
                    value={replyUserId}
                    onChange={(e) => setReplyUserId(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                  >
                    <option value="">Select user...</option>
                    {seedUsers.map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        @{u.profiles.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Timestamp{" "}
                    <span className="font-normal">(optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={replyTimestamp}
                    onChange={(e) => setReplyTimestamp(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Content
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={2}
                  maxLength={2000}
                  placeholder="Write a reply..."
                  className="mt-1 block w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={isPending || !replyUserId || !replyContent.trim()}
                >
                  {isPending ? "Posting..." : "Post Reply"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReplyingToId(null)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Inline vote form */}
          {isVoting && (
            <div className="mt-2 space-y-3 rounded-md border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Add upvotes from seed users
                </p>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedVoterIds(
                        new Set(seedUsers.map((u) => u.user_id))
                      )
                    }
                    className="text-foreground underline underline-offset-2 hover:opacity-70"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedVoterIds(new Set())}
                    className="text-muted-foreground underline underline-offset-2 hover:opacity-70"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {seedUsers.map((u) => {
                  const hasVoted = alreadyVoted.includes(u.user_id);
                  return (
                    <label
                      key={u.user_id}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                        selectedVoterIds.has(u.user_id)
                          ? "border-foreground bg-accent"
                          : "border-border hover:bg-accent/50"
                      } ${hasVoted ? "opacity-60" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedVoterIds.has(u.user_id)}
                        onChange={() => {
                          setSelectedVoterIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(u.user_id)) next.delete(u.user_id);
                            else next.add(u.user_id);
                            return next;
                          });
                        }}
                        className="h-3.5 w-3.5 rounded border-border"
                      />
                      <span className="font-medium">
                        @{u.profiles.username}
                      </span>
                      {hasVoted && (
                        <span className="text-[10px] text-muted-foreground">
                          (voted)
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              {seedUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No seed users. Create some first.
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddVotes}
                  disabled={isPending || selectedVoterIds.size === 0}
                >
                  {isPending ? "Adding..." : "Add Upvotes"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVotingId(null)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Render children */}
        {node.children.length > 0 && (
          <div className="mt-2 space-y-2">
            {node.children.map((child) => renderComment(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add new top-level comment */}
      <section className="rounded-xl border border-border p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Plus className="h-4 w-4" />
          Add Comment
        </h2>
        <form onSubmit={handleNewComment} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Comment as
              </label>
              <select
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
              >
                <option value="">Select seed user...</option>
                {seedUsers.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    @{u.profiles.username}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Timestamp{" "}
                <span className="font-normal">(leave empty for now)</span>
              </label>
              <input
                type="datetime-local"
                value={newTimestamp}
                onChange={(e) => setNewTimestamp(e.target.value)}
                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Content
            </label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              maxLength={2000}
              required
              placeholder="Write a comment..."
              className="mt-1 block w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
          </div>
          <Button type="submit" size="sm" disabled={isPending || !newUserId}>
            {isPending ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      </section>

      {/* Comment tree */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground">
          {comments.length} comment{comments.length !== 1 ? "s" : ""}
        </h2>
        <div className="mt-3 space-y-3">
          {commentTree.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No comments yet.
            </p>
          ) : (
            commentTree.map((node) => renderComment(node, 0))
          )}
        </div>
      </section>

      {/* Delete confirmation */}
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
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

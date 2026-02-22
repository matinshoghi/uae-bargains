"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { VoteButton } from "@/components/shared/VoteButton";
import { ReplyButton } from "./ReplyButton";
import { CommentMenu } from "./CommentMenu";
import { CommentList } from "./CommentList";
import { updateComment, deleteComment } from "@/lib/actions/comments";
import { cn, shortTimeAgo } from "@/lib/utils";
import type { CommentWithChildren } from "@/lib/types";

export function CommentItem({
  comment,
  userVote,
  userCommentVotes,
  isLoggedIn,
  dealId,
  currentUserId,
}: {
  comment: CommentWithChildren;
  userVote: 1 | -1 | null;
  userCommentVotes: Record<string, number>;
  isLoggedIn: boolean;
  dealId: string;
  currentUserId: string | null;
}) {
  const isDeleted = !comment.profiles;
  const isAuthor = !isDeleted && currentUserId === comment.user_id;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEdited =
    comment.updated_at &&
    comment.created_at &&
    comment.updated_at !== comment.created_at;

  async function handleSave() {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === comment.content) {
      setIsEditing(false);
      setEditContent(comment.content);
      return;
    }

    setIsSaving(true);
    const result = await updateComment(comment.id, trimmed);
    setIsSaving(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Comment updated");
      setIsEditing(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteComment(comment.id);
    setIsDeleting(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Comment deleted");
    }
    setShowDeleteDialog(false);
  }

  return (
    <div
      className={cn(
        comment.depth === 0 && "rounded-xl bg-zinc-50/60 p-4",
        comment.depth > 0 && "ml-10 border-l-2 border-zinc-200 pl-4 pt-3 mt-3"
      )}
    >
      {/* Header: avatar + @username + timestamp */}
      <div className="flex items-center gap-2 mb-2">
        <Avatar className={comment.depth === 0 ? "h-8 w-8" : "h-6 w-6"}>
          {!isDeleted && (
            <AvatarImage src={comment.profiles!.avatar_url ?? undefined} />
          )}
          <AvatarFallback className="text-xs">
            {isDeleted ? "?" : (comment.profiles!.username ?? "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isDeleted ? (
          <span className="text-sm font-medium text-muted-foreground">
            [deleted]
          </span>
        ) : (
          <Link
            href={`/user/${comment.profiles!.username}`}
            className="text-sm font-medium hover:underline"
          >
            @{comment.profiles!.username}
          </Link>
        )}
        <span className="text-xs text-zinc-400">
          {shortTimeAgo(comment.created_at)}
        </span>
        {isEdited && (
          <span className="text-xs text-zinc-400">(edited)</span>
        )}
      </div>

      {/* Content or Edit Form */}
      {isEditing ? (
        <div className="mb-3">
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            autoFocus
            maxLength={2000}
            className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm
                       focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !editContent.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white
                         transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
              className="px-4 py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-3 text-sm text-zinc-700 whitespace-pre-wrap">
          {comment.content}
        </p>
      )}

      {/* Actions: votes | reply | menu */}
      <div className="flex items-center gap-2">
        <VoteButton
          entityType="comment"
          entityId={comment.id}
          upvoteCount={comment.upvote_count}
          downvoteCount={comment.downvote_count}
          userVote={userVote}
          isLoggedIn={isLoggedIn}
        />
        {comment.depth < 1 && (
          <ReplyButton
            dealId={dealId}
            parentId={comment.id}
            isLoggedIn={isLoggedIn}
          />
        )}
        <div className="ml-auto">
          <CommentMenu
            commentId={comment.id}
            isAuthor={isAuthor}
            onEdit={() => {
              setEditContent(comment.content);
              setIsEditing(true);
            }}
            onDelete={() => setShowDeleteDialog(true)}
          />
        </div>
      </div>

      {/* Nested children (only depth-0 comments have replies) */}
      {comment.children.length > 0 && (
        <div className="mt-3">
          <CommentList
            comments={comment.children}
            userCommentVotes={userCommentVotes}
            isLoggedIn={isLoggedIn}
            dealId={dealId}
            currentUserId={currentUserId}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

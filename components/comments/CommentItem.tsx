"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
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
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VoteButton } from "@/components/shared/VoteButton";
import { ReplyButton } from "./ReplyButton";
import { CommentForm } from "./CommentForm";
import { CommentMenu } from "./CommentMenu";
import { CommentList } from "./CommentList";
import { updateComment, deleteComment } from "@/lib/actions/comments";
import { adminDeleteComment } from "@/lib/actions/admin";
import { shortTimeAgo } from "@/lib/utils";
import type { CommentWithChildren } from "@/lib/types";

export function CommentItem({
  comment,
  userVote,
  userCommentVotes,
  isLoggedIn,
  dealId,
  currentUserId,
  isAdmin = false,
}: {
  comment: CommentWithChildren;
  userVote: 1 | -1 | null;
  userCommentVotes: Record<string, number>;
  isLoggedIn: boolean;
  dealId: string;
  currentUserId: string | null;
  isAdmin?: boolean;
}) {
  const isDeleted = !comment.profiles;
  const isAuthor = !isDeleted && currentUserId === comment.user_id;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEdited = comment.is_edited;
  const isReply = comment.depth > 0;

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
    const result = isAdmin && !isAuthor
      ? await adminDeleteComment(comment.id)
      : await deleteComment(comment.id);
    setIsDeleting(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Comment deleted");
    }
    setShowDeleteDialog(false);
  }

  return (
    <div className={isReply ? "mt-3 ml-5 border-l-2 border-[#e4e3dd] pl-4 sm:ml-10 sm:pl-5" : "py-4"}>
      <div className="flex gap-2.5">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          <UserAvatar
            src={isDeleted ? null : comment.profiles!.avatar_url}
            name={isDeleted ? "?" : comment.profiles!.username}
            size="sm"
            className="border-[1.5px] border-[#e4e3dd]"
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-1.5">
            {isDeleted ? (
              <span className="text-sm font-medium text-muted-foreground">[deleted user]</span>
            ) : (
              <span className="font-display text-[13px] font-semibold">
                {comment.profiles!.username}
              </span>
            )}
            <span className="text-foreground/20">&middot;</span>
            <span className="font-mono-display text-[11px] text-muted-foreground">
              {shortTimeAgo(comment.created_at)}
            </span>
            {isEdited && (
              <span className="font-mono-display text-[11px] text-muted-foreground">(edited)</span>
            )}
          </div>

          {/* Body */}
          {isEditing ? (
            <div className="mt-2">
              <div className="border-[1.5px] border-[#e4e3dd] bg-card focus-within:border-foreground">
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  autoFocus
                  maxLength={2000}
                  className="w-full resize-none border-0 bg-transparent px-3 py-2 text-sm leading-relaxed
                             focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2 border-t border-[#e4e3dd] px-3 py-2">
                  <button
                    onClick={() => { setIsEditing(false); setEditContent(comment.content); }}
                    className="px-3 py-1 font-mono-display text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !editContent.trim()}
                    className="border-[1.5px] border-foreground bg-primary px-4 py-1 font-display text-[13px] font-semibold text-primary-foreground
                               transition-colors hover:brightness-95 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
              {comment.content}
            </p>
          )}

          {/* Action bar */}
          <div className="mt-1.5 flex items-center gap-1">
            <VoteButton
              entityType="comment"
              entityId={comment.id}
              upvoteCount={comment.upvote_count}
              downvoteCount={comment.downvote_count}
              userVote={userVote}
              isLoggedIn={isLoggedIn}
              variant="inline"
            />
            {comment.depth < 1 && (
              <>
                <span className="text-foreground/15">&middot;</span>
                <ReplyButton
                  dealId={dealId}
                  parentId={comment.id}
                  isLoggedIn={isLoggedIn}
                  isOpen={showReplyForm}
                  onToggle={() => setShowReplyForm(!showReplyForm)}
                />
              </>
            )}
            <div className="ml-auto">
              <CommentMenu
                commentId={comment.id}
                isAuthor={isAuthor}
                isAdmin={isAdmin}
                onEdit={() => { setEditContent(comment.content); setIsEditing(true); }}
                onDelete={() => setShowDeleteDialog(true)}
              />
            </div>
          </div>

          {/* Reply form — rendered below action bar at full content width */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                dealId={dealId}
                parentId={comment.id}
                isLoggedIn={isLoggedIn}
                onCancel={() => setShowReplyForm(false)}
                autoFocus
              />
            </div>
          )}

          {/* Children */}
          {comment.children.length > 0 && (
            <div className="mt-2">
              <CommentList
                comments={comment.children}
                userCommentVotes={userCommentVotes}
                isLoggedIn={isLoggedIn}
                dealId={dealId}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
            </div>
          )}
        </div>
      </div>

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

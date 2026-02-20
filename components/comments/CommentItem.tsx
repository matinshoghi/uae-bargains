import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteButton } from "@/components/shared/VoteButton";
import { ReplyButton } from "./ReplyButton";
import { CommentMenu } from "./CommentMenu";
import { CommentList } from "./CommentList";
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
          <AvatarImage src={comment.profiles.avatar_url ?? undefined} />
          <AvatarFallback className="text-xs">
            {(comment.profiles.username ?? "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Link
          href={`/user/${comment.profiles.username}`}
          className="text-sm font-medium hover:underline"
        >
          @{comment.profiles.username}
        </Link>
        <span className="text-xs text-zinc-400">
          {shortTimeAgo(comment.created_at)}
        </span>
      </div>

      {/* Content */}
      <p className="mb-3 text-sm text-zinc-700 whitespace-pre-wrap">
        {comment.content}
      </p>

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
            isAuthor={currentUserId === comment.user_id}
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
    </div>
  );
}

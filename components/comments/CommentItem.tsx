import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteButton } from "@/components/shared/VoteButton";
import { ReplyButton } from "./ReplyButton";
import { CommentList } from "./CommentList";
import { cn } from "@/lib/utils";
import type { CommentWithChildren } from "@/lib/types";

export function CommentItem({
  comment,
  userVote,
  userCommentVotes,
  isLoggedIn,
  dealId,
}: {
  comment: CommentWithChildren;
  userVote: 1 | -1 | null;
  userCommentVotes: Record<string, number>;
  isLoggedIn: boolean;
  dealId: string;
}) {
  const displayName =
    comment.profiles.display_name ?? comment.profiles.username;

  return (
    <div
      className={cn(
        "py-3",
        comment.depth > 0 && "ml-8 pl-4 border-l-2 border-zinc-100"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Avatar className="h-6 w-6">
          <AvatarImage src={comment.profiles.avatar_url ?? undefined} />
          <AvatarFallback className="text-xs">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Link href={`/user/${comment.profiles.username}`} className="text-sm font-medium hover:underline">
          {displayName}
        </Link>
        <span className="text-xs text-zinc-400">
          {formatDistanceToNow(new Date(comment.created_at), {
            addSuffix: true,
          })}
        </span>
      </div>

      {/* Content */}
      <p className="text-sm text-zinc-700 whitespace-pre-wrap mb-2">
        {comment.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <VoteButton
          entityType="comment"
          entityId={comment.id}
          upvoteCount={comment.upvote_count}
          downvoteCount={comment.downvote_count}
          userVote={userVote}
          isLoggedIn={isLoggedIn}
        />
        {comment.depth < 2 && (
          <ReplyButton
            dealId={dealId}
            parentId={comment.id}
            isLoggedIn={isLoggedIn}
          />
        )}
      </div>

      {/* Nested children */}
      {comment.children.length > 0 && (
        <CommentList
          comments={comment.children}
          userCommentVotes={userCommentVotes}
          isLoggedIn={isLoggedIn}
          dealId={dealId}
        />
      )}
    </div>
  );
}

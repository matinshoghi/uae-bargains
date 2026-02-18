import { CommentItem } from "./CommentItem";
import type { CommentWithChildren } from "@/lib/types";

export function CommentList({
  comments,
  userCommentVotes,
  isLoggedIn,
  dealId,
}: {
  comments: CommentWithChildren[];
  userCommentVotes: Record<string, number>;
  isLoggedIn: boolean;
  dealId: string;
}) {
  if (comments.length === 0) return null;

  return (
    <div className="space-y-1">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          userVote={(userCommentVotes[comment.id] as 1 | -1) ?? null}
          userCommentVotes={userCommentVotes}
          isLoggedIn={isLoggedIn}
          dealId={dealId}
        />
      ))}
    </div>
  );
}

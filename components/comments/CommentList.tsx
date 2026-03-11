import { CommentItem } from "./CommentItem";
import type { CommentWithChildren } from "@/lib/types";

export function CommentList({
  comments,
  userCommentVotes,
  isLoggedIn,
  dealId,
  currentUserId,
  isAdmin = false,
}: {
  comments: CommentWithChildren[];
  userCommentVotes: Record<string, number>;
  isLoggedIn: boolean;
  dealId: string;
  currentUserId: string | null;
  isAdmin?: boolean;
}) {
  if (comments.length === 0) return null;

  const isTopLevel = comments[0]?.depth === 0;

  return (
    <div className={isTopLevel ? "divide-y divide-[#e4e3dd]" : ""}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          userVote={(userCommentVotes[comment.id] as 1 | -1) ?? null}
          userCommentVotes={userCommentVotes}
          isLoggedIn={isLoggedIn}
          dealId={dealId}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}

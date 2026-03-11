import { MessageSquare } from "lucide-react";
import {
  fetchComments,
  buildCommentTree,
  getUserCommentVotes,
} from "@/lib/queries/comments";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

export async function CommentSection({
  dealId,
  currentUserId,
  isAdmin = false,
}: {
  dealId: string;
  currentUserId: string | null;
  isAdmin?: boolean;
}) {
  const isLoggedIn = !!currentUserId;

  const [comments, userCommentVotes] = await Promise.all([
    fetchComments(dealId),
    getUserCommentVotes(dealId),
  ]);

  const tree = buildCommentTree(comments);

  return (
    <section>
      {/* Header */}
      <div className="mb-5 flex items-center gap-2 border-b border-[#e4e3dd] pb-3">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-display text-lg font-bold tracking-tight">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </h2>
      </div>

      {/* Comment form — inline, above comments */}
      <div className="mb-6">
        <CommentForm dealId={dealId} isLoggedIn={isLoggedIn} />
      </div>

      {comments.length === 0 ? (
        <div className="py-8 text-center">
          <p className="font-display text-sm font-medium text-muted-foreground">
            No comments yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Be the first to share your thoughts on this deal.
          </p>
        </div>
      ) : (
        <CommentList
          comments={tree}
          userCommentVotes={userCommentVotes}
          isLoggedIn={isLoggedIn}
          dealId={dealId}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      )}
    </section>
  );
}

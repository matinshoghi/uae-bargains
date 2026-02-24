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
    <section className="pb-24">
      <h2 className="font-display mb-6 border-b-2 border-foreground pb-3 text-2xl font-bold uppercase tracking-tight md:text-3xl">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h2>

      <CommentList
        comments={tree}
        userCommentVotes={userCommentVotes}
        isLoggedIn={isLoggedIn}
        dealId={dealId}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
      />

      <CommentForm dealId={dealId} isLoggedIn={isLoggedIn} sticky />
    </section>
  );
}

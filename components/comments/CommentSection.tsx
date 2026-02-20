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
}: {
  dealId: string;
  currentUserId: string | null;
}) {
  const isLoggedIn = !!currentUserId;

  const [comments, userCommentVotes] = await Promise.all([
    fetchComments(dealId),
    getUserCommentVotes(dealId),
  ]);

  const tree = buildCommentTree(comments);

  return (
    <section className="pb-24">
      <h2 className="text-lg font-semibold mb-4">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h2>

      <CommentList
        comments={tree}
        userCommentVotes={userCommentVotes}
        isLoggedIn={isLoggedIn}
        dealId={dealId}
        currentUserId={currentUserId}
      />

      <CommentForm dealId={dealId} isLoggedIn={isLoggedIn} sticky />
    </section>
  );
}

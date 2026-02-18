import Link from "next/link";
import {
  fetchComments,
  buildCommentTree,
  getUserCommentVotes,
} from "@/lib/queries/comments";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

export async function CommentSection({
  dealId,
  isLoggedIn,
}: {
  dealId: string;
  isLoggedIn: boolean;
}) {
  const [comments, userCommentVotes] = await Promise.all([
    fetchComments(dealId),
    getUserCommentVotes(dealId),
  ]);

  const tree = buildCommentTree(comments);

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h2>

      {isLoggedIn ? (
        <CommentForm dealId={dealId} />
      ) : (
        <p className="text-sm text-zinc-500 mb-4">
          <Link
            href="/login"
            className="text-emerald-600 hover:underline"
          >
            Sign in
          </Link>{" "}
          to comment
        </p>
      )}

      <CommentList
        comments={tree}
        userCommentVotes={userCommentVotes}
        isLoggedIn={isLoggedIn}
        dealId={dealId}
      />
    </section>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSeedUsers } from "@/lib/queries/seed";
import { buildCommentTree } from "@/lib/queries/comments";
import { DealCommentManager } from "@/components/admin/DealCommentManager";
import { DealSeedVoter } from "@/components/admin/DealSeedVoter";
import type { CommentWithProfile } from "@/lib/types";

export default async function AdminDealCommentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: dealId } = await params;
  const admin = createAdminClient();

  // Fetch deal info
  const { data: deal } = await admin
    .from("deals")
    .select("id, title, created_at, upvote_count, downvote_count")
    .eq("id", dealId)
    .single();

  if (!deal) notFound();

  // Fetch ALL comments (including hidden) with profiles
  const { data: commentsRaw } = await admin
    .from("comments")
    .select("*, profiles:user_id (username, avatar_url)")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });

  const comments = (commentsRaw as CommentWithProfile[]) ?? [];
  const commentTree = buildCommentTree(comments);

  // Fetch seed users for the user picker
  const seedUsers = await fetchSeedUsers();

  // Fetch seed user votes on this deal
  const seedUserIds = seedUsers.map((u) => u.user_id);
  let dealSeedVoterIds: string[] = [];

  if (seedUserIds.length > 0) {
    const { data: dealVotes } = await admin
      .from("votes")
      .select("user_id")
      .eq("deal_id", dealId)
      .in("user_id", seedUserIds);

    dealSeedVoterIds = dealVotes?.map((v) => v.user_id) ?? [];
  }

  // Fetch vote counts per comment (how many votes each comment has from seed users)
  const commentIds = comments.map((c) => c.id);
  let votedMap: Record<string, string[]> = {};

  if (commentIds.length > 0) {
    if (seedUserIds.length > 0) {
      const { data: votes } = await admin
        .from("votes")
        .select("comment_id, user_id")
        .in("comment_id", commentIds)
        .in("user_id", seedUserIds);

      if (votes) {
        for (const v of votes) {
          if (v.comment_id) {
            if (!votedMap[v.comment_id]) votedMap[v.comment_id] = [];
            votedMap[v.comment_id].push(v.user_id);
          }
        }
      }
    }
  }

  const netVotes = deal.upvote_count - deal.downvote_count;

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Manage Comments</h1>
        <Link
          href={`/deals/${dealId}`}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="View deal"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View deal
        </Link>
      </div>
      <p className="mt-1 text-muted-foreground">
        {deal.title}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>
          Posted {format(new Date(deal.created_at), "MMM d, yyyy 'at' h:mm a")}
        </span>
        <span>
          {netVotes} upvote{netVotes !== 1 ? "s" : ""}{" "}
          <span className="text-xs">
            (+{deal.upvote_count} / -{deal.downvote_count})
          </span>
        </span>
      </div>

      <div className="mt-6">
        <DealSeedVoter
          dealId={dealId}
          seedUsers={seedUsers}
          alreadyVotedIds={dealSeedVoterIds}
        />
      </div>

      <div className="mt-8">
        <DealCommentManager
          dealId={dealId}
          comments={comments}
          commentTree={commentTree}
          seedUsers={seedUsers}
          seedVotedMap={votedMap}
        />
      </div>
    </div>
  );
}

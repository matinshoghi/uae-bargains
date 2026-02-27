import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSeedUsers } from "@/lib/queries/seed";
import { buildCommentTree } from "@/lib/queries/comments";
import { DealCommentManager } from "@/components/admin/DealCommentManager";
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
    .select("id, title")
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

  // Fetch vote counts per comment (how many votes each comment has from seed users)
  const commentIds = comments.map((c) => c.id);
  let votedMap: Record<string, string[]> = {};

  if (commentIds.length > 0) {
    const seedUserIds = seedUsers.map((u) => u.user_id);
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

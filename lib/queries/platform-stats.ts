import { createAdminClient } from "@/lib/supabase/admin";

export interface PlatformStats {
  dealsCount: number;
  votesCount: number;
  commentsCount: number;
}

const EMPTY_STATS: PlatformStats = {
  dealsCount: 0,
  votesCount: 0,
  commentsCount: 0,
};

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const supabase = createAdminClient();
    const [deals, votes, anonVotes, comments] = await Promise.all([
      supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .in("status", ["active", "expired"]),
      supabase
        .from("votes")
        .select("id", { count: "exact", head: true })
        .eq("is_revoked", false),
      supabase
        .from("anonymous_votes")
        .select("id", { count: "exact", head: true }),
      supabase.from("comments").select("id", { count: "exact", head: true }),
    ]);

    return {
      dealsCount: deals.count ?? 0,
      votesCount: (votes.count ?? 0) + (anonVotes.count ?? 0),
      commentsCount: comments.count ?? 0,
    };
  } catch {
    return EMPTY_STATS;
  }
}

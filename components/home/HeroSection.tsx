import { createClient } from "@/lib/supabase/server";
import { HeroContent } from "./HeroContent";

async function getStats() {
  try {
    const supabase = await createClient();
    const [deals, votes, comments] = await Promise.all([
      supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("votes")
        .select("id", { count: "exact", head: true })
        .eq("is_revoked", false),
      supabase.from("comments").select("id", { count: "exact", head: true }),
    ]);

    return {
      dealsCount: deals.count || 127,
      votesCount: votes.count || 842,
      commentsCount: comments.count || 54,
    };
  } catch {
    return { dealsCount: 127, votesCount: 842, commentsCount: 54 };
  }
}

export async function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const stats = await getStats();
  return <HeroContent stats={stats} isLoggedIn={isLoggedIn} />;
}

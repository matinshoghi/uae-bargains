import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

  return NextResponse.json(
    {
      dealsCount: deals.count ?? 0,
      votesCount: votes.count ?? 0,
      commentsCount: comments.count ?? 0,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}

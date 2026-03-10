import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ActivityItem {
  type: string;
  username: string;
  action: string;
  timestamp: string;
}

const FALLBACK_ACTIVITY: ActivityItem[] = [
  { type: "deal", username: "sarah_dxb", action: "posted a new deal", timestamp: new Date().toISOString() },
  { type: "vote", username: "techbargain", action: "upvoted a deal", timestamp: new Date().toISOString() },
  { type: "comment", username: "ali.deals", action: "commented on a deal", timestamp: new Date().toISOString() },
  { type: "deal", username: "matin", action: "shared a deal", timestamp: new Date().toISOString() },
  { type: "vote", username: "savvy_mum", action: "upvoted a deal", timestamp: new Date().toISOString() },
  { type: "deal", username: "dubai_saver", action: "joined the community", timestamp: new Date().toISOString() },
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 20);

  try {
    const supabase = await createClient();

    const [dealsRes, votesRes, commentsRes] = await Promise.all([
      supabase
        .from("deals")
        .select("title, created_at, profiles:user_id(username)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("votes")
        .select("vote_type, created_at, deals:deal_id(title), profiles:user_id(username)")
        .eq("is_revoked", false)
        .not("deal_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("comments")
        .select("created_at, deals:deal_id(title), profiles:user_id(username)")
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    const items: ActivityItem[] = [];

    for (const deal of dealsRes.data ?? []) {
      const profile = deal.profiles as unknown as { username: string } | null;
      if (profile?.username) {
        items.push({
          type: "deal",
          username: profile.username,
          action: `posted a new deal`,
          timestamp: deal.created_at,
        });
      }
    }

    for (const vote of votesRes.data ?? []) {
      const profile = vote.profiles as unknown as { username: string } | null;
      const deal = vote.deals as unknown as { title: string } | null;
      if (profile?.username && deal?.title) {
        const verb = vote.vote_type === 1 ? "upvoted" : "downvoted";
        items.push({
          type: "vote",
          username: profile.username,
          action: `${verb} '${deal.title.slice(0, 50)}'`,
          timestamp: vote.created_at,
        });
      }
    }

    for (const comment of commentsRes.data ?? []) {
      const profile = comment.profiles as unknown as { username: string } | null;
      const deal = comment.deals as unknown as { title: string } | null;
      if (profile?.username && deal?.title) {
        items.push({
          type: "comment",
          username: profile.username,
          action: `commented on '${deal.title.slice(0, 50)}'`,
          timestamp: comment.created_at,
        });
      }
    }

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const result = items.length > 0 ? items.slice(0, limit) : FALLBACK_ACTIVITY;

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json(FALLBACK_ACTIVITY);
  }
}

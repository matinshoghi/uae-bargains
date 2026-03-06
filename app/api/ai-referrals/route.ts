import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin-only endpoint that returns the recommended PostHog dashboard
 * configuration for AI referral analytics.
 *
 * Usage: GET /api/ai-referrals
 *
 * Requires the requesting user to be an admin.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    dashboards: {
      ai_referrals_by_source: {
        description: "AI referrals broken down by source (ChatGPT, Perplexity, etc.)",
        event: "ai_referral",
        breakdown: "ai_source",
        type: "bar",
      },
      ai_referral_trend: {
        description: "AI referral volume over time",
        event: "ai_referral",
        breakdown: "ai_source",
        type: "line",
        interval: "week",
      },
      top_landing_pages: {
        description: "Top landing pages from AI referrals",
        event: "ai_referral",
        breakdown: "landing_path",
        type: "table",
      },
      landing_page_types: {
        description: "Landing page types from AI referrals (homepage, deal, about, etc.)",
        event: "ai_referral",
        breakdown: "landing_page_type",
        type: "pie",
      },
      ai_conversions: {
        description: "Conversion actions from AI-referred visitors",
        event: "ai_conversion",
        breakdown: "conversion_action",
        type: "bar",
      },
      ai_conversion_by_source: {
        description: "AI conversions by referral source",
        event: "ai_conversion",
        breakdown: "ai_source",
        type: "bar",
      },
    },
    search_console_tips: {
      description: "Monitor for FAQ-style queries with high impressions but low CTR",
      action:
        "These may indicate content is being summarized in AI answers without click-through. Check Search Console Performance → Queries → sort by impressions desc, filter CTR < 2%.",
    },
    events_tracked: [
      {
        event: "ai_referral",
        properties: [
          "ai_source",
          "referrer_url",
          "landing_path",
          "landing_page_type",
        ],
        fires: "Once per session, on first page load when AI referral is detected",
      },
      {
        event: "ai_conversion",
        properties: ["ai_source", "conversion_action"],
        fires: "When AI-referred user performs a conversion action (vote, deal_click, comment)",
      },
    ],
    user_properties: [
      {
        property: "first_ai_source",
        description: "The first AI platform that referred this user",
      },
    ],
  });
}

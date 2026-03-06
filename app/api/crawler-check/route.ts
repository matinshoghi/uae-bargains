import { NextRequest, NextResponse } from "next/server";
import { AI_BOT_USER_AGENTS } from "@/lib/site";

/**
 * Diagnostic endpoint for verifying AI/search crawlers can reach production.
 *
 * Usage: curl -A "GPTBot" https://halasaves.com/api/crawler-check
 *
 * Returns the requesting user-agent, whether it matches a known AI bot,
 * and which bots are explicitly allowed in robots.txt.
 */
export function GET(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const matchedBot = AI_BOT_USER_AGENTS.find((bot) =>
    userAgent.toLowerCase().includes(bot.toLowerCase()),
  );

  return NextResponse.json(
    {
      ok: true,
      timestamp: new Date().toISOString(),
      requestUserAgent: userAgent,
      isKnownAiBot: !!matchedBot,
      matchedBot: matchedBot ?? null,
      allowedBots: [...AI_BOT_USER_AGENTS],
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

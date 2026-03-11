import { NextResponse } from "next/server";
import { getPlatformStats } from "@/lib/queries/platform-stats";

export async function GET() {
  const stats = await getPlatformStats();

  return NextResponse.json(
    stats,
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}

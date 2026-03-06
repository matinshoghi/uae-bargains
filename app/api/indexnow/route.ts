import { NextRequest, NextResponse } from "next/server";

const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY;

/**
 * IndexNow key verification endpoint.
 *
 * The IndexNow protocol requires the API key to be served as a plain-text
 * file accessible at a known URL. This endpoint serves that purpose.
 *
 * URL: /api/indexnow?key=true
 *
 * The `keyLocation` sent in IndexNow submissions points here.
 */
export function GET(request: NextRequest) {
  const wantsKey = request.nextUrl.searchParams.has("key");

  if (!INDEXNOW_KEY) {
    return new NextResponse("IndexNow key not configured", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }

  if (wantsKey) {
    return new NextResponse(INDEXNOW_KEY, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return NextResponse.json({
    status: "configured",
    keyEndpoint: "/api/indexnow?key=true",
  });
}

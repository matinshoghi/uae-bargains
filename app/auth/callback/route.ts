import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error_description");
  const errorCode = searchParams.get("error_code");
  const next = searchParams.get("next") ?? "/";

  if (error) {
    console.error("[auth/callback] OAuth error:", { error, errorCode });
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] Code exchange failed:", exchangeError.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error_description");
  const errorCode = searchParams.get("error_code");

  // Check query param first, then cookie for redirect path
  const cookieStore = await cookies();
  const next =
    searchParams.get("next") ??
    cookieStore.get("auth_redirect")?.value ??
    "/";

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
      // Detect new signups (created_at within the last 30 seconds)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const isNewUser =
          Date.now() - new Date(user.created_at).getTime() < 30_000;

        if (isNewUser) {
          const notifyGroupId = process.env.TELEGRAM_NOTIFY_GROUP_ID;
          if (notifyGroupId) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", user.id)
              .single();

            const provider = user.app_metadata?.provider ?? "email";
            const username = profile?.username ?? user.email ?? "unknown";

            await sendTelegramMessage(
              notifyGroupId,
              `👋 <b>New signup on HalaSaves!</b>\n\n👤 ${username}\n🔗 via ${provider}`
            );
          }
        }
      }

      const response = NextResponse.redirect(`${origin}${next}`);
      // Clear the redirect cookie
      response.cookies.set("auth_redirect", "", { maxAge: 0, path: "/" });
      return response;
    }
    console.error("[auth/callback] Code exchange failed:", exchangeError.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

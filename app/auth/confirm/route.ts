import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { notifyUserSignedUp } from "@/lib/notifications";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const cookieStore = await cookies();
  const next =
    searchParams.get("next") ??
    cookieStore.get("auth_redirect")?.value ??
    "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      if (type === "magiclink") {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const userCreatedAt = new Date(user.created_at).getTime();
          const isLikelyNewUser =
            Number.isFinite(userCreatedAt) &&
            Date.now() - userCreatedAt < 5 * 60_000;

          if (isLikelyNewUser) {
            await notifyUserSignedUp({
              userId: user.id,
              provider: user.app_metadata?.provider ?? "email",
              email: user.email,
            });
          }
        }
      }

      // For recovery, always go to the reset password page
      const destination = type === "recovery" ? "/settings/reset-password" : next;
      const response = NextResponse.redirect(`${origin}${destination}`);
      response.cookies.set("auth_redirect", "", { maxAge: 0, path: "/" });
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

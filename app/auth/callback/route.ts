import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyUserSignedUp } from "@/lib/notifications";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const provider = user.app_metadata?.provider ?? "email";
        const isOAuthProvider = provider !== "email";
        const isLikelyNewOAuthUser =
          Date.now() - new Date(user.created_at).getTime() < 5 * 60_000;
        const alreadyNotified = user.app_metadata?.signup_notified === true;

        if (isOAuthProvider && isLikelyNewOAuthUser && !alreadyNotified) {
          await notifyUserSignedUp({
            userId: user.id,
            provider,
            email: user.email,
          });

          const admin = createAdminClient();
          const { error: metadataError } = await admin.auth.admin.updateUserById(
            user.id,
            {
              app_metadata: {
                ...(user.app_metadata ?? {}),
                signup_notified: true,
              },
            }
          );

          if (metadataError) {
            console.error(
              "[auth/callback] Failed to mark signup as notified:",
              metadataError.message
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

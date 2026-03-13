import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/user/SettingsForm";
import { DeleteAccountSection } from "@/components/user/DeleteAccountSection";
import type { Metadata } from "next";

type AuthProvider = "email" | "google";

function isAuthProvider(value: unknown): value is AuthProvider {
  return value === "email" || value === "google";
}

function resolveSignUpMethod(appMetadata: {
  provider?: unknown;
  providers?: unknown;
}): AuthProvider {
  if (isAuthProvider(appMetadata.provider)) return appMetadata.provider;

  if (Array.isArray(appMetadata.providers)) {
    const matchedProvider = appMetadata.providers.find(isAuthProvider);
    if (matchedProvider) return matchedProvider;
  }

  return "email";
}

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const signUpMethod = resolveSignUpMethod(user.app_metadata);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display mb-6 border-b-2 border-foreground pb-3 text-3xl font-bold uppercase tracking-tight md:text-4xl">Settings</h1>
      <SettingsForm
        profile={profile}
        authInfo={{
          signUpMethod,
          email: user.email ?? null,
          isEmailVerified: Boolean(user.email_confirmed_at),
        }}
      />
      <DeleteAccountSection />
    </div>
  );
}

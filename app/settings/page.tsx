import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/user/SettingsForm";
import type { Metadata } from "next";

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
    .select("display_name, username, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <SettingsForm profile={profile} />
    </div>
  );
}

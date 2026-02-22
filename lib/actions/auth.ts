"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) throw error;
  if (data.url) redirect(data.url);
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  redirect("/");
}

export async function signUp(email: string, password: string) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) throw error;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Use the admin client for all writes — bypasses RLS so FK-constrained
  // updates (user_id → null) and the profile delete succeed unconditionally.
  const admin = createAdminClient();

  const { error: dealsError } = await admin
    .from("deals")
    .update({ user_id: null })
    .eq("user_id", user.id);
  if (dealsError) console.error("[deleteAccount] deals:", dealsError.message);

  const { error: commentsError } = await admin
    .from("comments")
    .update({ user_id: null })
    .eq("user_id", user.id);
  if (commentsError)
    console.error("[deleteAccount] comments:", commentsError.message);

  const { error: votesError } = await admin
    .from("votes")
    .delete()
    .eq("user_id", user.id);
  if (votesError) console.error("[deleteAccount] votes:", votesError.message);

  const { error: profileError } = await admin
    .from("profiles")
    .delete()
    .eq("id", user.id);
  if (profileError)
    console.error("[deleteAccount] profile:", profileError.message);

  const { error: authError } = await admin.auth.admin.deleteUser(user.id);
  if (authError) {
    console.error("[deleteAccount] auth.deleteUser:", authError.message);
    throw new Error("Failed to delete account. Please try again.");
  }

  redirect("/");
}

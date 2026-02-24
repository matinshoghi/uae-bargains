import { createAdminClient } from "@/lib/supabase/admin";

export type SeedUserWithProfile = {
  user_id: string;
  notes: string | null;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    created_at?: string;
  };
};

export async function fetchSeedUser(
  userId: string
): Promise<SeedUserWithProfile | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("seed_accounts")
    .select(
      "user_id, notes, created_at, profiles:user_id (username, avatar_url, created_at)"
    )
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data as unknown as SeedUserWithProfile;
}

export async function fetchSeedUsers(): Promise<SeedUserWithProfile[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("seed_accounts")
    .select("user_id, notes, created_at, profiles:user_id (username, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as SeedUserWithProfile[]) ?? [];
}

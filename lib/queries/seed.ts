import { createAdminClient } from "@/lib/supabase/admin";

export type SeedUserWithProfile = {
  user_id: string;
  notes: string | null;
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
};

export async function fetchSeedUsers(): Promise<SeedUserWithProfile[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("seed_accounts")
    .select("user_id, notes, created_at, profiles:user_id (username, display_name, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as SeedUserWithProfile[]) ?? [];
}

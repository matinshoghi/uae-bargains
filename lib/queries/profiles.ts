import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { DealWithRelations } from "@/lib/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function fetchProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function fetchUserStats(userId: string) {
  const supabase = await createClient();

  const { data: deals } = await supabase
    .from("deals")
    .select("id, upvote_count")
    .eq("user_id", userId);

  return {
    dealCount: deals?.length ?? 0,
    totalUpvotes: deals?.reduce((sum, d) => sum + d.upvote_count, 0) ?? 0,
  };
}

export async function fetchUserDeals(userId: string): Promise<DealWithRelations[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("deals")
    .select(`
      *,
      profiles:user_id (username, display_name, avatar_url),
      categories:category_id (label, slug)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data as DealWithRelations[]) ?? [];
}

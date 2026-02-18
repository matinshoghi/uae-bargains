import { createClient } from "@/lib/supabase/server";
import { DEALS_PER_PAGE } from "@/lib/constants";
import type { DealWithRelations } from "@/lib/types";

interface FetchDealsOptions {
  sort: string;
  limit?: number;
  offset?: number;
  categorySlug?: string;
}

const DEAL_SELECT = `
  *,
  profiles:user_id (username, display_name, avatar_url),
  categories:category_id (label, slug)
`;

export async function fetchDeals({
  sort,
  limit = DEALS_PER_PAGE,
  offset = 0,
  categorySlug,
}: FetchDealsOptions): Promise<DealWithRelations[]> {
  const supabase = await createClient();

  let query = supabase
    .from("deals")
    .select(DEAL_SELECT)
    .eq("status", "active")
    .range(offset, offset + limit - 1);

  // Filter by category — resolve slug to ID so the filter is on the deals table
  if (categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (!category) return [];
    query = query.eq("category_id", category.id);
  }

  // Sorting
  switch (sort) {
    case "new":
      query = query.order("created_at", { ascending: false });
      break;
    case "top":
      query = query
        .order("upvote_count", { ascending: false })
        .order("created_at", { ascending: false });
      break;
    case "hot":
    default:
      query = query
        .order("hot_score", { ascending: false })
        .order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as DealWithRelations[]) ?? [];
}

/**
 * Fetch the current user's deal votes as a map of dealId → voteType.
 * Returns an empty object if the user is not logged in.
 */
export async function getUserDealVotes(): Promise<{
  userVotes: Record<string, number>;
  isLoggedIn: boolean;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { userVotes: {}, isLoggedIn: false };

  const { data: votes } = await supabase
    .from("votes")
    .select("deal_id, vote_type")
    .eq("user_id", user.id)
    .not("deal_id", "is", null);

  const userVotes: Record<string, number> = {};
  if (votes) {
    for (const v of votes) {
      if (v.deal_id) userVotes[v.deal_id] = v.vote_type;
    }
  }

  return { userVotes, isLoggedIn: true };
}

import { createClient } from "@/lib/supabase/server";
import { FeaturedDealsList } from "@/components/admin/FeaturedDealsList";
import type { DealWithRelations } from "@/lib/types";

export default async function AdminFeaturedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("deals")
    .select(
      `*, profiles:user_id (username, avatar_url), categories:category_id (label, slug)`
    )
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  const deals = (data as DealWithRelations[]) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold">Featured Deals</h1>
      <p className="mt-2 text-muted-foreground">
        Pin deals to the top of the Hot feed. Pinned deals always appear first,
        regardless of their hot score.
      </p>

      <div className="mt-8">
        <FeaturedDealsList deals={deals} />
      </div>
    </div>
  );
}

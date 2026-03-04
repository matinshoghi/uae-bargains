import { createClient } from "@/lib/supabase/server";
import { ModerationDealList } from "@/components/admin/ModerationDealList";
import type { DealWithRelations } from "@/lib/types";

export default async function AdminModerationPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("deals")
    .select(
      `*, profiles:user_id (username, avatar_url), categories:category_id (label, slug)`
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  const deals = (data as DealWithRelations[]) ?? [];

  const { data: pushRows } = await supabase
    .from("telegram_pushes")
    .select("deal_id, created_at")
    .order("created_at", { ascending: false });

  const pushMap =
    pushRows?.reduce<Record<string, string | null>>((acc, row) => {
      if (!acc[row.deal_id]) {
        acc[row.deal_id] = row.created_at;
      }
      return acc;
    }, {}) ?? {};

  return (
    <div>
      <h1 className="text-2xl font-bold">Moderation</h1>
      <p className="mt-2 text-muted-foreground">
        Review, remove, restore, and edit deals across the platform.
      </p>

      <div className="mt-8">
        <ModerationDealList deals={deals} pushMap={pushMap} />
      </div>
    </div>
  );
}

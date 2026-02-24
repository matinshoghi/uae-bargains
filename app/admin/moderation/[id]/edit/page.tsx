import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { AdminDealForm } from "@/components/admin/AdminDealForm";
import Link from "next/link";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["deals"]["Row"];

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditDealPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  // Fetch deal
  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .single();

  if (!deal) notFound();

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, label, slug")
    .order("sort_order", { ascending: true });

  // Fetch all profiles for the author dropdown
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, username, display_name")
    .order("username", { ascending: true });

  // Fetch seed account IDs to highlight them
  const { data: seedAccounts } = await admin
    .from("seed_accounts")
    .select("user_id");

  const seedUserIds = new Set(seedAccounts?.map((s) => s.user_id) ?? []);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/moderation"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Moderation
        </Link>
      </div>

      <h1 className="text-2xl font-bold">Edit Deal</h1>
      <p className="mt-2 text-muted-foreground">
        Admin edit — all fields are editable including title and author.
      </p>

      <div className="mt-8 max-w-2xl">
        <AdminDealForm
          deal={deal as DealRow}
          categories={categories ?? []}
          profiles={
            (profiles ?? []).map((p) => ({
              id: p.id,
              username: p.username,
              display_name: p.display_name,
              is_seed: seedUserIds.has(p.id),
            }))
          }
        />
      </div>
    </div>
  );
}

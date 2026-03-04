import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSeedUsers } from "@/lib/queries/seed";
import { SeedDealForm } from "@/components/admin/SeedDealForm";
import { SeedVoteForm } from "@/components/admin/SeedVoteForm";
import { SeedCommentForm } from "@/components/admin/SeedCommentForm";

async function fetchCategories() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("categories")
    .select("id, label")
    .order("label", { ascending: true });
  return data ?? [];
}

export default async function SeedActionsPage() {
  const [users, categories] = await Promise.all([
    fetchSeedUsers(),
    fetchCategories(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Seed Actions</h1>
      <p className="mt-2 text-muted-foreground">
        Post deals, upvote, and comment as seed users.
      </p>

      {users.length === 0 && (
        <div className="mt-8 rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No seed users yet. Create some on the{" "}
            <a href="/admin/seed-users" className="underline underline-offset-2 hover:text-foreground">
              Seed Users
            </a>{" "}
            page first.
          </p>
        </div>
      )}

      <section className="mt-8">
        <details open className="group">
          <summary className="cursor-pointer text-lg font-semibold select-none">
            <span className="ml-1">Post Deal</span>
          </summary>
          <div className="mt-4 rounded-xl border border-border p-6">
            <SeedDealForm users={users} categories={categories} />
          </div>
        </details>
      </section>

      <section className="mt-8">
        <details open className="group">
          <summary className="cursor-pointer text-lg font-semibold select-none">
            <span className="ml-1">Upvote Deal</span>
          </summary>
          <div className="mt-4 rounded-xl border border-border p-6">
            <SeedVoteForm users={users} />
          </div>
        </details>
      </section>

      <section className="mt-8">
        <details open className="group">
          <summary className="cursor-pointer text-lg font-semibold select-none">
            <span className="ml-1">Post Comment</span>
          </summary>
          <div className="mt-4 rounded-xl border border-border p-6">
            <SeedCommentForm users={users} />
          </div>
        </details>
      </section>
    </div>
  );
}

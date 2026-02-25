import { createClient } from "@/lib/supabase/server";
import { ModerationCommentList } from "@/components/admin/ModerationCommentList";
import type { AdminComment } from "@/lib/types";

export default async function AdminCommentsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select(
      `*, profiles:user_id (username, avatar_url), deals:deal_id (title)`
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  const comments = (data as AdminComment[]) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold">Comments</h1>
      <p className="mt-2 text-muted-foreground">
        Moderate, edit, and manage comments across the platform.
      </p>

      <div className="mt-8">
        <ModerationCommentList comments={comments} />
      </div>
    </div>
  );
}

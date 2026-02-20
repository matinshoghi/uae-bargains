"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(2000),
  deal_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable().optional(),
});

export async function createComment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in to comment");

  const parsed = commentSchema.safeParse({
    content: formData.get("content"),
    deal_id: formData.get("deal_id"),
    parent_id: formData.get("parent_id") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { content, deal_id, parent_id } = parsed.data;

  // Calculate depth based on parent
  let depth = 0;
  if (parent_id) {
    const { data: parent } = await supabase
      .from("comments")
      .select("depth")
      .eq("id", parent_id)
      .single();

    depth = parent ? Math.min(parent.depth + 1, 1) : 0;
  }

  const { error } = await supabase.from("comments").insert({
    deal_id,
    user_id: user.id,
    parent_id: parent_id ?? null,
    content,
    depth,
  });

  if (error) {
    return { error: { form: [error.message] } };
  }

  revalidatePath(`/deals/${deal_id}`);
}

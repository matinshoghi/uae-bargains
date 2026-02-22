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

const updateSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(2000),
});

export async function updateComment(commentId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in");

  const parsed = updateSchema.safeParse({ content });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.content?.[0] ?? "Invalid content" };
  }

  // Fetch comment to verify ownership and get deal_id
  const { data: comment } = await supabase
    .from("comments")
    .select("user_id, deal_id")
    .eq("id", commentId)
    .single();

  if (!comment || comment.user_id !== user.id) {
    return { error: "Not authorized" };
  }

  const { error } = await supabase
    .from("comments")
    .update({ content: parsed.data.content, updated_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/deals/${comment.deal_id}`);
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in");

  // Fetch comment to verify ownership and get deal_id
  const { data: comment } = await supabase
    .from("comments")
    .select("user_id, deal_id")
    .eq("id", commentId)
    .single();

  if (!comment || comment.user_id !== user.id) {
    return { error: "Not authorized" };
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/deals/${comment.deal_id}`);
}

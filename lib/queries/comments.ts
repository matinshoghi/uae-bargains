import { createClient } from "@/lib/supabase/server";
import type { CommentWithProfile, CommentWithChildren } from "@/lib/types";

export async function fetchComments(
  dealId: string
): Promise<CommentWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles:user_id (username, display_name, avatar_url)
    `
    )
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as CommentWithProfile[]) ?? [];
}

export function buildCommentTree(
  comments: CommentWithProfile[]
): CommentWithChildren[] {
  const map = new Map<string, CommentWithChildren>();
  const roots: CommentWithChildren[] = [];

  for (const comment of comments) {
    map.set(comment.id, { ...comment, children: [] });
  }

  for (const comment of comments) {
    const node = map.get(comment.id)!;
    if (comment.parent_id && map.has(comment.parent_id)) {
      map.get(comment.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function getUserCommentVotes(
  dealId: string
): Promise<Record<string, number>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return {};

  const { data: votes } = await supabase
    .from("votes")
    .select("comment_id, vote_type")
    .eq("user_id", user.id)
    .not("comment_id", "is", null);

  const userVotes: Record<string, number> = {};
  if (votes) {
    for (const v of votes) {
      if (v.comment_id) userVotes[v.comment_id] = v.vote_type;
    }
  }

  return userVotes;
}

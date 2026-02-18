"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function voteDeal(dealId: string, voteType: 1 | -1) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in to vote");

  const { data: existing } = await supabase
    .from("votes")
    .select("id, vote_type")
    .eq("user_id", user.id)
    .eq("deal_id", dealId)
    .maybeSingle();

  if (existing) {
    if (existing.vote_type === voteType) {
      // Toggle off — remove vote
      await supabase.from("votes").delete().eq("id", existing.id);
    } else {
      // Switch vote direction
      await supabase
        .from("votes")
        .update({ vote_type: voteType })
        .eq("id", existing.id);
    }
  } else {
    // New vote
    await supabase.from("votes").insert({
      user_id: user.id,
      deal_id: dealId,
      vote_type: voteType,
    });
  }

  revalidatePath("/");
}

export async function voteComment(commentId: string, voteType: 1 | -1) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in to vote");

  const { data: existing } = await supabase
    .from("votes")
    .select("id, vote_type")
    .eq("user_id", user.id)
    .eq("comment_id", commentId)
    .maybeSingle();

  if (existing) {
    if (existing.vote_type === voteType) {
      await supabase.from("votes").delete().eq("id", existing.id);
    } else {
      await supabase
        .from("votes")
        .update({ vote_type: voteType })
        .eq("id", existing.id);
    }
  } else {
    await supabase.from("votes").insert({
      user_id: user.id,
      comment_id: commentId,
      vote_type: voteType,
    });
  }

  revalidatePath("/");
}

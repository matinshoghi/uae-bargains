"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { cookies, headers } from "next/headers";
import { ANON_VOTE_DAILY_LIMIT } from "@/lib/constants";
import { notifyDealVoted, notifyCommentVoted, notifyAnonymousDealVoted } from "@/lib/notifications";

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
      after(() => notifyDealVoted(user.id, dealId, voteType));
    }
  } else {
    // New vote
    await supabase.from("votes").insert({
      user_id: user.id,
      deal_id: dealId,
      vote_type: voteType,
    });
    after(() => notifyDealVoted(user.id, dealId, voteType));
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
      after(() => notifyCommentVoted(user.id, commentId, voteType));
    }
  } else {
    await supabase.from("votes").insert({
      user_id: user.id,
      comment_id: commentId,
      vote_type: voteType,
    });
    after(() => notifyCommentVoted(user.id, commentId, voteType));
  }

  revalidatePath("/");
}

// ── Anonymous deal voting ────────────────────────────────────────────

function getAnonId(cookieStore: Awaited<ReturnType<typeof cookies>>): string {
  const existing = cookieStore.get("anon_voter_id")?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  cookieStore.set("anon_voter_id", id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
  return id;
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

type AnonVoteResult = {
  rateLimited?: boolean;
  action?: "added" | "removed" | "switched";
};

export async function voteDealAnonymous(
  dealId: string,
  voteType: 1 | -1
): Promise<AnonVoteResult> {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const anonId = getAnonId(cookieStore);
  const ip = await getClientIp();

  // Check for existing vote FIRST so toggle-off is always allowed
  const { data: existing } = await supabase
    .from("anonymous_votes")
    .select("id, vote_type")
    .eq("anon_id", anonId)
    .eq("deal_id", dealId)
    .maybeSingle();

  // Toggle off — always allowed, even when rate limited
  if (existing && existing.vote_type === voteType) {
    await supabase.from("anonymous_votes").delete().eq("id", existing.id);
    revalidatePath("/");
    return { action: "removed" };
  }

  // Rate limit only applies to new votes and vote switches
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("anonymous_votes")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("created_at", dayAgo);

  if ((count ?? 0) >= ANON_VOTE_DAILY_LIMIT) {
    return { rateLimited: true };
  }

  if (existing) {
    // Switch direction
    await supabase
      .from("anonymous_votes")
      .update({ vote_type: voteType })
      .eq("id", existing.id);
    after(() => notifyAnonymousDealVoted(dealId, voteType));
    revalidatePath("/");
    return { action: "switched" };
  }

  // New vote
  await supabase.from("anonymous_votes").insert({
    anon_id: anonId,
    deal_id: dealId,
    vote_type: voteType,
    ip_address: ip,
  });

  after(() => notifyAnonymousDealVoted(dealId, voteType));
  revalidatePath("/");
  return { action: "added" };
}

/**
 * Fetch anonymous votes for the current visitor (by cookie).
 * Returns a map of dealId → voteType.
 */
export async function getAnonymousVotes(): Promise<Record<string, number>> {
  const cookieStore = await cookies();
  const anonId = cookieStore.get("anon_voter_id")?.value;
  if (!anonId) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("anonymous_votes")
    .select("deal_id, vote_type")
    .eq("anon_id", anonId);

  const map: Record<string, number> = {};
  if (data) {
    for (const v of data) {
      map[v.deal_id] = v.vote_type;
    }
  }
  return map;
}

/**
 * Merge anonymous votes into the authenticated user's votes on sign-in.
 * Called client-side after auth state change.
 */
export async function mergeAnonymousVotes(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const cookieStore = await cookies();
  const anonId = cookieStore.get("anon_voter_id")?.value;
  if (!anonId) return;

  // Get all anonymous votes for this visitor
  const { data: anonVotes } = await supabase
    .from("anonymous_votes")
    .select("id, deal_id, vote_type")
    .eq("anon_id", anonId);

  if (!anonVotes || anonVotes.length === 0) return;

  const admin = createAdminClient();

  for (const av of anonVotes) {
    // Check if user already voted on this deal
    const { data: existingVote } = await admin
      .from("votes")
      .select("id")
      .eq("user_id", user.id)
      .eq("deal_id", av.deal_id)
      .maybeSingle();

    if (!existingVote) {
      // Insert into votes table
      await admin.from("votes").insert({
        user_id: user.id,
        deal_id: av.deal_id,
        vote_type: av.vote_type,
      });
    }

    // Delete the anonymous vote (trigger will adjust deal counts down,
    // and the votes table trigger will adjust them back up for the merged vote)
    await admin.from("anonymous_votes").delete().eq("id", av.id);
  }

  // Clear the cookie
  cookieStore.set("anon_voter_id", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type SeedFormState = {
  error?: string;
  success?: boolean;
} | null;

function extractUUID(input: string): string {
  const match = input.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return match ? match[0] : input.trim();
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Not authorized");

  return user;
}

export async function createSeedUser(
  _prev: SeedFormState,
  formData: FormData
): Promise<SeedFormState> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const username = (formData.get("username") as string)?.trim();
    const displayName = (formData.get("display_name") as string)?.trim();
    const avatarUrl = (formData.get("avatar_url") as string)?.trim() || null;
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!username || username.length < 3 || username.length > 30) {
      return { error: "Username must be 3-30 characters" };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { error: "Username can only contain letters, numbers, hyphens, and underscores" };
    }
    if (!displayName || displayName.length < 1 || displayName.length > 50) {
      return { error: "Display name must be 1-50 characters" };
    }

    const email = `seed-${crypto.randomUUID()}@internal.halasaves.app`;
    const password = crypto.randomUUID() + crypto.randomUUID();

    // The handle_new_user trigger uses these metadata fields to populate the profile
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        preferred_username: username,
        full_name: displayName,
        avatar_url: avatarUrl,
      },
    });

    if (authError) {
      if (authError.message.includes("already been registered")) {
        return { error: "A user with this username already exists" };
      }
      return { error: authError.message };
    }

    const { error: seedError } = await admin.from("seed_accounts").insert({
      user_id: authUser.user.id,
      notes,
    });

    if (seedError) {
      await admin.auth.admin.deleteUser(authUser.user.id);
      return { error: seedError.message };
    }

    revalidatePath("/admin/seed-users");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteSeedUser(userId: string): Promise<SeedFormState> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data: seedAccount } = await admin
      .from("seed_accounts")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (!seedAccount) return { error: "Seed user not found" };

    // Nullify user_id on deals and comments so content persists
    await admin.from("deals").update({ user_id: null }).eq("user_id", userId);
    await admin.from("comments").update({ user_id: null }).eq("user_id", userId);
    await admin.from("votes").delete().eq("user_id", userId);
    await admin.from("seed_accounts").delete().eq("user_id", userId);
    await admin.from("profiles").delete().eq("id", userId);

    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) return { error: authError.message };

    revalidatePath("/admin/seed-users");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function postDealAsSeedUser(
  _prev: SeedFormState,
  formData: FormData
): Promise<SeedFormState> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const userId = formData.get("user_id") as string;
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const categoryId = formData.get("category_id") as string;
    const priceRaw = formData.get("price") as string;
    const originalPriceRaw = formData.get("original_price") as string;
    const url = (formData.get("url") as string)?.trim() || null;
    const location = (formData.get("location") as string)?.trim() || null;
    const imageUrl = (formData.get("image_url") as string)?.trim() || null;
    const expiresAt = (formData.get("expires_at") as string)?.trim() || null;

    if (!userId) return { error: "Select a seed user" };
    if (!title || title.length < 5) return { error: "Title must be at least 5 characters" };
    if (!description || description.length < 10) return { error: "Description must be at least 10 characters" };
    if (!categoryId) return { error: "Select a category" };

    // Verify user is a seed account
    const { data: seedAccount } = await admin
      .from("seed_accounts")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (!seedAccount) return { error: "User is not a seed account" };

    const price = priceRaw ? parseFloat(priceRaw) : null;
    const originalPrice = originalPriceRaw ? parseFloat(originalPriceRaw) : null;
    const expiresAtValue = expiresAt ? `${expiresAt}T23:59:59` : null;

    const { error } = await admin.from("deals").insert({
      user_id: userId,
      category_id: categoryId,
      title,
      description,
      price,
      original_price: originalPrice,
      url,
      location,
      image_url: imageUrl,
      expires_at: expiresAtValue,
    });

    if (error) return { error: error.message };

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function voteAsSeedUsers(
  dealId: string,
  userIds: string[]
): Promise<SeedFormState> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    if (!dealId) return { error: "Deal ID is required" };
    if (!userIds.length) return { error: "Select at least one seed user" };

    // Verify all users are seed accounts
    const { data: seedAccounts } = await admin
      .from("seed_accounts")
      .select("user_id")
      .in("user_id", userIds);

    if (!seedAccounts || seedAccounts.length !== userIds.length) {
      return { error: "One or more users are not seed accounts" };
    }

    // Verify deal exists
    const { data: deal } = await admin
      .from("deals")
      .select("id")
      .eq("id", dealId)
      .single();

    if (!deal) return { error: "Deal not found" };

    // Check for existing votes and only insert new ones
    const { data: existingVotes } = await admin
      .from("votes")
      .select("user_id")
      .eq("deal_id", dealId)
      .in("user_id", userIds);

    const existingUserIds = new Set(existingVotes?.map((v) => v.user_id) ?? []);
    const newVotes = userIds
      .filter((id) => !existingUserIds.has(id))
      .map((id) => ({ user_id: id, deal_id: dealId, vote_type: 1 }));

    if (newVotes.length === 0) {
      return { error: "All selected users have already voted on this deal" };
    }

    const { error } = await admin.from("votes").insert(newVotes);
    if (error) return { error: error.message };

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function commentAsSeedUser(
  _prev: SeedFormState,
  formData: FormData
): Promise<SeedFormState> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const userId = formData.get("user_id") as string;
    const dealIdRaw = formData.get("deal_id") as string;
    const content = (formData.get("content") as string)?.trim();
    const parentId = (formData.get("parent_id") as string)?.trim() || null;

    if (!userId) return { error: "Select a seed user" };
    if (!dealIdRaw) return { error: "Deal ID is required" };

    const dealId = extractUUID(dealIdRaw);
    if (!content || content.length < 1) return { error: "Comment cannot be empty" };
    if (content.length > 2000) return { error: "Comment must be under 2000 characters" };

    // Verify seed account
    const { data: seedAccount } = await admin
      .from("seed_accounts")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (!seedAccount) return { error: "User is not a seed account" };

    // Verify deal exists
    const { data: deal } = await admin
      .from("deals")
      .select("id")
      .eq("id", dealId)
      .single();

    if (!deal) return { error: "Deal not found" };

    let depth = 0;
    if (parentId) {
      const { data: parent } = await admin
        .from("comments")
        .select("depth")
        .eq("id", parentId)
        .single();

      depth = parent ? Math.min(parent.depth + 1, 1) : 0;
    }

    const { error } = await admin.from("comments").insert({
      deal_id: dealId,
      user_id: userId,
      parent_id: parentId,
      content,
      depth,
    });

    if (error) return { error: error.message };

    revalidatePath(`/deals/${dealId}`);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

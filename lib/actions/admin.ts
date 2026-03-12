"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { optimizeImage } from "@/lib/images";
import { revalidatePath } from "next/cache";

async function getDealSlug(admin: ReturnType<typeof createAdminClient>, dealId: string): Promise<string> {
  const { data } = await admin.from("deals").select("slug").eq("id", dealId).single();
  return data?.slug ?? dealId;
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

export async function toggleFeaturedDeal(
  dealId: string,
  featured: boolean
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { error } = await admin
      .from("deals")
      .update({ is_featured: featured })
      .eq("id", dealId);

    if (error) return { error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/featured");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function removeDeal(
  dealId: string,
  reason?: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const slug = await getDealSlug(admin, dealId);

    const { error } = await admin
      .from("deals")
      .update({
        status: "removed" as const,
        removed_by: "admin",
        removal_reason: reason || null,
      })
      .eq("id", dealId);

    if (error) return { error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/moderation");
    revalidatePath(`/deals/${slug}`);
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function restoreDeal(
  dealId: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const slug = await getDealSlug(admin, dealId);

    // Clear all status-related fields when restoring
    const { error } = await admin
      .from("deals")
      .update({
        status: "active" as const,
        removed_by: null,
        removal_reason: null,
        expired_reason: null,
        expire_report_count: 0,
      })
      .eq("id", dealId);

    if (error) return { error: error.message };

    // Clear community expire reports
    await admin.from("deal_expire_reports").delete().eq("deal_id", dealId);

    revalidatePath("/");
    revalidatePath("/admin/moderation");
    revalidatePath(`/deals/${slug}`);
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function adminExpireDeal(
  dealId: string,
  reason: "admin" | "out_of_stock" = "admin"
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const slug = await getDealSlug(admin, dealId);

    const { error } = await admin
      .from("deals")
      .update({
        status: "expired" as const,
        expired_reason: reason,
      })
      .eq("id", dealId);

    if (error) return { error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/moderation");
    revalidatePath(`/deals/${slug}`);
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function adminReactivateDeal(
  dealId: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data: deal, error: fetchError } = await admin
      .from("deals")
      .select("slug, status, expires_at")
      .eq("id", dealId)
      .single();

    if (fetchError || !deal) {
      return { error: fetchError?.message ?? "Deal not found." };
    }

    if (deal.status !== "expired") {
      return { error: "This deal is not expired." };
    }

    // Keep the same guard as author reactivation.
    if (deal.expires_at && new Date(deal.expires_at) < new Date()) {
      return { error: "Update the expiry date first — it's still in the past." };
    }

    await admin.from("deal_expire_reports").delete().eq("deal_id", dealId);

    const { error } = await admin
      .from("deals")
      .update({
        status: "active" as const,
        expired_reason: null,
        expire_report_count: 0,
      })
      .eq("id", dealId);

    if (error) return { error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/moderation");
    revalidatePath(`/deals/${deal.slug}`);
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function adminEditDeal(
  dealId: string,
  fields: {
    title?: string;
    description?: string;
    category_id?: string;
    price?: number | null;
    original_price?: number | null;
    url?: string | null;
    promo_code?: string | null;
    location?: string | null;
    expires_at?: string | null;
    user_id?: string | null;
    created_at?: string;
  }
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    // Don't update updated_at — admin edits should not trigger the
    // "(edited)" indicator visible to users. Only author self-edits do.
    // When created_at changes, sync updated_at to match so the
    // wasEdited() check (updated_at - created_at > 60s) stays clean.
    const payload: Record<string, unknown> = { ...fields };
    if (fields.created_at) {
      payload.updated_at = fields.created_at;
    }

    // If the expiry date was pushed to the future, reactivate an expired deal
    if (fields.expires_at) {
      const newExpiry = new Date(fields.expires_at);
      if (newExpiry > new Date()) {
        const { data: current } = await admin
          .from("deals")
          .select("status")
          .eq("id", dealId)
          .single();
        if (current?.status === "expired") {
          payload.status = "active";
          payload.expired_reason = null;
          payload.expire_report_count = 0;
        }
      }
    }

    const slug = await getDealSlug(admin, dealId);

    const { error } = await admin
      .from("deals")
      .update(payload)
      .eq("id", dealId);

    if (error) return { error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/moderation");
    revalidatePath(`/deals/${slug}`);
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function resetEditedFlag(
  dealId: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    // Sync updated_at to created_at so the wasEdited() check returns false
    const { data: deal, error: fetchError } = await admin
      .from("deals")
      .select("created_at, slug")
      .eq("id", dealId)
      .single();

    if (fetchError || !deal) return { error: fetchError?.message ?? "Deal not found" };

    const { error } = await admin
      .from("deals")
      .update({ updated_at: deal.created_at })
      .eq("id", dealId);

    if (error) return { error: error.message };

    revalidatePath(`/deals/${deal.slug}`);
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function adminUploadDealImage(
  dealId: string,
  formData: FormData
): Promise<{ error?: string; image_url?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const imageFile = formData.get("image") as File | null;
    if (!imageFile || imageFile.size === 0) {
      return { error: "No image provided" };
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return { error: "Image must be under 10MB" };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return { error: "Only JPEG, PNG, and WebP images are accepted" };
    }

    // Delete old image if exists
    const { data: deal } = await admin
      .from("deals")
      .select("image_url, slug")
      .eq("id", dealId)
      .single();

    if (deal?.image_url) {
      const marker = "/deal-images/";
      const idx = deal.image_url.indexOf(marker);
      if (idx !== -1) {
        const oldPath = deal.image_url.slice(idx + marker.length);
        await admin.storage.from("deal-images").remove([oldPath]);
      }
    }

    const optimized = await optimizeImage(await imageFile.arrayBuffer());
    const filePath = `admin/${crypto.randomUUID()}.${optimized.ext}`;

    const { error: uploadError } = await admin.storage
      .from("deal-images")
      .upload(filePath, optimized.buffer, { contentType: optimized.contentType });

    if (uploadError) return { error: "Failed to upload image" };

    const { data: publicUrl } = admin.storage
      .from("deal-images")
      .getPublicUrl(filePath);

    // Update deal with new image URL
    await admin
      .from("deals")
      .update({ image_url: publicUrl.publicUrl })
      .eq("id", dealId);

    revalidatePath(`/deals/${deal?.slug ?? dealId}`);
    revalidatePath("/admin/moderation");
    revalidatePath("/");
    return { image_url: publicUrl.publicUrl };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function adminRemoveDealImage(
  dealId: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data: deal } = await admin
      .from("deals")
      .select("image_url, slug")
      .eq("id", dealId)
      .single();

    if (deal?.image_url) {
      const marker = "/deal-images/";
      const idx = deal.image_url.indexOf(marker);
      if (idx !== -1) {
        const oldPath = deal.image_url.slice(idx + marker.length);
        await admin.storage.from("deal-images").remove([oldPath]);
      }
    }

    await admin
      .from("deals")
      .update({ image_url: null })
      .eq("id", dealId);

    revalidatePath(`/deals/${deal?.slug ?? dealId}`);
    revalidatePath("/admin/moderation");
    revalidatePath("/");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function adminHideComment(
  commentId: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data: comment } = await admin
      .from("comments")
      .select("deal_id")
      .eq("id", commentId)
      .single();

    if (!comment) return { error: "Comment not found" };

    const { error } = await admin
      .from("comments")
      .update({ is_hidden: true })
      .eq("id", commentId);

    if (error) return { error: error.message };

    const dealSlug = await getDealSlug(admin, comment.deal_id);
    revalidatePath(`/deals/${dealSlug}`);
    revalidatePath("/admin/comments");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function adminUnhideComment(
  commentId: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data: comment } = await admin
      .from("comments")
      .select("deal_id")
      .eq("id", commentId)
      .single();

    if (!comment) return { error: "Comment not found" };

    const { error } = await admin
      .from("comments")
      .update({ is_hidden: false })
      .eq("id", commentId);

    if (error) return { error: error.message };

    const dealSlug = await getDealSlug(admin, comment.deal_id);
    revalidatePath(`/deals/${dealSlug}`);
    revalidatePath("/admin/comments");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function adminEditComment(
  commentId: string,
  fields: { content?: string; created_at?: string }
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data: comment } = await admin
      .from("comments")
      .select("deal_id")
      .eq("id", commentId)
      .single();

    if (!comment) return { error: "Comment not found" };

    // Admin edits should NOT update updated_at — same convention as adminEditDeal
    const { error } = await admin
      .from("comments")
      .update(fields)
      .eq("id", commentId);

    if (error) return { error: error.message };

    const dealSlug = await getDealSlug(admin, comment.deal_id);
    revalidatePath(`/deals/${dealSlug}`);
    revalidatePath("/admin/comments");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function permanentlyDeleteDeal(
  dealId: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    // Fetch the deal first to confirm it exists and get the image URL
    const { data: deal, error: fetchError } = await admin
      .from("deals")
      .select("id, image_url")
      .eq("id", dealId)
      .single();

    if (fetchError || !deal) return { error: "Deal not found" };

    // 1. Collect all comment IDs so we can wipe their votes
    const { data: comments } = await admin
      .from("comments")
      .select("id")
      .eq("deal_id", dealId);

    const commentIds = (comments ?? []).map((c) => c.id);

    // 2. Delete votes cast on any of this deal's comments
    if (commentIds.length > 0) {
      await admin.from("votes").delete().in("comment_id", commentIds);
    }

    // 3. Delete votes cast directly on the deal
    await admin.from("votes").delete().eq("deal_id", dealId);

    // 4. Delete all comments for the deal
    //    (self-referential parent_id FK is safe — Postgres resolves the
    //     single-statement bulk delete within one transaction)
    await admin.from("comments").delete().eq("deal_id", dealId);

    // 5. Delete telegram push records (ON DELETE CASCADE would also handle
    //    this, but explicit deletion keeps the operation self-documenting)
    await admin.from("telegram_pushes").delete().eq("deal_id", dealId);

    // 6. Delete the deal row itself
    const { error: deleteError } = await admin
      .from("deals")
      .delete()
      .eq("id", dealId);

    if (deleteError) return { error: deleteError.message };

    // 7. Remove the deal image from Storage if one was attached
    if (deal.image_url) {
      const marker = "/deal-images/";
      const idx = deal.image_url.indexOf(marker);
      if (idx !== -1) {
        const imagePath = deal.image_url.slice(idx + marker.length);
        await admin.storage.from("deal-images").remove([imagePath]);
      }
    }

    revalidatePath("/");
    revalidatePath("/admin/moderation");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function adminDeleteComment(
  commentId: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    // Get deal_id for revalidation
    const { data: comment } = await admin
      .from("comments")
      .select("deal_id")
      .eq("id", commentId)
      .single();

    if (!comment) return { error: "Comment not found" };

    const { error } = await admin
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) return { error: error.message };

    const dealSlug = await getDealSlug(admin, comment.deal_id);
    revalidatePath(`/deals/${dealSlug}`);
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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
    revalidatePath(`/deals/${dealId}`);
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

    const { error } = await admin
      .from("deals")
      .update({
        status: "active" as const,
        removed_by: null,
        removal_reason: null,
      })
      .eq("id", dealId);

    if (error) return { error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/moderation");
    revalidatePath(`/deals/${dealId}`);
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
    location?: string | null;
    expires_at?: string | null;
    user_id?: string | null;
  }
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    // Don't update updated_at — admin edits should not trigger the
    // "(edited)" indicator visible to users. Only author self-edits do.
    const { error } = await admin
      .from("deals")
      .update(fields)
      .eq("id", dealId);

    if (error) return { error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/moderation");
    revalidatePath(`/deals/${dealId}`);
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

    if (imageFile.size > 5 * 1024 * 1024) {
      return { error: "Image must be under 5MB" };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return { error: "Only JPEG, PNG, and WebP images are accepted" };
    }

    // Delete old image if exists
    const { data: deal } = await admin
      .from("deals")
      .select("image_url")
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

    const fileExt = imageFile.name.split(".").pop();
    const filePath = `admin/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await admin.storage
      .from("deal-images")
      .upload(filePath, imageFile);

    if (uploadError) return { error: "Failed to upload image" };

    const { data: publicUrl } = admin.storage
      .from("deal-images")
      .getPublicUrl(filePath);

    // Update deal with new image URL
    await admin
      .from("deals")
      .update({ image_url: publicUrl.publicUrl })
      .eq("id", dealId);

    revalidatePath(`/deals/${dealId}`);
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
      .select("image_url")
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

    revalidatePath(`/deals/${dealId}`);
    revalidatePath("/admin/moderation");
    revalidatePath("/");
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

    revalidatePath(`/deals/${comment.deal_id}`);
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

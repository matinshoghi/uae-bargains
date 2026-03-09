"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { optimizeImage } from "@/lib/images";
import { revalidatePath } from "next/cache";
import { createStoreSchema, createCouponSchema, submitCouponSchema } from "@/lib/validations/coupon";
import { cookies, headers } from "next/headers";

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

// ── Store Actions ──────────────────────────────────────────

export type StoreFormState = {
  error?: string;
  success?: boolean;
} | null;

async function uploadLogo(
  admin: ReturnType<typeof createAdminClient>,
  file: File,
  oldLogoUrl?: string | null
): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new Error("Logo must be under 5MB");

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and SVG logos are accepted");
  }

  // Delete old logo if exists
  if (oldLogoUrl) {
    const marker = "/store-logos/";
    const idx = oldLogoUrl.indexOf(marker);
    if (idx !== -1) {
      const oldPath = oldLogoUrl.slice(idx + marker.length);
      await admin.storage.from("store-logos").remove([oldPath]);
    }
  }

  // SVGs don't need optimization
  if (file.type === "image/svg+xml") {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = `${crypto.randomUUID()}.svg`;
    const { error } = await admin.storage
      .from("store-logos")
      .upload(filePath, buffer, { contentType: "image/svg+xml" });
    if (error) throw new Error("Failed to upload logo");
    return admin.storage.from("store-logos").getPublicUrl(filePath).data.publicUrl;
  }

  const optimized = await optimizeImage(await file.arrayBuffer());
  const filePath = `${crypto.randomUUID()}.${optimized.ext}`;
  const { error } = await admin.storage
    .from("store-logos")
    .upload(filePath, optimized.buffer, { contentType: optimized.contentType });
  if (error) throw new Error("Failed to upload logo");
  return admin.storage.from("store-logos").getPublicUrl(filePath).data.publicUrl;
}

export async function createStore(
  _prev: StoreFormState,
  formData: FormData
): Promise<StoreFormState> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const raw = Object.fromEntries(formData.entries());
    const parsed = createStoreSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    // Handle logo upload
    let logoUrl: string | null = null;
    const logoFile = formData.get("logo") as File | null;
    if (logoFile && logoFile.size > 0) {
      logoUrl = await uploadLogo(admin, logoFile);
    }

    const { error } = await admin.from("stores").insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      logo_url: logoUrl,
      website_url: parsed.data.website_url || null,
      affiliate_network: parsed.data.affiliate_network || null,
      description: parsed.data.description || null,
      is_active: parsed.data.is_active,
      sort_order: parsed.data.sort_order,
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/stores");
    revalidatePath("/coupons");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateStore(
  _prev: StoreFormState,
  formData: FormData
): Promise<StoreFormState> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const id = formData.get("id") as string;
    if (!id) return { error: "Store ID is required" };

    const raw = Object.fromEntries(formData.entries());
    const parsed = createStoreSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    // Handle logo upload — keep existing if no new file
    const logoFile = formData.get("logo") as File | null;
    const existingLogoUrl = (formData.get("existing_logo_url") as string) || null;
    let logoUrl = existingLogoUrl;

    if (logoFile && logoFile.size > 0) {
      logoUrl = await uploadLogo(admin, logoFile, existingLogoUrl);
    }

    // If user cleared the logo (no file + removeLogo flag)
    const removeLogo = formData.get("remove_logo") === "true";
    if (removeLogo && !logoFile?.size) {
      if (existingLogoUrl) {
        const marker = "/store-logos/";
        const idx = existingLogoUrl.indexOf(marker);
        if (idx !== -1) {
          const oldPath = existingLogoUrl.slice(idx + marker.length);
          await admin.storage.from("store-logos").remove([oldPath]);
        }
      }
      logoUrl = null;
    }

    const { error } = await admin
      .from("stores")
      .update({
        name: parsed.data.name,
        slug: parsed.data.slug,
        logo_url: logoUrl,
        website_url: parsed.data.website_url || null,
        affiliate_network: parsed.data.affiliate_network || null,
        description: parsed.data.description || null,
        is_active: parsed.data.is_active,
        sort_order: parsed.data.sort_order,
      })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/stores");
    revalidatePath("/coupons");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteStore(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { error } = await admin.from("stores").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/stores");
    revalidatePath("/coupons");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ── Coupon Actions ─────────────────────────────────────────

export type CouponFormState = {
  error?: string;
  success?: boolean;
} | null;

export async function createCoupon(
  _prev: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const raw = Object.fromEntries(formData.entries());
    const parsed = createCouponSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { error } = await admin.from("coupons").insert({
      store_id: parsed.data.store_id,
      code: parsed.data.code || null,
      title: parsed.data.title,
      description: parsed.data.description || null,
      discount_type: parsed.data.discount_type,
      discount_value: parsed.data.discount_value || null,
      min_purchase: parsed.data.min_purchase || null,
      url: parsed.data.url || null,
      affiliate_url: parsed.data.affiliate_url || null,
      expires_at: parsed.data.expires_at || null,
      is_verified: parsed.data.is_verified,
      is_featured: parsed.data.is_featured,
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/coupons");
    revalidatePath("/coupons");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateCoupon(
  _prev: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const id = formData.get("id") as string;
    if (!id) return { error: "Coupon ID is required" };

    const raw = Object.fromEntries(formData.entries());
    const parsed = createCouponSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { error } = await admin
      .from("coupons")
      .update({
        store_id: parsed.data.store_id,
        code: parsed.data.code || null,
        title: parsed.data.title,
        description: parsed.data.description || null,
        discount_type: parsed.data.discount_type,
        discount_value: parsed.data.discount_value || null,
        min_purchase: parsed.data.min_purchase || null,
        url: parsed.data.url || null,
        affiliate_url: parsed.data.affiliate_url || null,
        expires_at: parsed.data.expires_at || null,
        is_verified: parsed.data.is_verified,
        is_featured: parsed.data.is_featured,
      })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/coupons");
    revalidatePath("/coupons");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function expireCoupon(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { error } = await admin
      .from("coupons")
      .update({ status: "expired" as const })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/coupons");
    revalidatePath("/coupons");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteCoupon(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { error } = await admin.from("coupons").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/coupons");
    revalidatePath("/coupons");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function incrementCouponClick(id: string): Promise<void> {
  const admin = createAdminClient();
  await admin.rpc("increment_coupon_click", { coupon_id: id });
}

export async function expireExpiredCoupons(): Promise<{ expired: number; error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("coupons")
      .update({ status: "expired" as const })
      .eq("status", "active")
      .lt("expires_at", new Date().toISOString())
      .select("id");

    if (error) return { expired: 0, error: error.message };

    revalidatePath("/admin/coupons");
    revalidatePath("/coupons");
    return { expired: data?.length ?? 0 };
  } catch (e) {
    return { expired: 0, error: (e as Error).message };
  }
}

// ── User Coupon Submission ────────────────────────────────────

export async function submitCoupon(
  _prev: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "You must be logged in to submit a coupon" };

    const raw = Object.fromEntries(formData.entries());
    const parsed = submitCouponSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const admin = createAdminClient();
    const { error } = await admin.from("coupons").insert({
      store_id: parsed.data.store_id,
      code: parsed.data.code || null,
      title: parsed.data.title,
      description: parsed.data.description || null,
      discount_type: parsed.data.discount_type,
      url: parsed.data.url || null,
      expires_at: parsed.data.expires_at || null,
      submitted_by: user.id,
      moderation_status: "pending",
      is_verified: false,
      is_featured: false,
    });

    if (error) return { error: error.message };

    revalidatePath("/coupons");
    revalidatePath("/admin/coupon-submissions");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ── Admin Moderation ──────────────────────────────────────────

export async function approveCoupon(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { error } = await admin
      .from("coupons")
      .update({ moderation_status: "approved" as const })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/coupon-submissions");
    revalidatePath("/admin/coupons");
    revalidatePath("/coupons");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function approveAndUpdateCoupon(
  _prev: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const id = formData.get("id") as string;
    if (!id) return { error: "Coupon ID is required" };

    const raw = Object.fromEntries(formData.entries());
    const parsed = createCouponSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { error } = await admin
      .from("coupons")
      .update({
        store_id: parsed.data.store_id,
        code: parsed.data.code || null,
        title: parsed.data.title,
        description: parsed.data.description || null,
        discount_type: parsed.data.discount_type,
        discount_value: parsed.data.discount_value || null,
        min_purchase: parsed.data.min_purchase || null,
        url: parsed.data.url || null,
        affiliate_url: parsed.data.affiliate_url || null,
        expires_at: parsed.data.expires_at || null,
        is_verified: parsed.data.is_verified,
        is_featured: parsed.data.is_featured,
        moderation_status: "approved" as const,
      })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/coupon-submissions");
    revalidatePath("/admin/coupons");
    revalidatePath("/coupons");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function rejectCoupon(
  id: string,
  note?: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { error } = await admin
      .from("coupons")
      .update({
        moderation_status: "rejected" as const,
        moderation_note: note || null,
      })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/coupon-submissions");
    revalidatePath("/admin/coupons");
    revalidatePath("/coupons");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ── Coupon Feedback ───────────────────────────────────────────

function getAnonId(cookieStore: Awaited<ReturnType<typeof cookies>>): string {
  const existing = cookieStore.get("anon_voter_id")?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  cookieStore.set("anon_voter_id", id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return id;
}

export async function submitCouponFeedback(
  couponId: string,
  worked: boolean
): Promise<{ error?: string; toggled?: boolean }> {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const anonId = getAnonId(cookieStore);
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    // Check for existing feedback
    const { data: existing } = await supabase
      .from("coupon_feedback")
      .select("id, worked")
      .eq("coupon_id", couponId)
      .eq("anon_id", anonId)
      .maybeSingle();

    const admin = createAdminClient();

    if (existing) {
      if (existing.worked === worked) {
        // Toggle off — remove feedback
        await admin.from("coupon_feedback").delete().eq("id", existing.id);
        revalidatePath("/coupons");
        return { toggled: true };
      }
      // Switch feedback direction — delete old, insert new
      await admin.from("coupon_feedback").delete().eq("id", existing.id);
    }

    await admin.from("coupon_feedback").insert({
      coupon_id: couponId,
      anon_id: anonId,
      ip_address: ip,
      worked,
    });

    revalidatePath("/coupons");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function getCouponFeedbackMap(): Promise<Record<string, boolean>> {
  const cookieStore = await cookies();
  const anonId = cookieStore.get("anon_voter_id")?.value;
  if (!anonId) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("coupon_feedback")
    .select("coupon_id, worked")
    .eq("anon_id", anonId);

  const map: Record<string, boolean> = {};
  if (data) {
    for (const row of data) {
      map[row.coupon_id] = row.worked;
    }
  }
  return map;
}

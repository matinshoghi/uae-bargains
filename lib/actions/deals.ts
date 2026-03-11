"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createDealSchema, updateDealSchema } from "@/lib/validations/deal";
import { captureImageForDeal } from "@/lib/og";
import { optimizeImage } from "@/lib/images";
import { notifyDealChange } from "@/lib/indexnow";
import { notifyDealPosted } from "@/lib/notifications";
import { slugify } from "@/lib/slugify";
import type { DealWithRelations } from "@/lib/types";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string
): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const { data } = await supabase
      .from("deals")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix++;
  }
}

export type DealFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  values?: Record<string, string>;
} | null;

function extractValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, val] of formData.entries()) {
    if (key !== "image") {
      values[key] = val as string;
    }
  }
  return values;
}

export async function createDeal(
  _prevState: DealFormState,
  formData: FormData
): Promise<DealFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const values = extractValues(formData);

  if (!user) {
    return { message: "You must be signed in to post a deal.", values };
  }

  // Parse form fields (exclude image — handled separately)
  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    is_free: formData.get("is_free"),
    price: formData.get("price"),
    original_price: formData.get("original_price"),
    url: formData.get("url"),
    promo_code: formData.get("promo_code"),
    location: formData.get("location"),
    category_id: formData.get("category_id"),
    expires_at: formData.get("expires_at"),
  };

  const parsed = createDealSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values };
  }

  const {
    title,
    description,
    is_free,
    price,
    original_price,
    url,
    promo_code,
    location,
    category_id,
    expires_at,
  } = parsed.data;

  // Handle image upload
  let image_url: string | null = null;
  const imageFile = formData.get("image") as File | null;

  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > MAX_UPLOAD_SIZE) {
      return { errors: { image: ["Image must be under 10MB"] }, values };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return {
        errors: { image: ["Only JPEG, PNG, and WebP images are accepted"] },
        values,
      };
    }

    const optimized = await optimizeImage(await imageFile.arrayBuffer());
    const filePath = `${user.id}/${crypto.randomUUID()}.${optimized.ext}`;

    const { error: uploadError } = await supabase.storage
      .from("deal-images")
      .upload(filePath, optimized.buffer, { contentType: optimized.contentType });

    if (uploadError) {
      return { errors: { image: ["Failed to upload image. Please try again."] }, values };
    }

    const { data: publicUrl } = supabase.storage
      .from("deal-images")
      .getPublicUrl(filePath);

    image_url = publicUrl.publicUrl;
  }

  // Store expiry as end-of-day in local time (not UTC)
  // This prevents timezone offset showing the wrong date
  const expiresAtValue = expires_at ? `${expires_at}T23:59:59` : null;

  // Generate unique slug from title
  const slug = await generateUniqueSlug(supabase, title);

  // Insert deal
  const { data: deal, error } = await supabase
    .from("deals")
    .insert({
      user_id: user.id,
      category_id,
      title,
      slug,
      description,
      price: is_free ? 0 : (price ?? null),
      original_price: is_free ? null : (original_price ?? null),
      url: url || null,
      promo_code: promo_code || null,
      location: location || null,
      image_url,
      expires_at: expiresAtValue,
    })
    .select()
    .returns<{ id: string; slug: string }[]>()
    .single();

  if (error) {
    return { message: error.message, values };
  }

  // Auto-extract image in the background if none was uploaded
  if (!image_url && url) {
    const dealId = deal.id;
    const userId = user.id;
    const dealUrl = url;
    after(async () => {
      const admin = createAdminClient();
      const capturedUrl = await captureImageForDeal(dealUrl, userId, admin);
      if (capturedUrl) {
        await admin
          .from("deals")
          .update({ image_url: capturedUrl })
          .eq("id", dealId);
      }
    });
  }

  // Notify IndexNow and Telegram about the new deal
  after(() => notifyDealChange(deal.slug));
  after(() => notifyDealPosted(user.id, title));

  redirect(`/deals/${deal.slug}`);
}

export async function updateDeal(
  dealId: string,
  _prevState: DealFormState,
  formData: FormData
): Promise<DealFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const values = extractValues(formData);

  if (!user) {
    return { message: "You must be signed in to edit a deal.", values };
  }

  // Verify ownership
  const { data: existingDeal } = await supabase
    .from("deals")
    .select("user_id, image_url, status, slug")
    .eq("id", dealId)
    .single();

  if (!existingDeal || existingDeal.user_id !== user.id) {
    return { message: "You can only edit your own deals.", values };
  }

  // Parse and validate (title omitted — locked after posting)
  const raw = {
    description: formData.get("description"),
    is_free: formData.get("is_free"),
    price: formData.get("price"),
    original_price: formData.get("original_price"),
    url: formData.get("url"),
    promo_code: formData.get("promo_code"),
    location: formData.get("location"),
    category_id: formData.get("category_id"),
    expires_at: formData.get("expires_at"),
  };

  const parsed = updateDealSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values };
  }

  const {
    description,
    is_free,
    price,
    original_price,
    url,
    promo_code,
    location,
    category_id,
    expires_at,
  } = parsed.data;

  // Handle image
  let image_url: string | null = existingDeal.image_url;
  const removeImage = formData.get("remove_image") === "true";
  const imageFile = formData.get("image") as File | null;

  // If user wants to remove image
  if (removeImage && !imageFile?.size) {
    // Delete old image from storage if it exists
    if (existingDeal.image_url) {
      const oldPath = extractStoragePath(existingDeal.image_url);
      if (oldPath) {
        await supabase.storage.from("deal-images").remove([oldPath]);
      }
    }
    image_url = null;
  }

  // If user uploaded a new image
  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > MAX_UPLOAD_SIZE) {
      return { errors: { image: ["Image must be under 10MB"] }, values };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return {
        errors: { image: ["Only JPEG, PNG, and WebP images are accepted"] },
        values,
      };
    }

    // Delete old image from storage
    if (existingDeal.image_url) {
      const oldPath = extractStoragePath(existingDeal.image_url);
      if (oldPath) {
        await supabase.storage.from("deal-images").remove([oldPath]);
      }
    }

    const optimized = await optimizeImage(await imageFile.arrayBuffer());
    const filePath = `${user.id}/${crypto.randomUUID()}.${optimized.ext}`;

    const { error: uploadError } = await supabase.storage
      .from("deal-images")
      .upload(filePath, optimized.buffer, { contentType: optimized.contentType });

    if (uploadError) {
      return { errors: { image: ["Failed to upload image. Please try again."] }, values };
    }

    const { data: publicUrl } = supabase.storage
      .from("deal-images")
      .getPublicUrl(filePath);

    image_url = publicUrl.publicUrl;
  }

  const expiresAtValue = expires_at ? `${expires_at}T23:59:59` : null;

  // If the expiry date was pushed to the future, reactivate an expired deal
  const shouldReactivate =
    existingDeal.status === "expired" &&
    expiresAtValue &&
    new Date(expiresAtValue) > new Date();

  const { error } = await supabase
    .from("deals")
    .update({
      category_id,
      description,
      price: is_free ? 0 : (price ?? null),
      original_price: is_free ? null : (original_price ?? null),
      url: url || null,
      promo_code: promo_code || null,
      location: location || null,
      image_url,
      expires_at: expiresAtValue,
      updated_at: new Date().toISOString(),
      ...(shouldReactivate && { status: "active" as const }),
    })
    .eq("id", dealId);

  if (error) {
    return { message: error.message, values };
  }

  // Notify IndexNow about the updated deal
  after(() => notifyDealChange(existingDeal.slug));

  revalidatePath(`/deals/${existingDeal.slug}`);
  redirect(`/deals/${existingDeal.slug}`);
}

export async function deleteDeal(dealId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  // Verify ownership
  const { data: deal } = await supabase
    .from("deals")
    .select("user_id, slug")
    .eq("id", dealId)
    .single();

  if (!deal || deal.user_id !== user.id) {
    return { error: "You can only delete your own deals." };
  }

  // Soft delete — set status to 'removed'
  const { error } = await supabase
    .from("deals")
    .update({ status: "removed" as const, removed_by: "author", updated_at: new Date().toISOString() })
    .eq("id", dealId);

  if (error) {
    return { error: error.message };
  }

  // Notify IndexNow about the removal
  after(() => notifyDealChange(deal.slug));

  revalidatePath("/");
  redirect("/");
}

/**
 * Extract the storage path from a Supabase public URL.
 * e.g. ".../deal-images/userId/filename.jpg" → "userId/filename.jpg"
 */
function extractStoragePath(publicUrl: string): string | null {
  const marker = "/deal-images/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

export async function fetchMoreDeals({
  sort,
  offset,
  categorySlug,
  hideExpired,
}: {
  sort: string;
  offset: number;
  categorySlug?: string;
  hideExpired?: boolean;
}) {
  const { fetchDeals } = await import("@/lib/queries/deals");
  return fetchDeals({ sort, offset, categorySlug, hideExpired });
}

export async function fetchMoreInterleavedDeals({
  sort,
  activeOffset,
  expiredOffset,
  categorySlug,
}: {
  sort: string;
  activeOffset: number;
  expiredOffset: number;
  categorySlug?: string;
}): Promise<{ deals: DealWithRelations[]; activeUsed: number; expiredUsed: number }> {
  const { fetchActiveDeals, fetchExpiredDeals } = await import("@/lib/queries/deals");
  const { interleaveDeals } = await import("@/lib/utils");
  const { DEALS_PER_PAGE, EXPIRED_DEAL_INTERVAL } = await import("@/lib/constants");

  const expiredNeeded = Math.ceil(DEALS_PER_PAGE / EXPIRED_DEAL_INTERVAL) + 1;

  const [active, expired] = await Promise.all([
    fetchActiveDeals({ sort, limit: DEALS_PER_PAGE, offset: activeOffset, categorySlug }),
    fetchExpiredDeals({ limit: expiredNeeded, offset: expiredOffset, categorySlug }),
  ]);

  return interleaveDeals(active, expired, DEALS_PER_PAGE);
}

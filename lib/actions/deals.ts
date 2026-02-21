"use server";

import { createClient } from "@/lib/supabase/server";
import { createDealSchema } from "@/lib/validations/deal";
import { extractOgImage } from "@/lib/og";
import { redirect } from "next/navigation";

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
    location,
    category_id,
    expires_at,
  } = parsed.data;

  // Handle image upload
  let image_url: string | null = null;
  const imageFile = formData.get("image") as File | null;

  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > 5 * 1024 * 1024) {
      return { errors: { image: ["Image must be under 5MB"] }, values };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return {
        errors: { image: ["Only JPEG, PNG, and WebP images are accepted"] },
        values,
      };
    }

    const fileExt = imageFile.name.split(".").pop();
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("deal-images")
      .upload(filePath, imageFile);

    if (uploadError) {
      return { errors: { image: ["Failed to upload image. Please try again."] }, values };
    }

    const { data: publicUrl } = supabase.storage
      .from("deal-images")
      .getPublicUrl(filePath);

    image_url = publicUrl.publicUrl;
  }

  // Auto-extract OG image if no image was uploaded and a URL is provided
  // Downloads the image and saves to Supabase Storage for consistent serving
  if (!image_url && url) {
    const ogImageUrl = await extractOgImage(url);
    if (ogImageUrl) {
      try {
        const imgResponse = await fetch(ogImageUrl, {
          signal: AbortSignal.timeout(5000),
        });
        if (imgResponse.ok) {
          const contentType = imgResponse.headers.get("content-type") ?? "image/jpeg";
          const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
          const buffer = await imgResponse.arrayBuffer();
          const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("deal-images")
            .upload(filePath, buffer, { contentType });

          if (!uploadError) {
            const { data: publicUrl } = supabase.storage
              .from("deal-images")
              .getPublicUrl(filePath);
            image_url = publicUrl.publicUrl;
          }
        }
      } catch {
        // Download/upload failed — deal proceeds without image
      }
    }
  }

  // Store expiry as end-of-day in local time (not UTC)
  // This prevents timezone offset showing the wrong date
  const expiresAtValue = expires_at ? `${expires_at}T23:59:59` : null;

  // Insert deal
  const { data: deal, error } = await supabase
    .from("deals")
    .insert({
      user_id: user.id,
      category_id,
      title,
      description,
      price: is_free ? 0 : (price ?? null),
      original_price: is_free ? null : (original_price ?? null),
      url: url || null,
      location: location || null,
      image_url,
      expires_at: expiresAtValue,
    })
    .select()
    .returns<{ id: string }[]>()
    .single();

  if (error) {
    return { message: error.message, values };
  }

  redirect(`/deals/${deal.id}`);
}

export async function fetchMoreDeals({
  sort,
  offset,
  categorySlug,
}: {
  sort: string;
  offset: number;
  categorySlug?: string;
}) {
  const { fetchDeals } = await import("@/lib/queries/deals");
  return fetchDeals({ sort, offset, categorySlug });
}

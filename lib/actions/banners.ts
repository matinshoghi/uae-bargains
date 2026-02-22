"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type BannerFormState = {
  error?: string;
  success?: boolean;
} | null;

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

  return { supabase, user };
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

async function uploadBannerImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  prefix: string
): Promise<string> {
  if (file.size > MAX_SIZE) {
    throw new Error("Image must be under 5MB");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, and WebP images are accepted");
  }

  const ext = file.name.split(".").pop();
  const filePath = `${prefix}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("hero-banners")
    .upload(filePath, file);

  if (error) throw new Error("Failed to upload image");

  const { data: publicUrl } = supabase.storage
    .from("hero-banners")
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
}

function extractStoragePath(publicUrl: string): string | null {
  const marker = "/hero-banners/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

export async function createBanner(
  _prev: BannerFormState,
  formData: FormData
): Promise<BannerFormState> {
  try {
    const { supabase } = await requireAdmin();

    const desktopFile = formData.get("desktop_image") as File | null;
    if (!desktopFile || desktopFile.size === 0) {
      return { error: "Desktop image is required" };
    }

    const desktopUrl = await uploadBannerImage(supabase, desktopFile, "desktop");

    let mobileUrl: string | null = null;
    const mobileFile = formData.get("mobile_image") as File | null;
    if (mobileFile && mobileFile.size > 0) {
      mobileUrl = await uploadBannerImage(supabase, mobileFile, "mobile");
    }

    const linkUrl = (formData.get("link_url") as string) || null;

    const { data: maxOrder } = await supabase
      .from("hero_banners")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrder?.sort_order ?? -1) + 1;

    const { error } = await supabase.from("hero_banners").insert({
      desktop_image_url: desktopUrl,
      mobile_image_url: mobileUrl,
      link_url: linkUrl,
      is_active: true,
      sort_order: nextOrder,
    });

    if (error) return { error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteBanner(bannerId: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { data: banner } = await supabase
      .from("hero_banners")
      .select("desktop_image_url, mobile_image_url")
      .eq("id", bannerId)
      .single();

    if (!banner) return { error: "Banner not found" };

    const pathsToRemove: string[] = [];
    const desktopPath = extractStoragePath(banner.desktop_image_url);
    if (desktopPath) pathsToRemove.push(desktopPath);
    if (banner.mobile_image_url) {
      const mobilePath = extractStoragePath(banner.mobile_image_url);
      if (mobilePath) pathsToRemove.push(mobilePath);
    }

    if (pathsToRemove.length > 0) {
      await supabase.storage.from("hero-banners").remove(pathsToRemove);
    }

    const { error } = await supabase
      .from("hero_banners")
      .delete()
      .eq("id", bannerId);

    if (error) return { error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/banners");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function toggleBannerActive(bannerId: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { data: banner } = await supabase
      .from("hero_banners")
      .select("is_active")
      .eq("id", bannerId)
      .single();

    if (!banner) return { error: "Banner not found" };

    const { error } = await supabase
      .from("hero_banners")
      .update({
        is_active: !banner.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bannerId);

    if (error) return { error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/banners");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function reorderBanner(
  bannerId: string,
  direction: "up" | "down"
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { data: banners } = await supabase
      .from("hero_banners")
      .select("id, sort_order")
      .order("sort_order", { ascending: true });

    if (!banners) return { error: "Failed to load banners" };

    const idx = banners.findIndex((b) => b.id === bannerId);
    if (idx === -1) return { error: "Banner not found" };

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= banners.length) return {};

    const current = banners[idx];
    const adjacent = banners[swapIdx];

    await Promise.all([
      supabase
        .from("hero_banners")
        .update({ sort_order: adjacent.sort_order })
        .eq("id", current.id),
      supabase
        .from("hero_banners")
        .update({ sort_order: current.sort_order })
        .eq("id", adjacent.id),
    ]);

    revalidatePath("/");
    revalidatePath("/admin/banners");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

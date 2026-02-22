import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type HeroBanner = Database["public"]["Tables"]["hero_banners"]["Row"];

export async function fetchActiveBanners(): Promise<HeroBanner[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hero_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<HeroBanner[]>();

  if (error) throw error;
  return data ?? [];
}

export async function fetchAllBanners(): Promise<HeroBanner[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hero_banners")
    .select("*")
    .order("sort_order", { ascending: true })
    .returns<HeroBanner[]>();

  if (error) throw error;
  return data ?? [];
}

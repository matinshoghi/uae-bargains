import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StoreRow, StoreWithCouponCount, CouponWithStore, CouponRow } from "@/lib/types";

export async function fetchActiveStores(): Promise<StoreWithCouponCount[]> {
  const supabase = await createClient();

  const { data: stores, error } = await supabase
    .from("stores")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  if (!stores || stores.length === 0) return [];

  // Count active coupons per store
  const { data: coupons } = await supabase
    .from("coupons")
    .select("store_id")
    .eq("status", "active")
    .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`);

  const countMap: Record<string, number> = {};
  for (const c of coupons ?? []) {
    countMap[c.store_id] = (countMap[c.store_id] || 0) + 1;
  }

  return (stores as StoreRow[]).map((store) => ({
    ...store,
    coupon_count: countMap[store.id] || 0,
  }));
}

export async function fetchStoreBySlug(slug: string): Promise<StoreRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as StoreRow;
}

export async function fetchCouponsByStore(storeId: string): Promise<CouponRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("store_id", storeId)
    .eq("status", "active")
    .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as CouponRow[]) ?? [];
}

export async function fetchAllStoresAdmin(): Promise<StoreRow[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("stores")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data as StoreRow[]) ?? [];
}

export async function fetchAllCouponsAdmin(): Promise<CouponWithStore[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("coupons")
    .select("*, stores:store_id (name, slug, logo_url)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as CouponWithStore[]) ?? [];
}

export async function fetchCouponById(id: string): Promise<CouponRow | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("coupons")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as CouponRow;
}

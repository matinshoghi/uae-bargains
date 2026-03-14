import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; couponId: string }> }
) {
  const { couponId } = await params;
  const admin = createAdminClient();

  const { data: coupon } = await admin
    .from("coupons")
    .select("affiliate_url, url")
    .eq("id", couponId)
    .single();

  if (!coupon) {
    return NextResponse.redirect(new URL("/coupons", _request.url));
  }

  // Increment click count atomically
  await admin.rpc("increment_coupon_click", { coupon_id: couponId });

  const redirectUrl = coupon.affiliate_url || coupon.url;
  if (!redirectUrl || !/^https?:\/\//i.test(redirectUrl)) {
    return NextResponse.redirect(new URL("/coupons", _request.url));
  }

  return NextResponse.redirect(redirectUrl);
}

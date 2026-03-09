import { ImageResponse } from "next/og";
import { fetchStoreBySlug, fetchCouponsByStore } from "@/lib/queries/coupons";

export const alt = "Store Coupons on HalaSaves";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await fetchStoreBySlug(slug);

  if (!store) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#18181b",
            color: "#fff",
            fontSize: 48,
            fontFamily: "sans-serif",
          }}
        >
          Store Not Found
        </div>
      ),
      { ...size }
    );
  }

  const coupons = await fetchCouponsByStore(store.id);
  const couponCount = coupons.length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#18181b",
          color: "#fafafa",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* Top: Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              backgroundColor: "#27272a",
              color: "#a1a1aa",
              padding: "8px 20px",
              borderRadius: "9999px",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            Coupon Codes
          </div>
          <div
            style={{
              backgroundColor: "#14532d",
              color: "#22c55e",
              padding: "8px 20px",
              borderRadius: "9999px",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {couponCount} {couponCount === 1 ? "code" : "codes"} available
          </div>
        </div>

        {/* Middle: Store name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.2,
            maxHeight: "220px",
            overflow: "hidden",
          }}
        >
          {store.name}
        </div>

        {/* Bottom: Description + Branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              maxWidth: "700px",
              overflow: "hidden",
              lineHeight: 1.4,
            }}
          >
            Verified promo codes &amp; discounts for UAE shoppers
          </div>

          {/* Branding */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#a1a1aa",
            }}
          >
            HalaSaves
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

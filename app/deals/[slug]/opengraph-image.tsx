import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Deal on HalaSaves";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function fetchDeal(slug: string) {
  const url = `${SUPABASE_URL}/rest/v1/deals?slug=eq.${encodeURIComponent(slug)}&select=title,price,original_price,discount_percentage,status,categories:category_id(label)`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/vnd.pgrst.object+json",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const deal = await fetchDeal(slug);

  if (!deal) {
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
          Deal Not Found
        </div>
      ),
      { ...size }
    );
  }

  const category = (deal.categories as { label: string } | null)?.label ?? "Deal";
  const hasPrice = deal.price != null;
  const hasDiscount =
    deal.original_price != null && deal.discount_percentage != null;
  const isExpired = deal.status === "expired";

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
        {/* Top: Category + Expired badge */}
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
            {category}
          </div>
          {isExpired && (
            <div
              style={{
                backgroundColor: "#7f1d1d",
                color: "#fca5a5",
                padding: "8px 20px",
                borderRadius: "9999px",
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              Expired
            </div>
          )}
        </div>

        {/* Middle: Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.2,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            maxHeight: "220px",
          }}
        >
          {deal.title}
        </div>

        {/* Bottom: Price + Branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          {/* Price block */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
            {hasPrice && (
              <div style={{ fontSize: 52, fontWeight: 700, color: "#22c55e" }}>
                AED {deal.price}
              </div>
            )}
            {hasDiscount && (
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                <div
                  style={{
                    fontSize: 32,
                    color: "#71717a",
                    textDecoration: "line-through",
                  }}
                >
                  AED {deal.original_price}
                </div>
                <div
                  style={{
                    backgroundColor: "#14532d",
                    color: "#22c55e",
                    padding: "6px 16px",
                    borderRadius: "8px",
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  -{deal.discount_percentage}%
                </div>
              </div>
            )}
          </div>

          {/* Branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
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
      </div>
    ),
    { ...size }
  );
}

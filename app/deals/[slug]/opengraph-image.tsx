import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const alt = "Deal on HalaSaves";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function fallback() {
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
          color: "#a1a1aa",
          fontSize: 40,
          fontFamily: "sans-serif",
        }}
      >
        HalaSaves
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();
    const { data: deal } = await supabase
      .from("deals")
      .select(
        "title, price, original_price, discount_percentage, status, categories:category_id (label)"
      )
      .eq("slug", slug)
      .single();

    if (!deal) return fallback();

    const category =
      (deal.categories as { label: string } | null)?.label ?? "Deal";
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
          <div
            style={{ display: "flex", alignItems: "center", gap: "16px" }}
          >
            <div
              style={{
                display: "flex",
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
            {isExpired ? (
              <div
                style={{
                  display: "flex",
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
            ) : null}
          </div>

          {/* Middle: Title */}
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.2,
              overflow: "hidden",
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
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "16px",
              }}
            >
              {deal.price != null ? (
                <div
                  style={{
                    display: "flex",
                    fontSize: 52,
                    fontWeight: 700,
                    color: "#22c55e",
                  }}
                >
                  AED {deal.price}
                </div>
              ) : null}
              {hasDiscount ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 32,
                      color: "#71717a",
                      textDecoration: "line-through",
                    }}
                  >
                    AED {deal.original_price}
                  </div>
                  <div
                    style={{
                      display: "flex",
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
              ) : null}
            </div>

            <div
              style={{
                display: "flex",
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
  } catch {
    return fallback();
  }
}

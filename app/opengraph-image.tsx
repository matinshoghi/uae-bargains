import { ImageResponse } from "next/og";

export const alt = "HalaSaves — Community Deals for UAE";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#18181b",
          color: "#fafafa",
          fontFamily: "sans-serif",
          gap: "24px",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700 }}>HalaSaves</div>
        <div
          style={{
            fontSize: 32,
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          Discover and share the best deals in UAE
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          {["Electronics", "Dining", "Fashion", "Travel", "Groceries"].map(
            (cat) => (
              <div
                key={cat}
                style={{
                  backgroundColor: "#27272a",
                  color: "#a1a1aa",
                  padding: "8px 20px",
                  borderRadius: "9999px",
                  fontSize: 22,
                  fontWeight: 500,
                }}
              >
                {cat}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}

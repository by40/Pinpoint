import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Shared Open Graph card renderer so every route's social image stays on-brand.
export function renderOgImage({
  line1,
  line2,
  subtitle,
}: {
  line1: string;
  line2: string;
  subtitle: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F7F6F3",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "76px",
              height: "76px",
              background: "#141412",
              borderRadius: "18px",
            }}
          >
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#F7F6F3" strokeWidth="2.2" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <div style={{ fontSize: "42px", fontWeight: 700, color: "#141412" }}>Pinpoint</div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "86px", fontWeight: 700, color: "#141412", lineHeight: 1.04, letterSpacing: "-2px" }}>
            {line1}
          </div>
          <div style={{ fontSize: "86px", fontWeight: 700, color: "#141412", lineHeight: 1.04, letterSpacing: "-2px" }}>
            {line2}
          </div>
          <div style={{ fontSize: "32px", color: "#57554E", marginTop: "28px" }}>{subtitle}</div>
        </div>

        {/* Footer note */}
        <div style={{ display: "flex", fontSize: "24px", color: "#6B6A63" }}>
          Powered by OpenStreetMap · Free · No account needed
        </div>
      </div>
    ),
    { ...ogSize }
  );
}

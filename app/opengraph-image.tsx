import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SecToolbox · 网络安全排查工具集";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Default OG image served from app/opengraph-image.tsx — every page
 * that doesn't ship its own override gets this. Uses only Tailwind-
 * free inline styles because next/og runs in edge-runtime where
 * most CSS-in-JS libraries don't ship. */

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1033 60%, #2d1a5e 100%)",
          color: "white",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top-left brand wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(124, 58, 237, 0.2)",
              border: "1px solid rgba(124, 58, 237, 0.5)",
              color: "#a78bfa",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            ⛨
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em" }}>
            SecToolbox
          </div>
        </div>

        {/* Bottom-aligned hero copy */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              background: "linear-gradient(90deg, #ffffff 0%, #c4b5fd 100%)",
              backgroundClip: "text",
              color: "transparent",
              display: "flex",
            }}
          >
            网络安全排查工具
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              background: "linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)",
              backgroundClip: "text",
              color: "transparent",
              display: "flex",
            }}
          >
            速查手册
          </div>
          <div style={{ marginTop: 32, fontSize: 28, color: "rgba(255,255,255,0.7)" }}>
            88 个工具 · 50+ 排查 SOP · 一键复制命令
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

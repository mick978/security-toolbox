import { ImageResponse } from "next/og";
import { cheatBySlug } from "@/lib/cheatsheets";

export const runtime = "edge";
export const alt = "SecToolbox · 排查案例";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Per-case OG image at /cheatsheet/<slug>/opengraph-image.tsx */

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = cheatBySlug(slug);
  if (!c) {
    return new ImageResponse(<div style={{ display: "flex", color: "white" }}>案例未找到</div>, { ...size });
  }
  const sevBg = c.severity === "danger" ? "rgba(239, 68, 68, 0.18)" :
                c.severity === "warn"   ? "rgba(245, 158, 11, 0.18)" :
                                          "rgba(124, 58, 237, 0.18)";
  const sevColor = c.severity === "danger" ? "#fca5a5" :
                  c.severity === "warn"   ? "#fcd34d" :
                                            "#c4b5fd";
  const sevLabel = c.severity === "danger" ? "紧急" :
                  c.severity === "warn"   ? "警告" :
                                            "参考";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1033 60%, #2d1a5e 100%)",
          color: "white",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16, padding: "8px 16px", borderRadius: 999, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)", color: "#c4b5fd", fontWeight: 600 }}>
            SecToolbox · 排查 SOP
          </span>
          {c.severity && (
            <span style={{ fontSize: 16, padding: "8px 16px", borderRadius: 999, background: sevBg, border: "1px solid rgba(255,255,255,0.15)", color: sevColor, fontWeight: 600 }}>
              {sevLabel}
            </span>
          )}
        </div>

        <div style={{ marginTop: 36, fontSize: 64, fontWeight: 800, lineHeight: 1.2, maxWidth: 1000 }}>
          {c.title}
        </div>

        <div style={{ marginTop: 28, fontSize: 28, color: "rgba(255,255,255,0.7)", lineHeight: 1.4, maxWidth: 950 }}>
          {c.summary}
        </div>

        <div style={{ marginTop: "auto", display: "flex", gap: 12, color: "rgba(255,255,255,0.7)", fontSize: 22 }}>
          <span>📋 {c.steps.length} 步</span>
          {c.durationMinutes && <span>⏱ {c.durationMinutes} 分钟</span>}
          <span>🔧 {Array.from(new Set(c.steps.map((s) => s.tool).filter(Boolean))).length} 个工具</span>
        </div>
      </div>
    ),
    { ...size },
  );
}

import { ImageResponse } from "next/og";
import { categories, toolBySlug } from "@/lib/tools";

export const runtime = "edge";
export const alt = "SecToolbox · 安全工具";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Per-tool OG image: tools/<slug>/opengraph-image.tsx. Uses the
 * category's accent palette (from lib/category-colors) so the
 * generated card colors visually match the rest of the catalog. */

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool) {
    return new ImageResponse(<div style={{ display: "flex", color: "white" }}>工具未找到</div>, { ...size });
  }
  const cat = categories.find((c) => c.slug === tool.category);
  const catLabel = cat?.name ?? tool.category;
  const runnable = !!tool.homepage;

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
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 16,
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(124, 58, 237, 0.15)",
              border: "1px solid rgba(124, 58, 237, 0.4)",
              color: "#c4b5fd",
              fontWeight: 600,
            }}
          >
            SecToolbox · 工具
          </span>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>{catLabel}</span>
        </div>

        <div style={{ marginTop: 36, fontSize: 88, fontWeight: 800, fontFamily: "monospace" }}>
          {tool.name}
        </div>

        <div style={{ marginTop: 28, fontSize: 30, color: "rgba(255,255,255,0.75)", lineHeight: 1.4, maxWidth: 950 }}>
          {tool.tagline}
        </div>

        <div style={{ marginTop: "auto", display: "flex", gap: 12 }}>
          {tool.platforms.slice(0, 4).map((p) => (
            <span
              key={p}
              style={{
                fontSize: 18,
                padding: "6px 14px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.85)",
                fontWeight: 500,
              }}
            >
              {p}
            </span>
          ))}
          {runnable && (
            <span
              style={{
                fontSize: 18,
                padding: "6px 14px",
                borderRadius: 6,
                background: "rgba(34, 197, 94, 0.18)",
                border: "1px solid rgba(34, 197, 94, 0.35)",
                color: "#86efac",
                fontWeight: 600,
              }}
            >
              ✓ 含文档
            </span>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}

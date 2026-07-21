import { ImageResponse } from "next/og";
import { projectBySlug } from "@/lib/github-projects";

export const runtime = "edge";
export const alt = "SecToolbox · AI Agent";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p || p.kind !== "agent") {
    return new ImageResponse(<div style={{ display: "flex", color: "white" }}>未找到</div>, { ...size });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1033 60%, #2d1a5e 100%)",
          color: "white", padding: 64, fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16, padding: "8px 16px", borderRadius: 999, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)", color: "#c4b5fd", fontWeight: 600 }}>
            SecToolbox · AI Agent
          </span>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
            ⭐ {p.stars >= 1000 ? `${(p.stars / 1000).toFixed(1)}k` : p.stars}
          </span>
        </div>
        <div style={{ marginTop: 36, fontSize: 70, fontWeight: 800 }}>{p.name}</div>
        <div style={{ marginTop: 16, fontSize: 20, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
          github.com/{p.owner}/{p.repo}
        </div>
        <div style={{ marginTop: 28, fontSize: 26, color: "rgba(255,255,255,0.78)", lineHeight: 1.4, maxWidth: 950 }}>
          {p.description}
        </div>
      </div>
    ),
    { ...size },
  );
}

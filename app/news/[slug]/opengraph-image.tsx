import { ImageResponse } from "next/og";
import { newsBySlug, type NewsCategory } from "@/lib/news";

export const runtime = "edge";
export const alt = "SecToolbox · 安全资讯";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Per-article OG image at /news/<slug>/opengraph-image.tsx
 * Mirrors the cheatsheet OG recipe; the accent color follows the article's
 * category (ai=purple / attack=red / troubleshoot=blue) so a share card
 * telegraphs the topic before the title is read. */

const CAT_COLOR: Record<NewsCategory, { bg: string; color: string; label: string }> = {
  ai:           { bg: "rgba(124, 58, 237, 0.18)", color: "#c4b5fd", label: "AI 资讯" },
  attack:       { bg: "rgba(239, 68, 68, 0.18)",  color: "#fca5a5", label: "攻击事件" },
  troubleshoot: { bg: "rgba(59, 130, 246, 0.18)", color: "#93c5fd", label: "排查实战" },
};

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = newsBySlug(slug);
  if (!n) {
    return new ImageResponse(<div style={{ display: "flex", color: "white" }}>文章未找到</div>, { ...size });
  }
  const c = CAT_COLOR[n.category];

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
            SecToolbox · 资讯
          </span>
          <span style={{ fontSize: 16, padding: "8px 16px", borderRadius: 999, background: c.bg, border: "1px solid rgba(255,255,255,0.15)", color: c.color, fontWeight: 600 }}>
            {c.label}
          </span>
        </div>

        <div style={{ marginTop: 36, fontSize: 60, fontWeight: 800, lineHeight: 1.2, maxWidth: 1000 }}>
          {n.title}
        </div>

        <div style={{ marginTop: 28, fontSize: 28, color: "rgba(255,255,255,0.7)", lineHeight: 1.4, maxWidth: 950 }}>
          {n.summary}
        </div>

        <div style={{ marginTop: "auto", display: "flex", gap: 12, color: "rgba(255,255,255,0.7)", fontSize: 22 }}>
          <span>📅 {n.date}</span>
          {n.readMinutes && <span>⏱ {n.readMinutes} 分钟</span>}
          <span>📰 {n.source}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}

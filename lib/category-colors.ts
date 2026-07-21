// Single source of truth for category accent colors.
//
// Why: previously every Category in `lib/tools.ts` stored its accent class as
// a free-form string ("text-emerald-400" etc.). Pages like `app/page.tsx` and
// `app/agents/page.tsx` re-derive ad-hoc colorings on top, which over time
// drifts. Centralizing the palette lets us:
//   1. swap a category color in one place
//   2. expose bg/text/border variants consistently
//   3. keep parity with the 8-tool (and 13-category) grouping on the homepage
//
// Usage:
//   import { categoryColor } from "@/lib/category-colors";
//   <Icon className={categoryColor("dns").text} />
//   <div className={categoryColor("dns").bgSoft}> ... </div>
import type { CategorySlug } from "@/lib/tools";

export interface CategoryColor {
  /** Light/dark pair so the color reads on both themes. */
  text: string;
  /** Soft tinted background, useful for cards/hover states. */
  bgSoft: string;
  /** Stronger tinted background, useful for chips. */
  bg: string;
  /** Matching border, ~30-40% alpha. */
  border: string;
  /** Hex equivalent for non-Tailwind consumers (mermaid, canvas). */
  hex: string;
}

// Single source of palette. Keys must be CategorySlug.
// 13 categories: dns / connectivity / ports / http-tls / capture /
// vulnscan / logs / online / recon / exploit / c2 / reverse / pentest
const PALETTE: Record<CategorySlug, CategoryColor> = {
  dns: { text: "text-emerald-600 dark:text-emerald-400", bgSoft: "bg-emerald-500/10", bg: "bg-emerald-500/15", border: "border-emerald-500/30", hex: "#34d399" },
  connectivity: { text: "text-sky-600 dark:text-sky-400", bgSoft: "bg-sky-500/10", bg: "bg-sky-500/15", border: "border-sky-500/30", hex: "#38bdf8" },
  ports: { text: "text-violet-600 dark:text-violet-400", bgSoft: "bg-violet-500/10", bg: "bg-violet-500/15", border: "border-violet-500/30", hex: "#a78bfa" },
  "http-tls": { text: "text-amber-600 dark:text-amber-400", bgSoft: "bg-amber-500/10", bg: "bg-amber-500/15", border: "border-amber-500/30", hex: "#fbbf24" },
  capture: { text: "text-cyan-600 dark:text-cyan-400", bgSoft: "bg-cyan-500/10", bg: "bg-cyan-500/15", border: "border-cyan-500/30", hex: "#22d3ee" },
  vulnscan: { text: "text-rose-600 dark:text-rose-400", bgSoft: "bg-rose-500/10", bg: "bg-rose-500/15", border: "border-rose-500/30", hex: "#fb7185" },
  logs: { text: "text-fuchsia-600 dark:text-fuchsia-400", bgSoft: "bg-fuchsia-500/10", bg: "bg-fuchsia-500/15", border: "border-fuchsia-500/30", hex: "#e879f9" },
  online: { text: "text-lime-600 dark:text-lime-400", bgSoft: "bg-lime-500/10", bg: "bg-lime-500/15", border: "border-lime-500/30", hex: "#a3e635" },
  recon: { text: "text-teal-600 dark:text-teal-400", bgSoft: "bg-teal-500/10", bg: "bg-teal-500/15", border: "border-teal-500/30", hex: "#2dd4bf" },
  exploit: { text: "text-red-600 dark:text-red-400", bgSoft: "bg-red-500/10", bg: "bg-red-500/15", border: "border-red-500/30", hex: "#f87171" },
  c2: { text: "text-orange-600 dark:text-orange-400", bgSoft: "bg-orange-500/10", bg: "bg-orange-500/15", border: "border-orange-500/30", hex: "#fb923c" },
  reverse: { text: "text-indigo-600 dark:text-indigo-400", bgSoft: "bg-indigo-500/10", bg: "bg-indigo-500/15", border: "border-indigo-500/30", hex: "#818cf8" },
  pentest: { text: "text-yellow-600 dark:text-yellow-400", bgSoft: "bg-yellow-500/10", bg: "bg-yellow-500/15", border: "border-yellow-500/30", hex: "#facc15" },
};

/**
 * Return the resolved color set for a category slug. Falls back to a muted
 * slate palette when the slug is unknown so the UI degrades gracefully.
 */
export function categoryColor(slug: string): CategoryColor {
  return (
    (PALETTE as Record<string, CategoryColor | undefined>)[slug] ?? {
      text: "text-slate-400",
      bgSoft: "bg-slate-500/10",
      bg: "bg-slate-500/15",
      border: "border-slate-500/30",
      hex: "#94a3b8",
    }
  );
}

/**
 * Convenience: returns just the `accent` class string in the legacy format
 * (light+dark pair, e.g. `text-xxx-600 dark:text-xxx-400`) so existing
 * call-sites that still read `category.accent` keep working without
 * individual edits.
 */
export function categoryAccentClass(slug: string): string {
  return categoryColor(slug).text;
}

export const CATEGORY_PALETTE = PALETTE;

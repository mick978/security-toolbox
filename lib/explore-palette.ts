// Single source of truth for the "explore" catalog pages.
// Used by:
//   - app/cheatsheet/[slug]/page.tsx (severity palette for step warnings)
//   - app/cheatsheet/page.tsx (category gradients/icons)
//   - app/agents/agents-client.tsx (per-area section + card strip)
//   - app/mcp/mcp-skills-client.tsx (per-area section + card strip)
//
// Three lookups:
//
//   EXPLORE_GRADIENTS[areaSlug]  → "from-XXX/20 to-YYY/20"  category header backdrop
//   EXPLORE_BG[areaSlug]        → "bg-XXX/10"               category icon tile
//   EXPLORE_STRIP[areaSlug]     → "from-XXX to-YYY"         card top accent
//
// Defaulting every entry to a primary/30 fall-through so a typo doesn't
// silently land a card on a transparent strip — the strip is visually loud
// and a missing color shows up instantly in code review.

export type SecurityAreaSlug =
  | "recon"
  | "vuln-scan"
  | "exploit"
  | "defense"
  | "incident"
  | "compliance"
  | "general";

export const EXPLORE_GRADIENTS: Record<SecurityAreaSlug, string> = {
  recon:      "from-blue-500/20 to-cyan-500/20",
  "vuln-scan": "from-yellow-500/20 to-amber-500/20",
  exploit:    "from-red-500/20 to-orange-500/20",
  defense:    "from-green-500/20 to-emerald-500/20",
  incident:   "from-orange-500/20 to-rose-500/20",
  compliance: "from-purple-500/20 to-pink-500/20",
  general:    "from-cyan-500/20 to-sky-500/20",
};

export const EXPLORE_BG: Record<SecurityAreaSlug, string> = {
  recon:      "bg-blue-500/10",
  "vuln-scan": "bg-yellow-500/10",
  exploit:    "bg-red-500/10",
  defense:    "bg-green-500/10",
  incident:   "bg-orange-500/10",
  compliance: "bg-purple-500/10",
  general:    "bg-cyan-500/10",
};

export const EXPLORE_STRIP: Record<SecurityAreaSlug, string> = {
  "vuln-scan": "from-yellow-500 to-amber-500",
  exploit:    "from-red-500 to-orange-500",
  defense:    "from-green-500 to-emerald-500",
  incident:   "from-orange-500 to-rose-500",
  compliance: "from-purple-500 to-pink-500",
  recon:      "from-blue-500 to-cyan-500",
  general:    "from-cyan-500 to-sky-500",
};

/* Convenience accessors with safe fallbacks — pages can pass the raw
 * security area slug (`SecurityArea` from lib/github-projects) and get a
 * sensible default without first coercing the type. */
export function exploreGradient(slug: string): string {
  return EXPLORE_GRADIENTS[slug as SecurityAreaSlug] ?? "from-primary/10 to-primary/5";
}
export function exploreBg(slug: string): string {
  return EXPLORE_BG[slug as SecurityAreaSlug] ?? "bg-primary/10";
}
export function exploreStrip(slug: string): string {
  return EXPLORE_STRIP[slug as SecurityAreaSlug] ?? "from-primary/50 to-primary/20";
}

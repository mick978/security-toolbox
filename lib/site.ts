/**
 * Site-wide URL helpers. Centralized so the canonical host only changes
 * here. Consumed by layout.tsx (metadataBase), every detail page
 * (alternates.canonical), every JSON-LD payload, sitemap.ts, and llms.txt.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL (preferred — set per deploy)
 *   2. Hard-coded DEFAULT for local dev / fallback
 *
 * If the env var is missing we still emit a non-empty URL so build-time
 * validation passes; warn at module load so the omission is visible.
 */
const DEFAULT = "https://sectoolbox.dev";

function resolve(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (raw && raw.trim().length > 0) {
    return raw.replace(/\/+$/, "");
  }
  if (process.env.NODE_ENV === "production") {
    // Visible at server startup; cheap to leave in place.
    console.warn(
      "[site] NEXT_PUBLIC_SITE_URL is not set; falling back to default. " +
        "Set it in your environment to lock the canonical host.",
    );
  }
  return DEFAULT;
}

export const SITE_URL: string = resolve();

/** Stable @id anchor for the Organization JSON-LD entity. */
export const ORG_ID = `${SITE_URL}/#organization`;

/** Build a canonical absolute URL from a path. */
export function canonical(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

/**
 * Site-wide URL helpers. Centralized so the canonical host only changes
 * here. Consumed by layout.tsx (metadataBase), every detail page
 * (alternates.canonical), every JSON-LD payload, sitemap.ts, and llms.txt.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL (preferred — required in production)
 *   2. Hard-coded DEFAULT only for `next dev` (localhost)
 *
 * In production builds (`next build`, `next start`) we REFUSE to fall
 * back to a placeholder — emitting `https://sectoolbox.dev` into
 * JSON-LD would be worse than failing the build, because crawlers
 * would index a domain nobody owns. Set NEXT_PUBLIC_SITE_URL on
 * the server (e.g. `https://sectoolbox.xiang.li`) before running
 * build / start.
 */
const DEFAULT_DEV = "http://localhost:3000";

function resolve(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (raw && raw.trim().length > 0) {
    return raw.replace(/\/+$/, "");
  }
  if (process.env.NODE_ENV === "production") {
    // Hard fail at module load: every JSON-LD and canonical link in
    // the app imports from here, so throwing aborts the build before
    // we can ship a broken sitemap to crawlers.
    const msg =
      "[site] NEXT_PUBLIC_SITE_URL is required in production. " +
      "Set it (e.g. `export NEXT_PUBLIC_SITE_URL=https://sectoolbox.xiang.li`) " +
      "before `next build` / `next start`. Falling back to a placeholder " +
      "would emit wrong canonical URLs into JSON-LD and break SEO.";
    if (typeof process !== "undefined" && process.stderr) {
      process.stderr.write(msg + "\n");
    }
    throw new Error(msg);
  }
  return DEFAULT_DEV;
}

export const SITE_URL: string = resolve();

/** Stable @id anchor for the Organization JSON-LD entity. */
export const ORG_ID = `${SITE_URL}/#organization`;

/** Build a canonical absolute URL from a path. */
export function canonical(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

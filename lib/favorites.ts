"use client";
// Local favorites store. Backs a tiny star-button on every detail page
// (tool / cheatsheet / project) and a small "favorites" panel reachable
// from the header.
//
// Design notes:
//   - We use `localStorage` and a `storage` event listener to keep
//     multiple open tabs consistent without server traffic.
//   - SSR-safe: every public function no-ops (or returns a sentinel)
//     when `window` is undefined. We deliberately *do not* throw so
//     calling `isFavorite()` during render does the right thing.
//   - We never block the React render path on localStorage. The hook
//     lives in components/favorites-provider.tsx and uses
//     `useSyncExternalStore` so React picks up changes immediately.
//   - Storage key is namespaced (`sectoolbox.favorites.v1`) so we can
//     change shape later without colliding with anything else in the
//     host storage.

export type FavoriteKind = "tool" | "cheatsheet" | "project";

export interface FavoriteEntry {
  kind: FavoriteKind;
  /** URL slug or unique id within the kind. */
  slug: string;
  /** Display label, captured at star-time. */
  label: string;
  /** Optional secondary line — typically the tagline or description. */
  hint?: string;
  /** Optional href override (defaults derive from kind). */
  href?: string;
  /** Added-at epoch ms. */
  at: number;
}

const STORAGE_KEY = "sectoolbox.favorites.v1";

/** Read raw JSON safely; returns [] on any failure or missing data. */
function readRaw(): FavoriteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is FavoriteEntry =>
        !!e &&
        typeof e.slug === "string" &&
        typeof e.label === "string" &&
        (e.kind === "tool" || e.kind === "cheatsheet" || e.kind === "project"),
    );
  } catch {
    return [];
  }
}

/** Persist + notify subscribers. Wrapped in try/catch since storage
 *  may throw on quota / privacy-mode browsers. */
function writeRaw(entries: FavoriteEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  } catch {
    /* ignore quota / unavailable */
  }
}

function keyOf(kind: FavoriteKind, slug: string): string {
  return `${kind}::${slug}`;
}

export function listFavorites(): FavoriteEntry[] {
  const items = readRaw();
  // Sort newest-first so the UI can render without re-sorting.
  items.sort((a, b) => b.at - a.at);
  return items;
}

export function isFavorite(kind: FavoriteKind, slug: string): boolean {
  if (typeof window === "undefined") return false;
  return readRaw().some((e) => e.kind === kind && e.slug === slug);
}

export function addFavorite(entry: Omit<FavoriteEntry, "at">): void {
  const items = readRaw();
  const k = keyOf(entry.kind, entry.slug);
  if (items.some((e) => keyOf(e.kind, e.slug) === k)) return;
  items.push({ ...entry, at: Date.now() });
  writeRaw(items);
}

export function removeFavorite(kind: FavoriteKind, slug: string): void {
  const items = readRaw();
  const k = keyOf(kind, slug);
  writeRaw(items.filter((e) => keyOf(e.kind, e.slug) !== k));
}

export function toggleFavorite(entry: Omit<FavoriteEntry, "at">): boolean {
  const k = keyOf(entry.kind, entry.slug);
  const items = readRaw();
  if (items.some((e) => keyOf(e.kind, e.slug) === k)) {
    writeRaw(items.filter((e) => keyOf(e.kind, e.slug) !== k));
    return false;
  }
  items.push({ ...entry, at: Date.now() });
  writeRaw(items);
  return true;
}

export function clearFavorites(): void {
  writeRaw([]);
}

export const FAVORITES_STORAGE_KEY = STORAGE_KEY;

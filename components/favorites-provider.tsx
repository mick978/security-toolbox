"use client";
// useFavorites hook + small FavoriteButton + FavoritesDrawer.
//
// All three live in one client module so the favourite state flow stays
// in one place and the components can subscribe without re-importing the
// storage helpers.

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Star, X, BookOpenText, Terminal, Wrench, Trash2 } from "lucide-react";

// Inlined zh-CN labels. The app is single-locale; next-intl was a phantom
// dep with no provider/messages, so useTranslations threw at runtime
// ("Could not find an Intl context"). Mirrors the detail-toc workaround.
const T = {
  title: "收藏",
  empty: "还没有收藏",
  emptyHint: "在工具 / 案例详情页点星标即可加入收藏",
  confirmClear: "确定清空全部收藏？",
  clearAll: "清空收藏",
  kindTool: "工具",
  kindCheatsheet: "排查案例",
  kindProject: "项目",
} as const;
import {
  type FavoriteEntry,
  type FavoriteKind,
  listFavorites,
  toggleFavorite,
  clearFavorites,
} from "@/lib/favorites";
import { cn } from "@/lib/utils";

/**
 * React subscribe helper. useSyncExternalStore keeps concurrent renders
 * consistent — important here because multiple components (button, drawer,
 * header star) read the same source.
 *
 * We use a custom subscribe function that listens for the `storage` event
 * (cross-tab updates) AND for the same-tab events we fire ourselves via
 * `dispatchEvent(new StorageEvent(...))`. Read returns the latest snapshot.
 */
function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === "sectoolbox.favorites.v1") cb();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

// Memoised snapshots: useSyncExternalStore requires a referentially stable
// value when nothing has changed to avoid render loops. We cache by the
// JSON string of the current raw storage.
function readSnapshot(): string {
  if (typeof window === "undefined") return "[]";
  try {
    return window.localStorage.getItem("sectoolbox.favorites.v1") ?? "[]";
  } catch {
    return "[]";
  }
}

function parseSnapshot(snapshot: string): FavoriteEntry[] {
  if (snapshot === "[]") return [];
  try {
    const parsed = JSON.parse(snapshot);
    return Array.isArray(parsed) ? (parsed as FavoriteEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * React hook returning the live favourite list. Sorted newest-first.
 */
export function useFavorites(): FavoriteEntry[] {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => "[]");
  return useMemo(() => {
    const items = parseSnapshot(snapshot);
    items.sort((a, b) => b.at - a.at);
    return items;
  }, [snapshot]);
}

/**
 * Single-toggle favourite mutation. Returns the new state (true = now a
 * favourite, false = just removed) so callers can branch on it.
 */
export function useToggleFavorite() {
  return useCallback((entry: Omit<FavoriteEntry, "at">): boolean => {
    return toggleFavorite(entry);
  }, []);
}

interface FavoriteButtonProps {
  kind: FavoriteKind;
  slug: string;
  label: string;
  hint?: string;
  /** Tailwind class merge — used to inherit the parent's positioning. */
  className?: string;
}

/**
 * Drop-in star toggle. Renders a 44px touch-target sized for the existing
 * nav buttons (matches the global hit-target contract).
 */
export function FavoriteButton({ kind, slug, label, hint, className }: FavoriteButtonProps) {
  const favorites = useFavorites();
  const toggle = useToggleFavorite();
  const isFav = favorites.some((f) => f.kind === kind && f.slug === slug);
  const onClick = () => {
    toggle({ kind, slug, label, hint });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isFav}
      aria-label={isFav ? `Favorited: ${label} (click to remove)` : `Favorite: ${label}`}
      title={isFav ? "Favorited · click to remove" : "Add to favorites"}
      className={cn(
        "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md w-10 h-10 border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isFav
          ? "border-yellow-500/50 bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/20"
          : "border-border/60 bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60",
        className,
      )}
    >
      <Star className={cn("h-4 w-4", isFav && "fill-current")} aria-hidden="true" />
    </button>
  );
}

/**
 * Drawer-style panel that pops up from the right when the header star
 * icon is clicked. Pure CSS — no portal needed. The panel is mounted in
 * Header via <FavoritesDrawer /> with shared open state.
 */
export function FavoritesDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const favorites = useFavorites();
  
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={T.title}
    >
      <div
        className="h-full w-full max-w-md bg-popover text-popover-foreground shadow-xl border-l border-border/60 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-2 font-semibold">
            <Star className="h-4 w-4 text-yellow-400 fill-current" aria-hidden="true" />
            {T.title}
            <span className="text-xs text-muted-foreground font-normal">
              {favorites.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
            aria-label={T.title}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-3">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground text-sm">
              <Star className="h-8 w-8 mb-3 opacity-40" aria-hidden="true" />
              <p>{T.empty}</p>
              <p className="text-xs mt-1">{T.emptyHint}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {favorites.map((f) => (
                <FavRow key={`${f.kind}::${f.slug}`} entry={f} />
              ))}
            </ul>
          )}
        </div>

        {favorites.length > 0 && (
          <footer className="border-t border-border/40 p-3">
            <button
              type="button"
              onClick={() => {
                if (confirm(T.confirmClear)) clearFavorites();
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-border/60 bg-secondary/40 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {T.clearAll}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

function FavRow({ entry }: { entry: FavoriteEntry }) {
  const href = entry.href ?? defaultHref(entry);
  const Icon = entry.kind === "tool" ? Terminal : entry.kind === "cheatsheet" ? BookOpenText : Wrench;
    const kindLabel =
    entry.kind === "tool"
      ? T.kindTool
      : entry.kind === "cheatsheet"
        ? T.kindCheatsheet
        : T.kindProject;
  return (
    <li>
      <Link
        href={href}
        className="flex items-start gap-3 p-3 rounded-md border border-border/40 hover:border-primary/40 hover:bg-secondary/40 transition-colors"
      >
        <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{entry.label}</div>
          {entry.hint && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">{entry.hint}</div>
          )}
          <div className="text-[10px] text-muted-foreground mt-1">{kindLabel}</div>
        </div>
      </Link>
    </li>
  );
}

function defaultHref(e: FavoriteEntry): string {
  if (e.kind === "tool") return `/tools/${e.slug}`;
  if (e.kind === "cheatsheet") return `/cheatsheet/${e.slug}`;
  return `/mcp/${e.slug}`;
}

/**
 * Tiny hook for the header star badge so we don't render an unused Hook on
 * pages without the Favorites provider.
 */
export function useFavoriteCount(): number {
  return useFavorites().length;
}

/** Re-export under a friendlier name for header imports. */
export const _internal = { useFavorites };

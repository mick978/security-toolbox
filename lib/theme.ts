"use client";

// Tiny theme + accent store backed by `localStorage`.
//
// Two pieces of state:
//   - `theme`: "light" | "dark" | "system". `system` follows the OS via
//     `matchMedia('(prefers-color-scheme: dark)')` and re-applies when
//     that preference changes (e.g. user toggles Mac dark mode at 2am).
//   - `accent`: one of four preset names ("purple" | "blue" | "green" |
//     "rose"). Each preset rewrites a small set of CSS variables on
//     <html> via `data-accent` so all derived Tailwind colours follow.
//
// We intentionally do NOT load `next-themes` — the project pulled it in
// already but doesn't use it; the original header did everything by
// hand. We keep the same hand-rolled pattern for consistency.

import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type AccentName = "purple" | "blue" | "green" | "rose" | "amber" | "cyan";

const THEME_KEY = "sectoolbox.theme";
const ACCENT_KEY = "sectoolbox.accent";

const ACCENTS: AccentName[] = ["purple", "blue", "green", "rose", "amber", "cyan"];

export const ACCENT_PRESETS: Array<{
  name: AccentName;
  label: string;
  /** Preview swatch (used as inline `background-color`). */
  hex: string;
}> = [
  { name: "purple", label: "紫罗兰", hex: "#7c3aed" },
  { name: "blue",   label: "深空蓝", hex: "#2563eb" },
  { name: "green",  label: "森林绿", hex: "#16a34a" },
  { name: "rose",   label: "暮光红", hex: "#db2777" },
  { name: "amber",  label: "琥珀橙", hex: "#f59e0b" },
  { name: "cyan",   label: "青冰蓝", hex: "#06b6d4" },
];

/** Compute the effective theme from a stored mode + system preference. */
function effectiveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

/** Apply theme + accent to the document. No-op during SSR. */
function applyTheme(mode: ThemeMode, accent: AccentName) {
  if (typeof document === "undefined") return;
  const t = effectiveTheme(mode);
  document.documentElement.classList.toggle("dark", t === "dark");
  document.documentElement.dataset.accent = accent;
}

/**
 * Read theme + accent from storage once on mount. We don't try to read
 * during SSR — `<html>` ships with `className="dark"` from layout.tsx so
 * the dark hydration matches. Consumers should branch on `hydrated` to
 * avoid showing the wrong UI before mounting.
 */
export function useThemeStore() {
  const [mode, setMode] = useState<ThemeMode | null>(null);
  const [accent, setAccentState] = useState<AccentName>("purple");

  // Read from storage and apply on mount.
  useEffect(() => {
    let stored: ThemeMode = "dark";
    try {
      const raw = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
      if (raw === "light" || raw === "dark" || raw === "system") stored = raw;
    } catch {
      /* ignore */
    }
    let storedAccent: AccentName = "purple";
    try {
      const raw = window.localStorage.getItem(ACCENT_KEY);
      if (raw && (ACCENTS as string[]).includes(raw)) storedAccent = raw as AccentName;
    } catch {
      /* ignore */
    }
    setMode(stored);
    setAccentState(storedAccent);
    applyTheme(stored, storedAccent);
  }, []);

  // When in `system`, listen to OS preference changes so the page flips
  // instantly with the OS. The matchMedia API is fine across evergreen
  // browsers; safe to add without a polyfill.
  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system", accent);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode, accent]);

  const setTheme = useCallback((next: ThemeMode) => {
    setMode(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      applyTheme(next, accent);
    }
  }, [accent]);

  const setAccent = useCallback((next: AccentName) => {
    setAccentState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(ACCENT_KEY, next);
      } catch {
        /* ignore */
      }
      applyTheme(mode ?? "dark", next);
    }
  }, [mode]);

  return {
    mode,
    accent,
    setTheme,
    setAccent,
    /** True after the first effect ran. Use to gate UI that depends on
     *  the persisted mode (e.g. the toggle button's icon). */
    hydrated: mode !== null,
    /** The theme that should actually be rendered right now. */
    effective: mode === null ? "dark" : effectiveTheme(mode),
  };
}

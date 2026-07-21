"use client";

// Tiny theme + accent store backed by `localStorage`.
//
// Pieces of state (all persisted under their own key):
//   - theme:    "light" | "dark" | "system". `system` follows OS via
//               matchMedia and re-applies on OS pref change.
//   - accent:   one of 8 preset names. Rewrites --primary / --ring via
//               data-accent on <html>.
//   - textColor: 8 preset names. Drives --text-primary / --text-heading.
//   - fontFamily: 3 presets (sans | serif | mono). Sets --font-family-base.
//   - fontSize:   3 presets (small | medium | large). Sets --font-size-base.
//   - animations: on | off. Off cancels hero-drift, stagger, etc.
//   - radius:     4 presets (sharp | soft | round | pill). Sets --radius.
//
// We intentionally do NOT load `next-themes`. The hand-rolled pattern
// keeps everything in one place and avoids SSR hydration surprises.

import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type AccentName =
  | "purple"
  | "blue"
  | "green"
  | "rose"
  | "amber"
  | "cyan"
  | "teal"
  | "fuchsia";

export type TextColorName =
  | "default"
  | "amber"
  | "emerald"
  | "sky"
  | "rose"
  | "violet"
  | "slate"
  | "mono";

export type FontFamilyName = "sans" | "serif" | "mono";
export type FontSizeName = "small" | "medium" | "large";
export type AnimationMode = "on" | "off";
export type RadiusName = "sharp" | "soft" | "round" | "pill";

/* --- Accent presets (8 colours) --- */
export const ACCENT_PRESETS: Array<{
  name: AccentName;
  label: string;
  hex: string;
}> = [
  { name: "purple",  label: "紫罗兰", hex: "#7c3aed" },
  { name: "blue",    label: "深空蓝", hex: "#2563eb" },
  { name: "green",   label: "森林绿", hex: "#16a34a" },
  { name: "rose",    label: "暮光红", hex: "#db2777" },
  { name: "amber",   label: "琥珀橙", hex: "#f59e0b" },
  { name: "cyan",    label: "青冰蓝", hex: "#06b6d4" },
  { name: "teal",    label: "薄荷绿", hex: "#0d9488" },
  { name: "fuchsia", label: "品红",   hex: "#c026d3" },
];

/* --- Text-color presets (8 colours) --- */
export const TEXT_COLOR_PRESETS: Array<{
  name: TextColorName;
  label: string;
  preview: string;
}> = [
  { name: "default", label: "默认",   preview: "#94a3b8" },
  { name: "amber",   label: "琥珀",   preview: "#b45309" },
  { name: "emerald", label: "翠绿",   preview: "#047857" },
  { name: "sky",     label: "天蓝",   preview: "#0369a1" },
  { name: "rose",    label: "玫瑰",   preview: "#be185d" },
  { name: "violet",  label: "紫罗兰", preview: "#6d28d9" },
  { name: "slate",   label: "石板",   preview: "#334155" },
  { name: "mono",    label: "等宽",   preview: "#1f2937" },
];

/* --- Font family presets --- */
export const FONT_FAMILY_PRESETS: Array<{
  name: FontFamilyName;
  label: string;
  /** CSS font-family string applied to --font-family-base. */
  stack: string;
}> = [
  {
    name: "sans",
    label: "无衬线",
    stack:
      'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  },
  {
    name: "serif",
    label: "衬线",
    stack:
      'ui-serif, Georgia, Cambria, "Times New Roman", "Songti SC", "Source Han Serif SC", serif',
  },
  {
    name: "mono",
    label: "等宽",
    stack:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
];

/* --- Font-size presets --- */
export const FONT_SIZE_PRESETS: Array<{
  name: FontSizeName;
  label: string;
  /** Root font-size in px (the rest of the UI scales via rem). */
  basePx: number;
}> = [
  { name: "small",  label: "小",   basePx: 14 },
  { name: "medium", label: "中",   basePx: 16 },
  { name: "large",  label: "大",   basePx: 18 },
];

/* --- Radius presets --- */
export const RADIUS_PRESETS: Array<{
  name: RadiusName;
  label: string;
  /** Border-radius in rem applied to --radius. */
  rem: string;
}> = [
  { name: "sharp", label: "锐利", rem: "0.25rem" },
  { name: "soft",  label: "柔和", rem: "0.6rem"  },
  { name: "round", label: "圆润", rem: "1rem"    },
  { name: "pill",  label: "胶囊", rem: "1.5rem"  },
];

const THEME_KEY = "sectoolbox.theme";
const ACCENT_KEY = "sectoolbox.accent";
const TEXT_KEY = "sectoolbox.text";
const FONT_FAMILY_KEY = "sectoolbox.fontFamily";
const FONT_SIZE_KEY = "sectoolbox.fontSize";
const ANIMATIONS_KEY = "sectoolbox.animations";
const RADIUS_KEY = "sectoolbox.radius";

const ACCENTS: AccentName[] = [
  "purple", "blue", "green", "rose", "amber", "cyan", "teal", "fuchsia",
];
const TEXT_COLORS: TextColorName[] = [
  "default", "amber", "emerald", "sky", "rose", "violet", "slate", "mono",
];
const FONT_FAMILIES: FontFamilyName[] = ["sans", "serif", "mono"];
const FONT_SIZES: FontSizeName[] = ["small", "medium", "large"];
const RADII: RadiusName[] = ["sharp", "soft", "round", "pill"];

/** Compute the effective theme from a stored mode + system preference. */
function effectiveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

/** Apply all settings to the document. No-op during SSR. */
function applyAll(opts: {
  mode: ThemeMode;
  accent: AccentName;
  textColor: TextColorName;
  fontFamily: FontFamilyName;
  fontSize: FontSizeName;
  animations: AnimationMode;
  radius: RadiusName;
}) {
  if (typeof document === "undefined") return;
  const t = effectiveTheme(opts.mode);
  const html = document.documentElement;
  html.classList.toggle("dark", t === "dark");
  html.dataset.accent = opts.accent;
  html.dataset.text = opts.textColor;
  html.dataset.font = opts.fontFamily;
  html.dataset.size = opts.fontSize;
  html.dataset.animations = opts.animations;
  html.dataset.radius = opts.radius;

  // Apply font-family + font-size directly so they don't depend on Tailwind
  // recompiling. Body uses --font-family-base; root font-size drives rem.
  html.style.fontFamily = FONT_FAMILY_PRESETS.find(
    (p) => p.name === opts.fontFamily,
  )!.stack;
  html.style.fontSize =
    FONT_SIZE_PRESETS.find((p) => p.name === opts.fontSize)!.basePx + "px";
}

/**
 * Read all settings from storage once on mount. Consumers should branch on
 * `hydrated` to avoid showing the wrong UI before mounting.
 */
export function useThemeStore() {
  const [mode, setMode] = useState<ThemeMode | null>(null);
  const [accent, setAccentState] = useState<AccentName>("purple");
  const [textColor, setTextColorState] = useState<TextColorName>("default");
  const [fontFamily, setFontFamilyState] = useState<FontFamilyName>("sans");
  const [fontSize, setFontSizeState] = useState<FontSizeName>("medium");
  const [animations, setAnimationsState] = useState<AnimationMode>("on");
  const [radius, setRadiusState] = useState<RadiusName>("soft");

  // Read from storage and apply on mount.
  useEffect(() => {
    let stored: ThemeMode = "dark";
    try {
      const raw = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
      if (raw === "light" || raw === "dark" || raw === "system")
        stored = raw;
    } catch {
      /* ignore */
    }

    let storedAccent: AccentName = "purple";
    try {
      const raw = window.localStorage.getItem(ACCENT_KEY);
      if (raw && (ACCENTS as string[]).includes(raw))
        storedAccent = raw as AccentName;
    } catch {
      /* ignore */
    }

    let storedText: TextColorName = "default";
    try {
      const raw = window.localStorage.getItem(TEXT_KEY);
      if (raw && (TEXT_COLORS as string[]).includes(raw))
        storedText = raw as TextColorName;
    } catch {
      /* ignore */
    }

    let storedFamily: FontFamilyName = "sans";
    try {
      const raw = window.localStorage.getItem(FONT_FAMILY_KEY);
      if (raw && (FONT_FAMILIES as string[]).includes(raw))
        storedFamily = raw as FontFamilyName;
    } catch {
      /* ignore */
    }

    let storedSize: FontSizeName = "medium";
    try {
      const raw = window.localStorage.getItem(FONT_SIZE_KEY);
      if (raw && (FONT_SIZES as string[]).includes(raw))
        storedSize = raw as FontSizeName;
    } catch {
      /* ignore */
    }

    let storedAnim: AnimationMode = "on";
    try {
      const raw = window.localStorage.getItem(ANIMATIONS_KEY);
      if (raw === "on" || raw === "off") storedAnim = raw;
    } catch {
      /* ignore */
    }

    let storedRadius: RadiusName = "soft";
    try {
      const raw = window.localStorage.getItem(RADIUS_KEY);
      if (raw && (RADII as string[]).includes(raw))
        storedRadius = raw as RadiusName;
    } catch {
      /* ignore */
    }

    setMode(stored);
    setAccentState(storedAccent);
    setTextColorState(storedText);
    setFontFamilyState(storedFamily);
    setFontSizeState(storedSize);
    setAnimationsState(storedAnim);
    setRadiusState(storedRadius);
    applyAll({
      mode: stored,
      accent: storedAccent,
      textColor: storedText,
      fontFamily: storedFamily,
      fontSize: storedSize,
      animations: storedAnim,
      radius: storedRadius,
    });
  }, []);

  // When in `system`, listen to OS preference changes so the page flips
  // instantly with the OS.
  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () =>
      applyAll({
        mode,
        accent,
        textColor,
        fontFamily,
        fontSize,
        animations,
        radius,
      });
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [
    mode,
    accent,
    textColor,
    fontFamily,
    fontSize,
    animations,
    radius,
  ]);

  /** Helper: persist + reapply with current state. */
  const persist = useCallback(
    (patch: Partial<{
      mode: ThemeMode;
      accent: AccentName;
      textColor: TextColorName;
      fontFamily: FontFamilyName;
      fontSize: FontSizeName;
      animations: AnimationMode;
      radius: RadiusName;
    }>) => {
      const next = {
        mode: patch.mode ?? mode ?? "dark",
        accent: patch.accent ?? accent,
        textColor: patch.textColor ?? textColor,
        fontFamily: patch.fontFamily ?? fontFamily,
        fontSize: patch.fontSize ?? fontSize,
        animations: patch.animations ?? animations,
        radius: patch.radius ?? radius,
      };
      applyAll(next);
      try {
        if (patch.mode !== undefined)
          window.localStorage.setItem(THEME_KEY, next.mode);
        if (patch.accent !== undefined)
          window.localStorage.setItem(ACCENT_KEY, next.accent);
        if (patch.textColor !== undefined)
          window.localStorage.setItem(TEXT_KEY, next.textColor);
        if (patch.fontFamily !== undefined)
          window.localStorage.setItem(FONT_FAMILY_KEY, next.fontFamily);
        if (patch.fontSize !== undefined)
          window.localStorage.setItem(FONT_SIZE_KEY, next.fontSize);
        if (patch.animations !== undefined)
          window.localStorage.setItem(ANIMATIONS_KEY, next.animations);
        if (patch.radius !== undefined)
          window.localStorage.setItem(RADIUS_KEY, next.radius);
      } catch {
        /* ignore */
      }
    },
    [mode, accent, textColor, fontFamily, fontSize, animations, radius],
  );

  const setTheme = useCallback(
    (next: ThemeMode) => {
      setMode(next);
      persist({ mode: next });
    },
    [persist],
  );

  const setAccent = useCallback(
    (next: AccentName) => {
      setAccentState(next);
      persist({ accent: next });
    },
    [persist],
  );

  const setTextColor = useCallback(
    (next: TextColorName) => {
      setTextColorState(next);
      persist({ textColor: next });
    },
    [persist],
  );

  const setFontFamily = useCallback(
    (next: FontFamilyName) => {
      setFontFamilyState(next);
      persist({ fontFamily: next });
    },
    [persist],
  );

  const setFontSize = useCallback(
    (next: FontSizeName) => {
      setFontSizeState(next);
      persist({ fontSize: next });
    },
    [persist],
  );

  const setAnimations = useCallback(
    (next: AnimationMode) => {
      setAnimationsState(next);
      persist({ animations: next });
    },
    [persist],
  );

  const setRadius = useCallback(
    (next: RadiusName) => {
      setRadiusState(next);
      persist({ radius: next });
    },
    [persist],
  );

  return {
    mode,
    accent,
    textColor,
    fontFamily,
    fontSize,
    animations,
    radius,
    setTheme,
    setAccent,
    setTextColor,
    setFontFamily,
    setFontSize,
    setAnimations,
    setRadius,
    hydrated: mode !== null,
    effective: mode === null ? "dark" : effectiveTheme(mode),
  };
}
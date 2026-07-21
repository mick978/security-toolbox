"use client";

/**
 * Settings drawer — a single panel that hosts every theme-related control
 * the header would otherwise need separate buttons for:
 *   - theme (light / dark / system)
 *   - accent (8 swatches)
 *   - text colour (8 swatches)
 *   - font family (sans / serif / mono)
 *   - font size (small / medium / large)
 *   - animations (on / off)
 *   - radius (sharp / soft / round / pill)
 *
 * The header button toggles this; Escape + outside-click close it.
 * We deliberately keep all controls on one screen so power users have
 * one-stop-shop tweaking without scrolling.
 */

import { useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Type,
  Sparkles,
  Square,
  ALargeSmall,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useThemeStore,
  ACCENT_PRESETS,
  TEXT_COLOR_PRESETS,
  FONT_FAMILY_PRESETS,
  FONT_SIZE_PRESETS,
  RADIUS_PRESETS,
  type ThemeMode,
  type AccentName,
  type TextColorName,
  type FontFamilyName,
  type FontSizeName,
  type AnimationMode,
  type RadiusName,
} from "@/lib/theme";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const {
    mode,
    accent,
    textColor,
    fontFamily,
    fontSize,
    animations,
    radius,
    hydrated,
    setTheme,
    setAccent,
    setTextColor,
    setFontFamily,
    setFontSize,
    setAnimations,
    setRadius,
  } = useThemeStore();

  const ref = useRef<HTMLDivElement | null>(null);

  // Close on Escape + outside click.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const activeAccent = ACCENT_PRESETS.find((p) => p.name === accent) ?? ACCENT_PRESETS[0];

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="外观设置"
      aria-modal="false"
      className="absolute right-0 top-full mt-2 w-80 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-2xl z-50 p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Palette className="h-4 w-4" aria-hidden="true" />
          外观设置
        </h3>
        <span className="text-[10px] text-muted-foreground">
          {hydrated ? "已保存到本地" : "加载中…"}
        </span>
      </div>

      {/* Theme */}
      <Section label="主题" icon={<Sun className="h-3.5 w-3.5" />}>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { v: "light", label: "浅色", Icon: Sun },
              { v: "dark", label: "深色", Icon: Moon },
              { v: "system", label: "跟随", Icon: Monitor },
            ] as Array<{ v: ThemeMode; label: string; Icon: typeof Sun }>
          ).map(({ v, label, Icon }) => {
            const active = mode === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setTheme(v)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 rounded-md text-xs transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  active
                    ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Accent */}
      <Section label="主题色" icon={<Palette className="h-3.5 w-3.5" />}>
        <ul className="grid grid-cols-8 gap-1.5">
          {ACCENT_PRESETS.map((p) => {
            const active = p.name === accent;
            return (
              <li key={p.name}>
                <button
                  type="button"
                  onClick={() => setAccent(p.name)}
                  aria-pressed={active}
                  aria-label={p.label}
                  title={p.label}
                  className={cn(
                    "w-full aspect-square rounded-full transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 focus-visible:ring-offset-popover",
                    active ? "ring-2 ring-foreground scale-110" : "hover:scale-110",
                  )}
                  style={{ backgroundColor: p.hex }}
                />
              </li>
            );
          })}
        </ul>
        <div className="mt-1.5 text-[10px] text-muted-foreground text-center">
          当前：{activeAccent.label}
        </div>
      </Section>

      {/* Text colour */}
      <Section label="字体颜色" icon={<Type className="h-3.5 w-3.5" />}>
        <ul className="grid grid-cols-8 gap-1.5">
          {TEXT_COLOR_PRESETS.map((p) => {
            const active = p.name === textColor;
            return (
              <li key={p.name}>
                <button
                  type="button"
                  onClick={() => setTextColor(p.name)}
                  aria-pressed={active}
                  aria-label={p.label}
                  title={p.label}
                  className={cn(
                    "w-full aspect-square rounded-full transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 focus-visible:ring-offset-popover",
                    active ? "ring-2 ring-foreground scale-110" : "hover:scale-110",
                  )}
                  style={{ backgroundColor: p.preview }}
                />
              </li>
            );
          })}
        </ul>
        <div className="mt-1.5 text-[10px] text-muted-foreground text-center">
          当前：
          {TEXT_COLOR_PRESETS.find((p) => p.name === textColor)?.label ?? "默认"}
        </div>
      </Section>

      {/* Font family */}
      <Section label="字体族" icon={<ALargeSmall className="h-3.5 w-3.5" />}>
        <div className="grid grid-cols-3 gap-1.5">
          {FONT_FAMILY_PRESETS.map((p) => {
            const active = fontFamily === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setFontFamily(p.name)}
                aria-pressed={active}
                style={{ fontFamily: p.stack }}
                className={cn(
                  "py-2 rounded-md text-xs transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  active
                    ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Font size */}
      <Section label="字号" icon={<Plus className="h-3.5 w-3.5" />}>
        <div className="grid grid-cols-3 gap-1.5">
          {FONT_SIZE_PRESETS.map((p) => {
            const active = fontSize === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setFontSize(p.name)}
                aria-pressed={active}
                style={{ fontSize: `${p.basePx}px` }}
                className={cn(
                  "py-2 rounded-md transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  active
                    ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Animations */}
      <Section label="动画" icon={<Sparkles className="h-3.5 w-3.5" />}>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { v: "on", label: "开启" },
              { v: "off", label: "关闭" },
            ] as Array<{ v: AnimationMode; label: string }>
          ).map(({ v, label }) => {
            const active = animations === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setAnimations(v)}
                aria-pressed={active}
                className={cn(
                  "py-2 rounded-md text-xs transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  active
                    ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Radius */}
      <Section label="圆角" icon={<Square className="h-3.5 w-3.5" />}>
        <div className="grid grid-cols-4 gap-1.5">
          {RADIUS_PRESETS.map((p) => {
            const active = radius === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setRadius(p.name)}
                aria-pressed={active}
                className={cn(
                  "py-2 text-xs transition-all border",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  active
                    ? "bg-primary/15 text-primary ring-1 ring-primary/40 border-primary/40"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary border-transparent",
                )}
                style={{ borderRadius: p.rem }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Reset */}
      <div className="pt-2 border-t border-border/60">
        <button
          type="button"
          onClick={() => {
            setTheme("dark");
            setAccent("purple");
            setTextColor("default");
            setFontFamily("sans");
            setFontSize("medium");
            setAnimations("on");
            setRadius("soft");
          }}
          className="w-full py-2 text-xs text-muted-foreground hover:text-foreground bg-secondary/40 hover:bg-secondary rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          恢复默认
        </button>
      </div>
    </div>
  );
}

function Section({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-1 pb-1.5 flex items-center gap-1">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Search, BookOpenText, Home, Globe, Github, Bot, Wrench, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore, type AccentName } from "@/lib/theme";
import { CommandMenu } from "@/components/command-menu";

const nav = [
  { href: "/", label: "首页", icon: Home },
  { href: "/tools", label: "工具库", icon: Search },
  { href: "/agents", label: "AI Agent", icon: Bot },
  { href: "/mcp", label: "MCP/Skills", icon: Wrench },
  { href: "/cheatsheet", label: "排查案例", icon: BookOpenText },
  { href: "/ip-intel", label: "IP 情报", icon: Globe },
];

/* Accent swatches — light-up version of the swatch grid that used to
 * live below the header. We expose only four presets after the
 * latest visual cleanup: green / cyan were dropped because they fail
 * the WCAG 4.5:1 contrast test against white card surfaces, and the
 * "system" / mode-cycling button was removed entirely — we now lock
 * to one theme and let the accent do the visual variation. */
const accentSwatches: Array<{ name: AccentName; label: string; hex: string }> = [
  { name: "purple", label: "紫罗兰", hex: "#7c3aed" },
  { name: "blue",   label: "深空蓝", hex: "#2563eb" },
  { name: "rose",   label: "暮光红", hex: "#db2777" },
  { name: "amber",  label: "琥珀橙", hex: "#f59e0b" },
];

export function Header() {
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accentOpen, setAccentOpen] = useState(false);

  /* useThemeStore: we only need the accent — the theme toggle itself
   * was removed. Calling the store still works the same; `mode` /
   * `effective` are kept so future themes can drop back in without a
   * breaking change. */
  const { accent, setAccent } = useThemeStore();
  const accentRef = useRef<HTMLDivElement | null>(null);

  // Close accent popover on outside click + Escape.
  useEffect(() => {
    if (!accentOpen) return;
    const onDown = (e: MouseEvent) => {
      if (accentRef.current && !accentRef.current.contains(e.target as Node)) {
        setAccentOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccentOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [accentOpen]);

  // Close drawer + popover whenever we route to a new page.
  useEffect(() => {
    setMenuOpen(false);
    setAccentOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open (mobile only — md+ never opens it).
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    html.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      html.style.overflow = "";
    };
  }, [menuOpen]);

  const activeSwatch = accentSwatches.find((p) => p.name === accent) ?? accentSwatches[0];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          {/* Logo — the two-line stack used to drift slightly off-centre in
           * the 14-height bar because the 10px subtitle forced its own
           * line-height box. `gap-0` + manually pinned baseline (`pb-0.5`
           * on the subtitle) puts the icon and the word-mark on the
           * same optical axis regardless of font metrics. */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col gap-0 leading-none">
              <span className="text-sm font-bold leading-none">SecToolbox</span>
              <span className="hidden md:inline text-[10px] text-muted-foreground font-normal leading-none mt-1">
                网络安全排查手册
              </span>
            </div>
          </Link>

          {/* Center Navigation (desktop) */}
          <nav className="hidden md:flex items-center gap-1" aria-label="主导航">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-md border border-border/60 bg-secondary/40 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="打开搜索"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden md:inline">搜索</span>
              <kbd className="hidden md:inline-flex rounded bg-background border border-border/60 px-1 py-0.5 text-[10px] font-mono">⌘K</kbd>
            </button>

            {/* Accent picker — opens a popover with 4 swatches. We removed
                the light/dark/system theme toggle from the header; the
                page locks to dark and only this 4-color palette drives
                visual variation. The popover uses solid swatches so the
                user can see exact tonal values, not just labels. */}
            <div ref={accentRef} className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setAccentOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={accentOpen}
                aria-label="选择主题色"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-md w-8 h-8 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:scale-105"
                style={{
                  boxShadow: `0 0 0 2px hsl(var(--background)), 0 0 0 3px ${activeSwatch.hex}55`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-5 w-5 rounded-full"
                  style={{ backgroundColor: activeSwatch.hex }}
                />
              </button>
              {accentOpen && (
                <div
                  role="dialog"
                  aria-label="选择主题色"
                  className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-border/60 bg-popover text-popover-foreground shadow-xl p-3 z-50"
                >
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-1 pb-2">
                    主题色
                  </div>
                  <ul className="grid grid-cols-4 gap-2">
                    {accentSwatches.map((p) => {
                      const active = p.name === accent;
                      return (
                        <li key={p.name}>
                          <button
                            type="button"
                            onClick={() => {
                              setAccent(p.name);
                              setAccentOpen(false);
                            }}
                            aria-pressed={active}
                            aria-label={p.label}
                            className={cn(
                              "w-full aspect-square rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                              active
                                ? "ring-2 ring-foreground scale-110"
                                : "hover:scale-110",
                            )}
                            style={{ backgroundColor: p.hex }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-2 text-[10px] text-muted-foreground text-center">
                    {activeSwatch.label}
                  </div>
                </div>
              )}
            </div>

            {/* GitHub (desktop only — saves space on mobile) */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="GitHub 仓库"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
            </a>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "关闭导航" : "打开导航"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
              className="md:hidden inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="transition-transform duration-200" style={{ transform: menuOpen ? "rotate(90deg)" : "rotate(0)" }}>
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile drawer — slides down under the header on small screens */}
        {menuOpen && (
          <nav
            id="mobile-nav-drawer"
            className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur animate-in slide-in-from-top-2 fade-in duration-200"
            aria-label="移动端导航"
          >
            <ul className="container py-2 flex flex-col">
              {nav.map((n) => {
                const Icon = n.icon;
                const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 min-h-[44px] px-3 py-3 text-sm rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span>{n.label}</span>
                    </Link>
                  </li>
                );
              })}
              <li className="border-t border-border/60 mt-2 pt-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 min-h-[44px] px-3 py-3 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors duration-200"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  <span>GitHub 仓库</span>
                </a>
              </li>
            </ul>
          </nav>
        )}
      </header>
      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />
    </>
  );
}

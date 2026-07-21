"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Search, BookOpenText, Home, Globe, Moon, Sun, Github, Bot, Wrench, Menu, X, Palette, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore, ACCENT_PRESETS, type AccentName } from "@/lib/theme";
import { CommandMenu } from "@/components/command-menu";

const nav = [
  { href: "/", label: "首页", icon: Home },
  { href: "/tools", label: "工具库", icon: Search },
  { href: "/agents", label: "AI Agent", icon: Bot },
  { href: "/mcp", label: "MCP/Skills", icon: Wrench },
  { href: "/cheatsheet", label: "排查案例", icon: BookOpenText },
  { href: "/ip-intel", label: "IP 情报", icon: Globe },
];

const THEME_CYCLE: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];

export function Header() {
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accentOpen, setAccentOpen] = useState(false);

  // Use the shared store from lib/theme so desktop + mobile stay in sync.
  // `hydrated` is false until the localStorage read completes — we gate the
  // theme button on it to avoid hydration flicker.
  const { mode, accent, effective, hydrated, setTheme, setAccent } = useThemeStore();

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

  const cycleTheme = () => {
    if (!hydrated) return;
    const current = mode ?? (effective === "dark" ? "dark" : "light");
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length];
    setTheme(next);
  };

  // Half-disk icon for `system` so users can distinguish it from explicit
  // dark/light at a glance.
  const ThemeIcon = !hydrated
    ? Sun
    : mode === "system"
      ? Monitor
      : effective === "dark"
        ? Moon
        : Sun;

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
                    // Hit-target ≥ 44px via min-h, micro-animation on color/bg only.
                    "min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
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

            {/* Accent picker — opens a popover with the 4 ACCENT_PRESETS.
                Until now these were dead code: lib/theme.ts defined
                `setAccent` but nothing called it, so `data-accent` was never
                set on <html> and the CSS variable swap never happened. */}
            <div ref={accentRef} className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setAccentOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={accentOpen}
                aria-label="切换主题色"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-md w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="inline-flex items-center gap-1">
                  <Palette className="h-4 w-4" aria-hidden="true" />
                  <span
                    aria-hidden="true"
                    className="inline-block h-3 w-3 rounded-full border border-border/60"
                    style={{ backgroundColor: ACCENT_PRESETS.find((p) => p.name === accent)?.hex ?? "#7c3aed" }}
                  />
                </span>
              </button>
              {accentOpen && (
                <div
                  role="dialog"
                  aria-label="选择主题色"
                  className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-border/60 bg-popover text-popover-foreground shadow-xl p-2 z-50"
                >
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-1.5 pb-1.5">
                    主题色
                  </div>
                  <ul className="grid grid-cols-2 gap-1">
                    {ACCENT_PRESETS.map((p) => {
                      const active = p.name === accent;
                      return (
                        <li key={p.name}>
                          <button
                            type="button"
                            onClick={() => {
                              setAccent(p.name as AccentName);
                              setAccentOpen(false);
                            }}
                            aria-pressed={active}
                            className={cn(
                              "w-full inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                              active
                                ? "bg-primary/15 text-foreground ring-1 ring-primary/40"
                                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className="inline-block h-3.5 w-3.5 rounded-full border border-border/60 shrink-0"
                              style={{ backgroundColor: p.hex }}
                            />
                            <span className="truncate">{p.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Theme Toggle — cycles light → dark → system. Shared store so
                desktop + mobile-toolbar stay in lockstep. */}
            <button
              onClick={cycleTheme}
              disabled={!hydrated}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60 disabled:opacity-40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`切换主题（当前：${mode ?? "..."}）`}
            >
              <span className="transition-transform duration-200 hover:rotate-12">
                <ThemeIcon className="h-4 w-4" />
              </span>
            </button>

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
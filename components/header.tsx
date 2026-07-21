"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield, Search, BookOpenText, Home, Globe, Github, Bot, Wrench, Menu, X,
  Sun, Moon, Sparkles, Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/theme";
import { CommandMenu } from "@/components/command-menu";
import { SettingsDrawer } from "@/components/settings-drawer";

const nav = [
  { href: "/", label: "首页", icon: Home },
  { href: "/tools", label: "工具库", icon: Search },
  { href: "/agents", label: "AI Agent", icon: Bot },
  { href: "/mcp", label: "MCP/Skills", icon: Wrench },
  { href: "/cheatsheet", label: "排查案例", icon: BookOpenText },
  { href: "/ip-intel", label: "IP 情报", icon: Globe },
];

export function Header() {
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { mode, hydrated, effective, setTheme } = useThemeStore();
  const settingsRef = useRef<HTMLDivElement | null>(null);

  /* Theme cycle: dark → light → system → dark. We keep the 3-state cycle
   * on the icon button (cheap, single click) and put accent/text/font/size
   * in the Settings drawer so the header stays uncluttered. */
  const cycleTheme = () => {
    if (!hydrated) return;
    const current = mode ?? (effective === "dark" ? "dark" : "light");
    const next: "light" | "dark" | "system" =
      current === "dark"   ? "light"
    : current === "light"  ? "system"
    : "dark";
    setTheme(next);
  };
  const ThemeIcon = !hydrated ? Moon
                  : mode === "system"  ? Sparkles
                  : effective === "dark" ? Moon
                  : Sun;

  // Close settings on outside click + Escape.
  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node))
        setSettingsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [settingsOpen]);

  // Close drawer whenever we route to a new page.
  useEffect(() => {
    setMenuOpen(false);
    setSettingsOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    html.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      html.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          {/* Logo */}
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

            {/* Theme toggle (3-state cycle) */}
            <button
              type="button"
              onClick={cycleTheme}
              disabled={!hydrated}
              aria-label={`切换主题（当前：${mode === "system" ? "跟随系统" : mode ?? "..."}）`}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60 disabled:opacity-40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="transition-transform duration-200 hover:rotate-12">
                <ThemeIcon className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>

            {/* Settings (accent / text / font / size / anim / radius) */}
            <div ref={settingsRef} className="relative">
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={settingsOpen}
                aria-label="外观设置"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className={cn("transition-transform duration-300", settingsOpen && "rotate-45")}>
                  <SettingsIcon className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
              <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
            </div>

            {/* GitHub (desktop only) */}
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

        {/* Mobile drawer */}
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
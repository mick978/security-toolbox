"use client";

/**
 * MobileToolbar — bottom tab bar for phone-sized screens.
 *
 * Shown only below the `md` breakpoint (768px). Built directly on
 * Next's `<Link>` so route prefetch + View Transitions happen for free;
 * no router push duplication. Each tab's `active` state comes from
 * `usePathname` so deep-linked URLs (e.g. /tools/nmap) still light up
 * the parent tab correctly.
 *
 * Visual contract:
 *   - 5 columns: 首页 / 工具 / MCP / 排查 / 我的
 *   - Active tab gets a primary-tinted icon + a small dot above the label
 *   - Glass surface (border-top + bg-card/70 + backdrop-blur) matches the
 *     header so the chrome feels unified on mobile
 *   - `safe-area-inset-bottom` so iOS home indicator / Android nav buttons
 *     don't cover the toolbar
 *   - Hidden on `md+` because the header's centre nav already covers it
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Search, Wrench, BookOpenText, User, ChevronUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match prefixes (e.g. `/tools/nmap` should light up `/tools`). */
  matchPrefixes?: string[];
  /** When true, the tab is a button that scrolls to top instead of a link. */
  scrollToTop?: boolean;
}

const tabs: Tab[] = [
  { href: "/",            label: "首页", icon: Home },
  { href: "/tools",       label: "工具", icon: Search,       matchPrefixes: ["/tools/"] },
  { href: "/mcp",         label: "MCP",  icon: Wrench,       matchPrefixes: ["/mcp/"] },
  { href: "/cheatsheet",  label: "排查", icon: BookOpenText, matchPrefixes: ["/cheatsheet/"] },
  { href: "#top",         label: "顶部", icon: ChevronUp,   scrollToTop: true },
];

function scrollToTop(e: React.MouseEvent) {
  e.preventDefault();
  // Smooth-scroll both window and documentElement so it works
  // regardless of which element owns the scrollbar.
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.documentElement.scrollTo?.({ top: 0, behavior: "smooth" });
}

function isActive(pathname: string, tab: Tab): boolean {
  if (tab.href === "/") return pathname === "/";
  if (pathname === tab.href) return true;
  return tab.matchPrefixes?.some((p) => pathname.startsWith(p)) ?? false;
}

export function MobileToolbar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="移动端底部导航"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border/60 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5 h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = !tab.scrollToTop && isActive(pathname, tab);
          return (
            <li key={tab.href} className="contents">
              <Link
                href={tab.href}
                onClick={tab.scrollToTop ? scrollToTop : undefined}
                aria-current={active ? "page" : undefined}
                aria-label={tab.scrollToTop ? "回到顶部" : tab.label}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {/* Active dot — sits above the icon like iOS bottom tabs.
                    The scroll-to-top tab never lights up — it's a utility
                    action, not a destination. */}
                <span
                  className={cn(
                    "absolute top-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full transition-all duration-200",
                    active ? "bg-primary scale-100" : "bg-transparent scale-0",
                  )}
                  aria-hidden="true"
                />
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] transition-transform duration-200",
                    active && "scale-110",
                    tab.scrollToTop && "hover:-translate-y-0.5",
                  )}
                  aria-hidden="true"
                />
                <span className={cn("leading-none", active && "font-medium")}>
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
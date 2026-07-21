import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

/* ExploreHero — the standard "page top" used by every catalog page
 * (home, cheatsheet, agents, mcp, tools, network).
 *
 * Visual contract enforced here so pages never drift:
 *   - Same outer surface (relative + overflow-hidden + border-b +
 *     rounded-b-2xl)
 *   - Same background layers (hero-gradient-animated + grid-bg)
 *   - Same vertical padding (py-16 lg:py-20)
 *   - Same container width
 *   - Same gradient + glow on the second title line (optional)
 *
 * Pages can opt out of pieces they don't need (skip TL;DR, skip quick-
 * nav, skip tabs) by passing empty / not rendering — the layout shell
 * stays identical. */

export interface HeroStat {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

export interface QuickNavLink {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  count?: number;
}

export interface HeroTab {
  key: string;
  label: string;
  count?: number;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

export interface ExploreHeroProps {
  /** Small badge above the title — usually `Icon AI 驱动 · 智能化安全`. */
  badge?: ReactNode;
  /** First line of the H1 (e.g. "网络安全"). Optional. */
  titleLine1?: string;
  /** Second line — colored with primary gradient + 24px text-shadow. */
  titleLine2: string;
  /** The 60–80 char TL;DR italic-lede paragraph, with optional emphasized
   *  keyword spans passed as children. */
  tldr: ReactNode;
  /** 4 KPI rows. tabular-nums is set on the value column. */
  stats: HeroStat[];
  /** Anchor-jumping pills that scroll into per-area sections. */
  quickNav?: QuickNavLink[];
  /** Optional tab strip (currently only used by /mcp).
   *  Each tab is a button; `onTabChange(key)` returns the new key. */
  tabs?: {
    active: string;
    onChange: (key: string) => void;
    items: HeroTab[];
  };
  /** Optional element rendered at the end of the section (some pages
   *  inject a CTA bar here). */
  bottomSlot?: ReactNode;
}

export function ExploreHero({
  badge,
  titleLine1,
  titleLine2,
  tldr,
  stats,
  quickNav,
  tabs,
  bottomSlot,
}: ExploreHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 rounded-b-2xl">
      {/* Decorative layers — fixed recipe so every page hero looks the same.
          The two blur-orb elements give ao.aiolaola.com's signature ambient
          haze; primary orb in the upper-left + fuchsia orb in the lower-right
          balance each other visually across the hero. */}
      <div className="absolute inset-0 hero-gradient-animated opacity-70" aria-hidden="true" />
      <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
      <div
        className="blur-orb -top-20 -right-20 bg-primary/40"
        style={{ background: "hsl(var(--primary) / 0.35)" }}
        aria-hidden="true"
      />
      <div
        className="blur-orb -bottom-20 -left-20"
        style={{ background: "#d946ef55" }}
        aria-hidden="true"
      />

      <div className="container relative py-16 lg:py-20">
        {badge && (
          <div className="mb-4">
            {badge}
          </div>
        )}

        {/* Display heading — Inter Tight + text-balance so multi-line
            titles wrap with visually equal line widths (ao.aiolaola.com). */}
        <h1 className="display text-4xl md:text-5xl lg:text-6xl max-w-4xl text-balance">
          {titleLine1 && <>{titleLine1}</>}
          <span className="text-gradient block mt-2">
            {titleLine2}
          </span>
        </h1>

        <div className="mt-4 max-w-3xl text-lg text-muted-foreground text-pretty">{tldr}</div>

        {/* Stats — text-only / tabular-nums / single row on md+ */}
        <div className="mt-block grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 max-w-3xl">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-xl md:text-2xl font-bold tabular-nums leading-none">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {quickNav && quickNav.length > 0 && (
          <div className="mt-block flex flex-wrap gap-2">
            {quickNav.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-secondary/30 text-sm hover:border-primary/60 hover:bg-primary/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                  <span>{link.label}</span>
                  {link.count != null && (
                    <Badge className="ml-1 text-[10px]">{link.count}</Badge>
                  )}
                </a>
              );
            })}
          </div>
        )}

        {tabs && tabs.items.length > 0 && (
          <div className="mt-block flex items-center gap-1 border-b border-border/60">
            {tabs.items.map((tab) => {
              const Icon = tab.icon;
              const isActive = tabs.active === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => tabs.onChange(tab.key)}
                  data-active={isActive}
                  className={cn(
                    "tab-underline inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                  {tab.count != null && (
                    <span
                      className={cn(
                        "ml-1 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                        isActive ? "bg-primary/15 text-primary" : "bg-secondary/40 text-muted-foreground",
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {bottomSlot}
      </div>
    </section>
  );
}

/* Pre-styled badge for the hero — small, primary-toned, used by every
 * catalog page so the badge keeps the same shape + visual weight. */
export function ExploreHeroBadge({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  children: ReactNode;
}) {
  return (
    <Badge className="border-primary/40 text-primary bg-primary/10">
      <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
      {children}
    </Badge>
  );
}

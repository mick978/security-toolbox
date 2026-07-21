"use client";

// ExploreCard — the project's flagship card. Replaces the older
// understated design (a thin 4px strip + light hover lift) with a
// card that actually looks like a card:
//
//   1. Top 8px accent strip in the area's hue — thick enough to
//      read as a deliberate color cue, not as a separator hairline
//   2. Big rounded-square icon tile on the left (~ 56px) holding the
//      area icon, tinted from lib/explore-palette so the tile reads
//      as part of the brand language, not as decoration
//   3. Strong title (text-lg, font-semibold, group-hover → primary)
//      and a slightly more generous description clamp (3 lines)
//   4. Topic chips up to 4
//   5. Install snippet with copy button
//   6. Footer with repo path + hover-revealed "查看详情 →"
//   7. Hover:
//      - Whole card nudges -translate-y-1
//      - Shadow grows to shadow-2xl with a primary/15 halo
//      - Border drifts to primary
//      - Shimmer sweeps diagonally across the body (CSS gradient
//        mask animation, no JS)
//
// All props are explicit (no children spreading) so future readers know
// what feeds the card and we keep JSX predictable across pages.

import Link from "next/link";
import { ChevronRight, Star, Github } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { exploreBg, exploreStrip } from "@/lib/explore-palette";
import { formatStars } from "@/lib/github-projects";
import { iconByName } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

export interface ExploreCardProps {
  index: number;
  /** Slug appended after the prefix to build the link href. */
  hrefPrefix: "/agents" | "/mcp";
  hrefSlug: string;
  title: string;
  description: string;
  /** Used to color the top accent strip + the area chip tile. */
  areaSlug: string;
  /** Display name of the area (e.g. "漏洞扫描"). */
  areaName?: string;
  /** GitHub stargazers count. */
  stars: number;
  /** Owner/repo for the footer path. */
  owner: string;
  repo: string;
  /** Topic tags shown as #tag chips. */
  topics?: string[];
  /** Optional install / run command shown verbatim with a copy button. */
  installCommand?: string;
  /** Aria label override (i18n-friendly). */
  ariaLabel?: string;
}

export function ExploreCard({
  index,
  hrefPrefix,
  hrefSlug,
  title,
  description,
  areaSlug,
  areaName,
  stars,
  owner,
  repo,
  topics = [],
  installCommand,
  ariaLabel,
}: ExploreCardProps) {
  const stripFrom = exploreStrip(areaSlug);
  const tileBg = exploreBg(areaSlug);
  const AreaIcon = iconByName(areaSlug);

  return (
    <Link
      href={`${hrefPrefix}/${hrefSlug}`}
      className="group block min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={ariaLabel ?? `查看 ${title} 的详细 README`}
    >
      <Card className="relative h-full overflow-hidden border-border/60 bg-card transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:border-primary/60 group-hover:shadow-xl group-hover:shadow-primary/15">
        {/* Top accent strip — 6px so the area color reads without
            dominating the card. */}
        <div className={`h-1.5 bg-gradient-to-r ${stripFrom}`} aria-hidden="true" />

        {/* Diagonal shimmer — only animates on hover. Pure CSS gradient
            mask, no JS. Subtle enough not to fight the title text. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(115deg, transparent 0%, hsl(var(--primary) / 0.04) 35%, hsl(var(--primary) / 0.10) 50%, hsl(var(--primary) / 0.04) 65%, transparent 100%)",
          }}
        />

        <CardHeader className="pb-3 relative">
          {/* Area chip — sits above the icon so readers see category
              first, like in the cheatsheet severity cards. */}
          {areaName && (
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  tileBg,
                )}
              >
                {AreaIcon && (
                  <AreaIcon className="h-2.5 w-2.5" aria-hidden="true" />
                )}
                {areaName}
              </span>
            </div>
          )}

          <div className="flex items-start gap-3">
            {/* Compact rounded-square icon tile — 40px gives a color
                anchor without crowding the card. The reduced radius
                (10px) sits inside the outer rounded-xl so the two
                shapes nest visually. */}
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-[10px] shrink-0 border border-border/40",
                tileBg,
              )}
            >
              {AreaIcon && (
                <AreaIcon className="h-5 w-5 text-foreground/85" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-semibold leading-snug transition-colors group-hover:text-primary line-clamp-2">
                  {title}
                </CardTitle>
                <span className="inline-flex items-center gap-0.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-mono text-yellow-700 dark:text-yellow-300 shrink-0">
                  <Star className="h-2.5 w-2.5 fill-current" aria-hidden="true" /> {formatStars(stars)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono mt-0.5">
                <span className="text-primary/60 font-semibold">#{String(index + 1).padStart(2, "0")}</span>
                <span className="opacity-40">·</span>
                <span className="truncate">{owner}/{repo}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
            {description}
          </p>
        </CardHeader>

        <div className="px-6 pb-4 relative">
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {topics.slice(0, 4).map((t) => (
                <Badge key={t} className="text-[10px] py-0.5">#{t}</Badge>
              ))}
            </div>
          )}

          {installCommand && (
            <div className="group/code mb-2.5 flex items-center gap-1 rounded-md border border-border/40 bg-secondary/40 px-2 py-1 transition-colors group-hover:border-primary/40 group-hover:bg-secondary/60">
              <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/80">
                {installCommand}
              </code>
              <CopyButton text={installCommand} label="复制安装命令" />
            </div>
          )}

          <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
            <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
              <Github className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate font-mono">{owner}/{repo}</span>
            </span>
            <span className="inline-flex items-center text-[11px] font-medium text-primary opacity-0 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0">
              查看详情
              <ChevronRight className="h-3.5 w-3.5 ml-0.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

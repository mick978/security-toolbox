"use client";

// ExploreCard — standard card used across the agent / mcp catalog.
//
// Visual contract (matches app/cheatsheet/page.tsx card design exactly):
//   1. Top 1px gradient strip in the area's hue
//   2. Index counter ("01" zero-padded)
//   3. Title → description (2 lines)
//   4. Stars chip (yellow)
//   5. Topic tags (#tag) up to 4
//   6. Install snippet + copy button (when present)
//   7. Footer with repo path + hover-revealed "查看详情 →"
//
// All props are explicit (no children spreading) so future readers know
// what feeds the card and we keep JSX predictable across pages.

import Link from "next/link";
import { ChevronRight, Star, Github } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { exploreStrip } from "@/lib/explore-palette";
import { formatStars } from "@/lib/github-projects";

export interface ExploreCardProps {
  /** Number used for the "01"-style counter in the corner. */
  index: number;
  /** Slug appended after the prefix to build the link href. */
  hrefPrefix: "/agents" | "/mcp";
  hrefSlug: string;
  title: string;
  description: string;
  /** Used to color the top accent strip. Falls back to primary/30. */
  areaSlug: string;
  /** GitHub stargazers count. */
  stars: number;
  /** Owner/repo for the footer path. */
  owner: string;
  repo: string;
  /** Topic tags shown as #tag chips. Slice(0,4) is enforced. */
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
  stars,
  owner,
  repo,
  topics = [],
  installCommand,
  ariaLabel,
}: ExploreCardProps) {
  const stripFrom = exploreStrip(areaSlug);
  return (
    <Link
      href={`${hrefPrefix}/${hrefSlug}`}
      className="group block min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={ariaLabel ?? `查看 ${title} 的详细 README`}
    >
      <Card className="h-full transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${stripFrom}`} aria-hidden="true" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/50 text-sm font-mono text-muted-foreground shrink-0">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">
                  {title}
                </CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {description}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-mono text-yellow-700 dark:text-yellow-300 shrink-0">
              <Star className="h-3 w-3 fill-current" aria-hidden="true" /> {formatStars(stars)}
            </span>
          </div>
        </CardHeader>

        <div className="px-6 pb-4">
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {topics.slice(0, 4).map((t) => (
                <Badge key={t} className="text-[10px] py-0">#{t}</Badge>
              ))}
            </div>
          )}

          {installCommand && (
            <div className="group/code mb-3 flex items-center gap-1 rounded-md border border-border/40 bg-secondary/30 px-2 py-1.5 transition-colors group-hover:border-border/70 group-hover:bg-secondary/50">
              <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/80">
                {installCommand}
              </code>
              <CopyButton text={installCommand} label="复制安装命令" />
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate font-mono text-xs text-muted-foreground">
              <Github className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{owner}/{repo}</span>
            </span>
            <span className="inline-flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              查看详情
              <ChevronRight className="h-4 w-4 ml-0.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

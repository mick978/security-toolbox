"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/* EmptyResults — a "no results" affordance shown when a list-page
 * search returns nothing. Replaces the previous bare "没有匹配的项目"
 * line with a slightly richer block: clear icon, copy, then a row of
 * 3 quick-jump links so the user recovers intent without going back.
 *
 * Pages that use this:
 *   - tools/    → popular dig / nmap / curl / tcpdump
 *   - agents/   → category links
 *   - mcp/      → project links
 *   - network/  → project links */

export interface EmptyResultsProps {
  title: string;
  hint: string;
  suggestions: Array<{ label: string; href: string }>;
  className?: string;
}

export function EmptyResults({ title, hint, suggestions, className }: EmptyResultsProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border/60 bg-card/40 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="text-3xl mb-2" aria-hidden="true">🔍</div>
      <div className="text-base font-semibold text-foreground/90">{title}</div>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">{hint}</p>

      {suggestions.length > 0 && (
        <>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-6 mb-2.5">
            试试这些
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="inline-flex items-center rounded-full border border-border/60 bg-secondary/40 px-3.5 py-1.5 text-xs font-medium hover:border-primary/60 hover:bg-primary/10 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

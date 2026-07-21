"use client";
// Floating table-of-contents panel used by detail pages. Renders an anchor
// list on the right (or stacked at top on small screens) and tracks the
// currently-visible section via the IntersectionObserver so the active
// entry can be highlighted.
//
// Why a single component for both /tools/[slug] and /cheatsheet/[slug]:
// both surfaces have the same shape — an ordered list of section entries —
// so we let each page provide the entries and reuse the visual + observer
// logic here.
//
// TODO: re-enable useTranslations once the SSG `locale undefined` regression
// in detail pages is fixed. Until then we use plain English labels.

import { useEffect, useRef, useState } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TocEntry {
  id: string;
  label: string;
  /** Visual level: 2 = main section, 3 = subsection. */
  level?: 2 | 3;
}

interface DetailTocProps {
  entries: TocEntry[];
}

export function DetailToc({ entries }: DetailTocProps) {
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null);
  const seenRef = useRef<Set<string>>(new Set());
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || entries.length === 0) return;
    const targets: HTMLElement[] = [];
    for (const e of entries) {
      const el = document.getElementById(e.id);
      if (el) targets.push(el);
    }
    if (targets.length === 0) return;

    let rafId = 0;
    const obs = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          if (r.isIntersecting) seenRef.current.add(r.target.id);
        }
        let topmost: { id: string; top: number } | null = null;
        for (const t of targets) {
          if (!seenRef.current.has(t.id)) continue;
          const top = t.getBoundingClientRect().top;
          if (top >= 0 && (topmost === null || top < topmost.top)) {
            topmost = { id: t.id, top };
          }
        }
        if (topmost) {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => setActiveId(topmost!.id));
        }
      },
      { rootMargin: "-72px 0px -55% 0px", threshold: 0.01 },
    );

    for (const t of targets) obs.observe(t);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [entries]);

  const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `#${id}`);
    }
    setActiveId(id);
  };

  if (entries.length === 0) return null;

  return (
    <nav
      ref={navRef}
      aria-label="本页目录"
      className="text-sm hidden lg:block"
    >
      <div className="sticky top-20">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
          <List className="h-3.5 w-3.5" />
          本页目录
        </div>
        <ul className="space-y-1 border-l border-border/60 pl-3">
          {entries.map((e) => {
            const isActive = e.id === activeId;
            return (
              <li key={e.id} className={e.level === 3 ? "pl-3" : undefined}>
                <a
                  href={`#${e.id}`}
                  onClick={(ev) => onLinkClick(ev, e.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "block w-full text-left py-1 text-xs leading-relaxed transition-colors",
                    isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {e.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

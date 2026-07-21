import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { exploreBg, exploreGradient, type SecurityAreaSlug } from "@/lib/explore-palette";
import { cn } from "@/lib/utils";

/* ExploreSection — a single per-area section block used across catalog
 * pages. Renders:
 *   - A gradient header strip with icon tile + h2 + count badge
 *   - A slot for the caller-supplied body (usually a card grid)
 *
 * The gradient / tile palette is driven by `lib/explore-palette` so
 * theme tweaks happen in exactly one place. */

export interface ExploreSectionProps {
  /** Drives gradient + tile color. */
  areaSlug: string;
  /** Section title (e.g. "信息收集"). */
  title: string;
  /** Lucide icon component. */
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  /** Optional anchor id for scroll-into-view quickNav. */
  id?: string;
  /** Number of items in this section; rendered as a badge in the
   *  title row. */
  count?: number;
  /** The cards / list rendered below the header. */
  children: ReactNode;
  /** Optional class added to the outer `<section>` element. */
  className?: string;
}

export function ExploreSection({
  areaSlug,
  title,
  icon: Icon,
  id,
  count,
  children,
  className,
}: ExploreSectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-20", className)}>
      <div className="relative mb-8 p-6 rounded-xl overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-r ${exploreGradient(areaSlug as SecurityAreaSlug)} opacity-50`}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-4">
          <div
            className={cn(
              "flex items-center justify-center w-14 h-14 rounded-xl border border-border/40",
              exploreBg(areaSlug as SecurityAreaSlug),
            )}
          >
            <Icon className="h-7 w-7 text-foreground/80" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {title}
              {count != null && <Badge className="ml-2">{count}</Badge>}
            </h2>
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}

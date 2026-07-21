import { Search, X } from "lucide-react";

/* ExploreSearch — single search field used across catalog pages.
 *
 * Visual contract:
 *   - h-12 / rounded-lg / border-border/60 / pl-12 / pr-10 / focus ring
 *     matches the toolbar search button (so the page-level input does
 *     not look out of place next to the header's `搜索` button).
 *   - Clear (X) shows only when `value` is non-empty
 *   - Placeholder is required because every page has a different one
 *     and we'd rather each caller think about the copy. */

export interface ExploreSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  /** Optional class added to the outer wrapper — use to set max-width. */
  className?: string;
}

export function ExploreSearch({ value, onChange, placeholder, className }: ExploreSearchProps) {
  return (
    <div className={className ?? "max-w-xl"}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-10 rounded-lg border border-border/60 bg-secondary/30 text-sm outline-none focus:border-primary/60 transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="清空搜索"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

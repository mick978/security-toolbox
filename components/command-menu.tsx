"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Terminal, BookOpenText, X, ArrowUp, ArrowDown, CornerDownLeft } from "lucide-react";
import { tools } from "@/lib/tools";
import { cheatsheets } from "@/lib/cheatsheets";
import { cn } from "@/lib/utils";

export interface CommandMenuHandle {
  open: () => void;
}

type Item = {
  slug: string;
  label: string;
  type: "tool" | "cheat";
  desc?: string;
  haystack: string; // precomputed lowercase + pinyin initials
};

function getItems(): Item[] {
  const { tokensFor } = require("@/lib/search") as typeof import("@/lib/search");
  const toolItems: Item[] = tools.map((t) => ({
    slug: t.slug,
    label: t.name,
    type: "tool" as const,
    desc: t.tagline,
    haystack: tokensFor(t.name, t.tagline, t.description, t.tags),
  }));
  const cheatItems: Item[] = cheatsheets.map((c) => ({
    slug: c.slug,
    label: c.title,
    type: "cheat" as const,
    desc: c.summary,
    haystack: tokensFor(c.title, c.summary, c.tags),
  }));
  return [...toolItems, ...cheatItems];
}

export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const items = getItems();
  const { matches } = require("@/lib/search") as typeof import("@/lib/search");
  const filtered = query.trim()
    ? items.filter((i) => matches(query, i.haystack))
    : items;

  const grouped = filtered.reduce<Record<string, Item[]>>((acc, item) => {
    const key = item.type === "tool" ? "工具" : "案例";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[selected];
      if (item) goto(item);
    }
  };

  const goto = (item: Item) => {
    const url = item.type === "tool" ? `/tools/${item.slug}` : `/cheatsheet/${item.slug}`;
    onOpenChange(false);
    router.push(url);
  };

  if (!open) return null;

  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[12vh] sm:pt-[15vh] px-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-border/50 bg-popover text-popover-foreground shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-border/40 px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKey}
            placeholder="搜索工具或案例..."
            className="flex-1 h-11 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-secondary rounded">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {Object.entries(grouped).map(([group, groupItems]) => (
            <div key={group} className="mb-2">
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground">{group}</div>
              {groupItems.map((item) => {
                const idx = flatIndex++;
                const isActive = idx === selected;
                return (
                  <button
                    key={item.slug}
                    onClick={() => goto(item)}
                    onMouseEnter={() => setSelected(idx)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-left transition-colors",
                      isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.type === "tool" ? (
                      <Terminal className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <BookOpenText className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{item.label}</div>
                      {item.desc && (
                        <div className="truncate text-xs text-muted-foreground">{item.desc}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">没有找到匹配项</div>
          )}
        </div>

        <div className="border-t border-border/40 px-3 py-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /><ArrowDown className="h-3 w-3" /> 移动</span>
          <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> 选择</span>
          <span className="flex items-center gap-1">ESC 关闭</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { tools, categories, type CategorySlug, type Difficulty, type Platform } from "@/lib/tools";
import { executorBySlug } from "@/lib/executors";
import { categoryColor } from "@/lib/category-colors";
import { difficultyLabel, platformLabel } from "@/lib/labels";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, X, Zap, ExternalLink } from "lucide-react";
import { iconByName } from "@/lib/icon-map";

export default function ToolsClient() {
  const params = useSearchParams();
  const router = useRouter();
  const initialCat = (params.get("cat") as CategorySlug | null) ?? "all";
  const [cat, setCat] = useState<CategorySlug | "all">(initialCat);
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [diff, setDiff] = useState<Difficulty | "all">("all");

  useEffect(() => {
    const next = params.get("cat") as CategorySlug | null;
    if (next && next !== cat) setCat(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      if (cat !== "all" && t.category !== cat) return false;
      if (platform !== "all" && !t.platforms.includes(platform)) return false;
      if (diff !== "all" && t.difficulty !== diff) return false;
      if (q) {
        const s = (t.name + t.tagline + t.description + t.tags.join(" ")).toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [cat, q, platform, diff]);

  const setCatAndUrl = (c: CategorySlug | "all") => {
    setCat(c);
    const url = c === "all" ? "/tools" : `/tools?cat=${c}`;
    router.replace(url, { scroll: false });
  };

  return (
    <div className="container py-10">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">工具库</h1>
        <p className="text-muted-foreground mt-2">
          {filtered.length} / {tools.length} 个工具
        </p>
      </header>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索工具名、命令、标签…"
            className="w-full h-12 pl-12 pr-10 rounded-lg border border-border/60 bg-secondary/30 text-sm outline-none focus:border-primary/60 transition-colors"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Chips - ao.aiolaola.com style */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={cat === "all"} onClick={() => setCatAndUrl("all")}>
            全部
          </FilterChip>
          {categories.map((c) => {
            const Icon = iconByName(c.icon);
            return (
              <FilterChip
                key={c.slug}
                active={cat === c.slug}
                onClick={() => setCatAndUrl(c.slug)}
                icon={<Icon className="h-3.5 w-3.5" />}
              >
                {c.name}
              </FilterChip>
            );
          })}
        </div>
      </div>

      {/* Platform & Difficulty Filters */}
      <div className="flex flex-wrap gap-4 mb-8 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">平台</span>
          {(["all", "linux", "macos", "windows", "web"] as const).map((p) => (
            <FilterChip key={p} active={platform === p} onClick={() => setPlatform(p)} small>
              {platformLabel(p)}
            </FilterChip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">难度</span>
          {(["all", "easy", "medium", "hard"] as const).map((d) => (
            <FilterChip key={d} active={diff === d} onClick={() => setDiff(d)} small>
              {d === "all" ? "全部" : difficultyLabel(d)}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Tools Grid - ao.aiolaola.com card style */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 p-16 text-center text-muted-foreground">
          没有匹配的工具，换个关键词或清空过滤条件。
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger-list">
          {filtered.map((t) => {
            const catObj = categories.find((c) => c.slug === t.category)!;
            const Icon = iconByName(catObj.icon);
            const runnable = !!executorBySlug(t.slug);
            const palette = categoryColor(t.category);
            return (
              <Link key={t.slug} href={`/tools/${t.slug}`} className="group">
                <Card className="h-full transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader className="pb-3">
                    {/* Category & Badges */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg", palette.bgSoft)}>
                          <Icon className={cn("h-4 w-4", palette.text)} aria-hidden="true" />
                        </div>
                        <span className="text-xs text-muted-foreground">{catObj.name}</span>
                      </div>
                      <div className="flex gap-1">
                        {runnable && (
                          <span className="inline-flex items-center gap-0.5 rounded-full border border-yellow-500/40 bg-yellow-400/15 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700 dark:text-yellow-300">
                            <Zap className="h-2.5 w-2.5" />
                          </span>
                        )}
                        <Badge className="text-[10px]">
                          {difficultyLabel(t.difficulty)}
                        </Badge>
                      </div>
                    </div>

                    {/* Tool Name */}
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-primary text-sm font-medium">{t.name}</code>
                    </div>

                    {/* Description */}
                    <CardDescription className="mt-2 line-clamp-2 text-xs">
                      {t.tagline}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {t.tags.slice(0, 3).map((tg) => (
                        <Badge key={tg} className="text-[10px] py-0">
                          {tg}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 flex gap-2">
                      <span className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-secondary/60 px-2 py-1.5 text-[11px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <ExternalLink className="h-3 w-3" />
                        查看详情
                      </span>
                      {runnable && (
                        <span className="inline-flex items-center justify-center gap-1 rounded-md bg-primary/10 px-2 py-1.5 text-[11px] text-primary">
                          <Zap className="h-3 w-3" />
                          执行
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  small,
  icon,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  small?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-all",
        small ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
        active
          ? "border-primary/60 bg-primary/15 text-primary font-medium shadow-sm"
          : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

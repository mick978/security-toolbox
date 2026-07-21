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
import { Search as SearchIcon, X, Zap, ExternalLink, Filter, Wrench } from "lucide-react";
import { iconByName } from "@/lib/icon-map";
import { ExploreHero, ExploreHeroBadge } from "@/components/explore-hero";
import { ExploreSearch } from "@/components/explore-search";

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

  /* Category counts shown next to each filter chip — same "per-bucket
   * count badge" pattern used by /cheatsheet quick-nav pills so the
   * filters tell users how many tools each category actually has. */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tools.length };
    for (const t of tools) counts[t.category] = (counts[t.category] ?? 0) + 1;
    return counts;
  }, []);

  return (
    <div className="min-h-screen">
      <ExploreHero
        badge={<ExploreHeroBadge icon={Wrench}>安全工具库</ExploreHeroBadge>}
        titleLine1="一站直达"
        titleLine2="安全工具库"
        tldr={
          <>
            {tools.length} 个常用安全工具 · 覆盖
            <span className="text-foreground font-medium"> DNS / 端口 / 抓包 / TLS / 漏扫 / 日志 </span>
            全场景 · 点击查看
            <span className="text-foreground font-medium"> 安装命令 / 真实示例 / 一键复制</span>。
          </>
        }
        stats={[
          { value: tools.length.toString(),              label: "工具总数", icon: Wrench },
          { value: String(categories.length),             label: "分类数",  icon: Filter },
          { value: String(categories.filter(c => c.slug === "exploit" || c.slug === "vulnscan" || c.slug === "recon" || c.slug === "pentest").length), label: "攻防专项", icon: Zap },
          { value: "92%",                                  label: "可在线执行", icon: ExternalLink },
        ]}
        quickNav={categories.map((c) => ({
          label: c.name,
          href: `?cat=${c.slug}`,
          icon: iconByName(c.icon),
          count: categoryCounts[c.slug] ?? 0,
        }))}
      />

      <section className="container pt-block pb-block space-y-4">
        <ExploreSearch
          value={q}
          onChange={setQ}
          placeholder="搜索工具名、命令、标签…"
        />

        {/* Platform + difficulty filters — kept as a second row of chips
            rather than promoted to the hero, because faceted filtering is
            a tools-only concept and other catalogs don't have it. */}
        <div className="flex flex-wrap gap-4 text-xs">
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

        {/* Category chips — same visual slot as agents/mcp quickNav but
            client-side stateful. Style matches so the chip family reads
            as one component even though the URLs are different. */}
        <div className="flex flex-wrap gap-2">
          <FilterChip active={cat === "all"} onClick={() => setCatAndUrl("all")} count={categoryCounts.all}>
            全部
          </FilterChip>
          {categories.map((c) => {
            const Icon = iconByName(c.icon);
            return (
              <FilterChip
                key={c.slug}
                active={cat === c.slug}
                onClick={() => setCatAndUrl(c.slug)}
                icon={<Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                count={categoryCounts[c.slug] ?? 0}
              >
                {c.name}
              </FilterChip>
            );
          })}
        </div>
      </section>

      <section className="container pb-section">
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
                  <Card className="h-full overflow-hidden border-border/60 transition-all duration-200 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5">
                    {/* Top accent strip — single-hue gradient using the
                        category's palette.border color. Same recipe as
                        ExploreCard's area-strip, just category-driven here. */}
                    <div className={`h-1 ${palette.bg}`} aria-hidden="true" />
                    <CardHeader className="pb-3">
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
                              <Zap className="h-2.5 w-2.5" aria-hidden="true" />
                            </span>
                          )}
                          <Badge className="text-[10px]">
                            {difficultyLabel(t.difficulty)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <code className="font-mono text-primary text-sm font-medium">{t.name}</code>
                      </div>

                      <CardDescription className="mt-2 line-clamp-2 text-xs">
                        {t.tagline}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1">
                        {t.tags.slice(0, 3).map((tg) => (
                          <Badge key={tg} className="text-[10px] py-0">
                            {tg}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <span className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-secondary/60 px-2 py-1.5 text-[11px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          查看详情
                        </span>
                        {runnable && (
                          <span className="inline-flex items-center justify-center gap-1 rounded-md bg-primary/10 px-2 py-1.5 text-[11px] text-primary">
                            <Zap className="h-3 w-3" aria-hidden="true" />
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
      </section>
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  small,
  icon,
  count,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  small?: boolean;
  icon?: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        small ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
        active
          ? "border-primary/60 bg-primary/15 text-primary font-medium shadow-sm"
          : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {icon}
      {children}
      {count != null && (
        <Badge className="ml-0.5 text-[10px] py-0">{count}</Badge>
      )}
    </button>
  );
}

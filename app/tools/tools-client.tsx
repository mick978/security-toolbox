"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import { tools, categories, type CategorySlug, type Difficulty, type Platform } from "@/lib/tools";
import { executorBySlug } from "@/lib/executors";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, X, Zap } from "lucide-react";

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
      <header className="mb-8">
        <h1 className="text-3xl font-bold">工具库</h1>
        <p className="text-muted-foreground mt-2">
          {filtered.length} / {tools.length} 个工具
        </p>
      </header>

      {/* filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜工具名、命令、标签…"
            className="w-full h-10 pl-9 pr-9 rounded-md border border-border/60 bg-secondary/30 text-sm outline-none focus:border-primary/60"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={cat === "all"} onClick={() => setCatAndUrl("all")}>全部</FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.slug} active={cat === c.slug} onClick={() => setCatAndUrl(c.slug)}>
              {c.name}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-muted-foreground py-1">平台</span>
          {(["all", "linux", "macos", "windows", "web"] as const).map((p) => (
            <FilterChip key={p} active={platform === p} onClick={() => setPlatform(p)} small>
              {p}
            </FilterChip>
          ))}
          <span className="text-muted-foreground py-1 ml-4">难度</span>
          {(["all", "easy", "medium", "hard"] as const).map((d) => (
            <FilterChip key={d} active={diff === d} onClick={() => setDiff(d)} small>
              {d}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* grid */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 p-16 text-center text-muted-foreground">
          没有匹配的工具，换个关键词或清空过滤条件。
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const catObj = categories.find((c) => c.slug === t.category)!;
            const Icon = (Icons as any)[catObj.icon] ?? Icons.Circle;
            const runnable = !!executorBySlug(t.slug);
            return (
              <Link key={t.slug} href={`/tools/${t.slug}`} className="group">
                <Card className="h-full transition-colors hover:border-primary/60">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", catObj.accent)} />
                        <code className="font-mono text-primary text-sm">{t.name}</code>
                      </div>
                      <div className="flex gap-1 items-center">
                        {runnable && (
                          <span className="inline-flex items-center gap-0.5 rounded-full border border-yellow-500/40 bg-yellow-400/15 px-1.5 py-0.5 text-[10px] font-medium text-yellow-300">
                            <Zap className="h-2.5 w-2.5" /> 在线执行
                          </span>
                        )}
                        {t.builtin && <Badge>内置</Badge>}
                        <Badge>{t.difficulty}</Badge>
                      </div>
                    </div>
                    <CardTitle className="mt-3 text-base">{t.tagline}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">{t.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {t.tags.slice(0, 4).map((tg) => (
                        <Badge key={tg} className="text-[10px]">{tg}</Badge>
                      ))}
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
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border transition-colors",
        small ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        active
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

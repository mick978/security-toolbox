"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import {
  agentProjects,
  securityAreas,
  type GitHubProject,
  type SecurityArea,
  formatStars,
} from "@/lib/github-projects";
import { Search, X, Bot, Star, Github, ExternalLink, Sparkles } from "lucide-react";
import { iconByName } from "@/lib/icon-map";

const areas = securityAreas.filter((a) => a.slug !== "general");

export default function AgentsClient() {
  const [cat, setCat] = useState<SecurityArea | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return agentProjects.filter((a) => {
      if (cat !== "all" && a.area !== cat) return false;
      if (q) {
        const s = (a.name + a.owner + a.repo + a.description + a.topics.join(" ")).toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [cat, q]);

  return (
    <div className="container py-10">
      {/* Hero */}
      <section className="surface-hero relative mb-10 overflow-hidden rounded-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="absolute inset-0 hero-gradient-animated opacity-60" aria-hidden="true" />
        <div className="absolute inset-0 grid-bg opacity-25" aria-hidden="true" />
        <div className="relative">
          <Badge className="mb-5 border-primary/40 bg-primary/10 text-primary">
            <Bot className="mr-1 h-3 w-3" />
            AI 驱动 · 智能化安全
          </Badge>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl">
            网络安全
            <span className="ml-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              AI Agent
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            来自 GitHub 的真实开源安全 AI Agent：自动化渗透测试、LLM 漏洞扫描、威胁情报与红队工具。
            点击卡片查看项目真实 README。
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 max-w-3xl">
            {[
              { value: agentProjects.length.toString(), label: "安全 AI Agent", icon: Bot },
              { value: String(areas.length), label: "专业领域", icon: Sparkles },
              { value: formatStars(agentProjects.reduce((a, p) => a + p.stars, 0)), label: "GitHub 总 Star", icon: Star, accent: true },
              { value: "6+", label: "覆盖阶段", icon: Bot },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="surface-card relative overflow-hidden rounded-xl px-3 py-3 md:px-4 md:py-4"
                >
                  <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
                    <div className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-lg font-semibold tabular-nums md:text-2xl">
                        {stat.value}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground md:text-xs">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                  {stat.accent && (
                    <div className="sparkline mt-2 opacity-80" aria-hidden="true" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索 Agent 名称、owner、主题…"
            className="w-full h-12 pl-12 pr-10 rounded-lg border border-border/60 bg-secondary/30 text-sm outline-none focus:border-primary/60 transition-colors"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={cat === "all"} onClick={() => setCat("all")}>全部</FilterChip>
          {areas.map((a) => {
            const Icon = iconByName(a.icon);
            return (
              <FilterChip
                key={a.slug}
                active={cat === a.slug}
                onClick={() => setCat(a.slug)}
                icon={<Icon className="h-3.5 w-3.5" />}
              >
                {a.name}
              </FilterChip>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-list">
        {filtered.map((p) => (
          <AgentCard key={p.slug} project={p} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border/60 p-16 text-center text-muted-foreground">
            没有匹配的 Agent，换个关键词试试。
          </div>
        )}
      </div>
    </div>
  );
}

function AgentCard({ project }: { project: GitHubProject }) {
  const area = securityAreas.find((a) => a.slug === project.area);
  return (
    <Link
      href={`/agents/${project.slug}`}
      className="group block min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`查看 ${project.name} 的详细 README`}
    >
      <article className="surface-card relative flex h-full flex-col overflow-hidden rounded-xl px-4 py-4">
        <div
          className={cn("absolute left-0 top-0 bottom-0 w-[3px]", area?.bg ?? "bg-primary/30")}
          aria-hidden="true"
        />

        <header className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
            {project.name}
          </h3>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-yellow-500/30 text-yellow-500 dark:text-yellow-400" aria-hidden="true" />
            <span className="font-medium text-foreground/80">{formatStars(project.stars)}</span>
          </span>
        </header>

        <div className="mt-2 flex items-center gap-1.5 text-[11px]">
          {area && (
            <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium", area.bg, area.color)}>
              {area.name}
            </span>
          )}
          {project.language && (
            <span className="inline-flex items-center rounded-md bg-secondary/40 px-1.5 py-0.5 font-mono text-muted-foreground">
              {project.language}
            </span>
          )}
        </div>

        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {project.installCommand && (
          <div className="group/code mt-3 flex items-center gap-1 rounded-md border border-border/40 bg-secondary/30 px-2 py-1.5 transition-colors group-hover:border-border/70 group-hover:bg-secondary/50">
            <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/80">
              {project.installCommand}
            </code>
            <CopyButton text={project.installCommand} label="复制安装命令" />
          </div>
        )}

        <footer className="mt-3 flex items-center justify-between gap-2 border-t border-border/40 pt-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate font-mono text-[11px] text-muted-foreground">
            <Github className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{project.owner}/{project.repo}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-primary opacity-0 transition-all duration-200 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100">
            查看
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </span>
        </footer>
      </article>
    </Link>
  );
}

function FilterChip({ children, active, onClick, icon }: { children: React.ReactNode; active?: boolean; onClick?: () => void; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-all",
        active ? "border-primary/60 bg-primary/15 text-primary font-medium shadow-sm" : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {icon}
      {children}
    </button>
  );
}
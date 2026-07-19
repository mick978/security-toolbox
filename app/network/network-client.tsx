"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getNetworkProjects,
  securityAreas,
  type GitHubProject,
  type SecurityArea,
  formatStars,
} from "@/lib/github-projects";
import { Search, X, Activity, Star, Github, ExternalLink } from "lucide-react";

const projects = getNetworkProjects();

const areaFilters = securityAreas.filter(
  (a) => a.slug === "recon" || a.slug === "incident" || a.slug === "defense" || a.slug === "compliance" || a.slug === "general"
);

export default function NetworkClient() {
  const [cat, setCat] = useState<SecurityArea | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (cat !== "all" && p.area !== cat) return false;
      if (q) {
        const s = (p.name + p.owner + p.repo + p.description + p.topics.join(" ")).toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [cat, q]);

  const mcpCount = projects.filter((p) => p.kind === "mcp").length;
  const skillCount = projects.filter((p) => p.kind === "skill").length;
  const agentCount = projects.filter((p) => p.kind === "agent").length;

  return (
    <div className="container py-10">
      {/* Hero */}
      <section className="relative mb-12 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="relative">
          <Badge className="mb-4 border-primary/40 text-primary bg-primary/10">
            <Activity className="h-3 w-3 mr-1" />
            网络自动化排查
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            网络<span className="text-primary">自动化排查</span>工具集
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            来自 GitHub 的真实开源网络排查工具：K8s 可观测性、实时 / 离线抓包、Prometheus / NetBox、AIOps 智能诊断 —— 点击卡片查看项目真实 README。
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            {[
              { value: String(projects.length), label: "网络工具", icon: Activity },
              { value: String(mcpCount), label: "MCP 服务器", icon: Activity },
              { value: String(skillCount + agentCount), label: "Skills + Agent", icon: Activity },
              { value: formatStars(projects.reduce((a, p) => a + p.stars, 0)), label: "GitHub 总 Star", icon: Star },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/40">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
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
            placeholder="搜索网络工具名称、owner、主题…"
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
          {areaFilters.map((a) => {
            const Icon = (Icons as any)[a.icon] ?? Icons.Circle;
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border/60 p-16 text-center text-muted-foreground">
            没有匹配的工具，换个关键词试试。
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: GitHubProject }) {
  const area = securityAreas.find((a) => a.slug === project.area);
  const kindLabel = project.kind === "mcp" ? "MCP" : project.kind === "skill" ? "Skill" : "Agent";
  const detailHref = project.kind === "agent" ? `/agents/${project.slug}` : `/mcp/${project.slug}`;

  return (
    <Link
      href={detailHref}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
      aria-label={`查看 ${project.name}（${kindLabel}）的详细 README`}
    >
      <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{project.name}</CardTitle>
            <span className="inline-flex items-center gap-1 text-xs text-foreground/80 shrink-0 tabular-nums">
              <Star className="h-3.5 w-3.5 text-yellow-500 dark:text-yellow-400 fill-yellow-500/20" aria-hidden="true" />
              <span className="font-semibold">{formatStars(project.stars)}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            <Badge className="text-[10px]">{kindLabel}</Badge>
            {area && <Badge className="text-[10px]">{area.name}</Badge>}
            {project.language && <Badge className="text-[10px]">{project.language}</Badge>}
          </div>
          <CardDescription className="mt-2 text-xs line-clamp-3">{project.descriptionCn ?? project.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-1.5 text-xs text-foreground/70 font-mono">
            <Github className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{project.owner}/{project.repo}</span>
          </div>
          {project.installCommand && (
            <code className="block mt-2 px-2 py-1 rounded bg-secondary/60 border border-border/50 text-[10px] font-mono truncate text-foreground/80">
              {project.installCommand}
            </code>
          )}
          <div className="mt-3 flex items-center text-xs text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all duration-200">
            查看真实 README <ExternalLink className="h-3 w-3 ml-1" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
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
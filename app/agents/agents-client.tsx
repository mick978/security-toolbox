"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Search, X, Bot, Star, Github, ExternalLink, Sparkles, ChevronRight, Wrench,
} from "lucide-react";
import { iconByName } from "@/lib/icon-map";

/* Same architecture as app/cheatsheet/page.tsx:
 * 1. Hero — text-only stats (no card surfaces)
 * 2. Area quick-nav chips (anchor scroll into per-area sections)
 * 3. Per-area sections with gradient header + Lucide icon + count chip
 * 4. Card grid — top gradient strip, index #, area chip, install snippet,
 *    topics, footer with stars / repo path / hover-revealed "查看"
 *
 * Compared to the old version this drops the flat surface-card grid and the
 * `surface-hero` panel — neither exists in the cheatsheet reference so the
 * visual systems now agree page to page. */

const AREA_GRADIENTS: Record<string, string> = {
  recon:      "from-blue-500/20 to-cyan-500/20",
  "vuln-scan": "from-yellow-500/20 to-amber-500/20",
  exploit:    "from-red-500/20 to-orange-500/20",
  defense:    "from-green-500/20 to-emerald-500/20",
  incident:   "from-orange-500/20 to-rose-500/20",
  compliance: "from-purple-500/20 to-pink-500/20",
  general:    "from-cyan-500/20 to-sky-500/20",
};

const AREA_BG: Record<string, string> = {
  recon:      "bg-blue-500/10",
  "vuln-scan": "bg-yellow-500/10",
  exploit:    "bg-red-500/10",
  defense:    "bg-green-500/10",
  incident:   "bg-orange-500/10",
  compliance: "bg-purple-500/10",
  general:    "bg-cyan-500/10",
};

export default function AgentsClient() {
  const [q, setQ] = useState("");

  /* Filter projects by search query. Category filtering is a no-op here on
   * purpose: cheatsheet groups by category visually but does not let users
   * "switch category". Users scroll to the area they want; this matches the
   * mental model of a printed catalog more than a faceted dashboard. */
  const filtered = useMemo(() => {
    return agentProjects.filter((a) => {
      if (!q) return true;
      const s = (a.name + a.owner + a.repo + a.description + a.topics.join(" ")).toLowerCase();
      return s.includes(q.toLowerCase());
    });
  }, [q]);

  /* Group projects by area, preserving `securityAreas` order so the surface
   * mirrors the safety workflow (recon → vuln-scan → exploit → defense →
   * incident → compliance). Empty groups are hidden so the user never sees
   * a category header with zero cards. */
  const byArea = useMemo(() => {
    const map = new Map<SecurityArea, GitHubProject[]>();
    for (const p of filtered) {
      const list = map.get(p.area) ?? [];
      list.push(p);
      map.set(p.area, list);
    }
    return securityAreas
      .filter((a) => a.slug !== "general" && map.has(a.slug))
      .map((a) => ({ area: a, projects: map.get(a.slug)! }));
  }, [filtered]);

  const totalStars = agentProjects.reduce((a, p) => a + p.stars, 0);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 rounded-b-2xl">
        <div className="absolute inset-0 hero-gradient-animated opacity-70" aria-hidden="true" />
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
        <div className="container relative py-16 lg:py-20">
          <Badge className="mb-4 border-primary/40 text-primary bg-primary/10">
            <Bot className="h-3 w-3 mr-1" aria-hidden="true" />
            AI 驱动 · 智能化安全
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            网络安全
            <span className="text-primary"> AI Agent</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {agentProjects.length} 个真实开源安全 AI Agent，覆盖信息收集 → 漏洞扫描 → 渗透测试 →
            防御检测 → 应急响应 → 合规审计全流程，点击卡片查看项目真实 README。
          </p>

          {/* Stats — text-only (matches cheatsheet standard) */}
          <div className="mt-block grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 max-w-3xl">
            {[
              { value: agentProjects.length.toString(), label: "安全 AI Agent", icon: Bot },
              { value: String(byArea.length), label: "专业领域",     icon: Sparkles },
              { value: formatStars(totalStars),          label: "GitHub 总 Star", icon: Star },
              { value: "6+",                              label: "覆盖阶段",       icon: Wrench },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <div>
                    <div className="text-xl md:text-2xl font-bold tabular-nums leading-none">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Area quick-nav */}
          <div className="mt-block flex flex-wrap gap-2">
            {byArea.map(({ area, projects }) => {
              const Icon = iconByName(area.icon);
              return (
                <a
                  key={area.slug}
                  href={`#area-${area.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-secondary/30 text-sm hover:border-primary/60 hover:bg-primary/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                  <span>{area.name}</span>
                  <Badge className="ml-1 text-[10px]">{projects.length}</Badge>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search — single field lives above the sections so it doesn't
       *  belong to any one area's filter. Empty q -> show all. */}
      <section className="container pt-block pb-block">
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
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>

      {/* Areas — identical layout to cheatsheet per-category sections */}
      <section className="container pb-section">
        <div className="space-y-16">
          {byArea.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/60 p-16 text-center text-muted-foreground">
              没有匹配的 Agent，换个关键词试试。
            </div>
          )}
          {byArea.map(({ area, projects }) => {
            const Icon = iconByName(area.icon);
            return (
              <section key={area.slug} id={`area-${area.slug}`} className="scroll-mt-20">
                {/* Category header */}
                <div className="relative mb-8 p-6 rounded-xl overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${AREA_GRADIENTS[area.slug] ?? "from-primary/10 to-primary/5"} opacity-50`} />
                  <div className="relative flex items-center gap-4">
                    <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${AREA_BG[area.slug] ?? "bg-primary/10"} border border-border/40`}>
                      {Icon && <Icon className="h-7 w-7 text-foreground/80" aria-hidden="true" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        {area.name}
                        <Badge className="ml-2">{projects.length}</Badge>
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-list">
                  {projects.map((p, idx) => (
                    <AgentCard key={p.slug} project={p} index={idx} areaSlug={area.slug} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function AgentCard({ project, index, areaSlug }: { project: GitHubProject; index: number; areaSlug: string }) {
  /* Severity-style accent strip on every card. Lifts from primary/30 →
   * area color → primary/10, so cards in the same area share a hue but
   * still stand out from one another. Matches cheatsheet `severity` styling. */
  const stripFrom = areaSlug === "exploit"        ? "from-red-500 to-orange-500"
                   : areaSlug === "incident"       ? "from-orange-500 to-rose-500"
                   : areaSlug === "defense"        ? "from-green-500 to-emerald-500"
                   : areaSlug === "compliance"     ? "from-purple-500 to-pink-500"
                   : areaSlug === "vuln-scan"      ? "from-yellow-500 to-amber-500"
                   : areaSlug === "recon"          ? "from-blue-500 to-cyan-500"
                   :                                  "from-primary/50 to-primary/20";
  return (
    <Link
      href={`/agents/${project.slug}`}
      className="group block min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`查看 ${project.name} 的详细 README`}
    >
      <Card className="h-full transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${stripFrom}`} aria-hidden="true" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/50 text-sm font-mono text-muted-foreground shrink-0">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">
                  {project.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {project.description}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-mono text-yellow-700 dark:text-yellow-300 shrink-0">
              <Star className="h-3 w-3 fill-current" aria-hidden="true" /> {formatStars(project.stars)}
            </span>
          </div>
        </CardHeader>

        <div className="px-6 pb-4">
          {/* Topics — tags like cheatsheet */}
          {project.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {project.topics.slice(0, 4).map((t) => (
                <Badge key={t} className="text-[10px] py-0">#{t}</Badge>
              ))}
            </div>
          )}

          {/* Install snippet + copy */}
          {project.installCommand && (
            <div className="group/code mb-3 flex items-center gap-1 rounded-md border border-border/40 bg-secondary/30 px-2 py-1.5 transition-colors group-hover:border-border/70 group-hover:bg-secondary/50">
              <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/80">
                {project.installCommand}
              </code>
              <CopyButton text={project.installCommand} label="复制安装命令" />
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate font-mono text-xs text-muted-foreground">
              <Github className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{project.owner}/{project.repo}</span>
            </span>
            <span className="inline-flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              查看详情
              <ChevronRight className="h-4 w-4 ml-0.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

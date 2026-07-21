"use client";

// /mcp — MCP tools + Agent Skills ecosystem browser.
//
// Architecture intentionally mirrors app/cheatsheet/page.tsx and
// app/agents/agents-client.tsx:
//   1. Hero — text-only stats, gradient bg, area quick-nav chips
//   2. Tabs (MCP / Skills) — same accent-underline pattern used elsewhere
//   3. Search input — single field above the section list
//   4. Per-area sections — each area's gradient header + Lucide icon +
//      count chip, then a 2-column card grid (matches cheatsheet density)
//   5. Card — top severity-style gradient strip + index + area chip +
//      install snippet + topics + footer with stars / repo path / hover
//
// Why the tabs persist: MCP and Skills come from the same GitHub-taxonomy
// tree but the user thinks of them as two distinct ecosystems. Splitting
// them at the data-source level (rather than collapsing into a single
// filter) preserves that mental model without breaking the visual system.

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import {
  mcpProjects,
  skillProjects,
  securityAreas,
  type GitHubProject,
  type SecurityArea,
  formatStars,
} from "@/lib/github-projects";
import {
  Search, X, Wrench, Code, Star, Github, ExternalLink, Sparkles,
  ChevronRight,
} from "lucide-react";
import { iconByName } from "@/lib/icon-map";

/* Area palettes — same hue tokens as cheatsheet's category visuals. These
 * are also referenced by AgentCard and SkillCard below so a single tweak
 * here changes the whole site. */
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

/* Maps each security area to the gradient-bar color pair used on the
 * accent strip atop every card. Defaulting to primary/30 keeps cards in
 * categories we forgot to register still readable. */
const STRIP_GRADIENT: Record<string, string> = {
  "vuln-scan": "from-yellow-500 to-amber-500",
  exploit:    "from-red-500 to-orange-500",
  defense:    "from-green-500 to-emerald-500",
  incident:   "from-orange-500 to-rose-500",
  compliance: "from-purple-500 to-pink-500",
  recon:      "from-blue-500 to-cyan-500",
  general:    "from-cyan-500 to-sky-500",
};

export default function McpSkillsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab: "mcp" | "skills" =
    searchParams.get("tab") === "skills" ? "skills" : "mcp";
  const [activeTab, setActiveTab] = useState<"mcp" | "skills">(initialTab);

  useEffect(() => {
    const t = searchParams.get("tab");
    setActiveTab(t === "skills" ? "skills" : "mcp");
  }, [searchParams]);

  const [q, setQ] = useState("");

  const filteredMcp = useMemo(
    () =>
      mcpProjects.filter((m) => {
        if (q) {
          const s = (m.name + m.owner + m.repo + m.description + m.topics.join(" ")).toLowerCase();
          if (!s.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [q],
  );
  const filteredSkills = useMemo(
    () =>
      skillProjects.filter((s) => {
        if (q) {
          const str = (s.name + s.owner + s.repo + s.description + s.topics.join(" ")).toLowerCase();
          if (!str.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [q],
  );

  /* Pick the active list and partition by area. Empty groups hidden so the
   * page never shows a category header with zero cards below it. */
  const activeList = activeTab === "mcp" ? filteredMcp : filteredSkills;
  const byArea = useMemo(() => {
    const map = new Map<SecurityArea, GitHubProject[]>();
    for (const p of activeList) {
      const list = map.get(p.area) ?? [];
      list.push(p);
      map.set(p.area, list);
    }
    return securityAreas
      .filter((a) => map.has(a.slug))
      .map((a) => ({ area: a, projects: map.get(a.slug)! }));
  }, [activeList]);

  const totalStars = mcpProjects.reduce((a, p) => a + p.stars, 0) +
                     skillProjects.reduce((a, p) => a + p.stars, 0);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 rounded-b-2xl">
        <div className="absolute inset-0 hero-gradient-animated opacity-70" aria-hidden="true" />
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
        <div className="container relative py-16 lg:py-20">
          <Badge className="mb-4 border-primary/40 text-primary bg-primary/10">
            <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
            MCP 工具 · Skills 技能
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            安全工具
            <span className="text-primary"> 生态系统</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {mcpProjects.length + skillProjects.length} 个真实开源项目，覆盖 MCP 服务器与 Agent Skills（SKILL.md）。
            点击卡片查看项目真实 README 介绍。
          </p>

          {/* Stats — text-only (matches cheatsheet / agents standard) */}
          <div className="mt-block grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 max-w-3xl">
            {[
              { value: mcpProjects.length.toString(),  label: "MCP 服务器",   icon: Wrench },
              { value: skillProjects.length.toString(), label: "Agent Skills", icon: Code },
              { value: String(byArea.length),            label: "专业领域",     icon: Sparkles },
              { value: formatStars(totalStars),          label: "GitHub 总 Star", icon: Star },
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

          {/* Area quick-nav (recomputed when the tab changes) */}
          <div className="mt-block flex flex-wrap gap-2">
            {byArea.map(({ area, projects }) => {
              const Icon = iconByName(area.icon);
              return (
                <a
                  key={area.slug}
                  href={`#mcp-area-${area.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-secondary/30 text-sm hover:border-primary/60 hover:bg-primary/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                  <span>{area.name}</span>
                  <Badge className="ml-1 text-[10px]">{projects.length}</Badge>
                </a>
              );
            })}
          </div>

          {/* Tabs — accent underline indicator (matches cheatsheet tab style
           * with the same `.tab-underline` global class). */}
          <div className="mt-block flex items-center gap-1 border-b border-border/60">
            {[
              { key: "mcp" as const,    label: "MCP 工具", count: mcpProjects.length,    icon: Wrench },
              { key: "skills" as const, label: "Skills 技能", count: skillProjects.length, icon: Code },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setQ("");
                    router.replace(tab.key === "skills" ? `${pathname}?tab=skills` : pathname, { scroll: false });
                  }}
                  data-active={isActive}
                  className={cn(
                    "tab-underline inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                  <span
                    className={cn(
                      "ml-1 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                      isActive ? "bg-primary/15 text-primary" : "bg-secondary/40 text-muted-foreground",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="container pt-block pb-block">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={activeTab === "mcp" ? "搜索 MCP 名称、owner、主题…" : "搜索 Skills 名称、owner、主题…"}
            className="w-full h-12 pl-12 pr-10 rounded-lg border border-border/60 bg-secondary/30 text-sm outline-none focus:border-primary/60 transition-colors"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>

      {/* Areas */}
      <section className="container pb-section">
        <div className="space-y-16">
          {byArea.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/60 p-16 text-center text-muted-foreground">
              没有匹配的项目，换个关键词试试。
            </div>
          )}
          {byArea.map(({ area, projects }) => {
            const Icon = iconByName(area.icon);
            return (
              <section key={area.slug} id={`mcp-area-${area.slug}`} className="scroll-mt-20">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-list">
                  {projects.map((p, idx) => (
                    <ProjectCard key={p.slug} project={p} index={idx} areaSlug={area.slug} />
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

function ProjectCard({ project, index, areaSlug }: { project: GitHubProject; index: number; areaSlug: string }) {
  const stripFrom = STRIP_GRADIENT[areaSlug] ?? "from-primary/50 to-primary/20";
  return (
    <Link
      href={`/mcp/${project.slug}`}
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
          {project.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {project.topics.slice(0, 4).map((t) => (
                <Badge key={t} className="text-[10px] py-0">#{t}</Badge>
              ))}
            </div>
          )}

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

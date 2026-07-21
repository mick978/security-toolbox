"use client";

// /mcp — MCP tools + Agent Skills catalog page.
//
// Architecture mirrors app/agents/agents-client.tsx and the cheatsheet
// page; only difference: we keep the MCP/Skills tab because users think
// of the two catalogs as different ecosystems. Re-render the same
// per-area sections for whichever tab is active.
//
// Visual contract:
//   1. Hero: badge + gradient title + TL;DR + text-only stats + area
//      quick-nav pills + tab underline
//   2. Search (single field, reset on tab switch)
//   3. Per-area sections using shared card / palette tokens
//
// Card rendering reuses components/explore-card so the three catalogs
// (cheatsheet, agents, mcp) read as siblings.

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
  Search, X, Wrench, Code, Star, Sparkles,
} from "lucide-react";
import { iconByName } from "@/lib/icon-map";
import { exploreBg, exploreGradient } from "@/lib/explore-palette";
import { ExploreCard } from "@/components/explore-card";

export default function McpSkillsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab: "mcp" | "skills" =
    searchParams.get("tab") === "skills" ? "skills" : "mcp";
  const [activeTab, setActiveTab] = useState<"mcp" | "skills">(initialTab);

  /* Keep tab state in lockstep with URL — back/forward, deep-links,
   * and post-detail-back navigation all just work. */
  useEffect(() => {
    setActiveTab(searchParams.get("tab") === "skills" ? "skills" : "mcp");
  }, [searchParams]);

  const [q, setQ] = useState("");

  const filteredMcp = useMemo(() => {
    if (!q) return mcpProjects;
    const needle = q.toLowerCase();
    return mcpProjects.filter((m) => {
      const s = (m.name + m.owner + m.repo + m.description + m.topics.join(" ")).toLowerCase();
      return s.includes(needle);
    });
  }, [q]);
  const filteredSkills = useMemo(() => {
    if (!q) return skillProjects;
    const needle = q.toLowerCase();
    return skillProjects.filter((s) => {
      const str = (s.name + s.owner + s.repo + s.description + s.topics.join(" ")).toLowerCase();
      return str.includes(needle);
    });
  }, [q]);

  const activeList = activeTab === "mcp" ? filteredMcp : filteredSkills;

  /* Group active list by area, preserving `securityAreas` order.
   * Skills can land in `general` (mixed-domain skill packs) — we keep
   * that bucket visible but at the bottom. Empty groups hidden. */
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

          {/* Gradient + glow on the second title line — same recipe as
              app/page.tsx + app/agents. Cross-page identity unmissable. */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            安全工具
            <span className="block mt-2 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent [text-shadow:_0_0_24px_hsl(var(--primary)/0.35)]">
              生态系统
            </span>
          </h1>

          {/* TL;DR — italic lede with two emphasized keyword spans, same
              rhythm used across the hero on home / cheatsheet / agents. */}
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            {mcpProjects.length + skillProjects.length} 个真实开源项目 · 覆盖
            <span className="text-foreground font-medium"> MCP 服务器</span> 与
            <span className="text-foreground font-medium"> Agent Skills（SKILL.md）</span>，
            <span className="text-foreground font-medium"> 点击卡片查看真实 README</span>。
          </p>

          {/* Stats — text-only (matches cheatsheet / agents standard). */}
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

          {/* Area quick-nav — recomputed when the tab flips. */}
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

          {/* Tab strip — same `.tab-underline` global class used in the
              existing cheatsheet / tools filters. */}
          <div className="mt-block flex items-center gap-1 border-b border-border/60">
            {[
              { key: "mcp" as const,    label: "MCP 工具",   count: mcpProjects.length,    icon: Wrench },
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

      {/* Per-area sections */}
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
                  <div className={`absolute inset-0 bg-gradient-to-r ${exploreGradient(area.slug)} opacity-50`} />
                  <div className="relative flex items-center gap-4">
                    <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${exploreBg(area.slug)} border border-border/40`}>
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
                    <ExploreCard
                      key={p.slug}
                      index={idx}
                      hrefPrefix="/mcp"
                      hrefSlug={p.slug}
                      title={p.name}
                      description={p.description}
                      areaSlug={p.area}
                      stars={p.stars}
                      owner={p.owner}
                      repo={p.repo}
                      topics={p.topics}
                      installCommand={p.installCommand}
                    />
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

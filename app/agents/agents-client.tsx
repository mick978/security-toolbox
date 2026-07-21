"use client";

// /agents — AI Agent catalog page.
//
// Visual contract — mirrors app/cheatsheet/page.tsx:
//   1. Hero: badge + gradient title + TL;DR + text-only stats + area quick-nav
//   2. Single search field
//   3. Per-area sections with gradient header + Lucide icon + count
//   4. Standardized card grid via components/explore-card
//
// All color tokens come from lib/explore-palette — that file is the only
// place where the hue per `SecurityArea` lives. Tweak there to retheme
// the entire catalog.

import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  agentProjects,
  securityAreas,
  type GitHubProject,
  type SecurityArea,
  formatStars,
} from "@/lib/github-projects";
import {
  Search, X, Bot, Star, Sparkles, Wrench,
} from "lucide-react";
import { iconByName } from "@/lib/icon-map";
import { exploreBg, exploreGradient } from "@/lib/explore-palette";
import { ExploreCard } from "@/components/explore-card";

const areas = securityAreas.filter((a) => a.slug !== "general");

export default function AgentsClient() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q) return agentProjects;
    const needle = q.toLowerCase();
    return agentProjects.filter((a) => {
      const s = (a.name + a.owner + a.repo + a.description + a.topics.join(" ")).toLowerCase();
      return s.includes(needle);
    });
  }, [q]);

  /* Group projects by area, preserving `securityAreas` order so the
   * surface reads as a workflow (recon → vuln-scan → exploit → defense
   * → incident → compliance). Empty groups are hidden so the user
   * never sees a category header with zero cards. */
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

          {/* Gradient + glow on the second title line — same recipe as
              app/page.tsx so cross-page identity is unmissable. */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            网络安全
            <span className="block mt-2 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent [text-shadow:_0_0_24px_hsl(var(--primary)/0.35)]">
              AI Agent 矩阵
            </span>
          </h1>

          {/* TL;DR — italic lede in a primary-tinted box, same rhythm
              as the TL;DR card on each cheatsheet detail page. */}
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            {agentProjects.length} 个真实开源安全 AI Agent · 覆盖
            <span className="text-foreground font-medium"> 信息收集 → 漏洞扫描 → 渗透测试 → 防御检测 → 应急响应 → 合规审计 </span>
            全流程，<span className="text-foreground font-medium">点击卡片查看真实 README</span>。
          </p>

          {/* Stats — text-only (matches cheatsheet / home standard). */}
          <div className="mt-block grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 max-w-3xl">
            {[
              { value: agentProjects.length.toString(), label: "安全 AI Agent", icon: Bot },
              { value: String(byArea.length),            label: "专业领域",     icon: Sparkles },
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

          {/* Area quick-nav — pills that scroll-jump into each section. */}
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

      {/* Search */}
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

      {/* Per-area sections — one block per area, header with gradient
          strip + icon tile + count, then a 2-col card grid. */}
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
                      hrefPrefix="/agents"
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

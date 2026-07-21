"use client";

// /agents — AI Agent catalog page.
//
// Architecture mirrors app/cheatsheet/page.tsx. The Hero, Search and
// per-area Section shells are all in /components/explore-*; this file
// only owns data wiring + the card-grid body.

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  agentProjects,
  securityAreas,
  type GitHubProject,
  type SecurityArea,
  formatStars,
} from "@/lib/github-projects";
import { Bot, Star, Sparkles, Wrench } from "lucide-react";
import { iconByName } from "@/lib/icon-map";
import { ExploreCard } from "@/components/explore-card";
import { ExploreHero, ExploreHeroBadge } from "@/components/explore-hero";
import { ExploreSearch } from "@/components/explore-search";
import { ExploreSection } from "@/components/explore-section";
import { EmptyResults } from "@/components/empty-results";

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
      <ExploreHero
        badge={<ExploreHeroBadge icon={Bot}>AI 驱动 · 智能化安全</ExploreHeroBadge>}
        titleLine1="网络安全"
        titleLine2="AI Agent 矩阵"
        tldr={
          <>
            {agentProjects.length} 个真实开源安全 AI Agent · 覆盖
            <span className="text-foreground font-medium"> 信息收集 → 漏洞扫描 → 渗透测试 → 防御检测 → 应急响应 → 合规审计 </span>
            全流程，<span className="text-foreground font-medium">点击卡片查看真实 README</span>。
          </>
        }
        stats={[
          { value: agentProjects.length.toString(), label: "安全 AI Agent", icon: Bot },
          { value: String(byArea.length),            label: "专业领域",     icon: Sparkles },
          { value: formatStars(totalStars),          label: "GitHub 总 Star", icon: Star },
          { value: "6+",                              label: "覆盖阶段",     icon: Wrench },
        ]}
        quickNav={byArea.map(({ area, projects }) => ({
          label: area.name,
          href: `#area-${area.slug}`,
          icon: iconByName(area.icon),
          count: projects.length,
        }))}
      />

      <section className="container pt-block pb-block">
        <ExploreSearch
          value={q}
          onChange={setQ}
          placeholder="搜索 Agent 名称、owner、主题…"
        />
      </section>

      <section className="container pb-section">
        <div className="space-y-16">
          {byArea.length === 0 && (
            <EmptyResults
              title="没找到匹配 Agent"
              hint="按场景分类或换关键词试试。常用：信息收集 / 漏洞扫描 / 渗透测试 / 防御检测 / 应急响应 / 合规。"
              suggestions={[
                { label: "信息收集", href: "/agents?cat=recon" },
                { label: "漏洞扫描", href: "/agents?cat=vuln-scan" },
                { label: "渗透测试", href: "/agents?cat=exploit" },
                { label: "应急响应", href: "/agents?cat=incident" },
              ]}
            />
          )}
          {byArea.map(({ area, projects }) => (
            <ExploreSection
              key={area.slug}
              id={`area-${area.slug}`}
              areaSlug={area.slug}
              title={area.name}
              icon={iconByName(area.icon) ?? Bot}
              count={projects.length}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-list">
                {projects.map((p, idx) => (
                  <ExploreCard
                    key={p.slug}
                    index={idx}
                    hrefPrefix="/agents"
                    hrefSlug={p.slug}
                    title={p.name}
                    description={p.description}
                    areaSlug={p.area}
                    areaName={area.name}
                    stars={p.stars}
                    owner={p.owner}
                    repo={p.repo}
                    topics={p.topics}
                    installCommand={p.installCommand}
                  />
                ))}
              </div>
            </ExploreSection>
          ))}
        </div>
      </section>
    </div>
  );
}

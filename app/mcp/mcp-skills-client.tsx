"use client";

// /mcp — MCP + Agent Skills catalog.
//
// Same architecture as /agents; the only addition is a tab strip
// (MCP / Skills) handed to <ExploreHero />. Card + palette + section
// shells all reuse /components/explore-*.

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Sparkles, Wrench, Code, Star } from "lucide-react";
import {
  mcpProjects,
  skillProjects,
  securityAreas,
  type GitHubProject,
  type SecurityArea,
  formatStars,
} from "@/lib/github-projects";
import { iconByName } from "@/lib/icon-map";
import { ExploreCard } from "@/components/explore-card";
import { ExploreHero, ExploreHeroBadge } from "@/components/explore-hero";
import { ExploreSearch } from "@/components/explore-search";
import { ExploreSection } from "@/components/explore-section";

export default function McpSkillsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab: "mcp" | "skills" =
    searchParams.get("tab") === "skills" ? "skills" : "mcp";
  const [activeTab, setActiveTab] = useState<"mcp" | "skills">(initialTab);

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
      <ExploreHero
        badge={<ExploreHeroBadge icon={Sparkles}>MCP 工具 · Skills 技能</ExploreHeroBadge>}
        titleLine1="安全工具"
        titleLine2="生态系统"
        tldr={
          <>
            {mcpProjects.length + skillProjects.length} 个真实开源项目 · 覆盖
            <span className="text-foreground font-medium"> MCP 服务器</span> 与
            <span className="text-foreground font-medium"> Agent Skills（SKILL.md）</span>，
            <span className="text-foreground font-medium"> 点击卡片查看真实 README</span>。
          </>
        }
        stats={[
          { value: mcpProjects.length.toString(),  label: "MCP 服务器",   icon: Wrench },
          { value: skillProjects.length.toString(), label: "Agent Skills", icon: Code },
          { value: String(byArea.length),            label: "专业领域",     icon: Sparkles },
          { value: formatStars(totalStars),          label: "GitHub 总 Star", icon: Star },
        ]}
        quickNav={byArea.map(({ area, projects }) => ({
          label: area.name,
          href: `#mcp-area-${area.slug}`,
          icon: iconByName(area.icon),
          count: projects.length,
        }))}
        tabs={{
          active: activeTab,
          onChange: (key) => {
            const next = key as "mcp" | "skills";
            setActiveTab(next);
            setQ("");
            router.replace(next === "skills" ? `${pathname}?tab=skills` : pathname, { scroll: false });
          },
          items: [
            { key: "mcp",    label: "MCP 工具",   count: mcpProjects.length,    icon: Wrench },
            { key: "skills", label: "Skills 技能", count: skillProjects.length, icon: Code },
          ],
        }}
      />

      <section className="container pt-block pb-block">
        <ExploreSearch
          value={q}
          onChange={setQ}
          placeholder={activeTab === "mcp" ? "搜索 MCP 名称、owner、主题…" : "搜索 Skills 名称、owner、主题…"}
        />
      </section>

      <section className="container pb-section">
        <div className="space-y-16">
          {byArea.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/60 p-16 text-center text-muted-foreground">
              没有匹配的项目，换个关键词试试。
            </div>
          )}
          {byArea.map(({ area, projects }) => (
            <ExploreSection
              key={area.slug}
              id={`mcp-area-${area.slug}`}
              areaSlug={area.slug}
              title={area.name}
              icon={iconByName(area.icon) ?? Wrench}
              count={projects.length}
            >
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

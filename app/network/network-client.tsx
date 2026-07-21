"use client";

// /network — Network observability catalog.
//
// Brought up to the same standard as /cheatsheet / /agents / /mcp via
// ExploreHero / ExploreSearch / ExploreSection + ExploreCard.

import { useState, useMemo } from "react";
import { SecurityArea } from "@/lib/github-projects";
import { getNetworkProjects, securityAreas, formatStars } from "@/lib/github-projects";
import { Activity, Wrench, Code, Star, Network } from "lucide-react";
import { iconByName } from "@/lib/icon-map";
import { ExploreCard } from "@/components/explore-card";
import { ExploreHero, ExploreHeroBadge } from "@/components/explore-hero";
import { ExploreSearch } from "@/components/explore-search";
import { ExploreSection } from "@/components/explore-section";
import { EmptyResults } from "@/components/empty-results";

const projects = getNetworkProjects();

const areaFilters = securityAreas.filter(
  (a) => a.slug === "recon" || a.slug === "incident" || a.slug === "defense" || a.slug === "compliance" || a.slug === "general",
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
  const totalStars = projects.reduce((a, p) => a + p.stars, 0);

  /* Group filtered projects by area so we render per-area sections
   * — same pattern used on /cheatsheet / /agents / /mcp. */
  const byArea = useMemo(() => {
    const map = new Map<SecurityArea, typeof projects>();
    for (const p of filtered) {
      const list = map.get(p.area) ?? [];
      list.push(p);
      map.set(p.area, list);
    }
    return areaFilters
      .filter((a) => map.has(a.slug))
      .map((a) => ({ area: a, projects: map.get(a.slug)! }));
  }, [filtered]);

  return (
    <div className="min-h-screen">
      <ExploreHero
        badge={<ExploreHeroBadge icon={Activity}>网络自动化排查</ExploreHeroBadge>}
        titleLine1="网络"
        titleLine2="自动化排查工具集"
        tldr={
          <>
            {projects.length} 个 GitHub 真实开源网络排查工具 · 覆盖
            <span className="text-foreground font-medium"> K8s 可观测性 / 实时抓包 / Prometheus · NetBox / AIOps 智能诊断</span>，
            <span className="text-foreground font-medium"> 点击卡片查看真实 README</span>。
          </>
        }
        stats={[
          { value: String(projects.length),         label: "网络工具",     icon: Network },
          { value: String(mcpCount),                 label: "MCP 服务器",   icon: Wrench },
          { value: String(skillCount + agentCount),  label: "Skills + Agent", icon: Code },
          { value: formatStars(totalStars),          label: "GitHub 总 Star", icon: Star },
        ]}
        quickNav={byArea.map(({ area, projects }) => ({
          label: area.name,
          href: `#network-area-${area.slug}`,
          icon: iconByName(area.icon),
          count: projects.length,
        }))}
      />

      <section className="container pt-block pb-block">
        <ExploreSearch
          value={q}
          onChange={setQ}
          placeholder="搜索网络工具名称、owner、主题…"
        />
      </section>

      <section className="container pb-section">
        <div className="space-y-16">
          {byArea.length === 0 && (
            <EmptyResults
              title="没找到匹配工具"
              hint="网络排查工具多用于 K8s / 抓包 / AIOps。试试按领域。"
              suggestions={[
                { label: "K8s 可观测", href: "/network?q=k8s" },
                { label: "实时抓包",   href: "/network?q=tcpdump" },
                { label: "AIOps 诊断", href: "/network?q=aiops" },
                { label: "应急响应",   href: "/network?q=incident" },
              ]}
            />
          )}
          {byArea.map(({ area, projects }) => (
            <ExploreSection
              key={area.slug}
              id={`network-area-${area.slug}`}
              areaSlug={area.slug}
              title={area.name}
              icon={iconByName(area.icon) ?? Activity}
              count={projects.length}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-list">
                {projects.map((p, idx) => {
                  /* MCP skills land on /mcp/<slug>; agents on /agents/<slug>;
                   * everything else from the network catalog also lives on
                   * /mcp/<slug> because that's the route the catalog
                   * already exposes. */
                  const hrefPrefix = p.kind === "agent" ? "/agents" : "/mcp";
                  return (
                    <ExploreCard
                      key={p.slug}
                      index={idx}
                      hrefPrefix={hrefPrefix as "/agents" | "/mcp"}
                      hrefSlug={p.slug}
                      title={p.name}
                      description={p.descriptionCn ?? p.description}
                      areaSlug={p.area}
                      areaName={area.name}
                      stars={p.stars}
                      owner={p.owner}
                      repo={p.repo}
                      topics={p.topics}
                      installCommand={p.installCommand}
                    />
                  );
                })}
              </div>
            </ExploreSection>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

// /mcp — MCP tools + Agent Skills ecosystem browser.
//
// Layout:
//   1. Hero: badge + headline + lede + 4 stat cards + sparkline (star dist)
//   2. Tabs: MCP / Skills with animated underline indicator
//   3. Search input
//   4. Category chips: 6 security areas with icons, single-select
//   5. Project grid: cards with area-accent strip, copy-button, hover lift

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
  Search,
  X,
  Wrench,
  Code,
  Star,
  Github,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { iconByName } from "@/lib/icon-map";

const areas = securityAreas.filter((a) => a.slug !== "general");

export default function McpSkillsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab: "mcp" | "skills" =
    searchParams.get("tab") === "skills" ? "skills" : "mcp";
  const [activeTab, setActiveTab] = useState<"mcp" | "skills">(initialTab);

  // Keep state in sync if the user navigates with browser back/forward or
  // arrives on /mcp?tab=skills after clicking the detail back-link.
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "skills") setActiveTab("skills");
    else setActiveTab("mcp");
  }, [searchParams]);
  const [cat, setCat] = useState<SecurityArea | "all">("all");
  const [q, setQ] = useState("");

  const filteredMcp = useMemo(() => {
    return mcpProjects.filter((m) => {
      if (cat !== "all" && m.area !== cat) return false;
      if (q) {
        const s = (m.name + m.owner + m.repo + m.description + m.topics.join(" ")).toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [cat, q]);

  const filteredSkills = useMemo(() => {
    return skillProjects.filter((s) => {
      if (cat !== "all" && s.area !== cat && s.area !== "general") return false;
      if (q) {
        const str = (s.name + s.owner + s.repo + s.description + s.topics.join(" ")).toLowerCase();
        if (!str.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [cat, q]);

  const list = activeTab === "mcp" ? filteredMcp : filteredSkills;
  const totalStars = mcpProjects.reduce((a, p) => a + p.stars, 0) + skillProjects.reduce((a, p) => a + p.stars, 0);

  return (
    <div className="container py-10">
      {/* ───────── Hero ───────── */}
      <section className="surface-hero relative mb-10 overflow-hidden rounded-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="absolute inset-0 hero-gradient-animated opacity-60" aria-hidden="true" />
        <div className="absolute inset-0 grid-bg opacity-25" aria-hidden="true" />

        <div className="relative">
          <Badge className="mb-5 border-primary/40 bg-primary/10 text-primary">
            <Sparkles className="mr-1 h-3 w-3" />
            MCP 工具 · Skills 技能
          </Badge>

          <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl">
            安全工具
            <span className="ml-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              生态系统
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            来自 GitHub 的真实开源项目，覆盖 MCP 服务器与 Agent Skills（SKILL.md）。点击卡片查看项目真实 README 介绍。
          </p>

          {/* Stats — 4 KPIs with subtle accent underlines. The sparkline at the
           * bottom is a static decorative curve; if we ever wire it to live
           * data, swap the gradient stop positions. */}
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 max-w-3xl">
            {[
              { value: mcpProjects.length.toString(), label: "MCP 服务器", icon: Wrench },
              { value: skillProjects.length.toString(), label: "Agent Skills", icon: Code },
              { value: String(areas.length), label: "专业领域", icon: Sparkles },
              { value: formatStars(totalStars), label: "GitHub 总 Star", icon: Star, accent: true },
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

      {/* ───────── Tabs ───────── */}
      <div className="mb-6 flex items-center gap-1 border-b border-border/60">
        {[
          { key: "mcp" as const, label: "MCP 工具", count: mcpProjects.length, icon: Wrench },
          { key: "skills" as const, label: "Skills 技能", count: skillProjects.length, icon: Code },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCat("all");
                router.replace(tab.key === "skills" ? `${pathname}?tab=skills` : pathname, { scroll: false });
              }}
              data-active={isActive}
              className={cn(
                "tab-underline inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
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

      {/* ───────── Search + Filters ───────── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索名称、owner、主题…"
            className="h-10 w-full rounded-lg border border-border/60 bg-background/40 pl-10 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60 focus:bg-background/60"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="清空搜索"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip active={cat === "all"} onClick={() => setCat("all")}>
            全部
          </FilterChip>
          {areas.map((a) => {
            const Icon = iconByName(a.icon);
            return (
              <FilterChip
                key={a.slug}
                active={cat === a.slug}
                onClick={() => setCat(a.slug)}
                icon={<Icon className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                {a.name}
              </FilterChip>
            );
          })}
        </div>
      </div>

      {/* ───────── Grid ───────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-list">
        {list.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
        {list.length === 0 && (
          <div className="surface-card col-span-full rounded-xl border border-dashed border-border/60 p-16 text-center text-muted-foreground">
            没有匹配的项目，换个关键词试试。
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: GitHubProject }) {
  const area = securityAreas.find((a) => a.slug === project.area);
  return (
    <Link
      href={`/mcp/${project.slug}`}
      className="group block min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`查看 ${project.name} 的详细 README`}
    >
      <article className="surface-card relative flex h-full flex-col overflow-hidden rounded-xl pl-4 pr-4 py-4">
        {/* Area accent strip — 3px vertical bar in the area's hue. */}
        <div
          className={cn("absolute left-0 top-0 bottom-0 w-[3px]", area?.bg ?? "bg-primary/30")}
          aria-hidden="true"
        />

        {/* Header: title + star count (top-right). Title clamps to 2 lines;
         * we drop the language badge to a meta line so the visual hierarchy
         * reads: title → area → description → install (1 line) → repo. */}
        <header className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
            {project.name}
          </h3>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-yellow-500/30 text-yellow-500 dark:text-yellow-400" aria-hidden="true" />
            <span className="font-medium text-foreground/80">{formatStars(project.stars)}</span>
          </span>
        </header>

        {/* Meta line: area chip + language, kept on one row with truncation. */}
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

        {/* Description — 3 lines max. */}
        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {/* Install command + copy button. The box is dim by default and only
         * brightens on hover so it doesn't compete with the title. */}
        {project.installCommand && (
          <div className="group/code mt-3 flex items-center gap-1 rounded-md border border-border/40 bg-secondary/30 px-2 py-1.5 transition-colors group-hover:border-border/70 group-hover:bg-secondary/50">
            <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/80">
              {project.installCommand}
            </code>
            <CopyButton text={project.installCommand} label="复制安装命令" />
          </div>
        )}

        {/* Footer: repo path + "open" indicator (visible on hover). */}
        <footer className="mt-3 flex items-center justify-between gap-2 border-t border-border/40 pt-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate font-mono text-[11px] text-muted-foreground">
            <Github className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{project.owner}/{project.repo}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1">
            查看
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </span>
        </footer>
      </article>
    </Link>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all",
        active
          ? "border-primary/50 bg-primary/15 text-primary shadow-[inset_0_1px_0_hsl(var(--primary)/0.15)]"
          : "border-border/60 bg-background/30 text-muted-foreground hover:border-border hover:bg-background/60 hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

// keep Card import in case future regressions need it
void Card; void CardHeader; void CardTitle; void CardDescription; void CardContent; void Badge;
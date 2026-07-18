"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import { Search, X, Wrench, Code, Star, Github, ExternalLink } from "lucide-react";

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

  return (
    <div className="container py-10">
      {/* Hero */}
      <section className="relative mb-12 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="relative">
          <Badge className="mb-4 border-primary/40 text-primary bg-primary/10">
            <Wrench className="h-3 w-3 mr-1" />
            MCP 工具 · Skills 技能
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            安全工具
            <span className="text-primary"> 生态系统</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            来自 GitHub 的真实开源项目，覆盖 MCP 服务器与 Agent Skills（SKILL.md）。
            点击卡片查看项目真实 README 介绍。
          </p>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            {[
              { value: mcpProjects.length.toString(), label: "MCP 服务器", icon: Wrench },
              { value: skillProjects.length.toString(), label: "Agent Skills", icon: Code },
              { value: String(areas.length), label: "专业领域", icon: Code },
              { value: formatStars(mcpProjects.reduce((a, p) => a + p.stars, 0) + skillProjects.reduce((a, p) => a + p.stars, 0)), label: "GitHub 总 Star", icon: Star },
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setActiveTab("mcp");
            setCat("all");
            router.replace(pathname, { scroll: false });
          }}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "mcp" ? "bg-primary text-primary-foreground" : "bg-secondary/30 text-muted-foreground hover:text-foreground"
          )}
        >
          <Wrench className="h-4 w-4 inline mr-1.5" />
          MCP 工具 ({mcpProjects.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("skills");
            setCat("all");
            router.replace(`${pathname}?tab=skills`, { scroll: false });
          }}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "skills" ? "bg-primary text-primary-foreground" : "bg-secondary/30 text-muted-foreground hover:text-foreground"
          )}
        >
          <Code className="h-4 w-4 inline mr-1.5" />
          Skills 技能 ({skillProjects.length})
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索名称、owner、主题…"
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
        {list.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
        {list.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border/60 p-16 text-center text-muted-foreground">
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
    <Link href={`/mcp/${project.slug}`} className="group">
      <Card className="h-full hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 transition-all">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{project.name}</CardTitle>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Star className="h-3.5 w-3.5" />
              {formatStars(project.stars)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {area && <Badge className="text-[10px]">{area.name}</Badge>}
            {project.language && <Badge className="text-[10px]">{project.language}</Badge>}
          </div>
          <CardDescription className="mt-2 text-xs line-clamp-3">{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Github className="h-3 w-3" />
            <span className="font-mono truncate">{project.owner}/{project.repo}</span>
          </div>
          {project.installCommand && (
            <code className="block mt-2 px-2 py-1 rounded bg-secondary/50 border border-border/40 text-[10px] font-mono truncate">
              {project.installCommand}
            </code>
          )}
          <div className="mt-3 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            查看真实 README <ExternalLink className="h-3 w-3 ml-1" />
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

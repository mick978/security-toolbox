import Link from "next/link";
import {
  ArrowLeft, GitBranch, Star, ExternalLink, Terminal, Languages,
  Calendar, Wrench, Lightbulb, Sparkles, FileCode, AlertTriangle, Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/markdown";
import { FavoriteButton } from "@/components/favorites-provider";
import {
  type GitHubProject,
  securityAreas,
  formatStars,
} from "@/lib/github-projects";
import { exploreBg, exploreGradient } from "@/lib/explore-palette";

interface ProjectDetailProps {
  project: GitHubProject;
  /** Pre-fetched README (or null on failure). Passed from the server route. */
  readme: string | null;
}

export async function ProjectDetail({ project, readme }: ProjectDetailProps) {
  const area = securityAreas.find((a) => a.slug === project.area);
  const areaName = area?.name ?? project.kind === "agent" ? "AI Agent" : "MCP 工具";

  return (
    <article className="space-y-8">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border/60 pb-6">
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${exploreGradient(project.area)} opacity-50`} aria-hidden="true" />

        <div className="pt-6 space-y-4">
          <Link
            href={project.kind === "agent" ? "/agents" : "/mcp"}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md px-2 py-1"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> 返回 {project.kind === "agent" ? "AI Agent" : "MCP"} 列表
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{project.kind === "agent" ? "AI Agent" : project.kind === "skill" ? "Skills" : "MCP"}</span>
            <span>›</span>
            {area && (
              <Badge className="text-[10px]">{area.name}</Badge>
            )}
            {project.language && (
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-primary/70" />
                {project.language}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5" aria-hidden="true" />
              {formatStars(project.stars)}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold break-words">{project.name}</h1>

          {/* TL;DR — italic lede with lightbulb accent. Mirrors cheatsheet
              detail hero treatment exactly. */}
          {project.description && (
            <div className="flex items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
              <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-sm md:text-base text-foreground/90 italic leading-relaxed">
                {project.description}
              </p>
            </div>
          )}

          {/* Meta chip row — same recipe used by cheatsheet detail. */}
          <div className="flex flex-wrap items-center gap-2.5">
            {project.kind === "agent" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span className="font-medium">AI Agent</span>
              </span>
            )}
            {project.language && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-xs font-mono">
                <FileCode className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {project.language}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5" aria-hidden="true" />
              {formatStars(project.stars)} stars
            </span>
            {project.installCommand && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
                提供安装命令
              </span>
            )}
            <FavoriteButton
              kind="project"
              slug={`${project.owner}/${project.repo}`}
              label={project.name}
              hint={project.description}
              className="w-9 h-9 min-h-0 min-w-0"
            />
          </div>

          {/* GitHub link + install snippet — visual pairing, like
              cheatsheet step cards. */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors min-w-0 max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Star className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="font-mono truncate">{project.owner}/{project.repo}</span>
              <ExternalLink className="h-3 w-3 ml-0.5 shrink-0" aria-hidden="true" />
            </a>
            {project.installCommand && (
              <code className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/50 border border-border/60 text-xs font-mono break-all min-w-0 max-w-full">
                <Terminal className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                <span className="break-all">{project.installCommand}</span>
              </code>
            )}
          </div>

          {/* Topic tags — same chip style as cheatsheet / agents list. */}
          {project.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.topics.slice(0, 12).map((t) => (
                <Badge key={t} className="text-[10px]">#{t}</Badge>
              ))}
            </div>
          )}

          {/* Notable / Why we included this — same cheatsheet-level
              "secondary highlight" treatment. */}
          {project.notable && (
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-sm text-muted-foreground">
              <span className="text-foreground font-medium inline-flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                为什么收录：
              </span>
              {project.whyCn ?? project.notable}
            </div>
          )}
        </div>
      </header>

      {/* Chinese overview — prepended above the English README. */}
      {project.descriptionCn && (
        <section className="rounded-lg border border-primary/30 bg-primary/5 p-5 space-y-2">
          <h2 className="text-base font-semibold flex items-center gap-2 text-primary">
            <Languages className="h-4 w-4" aria-hidden="true" />
            中文概述
          </h2>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {project.descriptionCn}
          </p>
        </section>
      )}

      {/* README or fallback */}
      <section className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
            {project.kind === "skill" ? "SKILL.md / README" : "README"}
          </h2>
          <span className="text-xs text-muted-foreground break-all">
            来源：<a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary break-all">github.com/{project.owner}/{project.repo}</a>
          </span>
        </div>

        <div className="min-w-0 overflow-hidden">
          {readme ? (
            <Markdown source={readme} project={project} />
          ) : (
            <Fallback project={project} />
          )}
        </div>
      </section>
    </article>
  );
}

function Fallback({ project }: { project: GitHubProject }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 p-6 space-y-4">
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />
        当前无法直接拉取该项目的 README（可能是网络、限流或仓库已移动）。下面是项目简介，请前往 GitHub 查看完整内容：
      </div>
      <p className="text-foreground/90 leading-relaxed">{project.description}</p>
      {project.installCommand && (
        <div>
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
            <Terminal className="h-3 w-3" aria-hidden="true" />
            推荐安装
          </div>
          <code className="block px-3 py-2 rounded-md bg-secondary/50 border border-border/60 text-xs font-mono break-all">
            {project.installCommand}
          </code>
        </div>
      )}
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Star className="h-4 w-4" aria-hidden="true" />
        在 GitHub 上查看完整 README
        <ExternalLink className="h-3 w-3 ml-0.5" aria-hidden="true" />
      </a>
    </div>
  );
}

import Link from "next/link";
import { Star, Github, ExternalLink, Terminal, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/markdown";
import {
  type GitHubProject,
  securityAreas,
  formatStars,
} from "@/lib/github-projects";

interface ProjectDetailProps {
  project: GitHubProject;
  /** Pre-fetched README (or null on failure). Pass from the server route. */
  readme: string | null;
}

export async function ProjectDetail({ project, readme }: ProjectDetailProps) {
  const area = securityAreas.find((a) => a.slug === project.area);

  return (
    <article className="space-y-8">
      {/* Header */}
      <header className="space-y-4 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href={project.kind === "agent" ? "/agents" : "/mcp"} className="hover:text-primary">
            {project.kind === "agent" ? "AI Agent" : project.kind === "skill" ? "Skills" : "MCP"}
          </Link>
          <span>›</span>
          {area && <Badge className="text-[10px]">{area.name}</Badge>}
          {project.language && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-primary/70" />
              {project.language}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {formatStars(project.stars)}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold">{project.name}</h1>
        <p className="text-lg text-muted-foreground">{project.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
          >
            <Github className="h-4 w-4" />
            <span className="font-mono">{project.owner}/{project.repo}</span>
            <ExternalLink className="h-3 w-3 ml-0.5" />
          </a>
          {project.installCommand && (
            <code className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/50 border border-border/60 text-xs font-mono">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              {project.installCommand}
            </code>
          )}
        </div>

        {project.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.topics.slice(0, 12).map((t) => (
              <Badge key={t} className="text-[10px]">#{t}</Badge>
            ))}
          </div>
        )}

        {project.notable && (
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">为什么收录：</span>
            {project.notable}
          </div>
        )}
      </header>

      {/* README or fallback */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            {project.kind === "skill" ? "SKILL.md / README" : "README"}
          </h2>
          <span className="text-xs text-muted-foreground">
            来源：<a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">github.com/{project.owner}/{project.repo}</a>
          </span>
        </div>

        {readme ? (
          <Markdown source={readme} project={project} />
        ) : (
          <Fallback project={project} />
        )}
      </section>
    </article>
  );
}

function Fallback({ project }: { project: GitHubProject }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 p-6 space-y-4">
      <div className="text-sm text-muted-foreground">
        当前无法直接拉取该项目的 README（可能是网络、限流或仓库已移动）。下面是项目简介，请前往 GitHub 查看完整内容：
      </div>
      <p className="text-foreground/90 leading-relaxed">{project.description}</p>
      {project.installCommand && (
        <div>
          <div className="text-xs text-muted-foreground mb-1">推荐安装</div>
          <code className="block px-3 py-2 rounded-md bg-secondary/50 border border-border/60 text-xs font-mono break-all">
            {project.installCommand}
          </code>
        </div>
      )}
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
      >
        <Github className="h-4 w-4" />
        在 GitHub 上查看完整 README
        <ExternalLink className="h-3 w-3 ml-0.5" />
      </a>
    </div>
  );
}

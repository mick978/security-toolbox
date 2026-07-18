import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  mcpProjects,
  skillProjects,
  projectBySlug,
  type GitHubProject,
  fetchReadme,
} from "@/lib/github-projects";
import { ProjectDetail } from "@/components/project-detail";

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return [...mcpProjects, ...skillProjects].map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p || (p.kind !== "mcp" && p.kind !== "skill")) return { title: "未找到" };
  return {
    title: `${p.name} · ${p.kind === "skill" ? "Agent Skill" : "MCP"} · SecToolbox`,
    description: p.description,
  };
}

export default async function McpOrSkillDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project || (project.kind !== "mcp" && project.kind !== "skill")) notFound();

  const readme = await fetchReadme(project as GitHubProject);
  const backHref = project.kind === "skill" ? "/mcp?tab=skills" : "/mcp";

  return (
    <div className="container py-10 max-w-4xl">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> 返回 {project.kind === "skill" ? "Skills" : "MCP"} 列表
      </Link>
      <ProjectDetail project={project as GitHubProject} readme={readme} />
    </div>
  );
}
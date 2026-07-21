import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  agentProjects,
  projectBySlug,
  type GitHubProject,
} from "@/lib/github-projects";
import { fetchReadme } from "@/lib/github-projects.server";
import { ProjectDetail } from "@/components/project-detail";

export const revalidate = 86400;
export const dynamicParams = true;

// SSG only the top-N most-starred agent pages; the rest fall through to
// dynamic / ISR via dynamicParams = true. Matches the strategy in
// app/mcp/[slug]/page.tsx — full enumeration causes Next 16 + webpack to
// hit a trace-collector race and abort the build.
export function generateStaticParams() {
  return [...agentProjects]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 6)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p || p.kind !== "agent") return { title: "未找到" };
  const ogTitle = `${p.name} · AI Agent`;
  return {
    title: `${p.name} · AI Agent · SecToolbox`,
    description: p.description,
    openGraph: {
      title: ogTitle,
      description: p.description,
      type: "article",
      url: p.url,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: p.description,
    },
  };
}

export default async function AgentDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project || project.kind !== "agent") notFound();

  const readme = await fetchReadme(project as GitHubProject);

  return (
    <div className="container py-10 max-w-4xl">
      <Link href="/agents" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> 返回 AI Agent 列表
      </Link>
      <ProjectDetail project={project as GitHubProject} readme={readme} />
    </div>
  );
}
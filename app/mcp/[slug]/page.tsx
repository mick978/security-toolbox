import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  mcpProjects,
  skillProjects,
  agentProjects,
  networkProjects,
  projectBySlug,
  type GitHubProject,
} from "@/lib/github-projects";
import { fetchReadme } from "@/lib/github-projects.server";
import { ProjectDetail } from "@/components/project-detail";

export const revalidate = 86400;
export const dynamicParams = true;

// Slugs that are surfaced on /mcp (i.e. belong to the canonical MCP + Skills
// arrays) — used so we don't leak unrelated MCP-shaped entries into the
// detail route. Network troubleshooting MCPs (kubeshark, wiremcp, etc.) are
// also reachable from the /network page; that page renders links of the form
// `/mcp/<slug>`, so we have to accept them here too.
const networkSlugs = new Set(networkProjects.map((p) => p.slug));

function isListableSlug(slug: string) {
  if (mcpProjects.some((p) => p.slug === slug)) return "mcp";
  if (skillProjects.some((p) => p.slug === slug)) return "skill";
  if (agentProjects.some((p) => p.slug === slug)) return "agent";
  // Anything else found only in the "networkProjects" bucket (kubeshark,
  // wiremcp, domain-mcp, ... — and the misfiled skills/agents that ended up
  // there too) renders as MCP kind, with back-link to /network.
  if (networkSlugs.has(slug)) return "mcp";
  return undefined;
}

export function generateStaticParams() {
  return [
    ...mcpProjects.map((p) => ({ slug: p.slug })),
    ...skillProjects.map((p) => ({ slug: p.slug })),
    ...networkProjects.map((p) => ({ slug: p.slug })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  const kind = p ? isListableSlug(p.slug) : undefined;
  if (!p || !kind) return { title: "未找到" };
  const ogTitle = `${p.name} · ${kind === "skill" ? "Agent Skill" : "MCP"}`;
  return {
    title: `${p.name} · ${kind === "skill" ? "Agent Skill" : "MCP"} · SecToolbox`,
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

export default async function McpOrSkillDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  const kind = project ? isListableSlug(project.slug) : undefined;
  if (!project || !kind) notFound();

  const readme = await fetchReadme(project as GitHubProject);
  // Network MCPs live on the /network page, so the back link should return
  // there; everything else goes back to the main /mcp catalog.
  const isNetwork = networkSlugs.has(project.slug);
  const backHref = kind === "skill" ? "/mcp?tab=skills" : isNetwork ? "/network" : "/mcp";
  const backLabel = kind === "skill" ? "Skills" : isNetwork ? "网络工具" : "MCP";

  return (
    <div className="container py-10 max-w-4xl">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> 返回 {backLabel} 列表
      </Link>
      <ProjectDetail project={project as GitHubProject} readme={readme} />
    </div>
  );
}
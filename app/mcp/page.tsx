import { Suspense } from "react";
import McpSkillsClient from "./mcp-skills-client";
import { mcpProjects, skillProjects, networkProjects } from "@/lib/github-projects";
import { itemListFromSlugs } from "@/lib/aeo";

// networkProjects is a mixed bag on disk: most are network MCPs (kubeshark,
// wiremcp, prometheus, netbox, sharkmcp, domain-mcp, itmcp) plus 2 skills
// (devops-security-agent-skills, awesome-sre-skills). Merge the MCP-kind ones
// into the MCP list so /mcp shows all 24 MCPs, not just the 17 in mcpProjects.
const allMcp = [
  ...mcpProjects,
  ...networkProjects.filter((p) => p.kind === "mcp"),
];
const allSkill = [
  ...skillProjects,
  ...networkProjects.filter((p) => p.kind === "skill"),
];

export const metadata = {
  title: "MCP 工具与 Skills · SecToolbox",
  description: "网络安全 MCP 工具和 Skills 技能库，覆盖信息收集、漏洞扫描、渗透测试、防御检测、应急响应、合规审计全流程。",
  alternates: { canonical: "/mcp" },
};

export default function McpSkillsPage() {
  const all = [...allMcp, ...allSkill];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListFromSlugs(
              "SecToolbox MCP 与 Skills",
              "/mcp",
              all.map((p) => ({ slug: p.slug, name: p.name })),
            ),
          ),
        }}
      />
      <Suspense fallback={<div className="container py-10 text-muted-foreground">加载中...</div>}>
        <McpSkillsClient mcpProjects={allMcp} skillProjects={allSkill} />
      </Suspense>
    </>
  );
}

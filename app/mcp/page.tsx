import { Suspense } from "react";
import McpSkillsClient from "./mcp-skills-client";
import { mcpProjects, skillProjects } from "@/lib/github-projects";
import { itemListFromSlugs } from "@/lib/aeo";

export const metadata = {
  title: "MCP 工具与 Skills · SecToolbox",
  description: "网络安全 MCP 工具和 Skills 技能库，覆盖信息收集、漏洞扫描、渗透测试、防御检测、应急响应、合规审计全流程。",
  alternates: { canonical: "/mcp" },
};

export default function McpSkillsPage() {
  const all = [...mcpProjects, ...skillProjects];
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
        <McpSkillsClient />
      </Suspense>
    </>
  );
}

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import McpSkillsClient from "./mcp-skills-client";

export const metadata = {
  title: "MCP 工具与 Skills · SecToolbox",
  description: "网络安全 MCP 工具和 Skills 技能库，覆盖信息收集、漏洞扫描、渗透测试、防御检测、应急响应、合规审计全流程。",
};

export default function McpSkillsPage() {
  return (
    <Suspense fallback={<div className="container py-10 text-muted-foreground">加载中...</div>}>
      <McpSkillsClient />
    </Suspense>
  );
}

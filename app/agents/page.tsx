import { Suspense } from "react";
import AgentsClient from "./agents-client";
import { agentProjects } from "@/lib/github-projects";
import { itemListFromSlugs } from "@/lib/aeo";

export const metadata = {
  title: "网络安全 AI Agent · SecToolbox",
  description: "智能化网络安全 AI Agent，覆盖信息收集、漏洞扫描、渗透测试、防御检测、应急响应、合规审计全流程。",
  alternates: { canonical: "/agents" },
};

export default function AgentsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListFromSlugs(
              "SecToolbox AI Agent 目录",
              "/agents",
              agentProjects.map((p) => ({ slug: p.slug, name: p.name })),
            ),
          ),
        }}
      />
      <Suspense fallback={<div className="container py-10 text-muted-foreground">加载中...</div>}>
        <AgentsClient />
      </Suspense>
    </>
  );
}

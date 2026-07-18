export const dynamic = "force-dynamic";

import { Suspense } from "react";
import AgentsClient from "./agents-client";

export const metadata = {
  title: "网络安全 AI Agent · SecToolbox",
  description: "智能化网络安全 AI Agent，覆盖信息收集、漏洞扫描、渗透测试、防御检测、应急响应、合规审计全流程。",
};

export default function AgentsPage() {
  return (
    <Suspense fallback={<div className="container py-10 text-muted-foreground">加载中...</div>}>
      <AgentsClient />
    </Suspense>
  );
}

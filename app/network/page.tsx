export const dynamic = "force-dynamic";

import { Suspense } from "react";
import NetworkClient from "./network-client";

export const metadata = {
  title: "网络自动化排查 · SecToolbox",
  description: "网络可观测性、抓包分析、SRE/AIOps、DNS/WHOIS 等真实开源项目 — 11 个经过 GitHub API 验证的网络排查工具。",
};

export default function NetworkPage() {
  return (
    <Suspense fallback={<div className="container py-10 text-muted-foreground">加载中...</div>}>
      <NetworkClient />
    </Suspense>
  );
}
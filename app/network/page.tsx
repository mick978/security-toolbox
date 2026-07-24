import { Suspense } from "react";
import NetworkClient from "./network-client";
import { getNetworkProjects } from "@/lib/github-projects";
import { itemListJsonLd } from "@/lib/aeo";
import { canonical } from "@/lib/site";

export const metadata = {
  title: "网络自动化排查 · SecToolbox",
  description: "网络可观测性、抓包分析、SRE/AIOps、DNS/WHOIS 等真实开源项目 — 11 个经过 GitHub API 验证的网络排查工具。",
  alternates: { canonical: "/network" },
};

export default function NetworkPage() {
  const projects = getNetworkProjects();
  return (
    <>
      {/* Network is an aggregate page (no per-project detail route),
          so the list points back to the section itself with each
          project as a ListItem carrying its source URL. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListJsonLd(
              "SecToolbox 网络自动化项目",
              projects.slice(0, 10).map((p) => ({
                url: p.url,
                name: p.name,
              })),
            ),
          ),
        }}
      />
      <Suspense fallback={<div className="container py-10 text-muted-foreground">加载中...</div>}>
        <NetworkClient />
      </Suspense>
    </>
  );
}
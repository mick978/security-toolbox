import { Suspense } from "react";
import ToolsClient from "./tools-client";
import { tools } from "@/lib/tools";
import { itemListFromSlugs } from "@/lib/aeo";

export const metadata = {
  title: "工具库 · SecToolbox",
  description: "全部网络安全排查工具搜索与分类浏览",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <>
      {/* Top-10 ItemList so AI agents can answer "what tools does SecToolbox list"
          without parsing the whole page. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListFromSlugs(
              "SecToolbox 工具库",
              "/tools",
              tools.map((t) => ({ slug: t.slug, name: t.name })),
            ),
          ),
        }}
      />
      <Suspense fallback={<div className="container py-10 text-muted-foreground">加载中...</div>}>
        <ToolsClient />
      </Suspense>
    </>
  );
}

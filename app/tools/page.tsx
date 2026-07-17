export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ToolsClient from "./tools-client";

export const metadata = {
  title: "工具库 · SecToolbox",
  description: "全部网络安全排查工具搜索与分类浏览",
};

export default function ToolsPage() {
  return (
    <Suspense fallback={<div className="container py-10 text-muted-foreground">加载中...</div>}>
      <ToolsClient />
    </Suspense>
  );
}

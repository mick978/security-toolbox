import Link from "next/link";
import { Github, ExternalLink, Shield, BookOpen, GitMerge, FileCheck, BarChart3 } from "lucide-react";
import { ExploreHero, ExploreHeroBadge } from "@/components/explore-hero";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tools } from "@/lib/tools";
import { cheatsheets } from "@/lib/cheatsheets";
import { agentProjects, mcpProjects, skillProjects, getNetworkProjects } from "@/lib/github-projects";

export const metadata = {
  title: "关于 SecToolbox · 数据来源 & 编辑流程",
  description: "SecToolbox 内容来源、编辑流程、安全边界与项目元信息。",
};

/* About page — a single static gate for "where does this data come
 * from?" / "is this site safe to use?" / "how can I contribute?".
 * Sits outside the main catalog navigation; linked only from the
 * footer. */

export default function AboutPage() {
  const totalAgents = agentProjects.length;
  const totalMcp = mcpProjects.length;
  const totalSkills = skillProjects.length;
  const totalNetwork = getNetworkProjects().length;

  const stats = [
    { value: tools.length.toString(),      label: "工具（含命令示例）", icon: Shield },
    { value: cheatsheets.length.toString(), label: "排查 SOP",          icon: BookOpen },
    { value: (totalAgents + totalMcp + totalSkills + totalNetwork).toString(), label: "开源项目", icon: GitMerge },
    { value: "100%",                        label: "MIT License",       icon: FileCheck },
  ];

  const principles = [
    {
      title: "数据来源透明",
      desc: "工具命令直接采自官方网站与 GitHub README；开源项目通过 GitHub REST API 拉取 star / topic / description 等元数据。",
      icon: GitMerge,
    },
    {
      title: "在线执行沙箱",
      desc: "网页执行的命令全部走白名单 — 仅 DNS / HTTP / TLS / TCP 探测类只读操作。攻击类（nmap -sS / sqlmap / masscan 等）一律拒绝，UID 0 也拦截。",
      icon: Shield,
    },
    {
      title: "无追踪、无广告",
      desc: "不接 GA / 广告 SDK / cookie banner；服务端对每条命令 log 仅记录时间戳和退出码，不记录命令体。",
      icon: BarChart3,
    },
  ];

  const counts = [
    { label: "工具收录", value: tools.length },
    { label: "排查案例", value: cheatsheets.length },
    { label: "AI Agent", value: totalAgents },
    { label: "MCP 服务器", value: totalMcp },
    { label: "Agent Skills", value: totalSkills },
    { label: "网络工具", value: totalNetwork },
  ];

  return (
    <div className="min-h-screen">
      <ExploreHero
        badge={<ExploreHeroBadge icon={FileCheck}>关于项目</ExploreHeroBadge>}
        titleLine1="数据来源 · 编辑流程"
        titleLine2="安全边界"
        tldr={
          <>
            SecToolbox 是一个开源的网络安全<span className="text-foreground font-medium"> 排查手册 </span>
            — 工具命令和实操案例来自官方文档与 GitHub，
            <span className="text-foreground font-medium"> 在线执行沙箱仅放行只读类排查命令 </span>
            （DNS / HTTP / TLS / TCP 探测），攻击类一律拦截。
          </>
        }
        stats={stats}
      />

      <section className="container pt-section pb-section space-y-12">
        {/* 三个信条 */}
        <div>
          <h2 className="text-2xl font-bold mb-block">三条原则</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.title} className="h-full overflow-hidden border-border/60 transition-all duration-200 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/15 hover:-translate-y-0.5">
                  <div className="h-1.5 bg-gradient-to-r from-primary/70 to-primary/30" aria-hidden="true" />
                  <CardHeader>
                    <Icon className="h-6 w-6 text-primary mb-2" aria-hidden="true" />
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{p.desc}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 目录 */}
        <div>
          <h2 className="text-2xl font-bold mb-block">目录组成</h2>
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {counts.map((c) => (
                <li key={c.label} className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-2 last:border-b-0">
                  <span className="text-sm text-muted-foreground">{c.label}</span>
                  <span className="text-lg font-bold tabular-nums text-foreground">{c.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 编辑流程 */}
        <div>
          <h2 className="text-2xl font-bold mb-block">编辑流程</h2>
          <ol className="space-y-3">
            {[
              "官方文档 / 源码 → 抽取命令 → 域名/IP/路径做最小化处理 → 上传",
              "开源项目通过 GitHub REST API 拉元数据 → 仅渲染 frontmatter 和 README 转 Markdown",
              "每周 review：过期命令、过期链接、star 数断层",
              "敏感操作 (攻击 / 利用 / 信息收集对未授权目标) 全部加 ⛔ 警示",
            ].map((step, idx) => (
              <li key={step} className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/30 px-4 py-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/15 text-primary font-mono text-sm shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-relaxed pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
          <div className="font-semibold text-base">觉得缺一个工具 / 案例？</div>
          <div className="text-sm text-muted-foreground mt-1">
            提交 PR 到 GitHub 仓库，一起把它变得更好。
          </div>
          <a
            href="https://github.com/mick978/security-toolbox/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Github className="h-4 w-4" aria-hidden="true" /> 打开仓库
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}

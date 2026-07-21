export const dynamic = "force-dynamic";

import Link from "next/link";
import { categories, tools } from "@/lib/tools";
import { EXECUTOR_SLUGS } from "@/lib/executors";
import { securityAgents } from "@/lib/agents";
import { cheatsheets } from "@/lib/cheatsheets";
import { categoryColor } from "@/lib/category-colors";
import { iconByName } from "@/lib/icon-map";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Zap, Shield, ShieldAlert, Swords, BookOpen, Bot, Network, AlertTriangle,
  Sparkles, Wrench, Search, Compass, GitBranch, BookOpenText, ChevronRight, Clock, ListChecks,
} from "lucide-react";
import { ExploreHero, ExploreHeroBadge } from "@/components/explore-hero";

export default function HomePage() {
  const stats = [
    { value: tools.length.toString(),          label: "安全工具",     icon: Shield },
    { value: categories.length.toString(),     label: "工具分类",     icon: BookOpen },
    { value: EXECUTOR_SLUGS.length.toString(), label: "在线执行",     icon: Zap },
    { value: securityAgents.length.toString(), label: "AI Agent",     icon: Bot },
  ];

  /* Role entry-points. Same content as before — kept tight so users
   * have exactly three first clicks: pentest, defense, response. */
  const roles = [
    {
      href: "/tools?cat=pentest",
      aria: "进入红队 / 渗透测试入口",
      icon: Swords,
      title: "红队 · 渗透测试",
      desc: "信息收集 → 漏扫 → 利用 → 后渗透 → C2 → 逆向",
      iconClass: "text-red-700 dark:text-red-400",
      hover: "hover:border-red-500/50",
    },
    {
      href: "/tools?cat=vulnscan",
      aria: "进入蓝队 / 防御运营入口",
      icon: Shield,
      title: "蓝队 · 防御运营",
      desc: "漏扫 · 日志取证 · 抓包分析 · TLS 评估 · 纵深防御",
      iconClass: "text-rose-700 dark:text-rose-400",
      hover: "hover:border-rose-500/50",
    },
    {
      href: "/cheatsheet?cat=ir",
      aria: "进入事件响应 / DFIR 入口",
      icon: ShieldAlert,
      title: "事件响应 · DFIR",
      desc: "主机 / 内存取证 · IOC 分析 · 日志关联 · 复盘攻击路径",
      iconClass: "text-fuchsia-700 dark:text-fuchsia-400",
      hover: "hover:border-fuchsia-500/50",
    },
  ] as const;

  /* Three-step on-this-page path. OA-style: drop the user into the
   * shortest path to value. Each step is a real destination, not a
   * marketing flourish. */
  const learningPath = [
    {
      step: "01",
      title: "挑一个工具",
      desc: "按场景分类或搜索关键词直查工具，工具详情页里有安装命令、示例与一键复制。",
      href: "/tools",
      cta: "进入工具库",
      icon: Wrench,
    },
    {
      step: "02",
      title: "照 SOP 排查",
      desc: "每个排查案例都按 信息收集 → 定位 → 处置 → 复盘 顺序组织命令，可单步复制执行。",
      href: "/cheatsheet",
      cta: "看排查案例",
      icon: BookOpenText,
    },
    {
      step: "03",
      title: "用 AI Agent 武装自己",
      desc: "GitHub 上 6 个领域、上千⭐ 的真实开源安全 Agent，可一键复制 installCommand。",
      href: "/agents",
      cta: "查看 AI Agent",
      icon: Bot,
    },
  ] as const;

  /* Three latest cheatsheets — taken straight from the data file.
   * No curation here; the page should pulse with whatever we ship.
   * The data file already sorts cases by category priority. */
  const latestCases = cheatsheets.slice(0, 3);

  return (
    <div className="min-h-screen">
      <ExploreHero
        badge={<ExploreHeroBadge icon={Sparkles}>v0.1 · 开源 · 网络安全排查工具集</ExploreHeroBadge>}
        titleLine1="网络安全排查工具"
        titleLine2="速查手册"
        tldr={
          <>
            面向 <span className="text-foreground font-medium">DevOps / SRE / 安全工程师 / 红蓝对抗</span> · 收录
            DNS、扫描、抓包、TLS、漏扫、日志、
            <span className="text-foreground font-medium"> 信息收集 / 漏洞利用 / C2 / 逆向 / 口令攻击 </span>
            常用工具 · <span className="text-foreground font-medium">安装命令 · 真实场景示例 · 一键复制</span>。
          </>
        }
        stats={stats.map((s) => ({ value: s.value, label: s.label, icon: s.icon }))}
        bottomSlot={
          /* Role-trio injected as the hero bottomSlot so it visually
           * belongs to the hero (same bg layers + same padding
           * rhythm) instead of sitting awkwardly below a divider. */
          <div className="mt-block grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl stagger-list">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Link
                  key={role.href}
                  href={role.href}
                  aria-label={role.aria}
                  className={`group flex items-start gap-3 p-4 rounded-lg border border-border/60 bg-card transition-all duration-200 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 ${role.hover}`}
                >
                  <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${role.iconClass} group-hover:scale-110 transition-transform`} aria-hidden="true" />
                  <div>
                    <div className="font-semibold text-sm group-hover:text-primary transition-colors">{role.title}</div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{role.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        }
      />

      {/* Warning — same component recipe as cheatsheet warning footer. */}
      <section className="container pt-section pb-block">
        <div className="rounded-lg border border-amber-500/60 dark:border-amber-500/40 bg-amber-100/70 dark:bg-amber-500/5 p-4 text-sm text-amber-900 dark:text-amber-200/90 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" aria-hidden="true" />
          <div>
            <div className="font-semibold text-amber-900 dark:text-amber-300 inline-flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              授权测试专用
            </div>
            <span className="block mt-1">
              以下工具仅限用于 <strong>自建靶场 / CTF / 红队授权项目</strong>；未授权扫描或攻击真实系统属违法行为，一切法律责任由使用者自负。
            </span>
          </div>
        </div>
      </section>

      {/* OA-style 3-step path. Compresses what used to be four
       * separate section blocks (红队 / 按分类浏览 / 高频工具 /
       * 网络排查) into a single scannable path. Users who don't want a
       * guided experience still have the role-trio above and the
       * full nav; this is additive, not blocking. */}
      <section className="container pb-section">
        <div className="mb-block flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Compass className="h-6 w-6 text-primary" aria-hidden="true" />
              <span>三步上手</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              从进站到出活的最短路径 ——
            </p>
          </div>
          <Link href="/tools" className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded whitespace-nowrap">
            跳过引导，去工具库 →
          </Link>
        </div>

        <ol className="grid gap-4 md:grid-cols-3 stagger-list">
          {learningPath.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.step} className="relative">
                <Link
                  href={step.href}
                  className="group block h-full rounded-xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/15 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {/* Vertical spine between steps — appears only when
                      this card has a follower. Pure CSS, no JS. */}
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0 transition-colors group-hover:bg-primary/15">
                      <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[11px] font-mono tracking-widest text-primary/70">
                          STEP {step.step}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold mt-0.5 group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end text-xs font-medium text-primary opacity-0 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                    {step.cta}
                    <ChevronRight className="h-4 w-4 ml-0.5" aria-hidden="true" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Latest cases — three freshest cheatsheets, served as a quick
       * preview so the home page signals that the data is alive. */}
      <section className="container pb-section">
        <div className="flex items-end justify-between mb-block">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-primary" aria-hidden="true" />
              <span>最新排查案例</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              按 SOP 步骤组织，可单步复制执行 —
            </p>
          </div>
          <Link href="/cheatsheet" className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded whitespace-nowrap">
            全部案例 →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-list">
          {latestCases.map((c, idx) => (
            <Link
              key={c.slug}
              href={`/cheatsheet/${c.slug}`}
              className="group block h-full rounded-xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/15 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`查看 ${c.title} 详情`}
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <span className="text-primary/60 font-semibold">#{String(idx + 1).padStart(2, "0")}</span>
                <span className="opacity-40">·</span>
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <ListChecks className="h-3 w-3" aria-hidden="true" />
                  {c.steps.length} 步
                </span>
                <span className="opacity-40">·</span>
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {c.durationMinutes ?? 30} 分
                </span>
              </div>
              <h3 className="text-base font-semibold mt-2 group-hover:text-primary transition-colors line-clamp-2">
                {c.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                {c.summary}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {c.tags.slice(0, 2).map((t) => (
                    <span key={t} className="inline-flex rounded-full border border-border/60 bg-secondary/40 px-1.5 py-0.5 text-[10px]">
                      #{t}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center text-xs text-primary opacity-0 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                  打开
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Network catalog — kept here because it's a distinct ecosystem
       * (K8s / 抓包 / AIOps) that doesn't sit inside /tools. The
       * single mega-card links out to /network. */}
      <section className="container pb-section">
        <div className="flex items-end justify-between mb-block">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Network className="h-6 w-6 text-primary" aria-hidden="true" />
              <span>网络自动化排查</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              K8s 可观测性 / 抓包分析 / Prometheus · NetBox / AIOps 智能诊断
            </p>
          </div>
          <Link href="/network" className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded whitespace-nowrap">
            进入网络排查 →
          </Link>
        </div>
        <Link
          href="/network"
          className="group block rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 to-transparent p-6 transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/15 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
              <Network className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold group-hover:text-primary transition-colors">网络排查工具集</div>
              <div className="text-xs text-muted-foreground mt-1">
                Kubeshark (eBPF K8s 抓包) · WireMCP (实时 tshark) · Prometheus / NetBox MCP · multi-rag-agent (AIOps)
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>
      </section>

      {/* AI Agent + MCP/Skills — a single section now, pointing to
       * /agents and /mcp. Each card is a quick visual CV of the
       * ecosystem; the full grid lives on those pages. */}
      <section className="container pb-section">
        <div className="flex items-end justify-between mb-block">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" aria-hidden="true" />
              <span>AI &amp; MCP 生态</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              GitHub 上经过 API 验证的真实开源项目
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/agents"
            className="group block rounded-xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/15 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0 transition-colors group-hover:bg-primary/15">
                <Bot className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold group-hover:text-primary transition-colors">网络安全 AI Agent</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {securityAgents.length} 个真实 Agent · 按 信息收集 / 漏洞扫描 / 渗透测试 / 防御运营 / 事件响应 / 合规 分类
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </div>
          </Link>

          <Link
            href="/mcp"
            className="group block rounded-xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/15 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0 transition-colors group-hover:bg-primary/15">
                <Wrench className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold group-hover:text-primary transition-colors">MCP 工具 &amp; Agent Skills</div>
                <div className="text-xs text-muted-foreground mt-1">
                  MCP 服务器 + SKILL.md · 实时 tshark · K8s 可观测性 · AIOps 智能诊断
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

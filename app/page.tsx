export const dynamic = "force-dynamic";

import Link from "next/link";
import { categories, tools } from "@/lib/tools";
import { executorBySlug, EXECUTOR_SLUGS } from "@/lib/executors";
import { securityAgents, agentCategories } from "@/lib/agents";
import { categoryColor } from "@/lib/category-colors";
import { iconByName } from "@/lib/icon-map";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Terminal, Zap, Shield, ScanLine, ShieldAlert, Swords, BookOpen, Bot, Network, AlertTriangle, Sparkles, Wrench } from "lucide-react";
import { ExploreHero, ExploreHeroBadge } from "@/components/explore-hero";

export default function HomePage() {
  const stats = [
    { value: tools.length.toString(),        label: "安全工具", icon: Shield },
    { value: categories.length.toString(),   label: "工具分类", icon: BookOpen },
    { value: EXECUTOR_SLUGS.length.toString(), label: "在线执行", icon: Zap },
    { value: securityAgents.length.toString(), label: "AI Agent", icon: Bot },
  ];

  /* Role-card palette — kept in-page because home is the only place
   * that groups the 3 colors into red/blue/DFIR entry points. The
   * THREE areas referenced (`exploit` / `vuln-scan` / `logs`) come
   * from the categories table, so the icons + category-color lookup
   * reuses lib/category-colors exactly like the explore card. */
  const roles = [
    {
      href: "/tools?cat=pentest",
      aria: "进入红队 / 渗透测试入口",
      icon: Swords,
      title: "红队 / 渗透测试",
      desc: "信息收集 → 漏扫 → 利用 → 后渗透 → C2 → 逆向，按 Kill Chain 聚合。",
      iconClass: "text-red-700 dark:text-red-400",
      hover: "hover:border-red-500/40",
    },
    {
      href: "/tools?cat=vulnscan",
      aria: "进入蓝队 / 防御运营入口",
      icon: Shield,
      title: "蓝队 / 防御运营",
      desc: "漏扫 · 日志取证 · 抓包分析 · TLS 评估，构建纵深防御。",
      iconClass: "text-rose-700 dark:text-rose-400",
      hover: "hover:border-rose-500/40",
    },
    {
      href: "/cheatsheet?cat=ir",
      aria: "进入事件响应 / DFIR 入口",
      icon: ShieldAlert,
      title: "事件响应 · DFIR",
      desc: "主机 / 内存取证、IOC 分析、日志关联，复盘攻击路径。",
      iconClass: "text-fuchsia-700 dark:text-fuchsia-400",
      hover: "hover:border-fuchsia-500/40",
    },
  ] as const;

  /* Popular tools row — re-uses the same category accent palette as
   * /tools (lib/category-colors) so the colored icon tiles on this
   * page match exactly what the dedicated /tools/[slug] page shows. */
  const popularSlugs = ["dig", "nmap", "curl", "tcpdump", "nuclei", "trivy"] as const;

  return (
    <div className="min-h-screen">
      {/* Hero — uses the same ExploreHero component as every catalog
       * page; identical visual grammar (badge / gradient title /
       * text-only stats / TL;DR) so first-impression matches. */}
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
        stats={stats.map((s) => ({
          value: s.value,
          label: s.label,
          icon: s.icon,
        }))}
        /* bottomSlot — mounts the role-trio of cards (Red / Blue / DFIR)
         * as primary entry points. Same shape across the page family,
         * keeps the hero visually consistent with /cheatsheet etc. */
        bottomSlot={
          <div className="mt-block grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl stagger-list">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Link
                  key={role.href}
                  href={role.href}
                  aria-label={role.aria}
                  className={`group flex items-start gap-3 p-4 rounded-lg border border-border/60 bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${role.hover}`}
                >
                  <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${role.iconClass}`} aria-hidden="true" />
                  <div>
                    <div className="font-semibold text-sm">{role.title}</div>
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

      {/* Red Team Catalog */}
      <section className="container pb-section">
        <div className="mb-block">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Swords className="h-6 w-6 text-red-700 dark:text-red-400" aria-hidden="true" />
            <span>红队 / 渗透测试</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            信息收集 → 漏扫 → 利用 → 后渗透 → C2 → 逆向，按 Kill Chain 分类聚合
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-list">
          {[
            { slug: "recon",    icon: "Search", name: "信息收集 · Recon", desc: "子域 / 端口 / 指纹 / OSINT", accent: "text-sky-400" },
            { slug: "vulnscan", icon: "ShieldAlert", name: "漏洞扫描 · VulnScan", desc: "nuclei / nikto / wpscan / trivy", accent: "text-yellow-400" },
            { slug: "exploit",  icon: "Zap", name: "漏洞利用 · Exploit", desc: "sqlmap / metasploit / poc", accent: "text-red-400" },
            { slug: "pentest",  icon: "Swords", name: "渗透后渗透 · Pentest", desc: "hydra / hashcat / crackmapexec / impacket", accent: "text-orange-400" },
            { slug: "c2",       icon: "Radio", name: "C2 / 隧道 · C2", desc: "sliver / chisel / frp / ligolo", accent: "text-purple-400" },
            { slug: "reverse",  icon: "Cpu", name: "逆向工程 · Reverse", desc: "ghidra / radare2 / frida / jadx", accent: "text-emerald-400" },
          ].map((c) => {
            const Icon = iconByName(c.icon);
            const count = tools.filter((t) => t.category === c.slug).length;
            return (
              <Link key={c.slug} href={`/tools?cat=${c.slug}`} className="group">
                <Card className="h-full transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className={`h-6 w-6 ${c.accent}`} aria-hidden="true" />
                      <Badge>{count}</Badge>
                    </div>
                    <CardTitle className="mt-3">{c.name}</CardTitle>
                    <CardDescription>{c.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* All Categories */}
      <section className="container py-section">
        <div className="flex items-end justify-between mb-block">
          <div>
            <h2 className="text-2xl font-bold">按分类浏览</h2>
            <p className="text-sm text-muted-foreground mt-1">
              选择场景 → 进入分类 → 查看工具与命令
            </p>
          </div>
          <Link href="/tools" className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
            查看全部 →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const Icon = iconByName(c.icon);
            const count = tools.filter((t) => t.category === c.slug).length;
            return (
              <Link key={c.slug} href={`/tools?cat=${c.slug}`} className="group">
                <Card className="h-full transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className={`h-6 w-6 ${c.accent}`} aria-hidden="true" />
                      <Badge>{count}</Badge>
                    </div>
                    <CardTitle className="mt-3">{c.name}</CardTitle>
                    <CardDescription>{c.short}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Tools */}
      <section className="container pb-section">
        <h2 className="text-2xl font-bold mb-block">高频工具</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {popularSlugs.map((slug) => {
            const t = tools.find((x) => x.slug === slug);
            if (!t) return null;
            const runnable = !!executorBySlug(t.slug);
            return (
              <Link key={t.slug} href={`/tools/${t.slug}`} className="group">
                <Card className="h-full transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <code className="text-primary font-mono text-sm">{t.name}</code>
                      {runnable && (
                        <span className="inline-flex items-center gap-0.5 rounded-full border border-yellow-500/40 bg-yellow-400/15 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700 dark:text-yellow-300">
                          <Zap className="h-2.5 w-2.5" aria-hidden="true" />
                          在线执行
                        </span>
                      )}
                      <Badge className="ml-auto">{t.category}</Badge>
                    </div>
                    <CardDescription className="mt-2">{t.tagline}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* AI Agent Section */}
      <section className="container pb-section">
        <div className="flex items-end justify-between mb-block">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" aria-hidden="true" />
              <span>网络安全 AI Agent</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              智能化安全 Agent 矩阵，覆盖信息收集 → 漏扫 → 渗透 → 防御 → 响应 → 合规全流程
            </p>
          </div>
          <Link href="/agents" className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
            查看全部 →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agentCategories.slice(0, 6).map((c) => {
            const Icon = iconByName(c.icon);
            const count = securityAgents.filter((a) => a.area === c.slug).length;
            return (
              <Link key={c.slug} href={`/agents?cat=${c.slug}`} className="group">
                <Card className="h-full transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <Badge>{count}</Badge>
                    </div>
                    <CardTitle className="mt-3">{c.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Network Troubleshooting Section */}
      <section className="container pb-section">
        <div className="flex items-end justify-between mb-block">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Network className="h-6 w-6 text-primary" aria-hidden="true" />
              <span>网络自动化排查</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              K8s 可观测性 / 抓包分析 / Prometheus · NetBox / AIOps 智能诊断 — 11 个经过 GitHub API 验证的真实工具
            </p>
          </div>
          <Link href="/network" className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
            查看全部 →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/network" className="group md:col-span-2 lg:col-span-3">
            <Card className="h-full transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                    <Network className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">网络排查工具集</CardTitle>
                    <CardDescription className="mt-1">
                      Kubeshark (eBPF K8s 抓包) · WireMCP (实时 tshark) · Prometheus / NetBox MCP · multi-rag-agent (AIOps) — 覆盖可观测性、应急响应、IT 基础排查
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary ml-auto group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}

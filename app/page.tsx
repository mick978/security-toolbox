export const dynamic = "force-dynamic";

import Link from "next/link";
import { categories, tools } from "@/lib/tools";
import { executorBySlug, EXECUTOR_SLUGS } from "@/lib/executors";
import { securityAgents, agentCategories } from "@/lib/agents";
import { categoryColor } from "@/lib/category-colors";
import { iconByName } from "@/lib/icon-map";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Terminal, Zap, Shield, ScanLine, ShieldAlert, Swords, Search, Globe, BookOpen, Bot, Network, AlertTriangle } from "lucide-react";

export default function HomePage() {
  const stats = [
    { value: tools.length.toString(), label: "安全工具", icon: Shield },
    { value: categories.length.toString(), label: "工具分类", icon: BookOpen },
    { value: EXECUTOR_SLUGS.length.toString(), label: "在线执行", icon: Zap },
    { value: securityAgents.length.toString(), label: "AI Agent", icon: Bot },
  ];

  return (
    <div>
      {/* Hero - ao.aiolaola.com style */}
      <section className="relative border-b border-border/60 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="container relative py-16 lg:py-24">
          {/* Badge */}
          <Badge className="mb-5 border-primary/40 text-primary bg-primary/10">
            v0.1 · 开源 · 网络安全排查工具集
          </Badge>

          {/* Main Heading — gradient on the second line gives the brand
              accent (which itself can vary across 6 accent presets) a
              stable "glow" cue. Wrapping the gradient span in
              `inline-block` lets the focus ring wrap the whole accent
              block instead of the second line only. */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl">
            网络安全排查工具
            <span className="block mt-2 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent [text-shadow:_0_0_24px_hsl(var(--primary)/0.35)]">
              速查手册
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            面向 DevOps / SRE / 安全工程师 / 红蓝对抗。收录 DNS、扫描、抓包、TLS、漏扫、日志、
            <span className="text-foreground font-medium">信息收集 / 漏洞利用 / C2 / 逆向 / 口令攻击</span>常用工具的
            <span className="text-foreground font-medium"> 安装命令、真实场景示例、一键复制</span>。
          </p>

          {/* Search Box */}
          <div className="mt-8 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Link
              href="/tools"
              className="flex items-center h-12 pl-12 pr-4 rounded-lg border border-border/60 bg-secondary/30 text-muted-foreground hover:border-primary/60 hover:bg-secondary/50 transition-colors"
            >
              搜索工具、命令、标签…
            </Link>
          </div>

          {/* Stats — now text-only (no card surface) so they read as
              hero auxiliaries rather than competing with the role-cards
              below. `tabular-nums` keeps digit widths equal so the four
              columns stay aligned without a width-pinning wrapper. */}
          <div className="mt-block grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 max-w-2xl">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <div>
                    <div className="text-xl md:text-2xl font-bold tabular-nums leading-none">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons — three tiers of emphasis:
              - primary (filled + shadow) — main journey
              - secondary (ghost, hover-revealed border) — supporting entry
              - tertiary (themed sky) — niche capability
              Every Link gets explicit focus-visible so keyboard users can
              tell where they are. */}
          <div className="mt-section flex flex-wrap gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              浏览全部工具 <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/cheatsheet"
              className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
            >
              <Terminal className="h-4 w-4" aria-hidden="true" />
              场景排查速查 · 53 案例
            </Link>
            <Link
              href="/ip-intel"
              className="inline-flex items-center gap-2 rounded-md border border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-200 px-5 py-2.5 text-sm font-medium hover:bg-sky-500/20 hover:border-sky-500/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              IP 情报查询
            </Link>
          </div>

          {/* Role quick-links: red / blue / DFIR. Each card uses a
              category-coloured hover ring so the visual cue matches the
              category palette defined in lib/category-colors.ts. */}
          <div className="mt-block grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl stagger-list">
            {(
              [
                {
                  href: "/tools?cat=pentest",
                  aria: "进入红队 / 渗透测试入口",
                  icon: Swords,
                  title: "红队 / 渗透测试",
                  desc: "信息收集 → 漏扫 → 利用 → 后渗透 → C2 → 逆向，按 Kill Chain 聚合。",
                  // Hover ring uses the category's own border color. We
                  // spell the full class string (not a template) so
                  // Tailwind's JIT picks it up.
                  palette: categoryColor("exploit"),
                  hoverBorder: "hover:border-red-500/40",
                },
                {
                  href: "/tools?cat=vulnscan",
                  aria: "进入蓝队 / 防御运营入口",
                  icon: Shield,
                  title: "蓝队 / 防御运营",
                  desc: "漏扫 · 日志取证 · 抓包分析 · TLS 评估，构建纵深防御。",
                  palette: categoryColor("vulnscan"),
                  hoverBorder: "hover:border-rose-500/40",
                },
                {
                  href: "/cheatsheet?cat=ir",
                  aria: "进入事件响应 / DFIR 入口",
                  icon: ShieldAlert,
                  title: "事件响应 · DFIR",
                  desc: "主机 / 内存取证、IOC 分析、日志关联，复盘攻击路径。",
                  palette: categoryColor("logs"),
                  hoverBorder: "hover:border-fuchsia-500/40",
                },
              ] as const
            ).map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  aria-label={card.aria}
                  className={`group flex items-start gap-3 p-4 rounded-lg border border-border/60 bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${card.hoverBorder}`}
                >
                  <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${card.palette.text}`} aria-hidden="true" />
                  <div>
                    <div className="font-semibold text-sm">{card.title}</div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Red Team / Pentest Section */}
      <section className="container pt-section pb-block">
        <div className="rounded-lg border border-amber-500/60 dark:border-amber-500/40 bg-amber-100/70 dark:bg-amber-500/5 p-4 text-sm text-amber-900 dark:text-amber-200/90 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-900 dark:text-amber-300">⚠ 授权测试专用</div>
            以下工具仅限用于 <strong>自建靶场 / CTF / 红队授权项目</strong>；未授权扫描或攻击真实系统属违法行为，一切法律责任由使用者自负。
          </div>
        </div>
      </section>

      {/* Red Team Categories */}
      <section className="container pb-section">
        <div className="mb-block">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Swords className="h-6 w-6 text-red-700 dark:text-red-400" />
            <span>红队 / 渗透测试</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            信息收集 → 漏扫 → 利用 → 后渗透 → C2 → 逆向，按 Kill Chain 分类聚合
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-list">
          {[
            { slug: "recon", icon: "Search", name: "信息收集 · Recon", desc: "子域 / 端口 / 指纹 / OSINT", accent: "text-sky-600 dark:text-sky-400" },
            { slug: "vulnscan", icon: "ShieldAlert", name: "漏洞扫描 · VulnScan", desc: "nuclei / nikto / wpscan / trivy", accent: "text-yellow-600 dark:text-yellow-400" },
            { slug: "exploit", icon: "Zap", name: "漏洞利用 · Exploit", desc: "sqlmap / metasploit / poc", accent: "text-red-600 dark:text-red-400" },
            { slug: "pentest", icon: "Swords", name: "渗透后渗透 · Pentest", desc: "hydra / hashcat / crackmapexec / impacket", accent: "text-orange-600 dark:text-orange-400" },
            { slug: "c2", icon: "Radio", name: "C2 / 隧道 · C2", desc: "sliver / chisel / frp / ligolo", accent: "text-purple-600 dark:text-purple-400" },
            { slug: "reverse", icon: "Cpu", name: "逆向工程 · Reverse", desc: "ghidra / radare2 / frida / jadx", accent: "text-emerald-600 dark:text-emerald-400" },
          ].map((c) => {
            const Icon = iconByName(c.icon);
            const count = tools.filter((t) => t.category === c.slug).length;
            return (
              <Link key={c.slug} href={`/tools?cat=${c.slug}`} className="group">
                <Card className="h-full transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className={`h-6 w-6 ${c.accent}`} />
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
          <Link href="/tools" className="text-sm text-primary hover:underline">
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
                      <Icon className={`h-6 w-6 ${c.accent}`} />
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
          {["dig", "nmap", "curl", "tcpdump", "nuclei", "trivy"].map((slug) => {
            const t = tools.find((x) => x.slug === slug);
            if (!t) return null;
            const runnable = !!executorBySlug(t.slug);
            const catName = categories.find((c) => c.slug === t.category)?.name ?? t.category;
            return (
              <Link key={t.slug} href={`/tools/${t.slug}`} className="group">
                <Card className="h-full transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <code className="text-primary font-mono text-sm">{t.name}</code>
                      {runnable && (
                        <span className="inline-flex items-center gap-0.5 rounded-full border border-yellow-500/40 bg-yellow-400/15 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700 dark:text-yellow-300">
                          <Zap className="h-2.5 w-2.5" /> 在线执行
                        </span>
                      )}
                      <Badge className="ml-auto">{catName}</Badge>
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
              <Bot className="h-6 w-6 text-primary" />
              <span>网络安全 AI Agent</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              智能化安全 Agent 矩阵，覆盖信息收集 → 漏扫 → 渗透 → 防御 → 响应 → 合规全流程
            </p>
          </div>
          <Link href="/agents" className="text-sm text-primary hover:underline">
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
                        <Icon className="h-5 w-5 text-primary" />
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
              <Network className="h-6 w-6 text-primary" />
              <span>网络自动化排查</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              K8s 可观测性 / 抓包分析 / Prometheus · NetBox / AIOps 智能诊断 — 11 个经过 GitHub API 验证的真实工具
            </p>
          </div>
          <Link href="/network" className="text-sm text-primary hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/network" className="group md:col-span-2 lg:col-span-3">
            <Card className="h-full transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                    <Network className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">网络排查工具集</CardTitle>
                    <CardDescription className="mt-1">
                      Kubeshark (eBPF K8s 抓包) · WireMCP (实时 tshark) · Prometheus / NetBox MCP · multi-rag-agent (AIOps) — 覆盖可观测性、应急响应、IT 基础排查
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import * as Icons from "lucide-react";
import { categories, tools } from "@/lib/tools";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Terminal, Zap, Shield, ScanLine } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative border-b border-border/60 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.15),transparent_50%),radial-gradient(circle_at_80%_60%,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="container relative py-20 lg:py-28">
          <Badge className="mb-5 border-primary/40 text-primary bg-primary/10">
            v0.1 · {tools.length} 工具 · {categories.length} 分类
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl">
            网络安全排查工具速查手册
            <span className="block text-primary mt-2">SecToolbox</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            面向 DevOps / SRE / 安全工程师 / 红蓝对抗。收录 DNS、扫描、抓包、TLS、漏扫、日志、
            <span className="text-foreground font-medium">信息收集 / 漏洞利用 / C2 / 逆向 / 口令攻击</span>常用工具的
            <span className="text-foreground font-medium"> 安装命令、真实场景示例、一键复制</span>。
          </p>
          <div className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200 max-w-2xl">
            ⚠️ 攻击性工具（信息收集 / 漏洞利用 / C2 / 口令攻击）<span className="font-medium">仅限用于授权渗透测试、CTF、自建靶场或学术研究</span>。禁止未授权使用。使用者需自行承担法律责任。
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90"
            >
              浏览全部工具 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/cheatsheet"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-5 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              <Terminal className="h-4 w-4" />
              场景排查速查 · 20 案例
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Feature icon={Zap} text="⌘K 全局搜索" />
            <Feature icon={Terminal} text="命令一键复制" />
            <Feature icon={ScanLine} text="真实示例 + 常用参数" />
            <Feature icon={Shield} text="每条命令标注平台 / 授权提醒" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-8">
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
            const Icon = (Icons as any)[c.icon] ?? Icons.Circle;
            const count = tools.filter((t) => t.category === c.slug).length;
            return (
              <Link key={c.slug} href={`/tools?cat=${c.slug}`} className="group">
                <Card className="h-full transition-colors hover:border-primary/60 hover:bg-secondary/30">
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

      {/* Popular */}
      <section className="container pb-24">
        <h2 className="text-2xl font-bold mb-6">高频工具</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {["dig", "nmap", "curl", "tcpdump", "nuclei", "trivy"].map((slug) => {
            const t = tools.find((x) => x.slug === slug);
            if (!t) return null;
            return (
              <Link key={t.slug} href={`/tools/${t.slug}`} className="group">
                <Card className="h-full transition-colors hover:border-primary/60">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <code className="text-primary font-mono text-sm">{t.name}</code>
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
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <span>{text}</span>
    </div>
  );
}

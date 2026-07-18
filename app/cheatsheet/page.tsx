export const dynamic = "force-dynamic";

import Link from "next/link";
import * as Icons from "lucide-react";
import { cheatsheets, caseCategories, casesByCategory } from "@/lib/cheatsheets";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, AlertTriangle, ShieldAlert, Search, Zap, Server, Cloud, Boxes, Smartphone, Waypoints, Network, ArrowRight, BookOpen, Clock, Shield } from "lucide-react";

export const metadata = {
  title: "场景速查 · SecToolbox",
  description: "按典型排查场景组织的实战 SOP · 网络 / 攻击 / 系统 / 云安全 / K8s / 移动抓包 / 内网横向",
};

const sevStyle = {
  info: { label: "参考", cls: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: "📘" },
  warn: { label: "警告", cls: "bg-amber-500/10 text-amber-500 border-amber-500/30", icon: "⚠️" },
  danger: { label: "紧急", cls: "bg-red-500/10 text-red-500 border-red-500/30", icon: "🚨" },
};

// Category visual config
const categoryVisuals: Record<string, { gradient: string; iconBg: string; emoji: string }> = {
  network: { gradient: "from-blue-500/20 to-cyan-500/20", iconBg: "bg-blue-500/10", emoji: "🌐" },
  attack: { gradient: "from-red-500/20 to-orange-500/20", iconBg: "bg-red-500/10", emoji: "⚔️" },
  system: { gradient: "from-purple-500/20 to-pink-500/20", iconBg: "bg-purple-500/10", emoji: "🖥️" },
  cloud: { gradient: "from-sky-500/20 to-blue-500/20", iconBg: "bg-sky-500/10", emoji: "☁️" },
  k8s: { gradient: "from-indigo-500/20 to-violet-500/20", iconBg: "bg-indigo-500/10", emoji: "☸️" },
  mobile: { gradient: "from-emerald-500/20 to-teal-500/20", iconBg: "bg-emerald-500/10", emoji: "📱" },
  lateral: { gradient: "from-orange-500/20 to-amber-500/20", iconBg: "bg-orange-500/10", emoji: "🕸️" },
};

export default function CheatsheetPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="container relative py-16 lg:py-20">
          <Badge className="mb-4 border-primary/40 text-primary bg-primary/10">
            <BookOpen className="h-3 w-3 mr-1" />
            实战 SOP · 场景速查
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            经典排查
            <span className="text-primary"> 案例库</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {cheatsheets.length} 个实战场景 SOP，覆盖网络、攻击、系统、云、K8s、移动、内网横向七大领域。
            每个案例都是经过验证的排查流程，助你快速定位和解决问题。
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            {[
              { value: cheatsheets.length.toString(), label: "排查案例", icon: BookOpen },
              { value: caseCategories.length.toString(), label: "场景分类", icon: Shield },
              { value: "7", label: "覆盖领域", icon: Zap },
              { value: "100+", label: "排查命令", icon: Clock },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/40">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category Quick Nav */}
          <div className="mt-8 flex flex-wrap gap-2">
            {caseCategories.map((cc) => {
              const n = casesByCategory(cc.slug).length;
              const visual = categoryVisuals[cc.slug];
              return (
                <a
                  key={cc.slug}
                  href={`#${cc.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-secondary/30 text-sm hover:border-primary/60 hover:bg-primary/10 transition-all"
                >
                  <span>{visual?.emoji}</span>
                  <span>{cc.name}</span>
                  <Badge className="ml-1 text-[10px]">{n}</Badge>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-12">
        <div className="space-y-16">
          {caseCategories.map((cc) => {
            const Icon = (Icons as any)[cc.icon] ?? ShieldAlert;
            const list = casesByCategory(cc.slug);
            const visual = categoryVisuals[cc.slug];

            return (
              <section key={cc.slug} id={cc.slug} className="scroll-mt-20">
                {/* Category Header */}
                <div className="relative mb-8 p-6 rounded-xl overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${visual?.gradient} opacity-50`} />
                  <div className="relative flex items-center gap-4">
                    <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${visual?.iconBg} border border-border/40`}>
                      <span className="text-3xl">{visual?.emoji}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        {cc.name}
                        <Badge className="ml-2">{list.length}</Badge>
                      </h2>
                      <p className="text-muted-foreground mt-1">{cc.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Cases Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {list.map((c, idx) => {
                    const sev = c.severity ? sevStyle[c.severity] : null;
                    return (
                      <Link key={c.slug} href={`/cheatsheet/${c.slug}`} className="group">
                        <Card className="h-full transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 overflow-hidden">
                          {/* Top accent bar */}
                          <div className={`h-1 bg-gradient-to-r ${
                            c.severity === "danger" ? "from-red-500 to-orange-500" :
                            c.severity === "warn" ? "from-amber-500 to-yellow-500" :
                            "from-primary/50 to-primary/20"
                          }`} />

                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-3">
                                {/* Index number */}
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/50 text-sm font-mono text-muted-foreground shrink-0">
                                  {String(idx + 1).padStart(2, "0")}
                                </div>
                                <div>
                                  <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">
                                    {c.title}
                                  </CardTitle>
                                  <CardDescription className="mt-1 line-clamp-2 text-xs">
                                    {c.summary}
                                  </CardDescription>
                                </div>
                              </div>
                              {sev && (
                                <span className={`text-[10px] px-2 py-0.5 rounded border font-mono shrink-0 ${sev.cls}`}>
                                  {sev.icon} {sev.label}
                                </span>
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {c.tags.slice(0, 4).map((t) => (
                                <Badge key={t} className="text-[10px] py-0">
                                  #{t}
                                </Badge>
                              ))}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-border/40">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {c.steps.length} 步
                                </span>
                                {c.relatedTools && (
                                  <span className="flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    {c.relatedTools.length} 工具
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                查看详情
                                <ChevronRight className="h-4 w-4 ml-0.5" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      {/* Warning Footer */}
      <section className="container pb-16">
        <div className="p-6 border border-amber-500/30 bg-amber-500/5 rounded-xl text-sm flex gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <div className="font-semibold text-amber-500 mb-2 text-base">⚠ 授权提醒</div>
            <p className="text-muted-foreground leading-relaxed">
              涉及扫描 / 抓包 / 封禁的命令仅限在你自己拥有或经过授权的资产上使用；
              勒索、挖矿、Webshell 类应急建议同步通知安全负责人和法务，注意保留完整证据链。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

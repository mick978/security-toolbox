export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  ChevronRight, AlertTriangle, Zap, Cloud, Boxes, Smartphone, Waypoints,
  Clock, Shield, BookOpen,
  Info, Siren,
  Globe, Swords, MonitorSmartphone,
} from "lucide-react";
import { cheatsheets, caseCategories, casesByCategory } from "@/lib/cheatsheets";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExploreHero, ExploreHeroBadge } from "@/components/explore-hero";
import { ExploreSection } from "@/components/explore-section";

export const metadata = {
  title: "场景速查 · SecToolbox",
  description: "按典型排查场景组织的实战 SOP · 网络 / 攻击 / 系统 / 云安全 / K8s / 移动抓包 / 内网横向",
};

/* Severity chip — `Icon` (Lucide component) replaces the previous emoji
 * string so it scales with the chip and reads the same on every device. */
const sevStyle = {
  info:   { label: "参考",                       cls: "bg-blue-500/10 text-blue-500 border-blue-500/30", Icon: Info },
  warn:   { label: "警告 · 请按顺序执行",          cls: "bg-amber-500/10 text-amber-500 border-amber-500/30", Icon: AlertTriangle },
  danger: { label: "紧急 · 建议同步通知安全 / 法务",   cls: "bg-red-500/10 text-red-500 border-red-500/30",     Icon: Siren },
};

/* Maps the cheatsheet `CaseCategory` slug to the icons we use in the
 * ExploreSection header + quick-nav pill. The category Visuals and the
 * securityAreas-table for agents/mcp use the same physical mapping; the
 * lib is not shared today because cheatsheet uses `CaseCategory`
 * (network/attack/...) while agents/mcp use `SecurityArea`
 * (recon/vuln-scan/...). When the two namespaces eventually unify, a
 * shared icon lookup can fold into lib/explore-palette. */
const categoryIcons: Record<string, { icon: typeof Globe; gradient: string; iconBg: string }> = {
  network:  { icon: Globe,              gradient: "from-blue-500/20 to-cyan-500/20",     iconBg: "bg-blue-500/10" },
  attack:   { icon: Swords,             gradient: "from-red-500/20 to-orange-500/20",    iconBg: "bg-red-500/10" },
  system:   { icon: MonitorSmartphone,  gradient: "from-purple-500/20 to-pink-500/20",   iconBg: "bg-purple-500/10" },
  cloud:    { icon: Cloud,              gradient: "from-sky-500/20 to-blue-500/20",      iconBg: "bg-sky-500/10" },
  k8s:      { icon: Boxes,              gradient: "from-indigo-500/20 to-violet-500/20", iconBg: "bg-indigo-500/10" },
  mobile:   { icon: Smartphone,         gradient: "from-emerald-500/20 to-teal-500/20",  iconBg: "bg-emerald-500/10" },
  lateral:  { icon: Waypoints,          gradient: "from-orange-500/20 to-amber-500/20",  iconBg: "bg-orange-500/10" },
};

export default function CheatsheetPage() {
  return (
    <div className="min-h-screen">
      <ExploreHero
        badge={<ExploreHeroBadge icon={BookOpen}>实战 SOP · 场景速查</ExploreHeroBadge>}
        titleLine1="经典排查"
        titleLine2="案例库"
        tldr={
          <>
            {cheatsheets.length} 个实战场景 SOP，覆盖
            <span className="text-foreground font-medium"> 网络、攻击、系统、云、K8s、移动、内网横向 </span>
            七大领域，每个案例都是
            <span className="text-foreground font-medium"> 经过验证的排查流程</span>，
            <span className="text-foreground font-medium"> 助你快速定位和解决问题</span>。
          </>
        }
        stats={[
          { value: cheatsheets.length.toString(),  label: "排查案例", icon: BookOpen },
          { value: caseCategories.length.toString(), label: "场景分类", icon: Shield },
          { value: "7",                              label: "覆盖领域", icon: Zap },
          { value: "100+",                           label: "排查命令", icon: Clock },
        ]}
        quickNav={caseCategories.map((cc) => {
          const visual = categoryIcons[cc.slug];
          const Icon = visual?.icon;
          return {
            label: cc.name,
            href: `#${cc.slug}`,
            icon: Icon,
            count: casesByCategory(cc.slug).length,
          };
        })}
      />

      <section className="container pt-block pb-section">
        <div className="space-y-16">
          {caseCategories.map((cc) => {
            const list = casesByCategory(cc.slug);
            const visual = categoryIcons[cc.slug];
            const Icon = visual.icon;

            return (
              <ExploreSection
                key={cc.slug}
                id={cc.slug}
                areaSlug={cc.slug}
                title={cc.name}
                icon={Icon}
                count={list.length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-list">
                  {list.map((c, idx) => {
                    const sev = c.severity ? sevStyle[c.severity] : null;
                    return (
                      <Link key={c.slug} href={`/cheatsheet/${c.slug}`} className="group">
                        <Card className="h-full transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 overflow-hidden">
                          <div className={`h-1 bg-gradient-to-r ${
                            c.severity === "danger" ? "from-red-500 to-orange-500" :
                            c.severity === "warn" ? "from-amber-500 to-yellow-500" :
                            "from-primary/50 to-primary/20"
                          }`} aria-hidden="true" />

                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-3">
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
                                  {sev.Icon && <sev.Icon className="h-3 w-3 mr-1" aria-hidden="true" />}
                                  {sev.label}
                                </span>
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0">
                            <div className="flex flex-wrap gap-1 mb-3">
                              {c.tags.slice(0, 4).map((t) => (
                                <Badge key={t} className="text-[10px] py-0">#{t}</Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-border/40">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" aria-hidden="true" />
                                  {c.steps.length} 步
                                </span>
                                {c.relatedTools && (
                                  <span className="flex items-center gap-1">
                                    <Zap className="h-3 w-3" aria-hidden="true" />
                                    {c.relatedTools.length} 工具
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                查看详情
                                <ChevronRight className="h-4 w-4 ml-0.5" aria-hidden="true" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </ExploreSection>
            );
          })}
        </div>
      </section>

      {/* Warning Footer */}
      <section className="container pb-section">
        <div className="p-6 border border-amber-500/30 bg-amber-500/5 rounded-xl text-sm flex gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" aria-hidden="true" />
          </div>
          <div>
            <div className="font-semibold text-amber-500 mb-2 text-base inline-flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              授权提醒
            </div>
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

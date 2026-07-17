export const dynamic = "force-dynamic";

import Link from "next/link";
import * as Icons from "lucide-react";
import { cheatsheets, caseCategories, casesByCategory } from "@/lib/cheatsheets";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, AlertTriangle, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "场景速查 · SecToolbox",
  description: "按典型排查场景组织的实战 SOP · 网络 / 攻击 / 系统 / 云安全 / K8s / 移动抓包 / 内网横向",
};

const sevStyle = {
  info:   { label: "参考", cls: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  warn:   { label: "警告", cls: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  danger: { label: "紧急", cls: "bg-red-500/10 text-red-500 border-red-500/30" },
};

export default function CheatsheetPage() {
  return (
    <div className="container py-10 max-w-6xl">
      <header className="mb-10">
        <h1 className="text-4xl font-bold">经典排查案例</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {cheatsheets.length} 个实战场景 SOP —— 网络 / 攻击 / 系统 / 云 / K8s / 移动 / 内网横向
        </p>
        <div className="flex gap-3 mt-4 text-sm">
          {caseCategories.map((cc) => {
            const n = casesByCategory(cc.slug).length;
            return (
              <a key={cc.slug} href={`#${cc.slug}`} className="text-primary hover:underline">
                {cc.name} · {n}
              </a>
            );
          })}
        </div>
      </header>

      <div className="space-y-14">
        {caseCategories.map((cc) => {
          const Icon = (Icons as any)[cc.icon] ?? ShieldAlert;
          const list = casesByCategory(cc.slug);
          return (
            <section key={cc.slug} id={cc.slug} className="scroll-mt-20">
              <div className="flex items-baseline gap-3 mb-6 border-b border-border pb-3">
                <Icon className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">{cc.name}</h2>
                <span className="text-sm text-muted-foreground">{cc.desc}</span>
                <span className="ml-auto text-xs text-muted-foreground">{list.length} 个场景</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map((c) => {
                  const sev = c.severity ? sevStyle[c.severity] : null;
                  return (
                    <Link key={c.slug} href={`/cheatsheet/${c.slug}`} className="group">
                      <Card className="h-full transition-all group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base leading-snug">{c.title}</CardTitle>
                            {sev && (
                              <span className={`text-[10px] px-2 py-0.5 rounded border font-mono shrink-0 ${sev.cls}`}>
                                {sev.label}
                              </span>
                            )}
                          </div>
                          <CardDescription className="line-clamp-2">{c.summary}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {c.tags.slice(0, 4).map((t) => (
                                <Badge key={t} className="text-[10px]">#{t}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              {c.steps.length} 步
                              <ChevronRight className="h-4 w-4 ml-1 group-hover:text-primary transition-colors" />
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

      <div className="mt-16 p-5 border border-amber-500/30 bg-amber-500/5 rounded-lg text-sm flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-amber-500 mb-1">授权提醒</div>
          <p className="text-muted-foreground">
            涉及扫描 / 抓包 / 封禁的命令仅限在你自己拥有或经过授权的资产上使用；勒索、挖矿、Webshell 类应急建议同步通知安全负责人和法务，注意保留完整证据链。
          </p>
        </div>
      </div>
    </div>
  );
}

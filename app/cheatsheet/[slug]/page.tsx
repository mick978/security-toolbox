import { notFound } from "next/navigation";
import Link from "next/link";
import { cheatsheets, cheatBySlug, caseCategories } from "@/lib/cheatsheets";
import { toolBySlug } from "@/lib/tools";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/code-block";
import { Mermaid } from "@/components/mermaid";
import { Topology } from "@/components/topology";
import { ArrowLeft, AlertTriangle, ShieldAlert, Clock, Wrench, ChevronRight, BookOpen, Zap } from "lucide-react";

const sevStyle = {
  info: { label: "参考", cls: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: "📘" },
  warn: { label: "警告 · 请按顺序执行", cls: "bg-amber-500/10 text-amber-500 border-amber-500/30", icon: "⚠️" },
  danger: { label: "紧急 · 建议同步通知安全 / 法务", cls: "bg-red-500/10 text-red-500 border-red-500/30", icon: "🚨" },
};

const categoryVisuals: Record<string, { emoji: string; gradient: string }> = {
  network: { emoji: "🌐", gradient: "from-blue-500/20 to-cyan-500/20" },
  attack: { emoji: "⚔️", gradient: "from-red-500/20 to-orange-500/20" },
  system: { emoji: "🖥️", gradient: "from-purple-500/20 to-pink-500/20" },
  cloud: { emoji: "☁️", gradient: "from-sky-500/20 to-blue-500/20" },
  k8s: { emoji: "☸️", gradient: "from-indigo-500/20 to-violet-500/20" },
  mobile: { emoji: "📱", gradient: "from-emerald-500/20 to-teal-500/20" },
  lateral: { emoji: "🕸️", gradient: "from-orange-500/20 to-amber-500/20" },
};

export function generateStaticParams() {
  return cheatsheets.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = cheatBySlug(slug);
  if (!c) return { title: "案例未找到" };
  return { title: `${c.title} · SecToolbox`, description: c.summary };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = cheatBySlug(slug);
  if (!c) notFound();

  const cat = caseCategories.find((x) => x.slug === c.category)!;
  const sev = c.severity ? sevStyle[c.severity] : null;
  const relatedTools = Array.from(new Set(c.steps.map((s) => s.tool).filter(Boolean))) as string[];
  const visual = categoryVisuals[c.category];

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className={`absolute inset-0 bg-gradient-to-r ${visual?.gradient} opacity-30`} />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="container relative py-10 max-w-4xl">
          <Link href="/cheatsheet" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> 返回案例库
          </Link>

          <div className="flex items-start gap-4">
            <div className="text-5xl">{visual?.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Link href={`/cheatsheet#${cat.slug}`} className="hover:text-primary">{cat.name}</Link>
                <ChevronRight className="h-3 w-3" />
                <span>案例详情</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{c.title}</h1>
              <p className="text-lg text-muted-foreground">{c.summary}</p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{c.steps.length} 个步骤</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Wrench className="h-4 w-4" />
                  <span>{relatedTools.length} 个工具</span>
                </div>
                {sev && (
                  <Badge className={`${sev.cls} text-xs`}>
                    {sev.icon} {sev.label}
                  </Badge>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {c.tags.map((t) => (
                  <Badge key={t} className="text-xs">#{t}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="container py-10 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            排查步骤
          </h2>
          <p className="text-sm text-muted-foreground mt-1">按照以下步骤逐步排查，每步都有详细的命令和说明</p>
        </div>

        <ol className="space-y-8">
          {c.steps.map((step, i) => (
            <li key={i} className="relative">
              {/* Step card */}
              <div className="border border-border/60 rounded-xl overflow-hidden hover:border-primary/40 transition-colors">
                {/* Step header */}
                <div className="flex items-center gap-4 p-4 bg-secondary/30 border-b border-border/40">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-lg">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    {step.desc && (
                      <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                    )}
                  </div>
                  {step.tool && (
                    <Link
                      href={`/tools/${step.tool}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      {step.tool}
                    </Link>
                  )}
                </div>

                {/* Step content */}
                <div className="p-4 space-y-4">
                  {step.mermaid && <Mermaid chart={step.mermaid} />}
                  {step.topology && <Topology ascii={step.topology} />}
                  {step.cmd && (
                    <div className="ml-0">
                      <CodeBlock cmd={step.cmd} />
                    </div>
                  )}
                  {step.tool && (
                    <Link
                      href={`/tools/${step.tool}`}
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Zap className="h-3 w-3" />
                      查看 {step.tool} 工具详情 →
                    </Link>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {i < c.steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="w-0.5 h-6 bg-border/60" />
                </div>
              )}
            </li>
          ))}
        </ol>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              用到的工具
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedTools.map((slug) => {
                const t = toolBySlug(slug);
                if (!t) return null;
                return (
                  <Link
                    key={slug}
                    href={`/tools/${slug}`}
                    className="p-4 border border-border/60 rounded-xl hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                  >
                    <div className="font-mono text-sm text-primary group-hover:text-primary/80">{t.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.tagline}</div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Warning */}
        <div className="mt-12 p-6 border border-amber-500/30 bg-amber-500/5 rounded-xl flex gap-4 text-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <div className="font-semibold text-amber-500 mb-2">⚠ 授权提醒</div>
            <p className="text-muted-foreground leading-relaxed">
              文中命令仅限在你自己拥有或已获授权的资产上执行。
              生产环境务必先在测试环境演练，紧急处置类操作保留日志、镜像与操作记录。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

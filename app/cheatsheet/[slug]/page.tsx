import { notFound } from "next/navigation";
import Link from "next/link";
import { cheatsheets, cheatBySlug, caseCategories } from "@/lib/cheatsheets";
import { toolBySlug } from "@/lib/tools";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/code-block";
import { Mermaid } from "@/components/mermaid";
import { Topology } from "@/components/topology";
import { FavoriteButton } from "@/components/favorites-provider";
import { exploreBg } from "@/lib/explore-palette";
import {
  ArrowLeft, AlertTriangle, ChevronRight, BookOpen, Zap, Wrench, Clock,
  Globe, Swords, MonitorSmartphone, Cloud, Boxes, Smartphone, Waypoints,
  Info, Siren, Lightbulb, ListChecks, Check, GitBranch, Calendar,
} from "lucide-react";

/* Severity chip — `Icon` (Lucide component) replaces the previous emoji
 * string so it scales with the chip and reads the same on every device. */
const sevStyle = {
  info:   { label: "参考",                       cls: "bg-blue-500/10 text-blue-500 border-blue-500/30",   Icon: Info },
  warn:   { label: "警告 · 请按顺序执行",          cls: "bg-amber-500/10 text-amber-500 border-amber-500/30", Icon: AlertTriangle },
  danger: { label: "紧急 · 建议同步通知安全 / 法务",   cls: "bg-red-500/10 text-red-500 border-red-500/30",     Icon: Siren },
};

/* Difficulty chip — keeps the same warm/cool palette direction as the
 * category colors so users learn the visual grammar. */
const difficultyStyle: Record<string, { label: string; cls: string }> = {
  beginner:     { label: "入门", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
  intermediate: { label: "进阶", cls: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  advanced:     { label: "高级", cls: "bg-rose-500/10 text-rose-500 border-rose-500/30" },
};

const categoryVisuals: Record<string, { Icon: typeof Globe; gradient: string }> = {
  network:  { Icon: Globe,             gradient: "from-blue-500/20 to-cyan-500/20" },
  attack:   { Icon: Swords,            gradient: "from-red-500/20 to-orange-500/20" },
  system:   { Icon: MonitorSmartphone, gradient: "from-purple-500/20 to-pink-500/20" },
  cloud:    { Icon: Cloud,             gradient: "from-sky-500/20 to-blue-500/20" },
  k8s:      { Icon: Boxes,             gradient: "from-indigo-500/20 to-violet-500/20" },
  mobile:   { Icon: Smartphone,        gradient: "from-emerald-500/20 to-teal-500/20" },
  lateral:  { Icon: Waypoints,         gradient: "from-orange-500/20 to-amber-500/20" },
};

/* Render durationMinutes as a friendly chip. Bucketed to the nearest 5 min
 * under an hour, and rounded to the nearest 15 min above an hour, so two
 * similar SOPs don't show noisy ±2 min differences. */
function formatDuration(minutes: number): string {
  if (minutes <= 15)  return `${minutes} 分钟`;
  if (minutes <= 60)  return `约 ${Math.round(minutes / 5) * 5} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `约 ${h} 小时` : `约 ${h} 小时 ${m} 分`;
}

// SSG only top-10 cheatsheets by category priority (network/attack/system
// first). Full list used to be 50+ pages which on Next 16 + webpack hits a
// race in the trace collector; 10 covers the popular surface and the rest
// fall through to dynamic.
export function generateStaticParams() {
  const priority = (slug: string) =>
    slug.startsWith("network-") || slug.startsWith("http-") || slug.startsWith("tls-") ? 0
    : slug.startsWith("attack-") || slug.startsWith("lateral-") ? 1
    : 2;
  return [...cheatsheets]
    .sort((a, b) => priority(a.slug) - priority(b.slug) || a.slug.localeCompare(b.slug))
    .slice(0, 10)
    .map((c) => ({ slug: c.slug }));
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
  const diff = c.difficulty ? difficultyStyle[c.difficulty] : null;
  const relatedTools = Array.from(new Set(c.steps.map((s) => s.tool).filter(Boolean))) as string[];
  const visual = categoryVisuals[c.category];
  const CatIcon = visual.Icon;

  return (
    <div className="min-h-screen">
      {/* Hero Header — same recipe as <ExploreHero /> so a case-detail
          page doesn't look out of place next to the catalog listing. */}
      <section className="relative overflow-hidden border-b border-border/60 rounded-b-2xl">
        <div className="absolute inset-0 hero-gradient-animated opacity-70" aria-hidden="true" />
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
        <div className="container relative py-16 lg:py-20 max-w-4xl">
          <Link
            href="/cheatsheet"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md px-2 py-1"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> 返回案例库
          </Link>

          <div className="flex items-start gap-4">
            <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${exploreBg(c.category)} border border-border/40 shrink-0`}>
              <CatIcon className="h-7 w-7 text-foreground/80" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Link
                  href={`/cheatsheet#${cat.slug}`}
                  className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
                >
                  {cat.name}
                </Link>
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <span>案例详情</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{c.title}</h1>

              {/* TL;DR — bold + accent border so readers see the punchline
                  before scrolling into the steps. Same data as OG cards /
                  search snippets — kept in sync via `c.summary`. */}
              {c.summary && (
                <div className="flex items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 mb-4">
                  <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-sm md:text-base text-foreground/90 italic leading-relaxed">
                    {c.summary}
                  </p>
                </div>
              )}

              {/* Meta chip row — duration / difficulty / step count /
                  tool count / severity / last-reviewed. Single scan
                  line, no math required from the reader. */}
              <div className="flex flex-wrap items-center gap-2.5">
                {c.durationMinutes != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-xs">
                    <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span className="font-medium">{formatDuration(c.durationMinutes)}</span>
                  </span>
                )}
                {diff && (
                  <Badge className={`${diff.cls} text-xs gap-1`}>
                    <GitBranch className="h-3 w-3" aria-hidden="true" /> {diff.label}
                  </Badge>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                  {c.steps.length} 步
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                  {relatedTools.length} 工具
                </span>
                {sev && (
                  <Badge className={`${sev.cls} text-xs gap-1`}>
                    <sev.Icon className="h-3 w-3" aria-hidden="true" /> {sev.label}
                  </Badge>
                )}
                {c.lastReviewed && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    复审 {c.lastReviewed}
                  </span>
                )}
              </div>

              {/* Tags + favorite (unchanged) */}
              <div className="flex flex-wrap items-center gap-1.5 mt-4">
                {c.tags.map((t) => (
                  <Badge key={t} className="text-xs">#{t}</Badge>
                ))}
                <FavoriteButton
                  kind="cheatsheet"
                  slug={c.slug}
                  label={c.title}
                  hint={c.summary}
                  className="w-9 h-9 min-h-0 min-w-0 ml-1"
                />
              </div>
            </div>
          </div>

          {/* Prereq — collapsible. 90% of repeat readers can skip it,
              but newcomers want it. The default-closed state respects
              their time without hiding the data. */}
          {c.prereq && c.prereq.length > 0 && (
            <details className="mt-6 group rounded-lg border border-border/60 bg-secondary/30 overflow-hidden">
              <summary className="cursor-pointer px-4 py-3 flex items-center gap-2 font-medium text-sm select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                <ListChecks className="h-4 w-4 text-primary" aria-hidden="true" />
                前置依赖（{c.prereq.length} 项）
                <ChevronRight className="h-4 w-4 ml-auto transition-transform group-open:rotate-90" aria-hidden="true" />
              </summary>
              <ul className="px-4 pb-4 pt-1 space-y-1.5 text-sm text-muted-foreground">
                {c.prereq.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" aria-hidden="true" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </section>

      {/* Steps */}
      <section className="container py-10 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                      {step.tool}
                    </Link>
                  )}
                </div>

                {/* Step content */}
                <div className="p-4 space-y-4">
                  {step.mermaid && <Mermaid chart={step.mermaid} />}
                  {step.topology && <Topology ascii={step.topology} />}
                  {step.cmd && (
                    <div>
                      <CodeBlock cmd={step.cmd} />
                    </div>
                  )}
                  {step.tool && (
                    <Link
                      href={`/tools/${step.tool}`}
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
                    >
                      <Zap className="h-3 w-3" aria-hidden="true" />
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

        {/* Related Cases — hand-curated, cross-category. Distinct from
            the auto "same category" and from `relatedTools`: these are
            follow-up reads, not prerequisites. */}
        {c.relatedCases && c.relatedCases.length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" aria-hidden="true" />
              相关案例
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {c.relatedCases.map((s) => {
                const r = cheatBySlug(s);
                if (!r) return null;
                return (
                  <Link
                    key={s}
                    href={`/cheatsheet/${r.slug}`}
                    className="group block p-4 border border-border/60 rounded-xl hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="flex items-start gap-2">
                      <GitBranch className="h-3.5 w-3.5 mt-1 text-muted-foreground shrink-0" aria-hidden="true" />
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors">{r.title}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.summary}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" aria-hidden="true" />
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
                    className="p-4 border border-border/60 rounded-xl hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="font-mono text-sm text-primary group-hover:text-primary/80">{t.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.tagline}</div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Warning — `AlertTriangle` replaces the prior emoji `⚠`. */}
        <div className="mt-12 p-6 border border-amber-500/30 bg-amber-500/5 rounded-xl flex gap-4 text-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" aria-hidden="true" />
          </div>
          <div>
            <div className="font-semibold text-amber-500 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              授权提醒
            </div>
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

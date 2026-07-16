import { notFound } from "next/navigation";
import Link from "next/link";
import { cheatsheets, cheatBySlug, caseCategories } from "@/lib/cheatsheets";
import { toolBySlug } from "@/lib/tools";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/code-block";
import { ArrowLeft, AlertTriangle, ShieldAlert } from "lucide-react";

const sevStyle = {
  info:   { label: "参考", cls: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  warn:   { label: "警告 · 请按顺序执行", cls: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  danger: { label: "紧急 · 建议同步通知安全 / 法务", cls: "bg-red-500/10 text-red-500 border-red-500/30" },
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

  return (
    <div className="container py-10 max-w-4xl">
      <Link href="/cheatsheet" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> 返回案例库
      </Link>

      <header className="mb-8">
        <div className="text-xs text-muted-foreground mb-2">
          <Link href={`/cheatsheet#${cat.slug}`} className="hover:text-primary">{cat.name}</Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">{c.title}</h1>
        <p className="text-lg text-muted-foreground">{c.summary}</p>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {c.tags.map((t) => <Badge key={t}>#{t}</Badge>)}
        </div>
      </header>

      {sev && (
        <div className={`mb-8 p-4 border rounded-lg flex gap-3 ${sev.cls}`}>
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{sev.label}</div>
        </div>
      )}

      <ol className="space-y-6">
        {c.steps.map((step, i) => (
          <li key={i} className="border-l-2 border-primary/40 pl-5 relative">
            <span className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <h3 className="font-semibold mb-1.5 ml-2">{step.title}</h3>
            {step.desc && <p className="text-sm text-muted-foreground mb-2 ml-2">{step.desc}</p>}
            {step.cmd && (
              <div className="ml-0">
                <CodeBlock cmd={step.cmd} />
              </div>
            )}
            {step.tool && (
              <Link
                href={`/tools/${step.tool}`}
                className="text-xs text-primary hover:underline mt-1.5 inline-block ml-2"
              >
                → 该步用到 {step.tool}，查看工具详情
              </Link>
            )}
          </li>
        ))}
      </ol>

      {relatedTools.length > 0 && (
        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="text-xl font-semibold mb-4">用到的工具</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {relatedTools.map((slug) => {
              const t = toolBySlug(slug);
              if (!t) return null;
              return (
                <Link
                  key={slug}
                  href={`/tools/${slug}`}
                  className="p-3 border border-border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="font-mono text-sm text-primary">{t.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{t.tagline}</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-12 p-4 border border-border rounded-lg bg-muted/30 flex gap-3 text-sm">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-muted-foreground">
          文中命令仅限在你自己拥有或已获授权的资产上执行。生产环境务必先在测试环境演练，紧急处置类操作保留日志、镜像与操作记录。
        </p>
      </div>
    </div>
  );
}

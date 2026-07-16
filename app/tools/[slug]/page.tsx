import { notFound } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import { toolBySlug, categoryBySlug, tools } from "@/lib/tools";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";
import { ArrowLeft, ExternalLink, Terminal, AlertTriangle, Package, BookOpen } from "lucide-react";

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = toolBySlug(slug);
  if (!t) return { title: "工具未找到" };
  return { title: `${t.name} · ${t.tagline} · SecToolbox`, description: t.description };
}

export default async function ToolDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool) notFound();
  const cat = categoryBySlug(tool.category)!;
  const CatIcon = (Icons as any)[cat.icon] ?? Icons.Circle;
  const dangerous = tool.category === "vulnscan" || tool.slug === "sqlmap" || tool.slug === "masscan";

  return (
    <div className="container py-10 max-w-4xl">
      <Link href="/tools" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回工具库
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <CatIcon className={`h-6 w-6 ${cat.accent}`} />
            <Link href={`/tools?cat=${cat.slug}`} className="text-sm text-muted-foreground hover:text-primary">
              {cat.name}
            </Link>
          </div>
          <h1 className="text-3xl font-bold font-mono text-primary">{tool.name}</h1>
          <p className="text-lg text-muted-foreground mt-2">{tool.tagline}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {tool.builtin && <Badge>系统内置</Badge>}
          <Badge>难度 {tool.difficulty}</Badge>
          <div className="flex gap-1">
            {tool.platforms.map((p) => (
              <Badge key={p}>{p}</Badge>
            ))}
          </div>
        </div>
      </div>

      <p className="text-foreground/90 leading-relaxed mb-6">{tool.description}</p>

      {dangerous && (
        <div className="flex gap-3 rounded-md border border-rose-500/40 bg-rose-500/10 p-4 mb-8">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-rose-300 mb-1">授权提醒</div>
            <p className="text-muted-foreground">
              此工具具备扫描 / 漏洞检测 / 注入能力。请仅在你<span className="text-foreground font-medium">明确取得书面授权</span>的目标上运行，
              否则可能触犯《网络安全法》《数据安全法》与刑法相关条款。
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-8">
        {tool.tags.map((t) => (
          <Badge key={t}>#{t}</Badge>
        ))}
      </div>

      {/* Install */}
      {tool.install && tool.install.length > 0 && (
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
            <Package className="h-4 w-4 text-primary" />
            安装
          </h2>
          <div className="space-y-3">
            {tool.install.map((i, idx) => (
              <div key={idx}>
                <div className="text-xs text-muted-foreground mb-1.5">通过 {i.manager}</div>
                <CodeBlock cmd={i.cmd} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Examples */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
          <Terminal className="h-4 w-4 text-primary" />
          用法示例
        </h2>
        <div className="space-y-4">
          {tool.examples.map((ex, idx) => (
            <div key={idx}>
              <div className="flex items-baseline justify-between mb-1.5">
                <div className="text-sm font-medium">{ex.label}</div>
                {ex.note && <div className="text-xs text-muted-foreground">{ex.note}</div>}
              </div>
              <CodeBlock cmd={ex.cmd} />
            </div>
          ))}
        </div>
      </section>

      {/* Links */}
      {(tool.docs || tool.homepage) && (
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
            <BookOpen className="h-4 w-4 text-primary" />
            延伸阅读
          </h2>
          <div className="space-y-2">
            {tool.homepage && (
              <a
                href={tool.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {tool.homepage}
              </a>
            )}
            {tool.docs && (
              <a
                href={tool.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {tool.docs}
              </a>
            )}
          </div>
        </section>
      )}

      {/* Related */}
      <section>
        <h2 className="text-xl font-semibold mb-4">同分类推荐</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {tools
            .filter((t) => t.category === tool.category && t.slug !== tool.slug)
            .slice(0, 4)
            .map((t) => (
              <Link key={t.slug} href={`/tools/${t.slug}`} className="group">
                <Card className="h-full transition-colors hover:border-primary/60">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-primary text-sm">{t.name}</code>
                      <Badge className="ml-auto">{t.difficulty}</Badge>
                    </div>
                    <CardDescription className="mt-2">{t.tagline}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { news, newsBySlug, newsCategories, relatedNews, type NewsItem, type NewsCategory } from "@/lib/news";
import { Badge } from "@/components/ui/badge";
import { ArticleMarkdown } from "@/components/article-markdown";
import { exploreBg } from "@/lib/explore-palette";
import { SITE_URL, ORG_ID, canonical } from "@/lib/site";
import {
  ArrowLeft, ChevronRight, Calendar, Clock, ExternalLink, AlertTriangle,
  Lightbulb, Newspaper, Bot, ShieldAlert, Globe, ListChecks, HelpCircle,
} from "lucide-react";

/** Build the NewsArticle + (optional) FAQPage graph for one article.
 *  Kept as a function so changes to the schema live in one place; the
 *  detail page just JSON.stringifies the result into the <script>.
 *  Defensive: any field that could be empty is omitted rather than
 *  emitting an empty string — empty fields are schema violations
 *  in some validators (e.g. Google Rich Results Test). */
function buildNewsArticleJsonLd(n: NewsItem) {
  const url = canonical(`/news/${n.slug}`);
  const dateISO = `${n.date}T00:00:00+08:00`;
  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    headline: n.title,
    description: n.description,
    datePublished: dateISO,
    dateModified: dateISO,
    inLanguage: "zh-CN",
    keywords: n.tags.join(", "),
    articleSection: n.category,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", "@id": ORG_ID, name: "SecToolbox" },
    publisher: { "@id": ORG_ID },
  };
  if (n.faq && n.faq.length > 0) {
    article.hasPart = {
      "@type": "FAQPage",
      mainEntity: n.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
  }
  return article;
}

/* Same category -> area-slug mapping as the listing page so the hero
 * tile color matches the section header the reader came from. */
const categoryVisuals: Record<NewsCategory, { Icon: typeof Globe; areaSlug: string; name: string }> = {
  ai:           { Icon: Bot,          areaSlug: "compliance", name: "AI 资讯" },
  attack:       { Icon: ShieldAlert,  areaSlug: "exploit",    name: "攻击事件" },
  troubleshoot: { Icon: Globe,        areaSlug: "recon",      name: "排查实战" },
};

/* "2026-01-15" -> "2026.01.15" - dot-separated, stable across server /
 * client (no Date parsing => no timezone drift). */
function fmtDate(iso: string): string {
  return iso.replace(/-/g, ".");
}

// SSG the top 10 by category priority (ai/attack first) + featured, same
// rationale as cheatsheet: keep the prerendered page count manageable on
// Next 16 + webpack; the rest fall through to dynamic.
export function generateStaticParams() {
  const priority = (slug: string) =>
    slug.startsWith("llm-") || slug.startsWith("ai-") || slug.startsWith("owasp-") ? 0
    : slug.startsWith("ransomware") || slug.startsWith("in-the-wild") || slug.startsWith("data-breach") ? 1
    : 2;
  return [...news]
    .sort((a, b) =>
      priority(a.slug) - priority(b.slug)
      || Number(b.featured ?? false) - Number(a.featured ?? false)
      || a.slug.localeCompare(b.slug),
    )
    .slice(0, 10)
    .map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = newsBySlug(slug);
  if (!n) return { title: "文章未找到" };
  return {
    title: n.title,
    description: n.description,
    alternates: { canonical: canonical(`/news/${slug}`) },
    openGraph: {
      type: "article",
      title: n.title,
      description: n.description,
      url: canonical(`/news/${slug}`),
      publishedTime: n.date,
      authors: [n.author ?? "SecToolbox 编辑组"],
      tags: n.tags,
    },
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = newsBySlug(slug);
  if (!n) notFound();

  const cat = newsCategories.find((x) => x.slug === n.category)!;
  const visual = categoryVisuals[n.category];
  const CatIcon = visual.Icon;
  const related = relatedNews(slug, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Header - same recipe as <ExploreHero /> / cheatsheet detail
          so an article page doesn't look out of place next to the catalog. */}
      <section className="relative overflow-hidden border-b border-border/60 rounded-b-2xl">
        <div className="absolute inset-0 hero-gradient-animated opacity-70" aria-hidden="true" />
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
        <div className="container relative py-16 lg:py-20 max-w-4xl">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md px-2 py-1"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> 返回资讯列表
          </Link>

          <div className="flex items-start gap-4">
            <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${exploreBg(visual.areaSlug)} border border-border/40 shrink-0`}>
              <CatIcon className="h-7 w-7 text-foreground/80" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Link
                  href={`/news#${cat.slug}`}
                  className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
                >
                  {visual.name}
                </Link>
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <span>资讯正文</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{n.title}</h1>

              {/* TL;DR - same accent-bordered box as cheatsheet detail. */}
              {n.summary && (
                <div className="flex items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 mb-4">
                  <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-sm md:text-base text-foreground/90 italic leading-relaxed">
                    {n.summary}
                  </p>
                </div>
              )}

              {/* Meta chip row - date / read time / source / category. */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-xs">
                  <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  <span className="font-medium">{fmtDate(n.date)}</span>
                </span>
                {n.readMinutes && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-xs">
                    <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span className="font-medium">{n.readMinutes} 分钟阅读</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
                  {n.source}
                </span>
                {n.sourceUrl && (
                  <a
                    href={n.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
                  >
                    查看来源
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 mt-4">
                {n.tags.map((t) => (
                  <Badge key={t} className="text-xs">#{t}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article body */}
      <article className="container py-10 max-w-3xl">
        {/* AEO / JSON-LD: NewsArticle + optional FAQPage. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildNewsArticleJsonLd(n)) }}
        />

        <ArticleMarkdown source={n.body} />

        {/* Key facts — readable for humans, quotable for AI agents.
            <dl> gives search engines a clear structure. */}
        {n.keyFacts && n.keyFacts.length >= 3 && (
          <section id="key-facts" className="mt-10 pt-8 border-t border-border/60 scroll-mt-24" aria-labelledby="key-facts-heading">
            <h2 id="key-facts-heading" className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
              关键事实
            </h2>
            <dl className="grid gap-2.5 sm:grid-cols-2">
              {n.keyFacts.map((fact, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-border/60 bg-secondary/30 px-3 py-2.5">
                  <span className="text-primary/70 font-mono text-xs mt-0.5 shrink-0" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <dd className="text-sm text-foreground/90 leading-relaxed m-0">{fact}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* FAQ — collapsed by default to keep the article visually clean.
            Each entry is also emitted as a Question/Answer in JSON-LD. */}
        {n.faq && n.faq.length > 0 && (
          <section id="faq" className="mt-8" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-xl font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" aria-hidden="true" />
              常见问题
            </h2>
            <div className="space-y-2">
              {n.faq.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-lg border border-border/60 bg-card overflow-hidden"
                >
                  <summary className="cursor-pointer px-4 py-3 flex items-center gap-2 font-medium text-sm select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    {f.q}
                    <ChevronRight className="h-4 w-4 ml-auto transition-transform group-open:rotate-90 text-muted-foreground" aria-hidden="true" />
                  </summary>
                  <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related - same-category follow-up reads. */}
        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border/60">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" aria-hidden="true" />
              相关资讯
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {related.map((r) => {
                const rVisual = categoryVisuals[r.category];
                const RIcon = rVisual.Icon;
                return (
                  <Link
                    key={r.slug}
                    href={`/news/${r.slug}`}
                    className="group block p-4 border border-border/60 rounded-xl hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="flex items-start gap-2">
                      <RIcon className="h-3.5 w-3.5 mt-1 text-muted-foreground shrink-0" aria-hidden="true" />
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors line-clamp-2">{r.title}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.summary}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-1.5">{fmtDate(r.date)}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <div className="mt-12 p-6 border border-amber-500/30 bg-amber-500/5 rounded-xl flex gap-4 text-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" aria-hidden="true" />
          </div>
          <div>
            <div className="font-semibold text-amber-500 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              编辑说明
            </div>
            <p className="text-muted-foreground leading-relaxed">
              本文为基于公开报道与行业趋势的分析整理，具体事件与数字以官方通报为准。
              文中命令仅限在自有或已获授权的资产上验证，生产环境请先在测试环境演练并保留操作记录。
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

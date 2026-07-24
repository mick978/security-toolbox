import Link from "next/link";
import {
  ChevronRight, AlertTriangle, ExternalLink, Clock, Calendar,
  Newspaper, Bot, ShieldAlert, Globe, Sparkles,
} from "lucide-react";
import { news, newsCategories, topNewsByCategory, latestNews, type NewsCategory } from "@/lib/news";
import { Badge } from "@/components/ui/badge";
import { ExploreHero, ExploreHeroBadge } from "@/components/explore-hero";
import { ExploreSection } from "@/components/explore-section";
import { itemListFromSlugs } from "@/lib/aeo";

export const metadata = {
  title: "安全资讯 · SecToolbox",
  description: "AI / 网络攻击 / 网络排查 三大方向 Top 5 资讯 · 每篇都是可落地的复盘与分析",
  alternates: { canonical: "/news" },
};

/* Per-category visuals. The news category slugs (ai/attack/troubleshoot)
 * aren't in lib/explore-palette's SecurityAreaSlug set, so we map each to
 * an existing area slug for a real gradient + icon - keeps the section
 * headers colorful instead of falling through to the primary fallback. */
const categoryVisuals: Record<NewsCategory, { Icon: typeof Globe; areaSlug: string }> = {
  ai:           { Icon: Bot,          areaSlug: "compliance" },
  attack:       { Icon: ShieldAlert,  areaSlug: "exploit" },
  troubleshoot: { Icon: Globe,        areaSlug: "recon" },
};

/* "2026-01-15" -> "2026.01.15" - dot-separated stays tidy in a chip and
 * sorts correctly. Avoids Date parsing so it renders identically on the
 * server and client (no timezone drift). */
function fmtDate(iso: string): string {
  return iso.replace(/-/g, ".");
}

export default function NewsPage() {
  const featured = latestNews().find((n) => n.featured) ?? latestNews(1)[0];

  return (
    <div className="min-h-screen">
      {/* Top-10 ItemList — answers "what are SecToolbox's latest
          security articles" without crawling the page. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListFromSlugs(
              "SecToolbox 最新资讯",
              "/news",
              latestNews().map((n) => ({ slug: n.slug, name: n.title })),
            ),
          ),
        }}
      />
      <ExploreHero
        badge={<ExploreHeroBadge icon={Newspaper}>资讯 · 安全动态周报</ExploreHeroBadge>}
        titleLine1="安全资讯"
        titleLine2="与实战动态"
        tldr={
          <>
            覆盖
            <span className="text-foreground font-medium"> AI、网络攻击、网络问题排查 </span>
            三大方向，每个方向精选
            <span className="text-foreground font-medium"> Top 5 </span>
            资讯，每篇都是
            <span className="text-foreground font-medium"> 可落地的复盘与分析</span>。
          </>
        }
        stats={[
          { value: news.length.toString(),                label: "资讯文章", icon: Newspaper },
          { value: newsCategories.length.toString(),      label: "主题方向", icon: Sparkles },
          { value: "15",                                  label: "Top 精选", icon: ChevronRight },
          { value: latestNews().slice(0, 6).length.toString(), label: "近期待读", icon: Clock },
        ]}
        quickNav={newsCategories.map((cc) => {
          const visual = categoryVisuals[cc.slug];
          return {
            label: cc.name,
            href: `#${cc.slug}`,
            icon: visual.Icon,
            count: topNewsByCategory(cc.slug).length,
          };
        })}
      />

      {/* Featured lead - the single freshest featured article, pulled
       * above the per-category blocks so first-time readers land on one
       * strong read instead of a wall of equal-weight cards. */}
      {featured && (
        <section className="container pt-section pb-block">
          <Link
            href={`/news/${featured.slug}`}
            className="group block rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 to-transparent p-6 transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/15 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center gap-2 text-xs text-primary font-medium mb-3">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>头条 · {fmtDate(featured.date)}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors">
              {featured.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
              {featured.summary}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" /> {fmtDate(featured.date)}
              </span>
              {featured.readMinutes && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" /> {featured.readMinutes} 分钟
                </span>
              )}
              <span>来源 · {featured.source}</span>
              <span className="inline-flex items-center text-primary opacity-0 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                阅读全文
                <ChevronRight className="h-3.5 w-3.5 ml-0.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="container pb-section">
        <div className="space-y-16">
          {newsCategories.map((cc) => {
            const list = topNewsByCategory(cc.slug);
            const visual = categoryVisuals[cc.slug];
            return (
              <ExploreSection
                key={cc.slug}
                id={cc.slug}
                areaSlug={visual.areaSlug}
                title={cc.name}
                icon={visual.Icon}
                count={list.length}
              >
                {/* Category one-liner - gives the block a scannable intro
                    that the section header alone doesn't carry. */}
                <p className="text-sm text-muted-foreground -mt-4 mb-6">{cc.desc}</p>

                <ol className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-list">
                  {list.map((n, idx) => (
                    <li key={n.slug}>
                      <Link
                        href={`/news/${n.slug}`}
                        aria-label={`阅读 ${n.title}`}
                        className="group block h-full rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {/* Rank strip - #01..#05, mirrors the homepage
                            latest-cases numbering so the visual grammar
                            stays consistent across the site. */}
                        <div className="h-1 bg-gradient-to-r from-primary/50 to-primary/20" aria-hidden="true" />
                        <div className="p-5">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                            <span className="text-primary/60 font-semibold">
                              #{String(idx + 1).padStart(2, "0")}
                            </span>
                            <span className="opacity-40">·</span>
                            <span className="inline-flex items-center gap-1 text-[11px]">
                              <Calendar className="h-3 w-3" aria-hidden="true" />
                              {fmtDate(n.date)}
                            </span>
                            {n.readMinutes && (
                              <>
                                <span className="opacity-40">·</span>
                                <span className="inline-flex items-center gap-1 text-[11px]">
                                  <Clock className="h-3 w-3" aria-hidden="true" />
                                  {n.readMinutes} 分
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="text-base font-semibold mt-2 group-hover:text-primary transition-colors line-clamp-2">
                            {n.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                            {n.summary}
                          </p>

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1">
                              {n.tags.slice(0, 2).map((t) => (
                                <Badge key={t} className="text-[10px] py-0">#{t}</Badge>
                              ))}
                            </div>
                            <span className="text-[11px] text-muted-foreground shrink-0 truncate max-w-[40%]">
                              {n.source}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              </ExploreSection>
            );
          })}
        </div>
      </section>

      {/* Disclaimer footer - these are analytical write-ups based on
          publicly reported incidents, not breaking news wires. */}
      <section className="container pb-section">
        <div className="p-6 border border-amber-500/30 bg-amber-500/5 rounded-xl text-sm flex gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" aria-hidden="true" />
          </div>
          <div>
            <div className="font-semibold text-amber-500 mb-2 text-base inline-flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              编辑说明
            </div>
            <p className="text-muted-foreground leading-relaxed">
              本栏目文章为基于公开报道与行业趋势的<span className="text-foreground font-medium">分析整理</span>，
              非实时新闻快讯；涉及的具体事件、数字以官方通报为准。文中命令仅限在自有或授权资产上验证，
              生产环境请先在测试环境演练。
              <span className="inline-flex items-center gap-1 ml-1">
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                各篇末尾附参考来源。
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

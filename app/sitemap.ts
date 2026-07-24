import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { cheatsheets } from "@/lib/cheatsheets";
import { news } from "@/lib/news";
import { agentProjects, mcpProjects, skillProjects, getNetworkProjects } from "@/lib/github-projects";
import { SITE_URL, canonical } from "@/lib/site";

/* Build a sitemap at build time. Next auto-serves this at
 * /sitemap.xml when this file lives at app/sitemap.ts. URLs are
 * derived from the page data so a new tool / case / agent
 * automatically appears in the sitemap without a manual edit.
 *
 * Per Next docs the staging deploy gets its own baseUrl via the env
 * var so crawlers see correct canonical.
 *
 * lastModified: news carries an ISO `date` so we use it directly.
 * tools/cheatsheets don't carry a date field, so they fall back to
 * the build time. This gives crawlers an honest freshness signal
 * where we have one, and a reasonable "as of build" signal where
 * we don't. */

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  /* Static, discoverable pages */
  const staticEntries: MetadataRoute.Sitemap = [
    { url: canonical("/"),           lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: canonical("/tools"),      lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: canonical("/cheatsheet"), lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: canonical("/news"),       lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: canonical("/agents"),     lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: canonical("/mcp"),        lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: canonical("/network"),    lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: canonical("/ip-intel"),   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: canonical("/about"),      lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: canonical("/login"),      lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];

  /* Dynamic entries (slug-based pages). generateStaticParams in
   * each route already keeps the page count manageable; we list
   * every entry so search engines discover all of them. */
  const toolEntries:  MetadataRoute.Sitemap = tools.map((t) => ({
    url: canonical(`/tools/${t.slug}`),
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));
  const cheatEntries: MetadataRoute.Sitemap = cheatsheets.map((c) => ({
    url: canonical(`/cheatsheet/${c.slug}`),
    lastModified: c.lastReviewed ? new Date(c.lastReviewed) : now,
    changeFrequency: "monthly", priority: 0.7,
  }));
  /* News: use the article's own `date` so search engines get a
   * truthful freshness signal — that's the whole point of sitemap
   * lastModified per Google docs. */
  const newsEntries:  MetadataRoute.Sitemap = news.map((n) => ({
    url: canonical(`/news/${n.slug}`),
    lastModified: new Date(n.date),
    changeFrequency: "monthly", priority: 0.7,
  }));
  const agentEntries: MetadataRoute.Sitemap = agentProjects.map((p) => ({
    url: canonical(`/agents/${p.slug}`),
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));
  const mcpAndSkill:  MetadataRoute.Sitemap = [
    ...mcpProjects,
    ...skillProjects,
  ].map((p) => ({
    url: canonical(`/mcp/${p.slug}`),
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));
  const networkEntries: MetadataRoute.Sitemap = getNetworkProjects().map((p) => ({
    url: canonical("/network"), /* aggregated detail page lives at /network */
    lastModified: now, changeFrequency: "monthly", priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...toolEntries,
    ...cheatEntries,
    ...newsEntries,
    ...agentEntries,
    ...mcpAndSkill,
    ...networkEntries,
  ];
}

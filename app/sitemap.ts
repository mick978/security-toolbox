import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { cheatsheets } from "@/lib/cheatsheets";
import { agentProjects, mcpProjects, skillProjects, getNetworkProjects } from "@/lib/github-projects";

/* Build a sitemap at build time. Next auto-serves this at
 * /sitemap.xml when this file lives at app/sitemap.ts. URLs are
 * derived from the page data so a new tool / case / agent
 * automatically appears in the sitemap without a manual edit.
 *
 * baseUrl comes from NEXT_PUBLIC_SITE_URL or falls back to the
 * production host. Per Next docs the staging deploy gets its own
 * baseUrl via the env var so crawlers see correct canonical. */

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sectoolbox.dev";
  const now = new Date();
  /* Static, discoverable pages */
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`,            lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/tools`,       lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/cheatsheet`,  lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/agents`,      lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/mcp`,         lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/network`,     lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/ip-intel`,    lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`,       lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/login`,       lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];

  /* Dynamic entries (slug-based pages). generateStaticParams in
   * each route already keeps the page count manageable; we list
   * every entry so search engines discover all of them. */
  const toolEntries:    MetadataRoute.Sitemap = tools.map((t) => ({
    url: `${base}/tools/${t.slug}`,       lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));
  const cheatEntries:   MetadataRoute.Sitemap = cheatsheets.map((c) => ({
    url: `${base}/cheatsheet/${c.slug}`,  lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));
  const agentEntries:   MetadataRoute.Sitemap = agentProjects.map((p) => ({
    url: `${base}/agents/${p.slug}`,      lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));
  const mcpAndSkill:    MetadataRoute.Sitemap = [
    ...mcpProjects,
    ...skillProjects,
  ].map((p) => ({
    url: `${base}/mcp/${p.slug}`,         lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));
  const networkEntries: MetadataRoute.Sitemap = getNetworkProjects().map((p) => ({
    url: `${base}/network/`, /* aggregated detail page lives at /network */
    lastModified: now, changeFrequency: "monthly", priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...toolEntries,
    ...cheatEntries,
    ...agentEntries,
    ...mcpAndSkill,
    ...networkEntries,
  ];
}

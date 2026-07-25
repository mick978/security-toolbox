import { SITE_URL } from "@/lib/site";

/* /robots.txt — generated from SITE_URL so the Sitemap pointer
 * matches the canonical host. Static-friendly: rendered once per
 * build (force-static) and the URL is hard-coded into the response
 * body, so crawlers see the right Sitemap even before any JS runs.
 *
 * Allows the major AI crawlers (GPTBot / ClaudeBot / PerplexityBot /
 * Google-Extended) so AI search and answer engines can cite our
 * content. To block a specific bot, add a more-specific User-agent
 * block above the wildcard one — the more specific rule wins. */
export const dynamic = "force-static";

function buildBody(): string {
  return [
    "# SecToolbox",
    "#",
    "# Public, discoverable surface. AI search crawlers are explicitly",
    "# allowed (GPTBot / ClaudeBot / PerplexityBot / Google-Extended).",
    "",
    "User-agent: *",
    "Allow: /",
    "",
    "User-agent: GPTBot",
    "Allow: /",
    "",
    "User-agent: ClaudeBot",
    "Allow: /",
    "",
    "User-agent: Claude-Web",
    "Allow: /",
    "",
    "User-agent: PerplexityBot",
    "Allow: /",
    "",
    "User-agent: Google-Extended",
    "Allow: /",
    "",
    "# Disallow internal / auth-gated endpoints if any leak into the index.",
    "User-agent: *",
    "Disallow: /api/",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
}

export function GET() {
  return new Response(buildBody(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

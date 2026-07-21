import type { MetadataRoute } from "next";

/* robots.txt — Next serves this at /robots.txt from app/robots.ts.
 * We allow all crawlers by default and explicitly point them at
 * our sitemap + the YAML-style sitemap that search engines know.
 *
 * Auth-locked routes (/login, /api/auth/*) are disallowed so we
 * don't accidentally index session endpoints. */

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sectoolbox.dev";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/login"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

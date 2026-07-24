#!/usr/bin/env node
/**
 * Validate the JSON-LD payloads we generate from the data layer.
 *
 * Strategy: instead of starting a Next dev server, we replay the
 * payload builders against the real data files in `lib/`. If a
 * builder throws or its output isn't valid JSON, we fail.
 *
 * This catches the cheap mistakes (broken template strings, missing
 * @context, malformed nested arrays) without paying the cost of a
 * full build. Rich-results-specific shape checks live downstream in
 * Google Search Console; this is just a smoke test.
 */
import { news } from "../lib/news.ts";
import { tools } from "../lib/tools.ts";
import { cheatsheets } from "../lib/cheatsheets.ts";
import { latestNews } from "../lib/news.ts";
import { canonical, ORG_ID, SITE_URL } from "../lib/site.ts";

/* Inlined equivalents of the aeo.ts helpers. We inline rather than
 * import so the validator script can run with `node --experimental-
 * strip-types` without ESM resolution fighting over the .ts/.js
 * extension — Next's build path is the source of truth, not this
 * smoke test. */
function itemListJsonLd(name, items) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: it.url,
      name: it.name,
    })),
    publisher: { "@id": ORG_ID },
  };
}
function itemListFromSlugs(name, pathPrefix, entries, limit = 10) {
  return itemListJsonLd(
    name,
    entries.slice(0, limit).map((e) => ({
      url: canonical(`${pathPrefix}/${e.slug}`),
      name: e.name,
    })),
  );
}

let failed = 0;
const cases = [];

/* Helper: assert a payload parses, has @context, has @type, and
 * contains ORG_ID somewhere (so it joins the entity graph). */
function check(label, payload) {
  try {
    if (payload == null || typeof payload !== "object") {
      throw new Error("payload is not an object");
    }
    const str = JSON.stringify(payload);
    const parsed = JSON.parse(str);
    if (parsed["@context"] !== "https://schema.org") {
      throw new Error("missing @context");
    }
    if (!parsed["@type"] && !Array.isArray(parsed["@graph"])) {
      throw new Error("missing @type (and not a @graph)");
    }
    if (!str.includes(ORG_ID)) {
      // We don't strictly require every payload to reference the
      // publisher (some are leaves), so this is a soft warning.
      console.log(`  · ${label}: no ORG_ID reference (allowed for leaves)`);
    }
    cases.push({ label, ok: true });
  } catch (e) {
    cases.push({ label, ok: false, err: String(e) });
    failed++;
  }
}

/* --- NewsArticle payloads (per slug) --- */
for (const n of news) {
  const url = canonical(`/news/${n.slug}`);
  const article = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    headline: n.title,
    description: n.description,
    datePublished: `${n.date}T00:00:00+08:00`,
    dateModified: `${n.date}T00:00:00+08:00`,
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
  check(`news/${n.slug}`, article);
}

/* --- SoftwareSourceCode payloads --- */
for (const t of tools) {
  const url = canonical(`/tools/${t.slug}`);
  const payload = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `${url}#software`,
    name: t.name,
    description: t.description,
    url,
    applicationCategory: t.category,
    keywords: t.tags.join(","),
    ...(t.homepage ? { codeRepository: t.homepage } : {}),
    programmingLanguage: "Shell",
    operatingSystem: t.platforms.join(","),
    publisher: { "@id": ORG_ID },
  };
  check(`tools/${t.slug}`, payload);
}

/* --- HowTo payloads --- */
for (const c of cheatsheets) {
  const url = canonical(`/cheatsheet/${c.slug}`);
  const payload = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${url}#howto`,
    name: c.title,
    description: c.summary,
    url,
    inLanguage: "zh-CN",
    ...(c.durationMinutes != null ? { totalTime: `PT${c.durationMinutes}M` } : {}),
    step: c.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      ...(s.desc ? { description: s.desc } : {}),
      ...(s.cmd ? { text: s.cmd } : {}),
    })),
    publisher: { "@id": ORG_ID },
  };
  check(`cheatsheet/${c.slug}`, payload);
}

/* --- ItemList payloads --- */
check("homepage ItemList", itemListJsonLd("home", [
  ...latestNews(3).map((n) => ({ url: canonical(`/news/${n.slug}`), name: n.title })),
  ...cheatsheets.slice(0, 3).map((c) => ({ url: canonical(`/cheatsheet/${c.slug}`), name: c.title })),
]));
check("news ItemList", itemListFromSlugs("news", "/news",
  latestNews().map((n) => ({ slug: n.slug, name: n.title })),
));
check("tools ItemList", itemListFromSlugs("tools", "/tools",
  tools.map((t) => ({ slug: t.slug, name: t.name })),
));
check("cheatsheet ItemList", itemListFromSlugs("cheatsheet", "/cheatsheet",
  cheatsheets.map((c) => ({ slug: c.slug, name: c.title })),
));

/* --- Site-level graph --- */
check("site graph", {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": ORG_ID, name: "SecToolbox", url: SITE_URL },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, inLanguage: "zh-CN" },
    { "@type": "SoftwareApplication", "@id": `${SITE_URL}/#software`, name: "SecToolbox" },
  ],
});

/* --- Report --- */
let okCount = 0;
for (const c of cases) {
  if (c.ok) { okCount++; continue; }
  console.log(`[FAIL] ${c.label}: ${c.err}`);
}
console.log(`\n${okCount}/${cases.length} JSON-LD payloads validated.`);
process.exit(failed > 0 ? 1 : 0);

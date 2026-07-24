/**
 * AEO / JSON-LD helpers. Centralized so the @context / @id patterns
 * stay consistent across pages and so changes to the schema only
 * happen here, not in every page.
 *
 * Conventions:
 *   - Each helper returns a plain object ready to be JSON.stringify'd
 *     into a <script type="application/ld+json">.
 *   - Fields that would be empty arrays or empty strings are omitted
 *     — empty strings fail some schema validators (e.g. Google Rich
 *     Results Test) and never help SEO.
 *   - `publisher` always references the stable Organization @id from
 *     lib/site so the entity graph stays connected.
 */
import { canonical, ORG_ID } from "./site";

/** ItemList for a category listing. `items` is a list of
 *  `{url, name}` pairs. We cap at the caller's choice; the design
 *  spec recommends 10 so AI agents get a tight answer. */
export function itemListJsonLd(
  name: string,
  items: Array<{ url: string; name: string }>,
): Record<string, unknown> {
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

/** Convenience to map an array of slugs/titles to absolute ItemList
 *  entries given a path prefix. */
export function itemListFromSlugs(
  name: string,
  pathPrefix: string,
  entries: Array<{ slug: string; name: string }>,
  limit = 10,
): Record<string, unknown> {
  return itemListJsonLd(
    name,
    entries.slice(0, limit).map((e) => ({
      url: canonical(`${pathPrefix}/${e.slug}`),
      name: e.name,
    })),
  );
}

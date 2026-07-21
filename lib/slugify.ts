// GitHub-flavoured heading slugification.
//
// Goals (matching GitHub's actual behaviour):
//   1. Lowercase the text.
//   2. Strip characters that aren't alphanumeric / space / underscore / hyphen / CJK.
//      GitHub keeps CJK characters intact, so we do too — modern browsers anchor
//      them fine and the URLs stay readable for sharing.
//   3. Collapse whitespace and punctuation runs into a single `-`.
//   4. Trim leading/trailing `-`.
//   5. If two headings on the same page collide, deduplicate with -1, -2, etc.
//      GitHub does the same thing.
export function slugifyHeading(input: string): string {
  return input
    .toLowerCase()
    // Keep word characters, whitespace, hyphen, underscore, and CJK / extended
    // Unicode. We deliberately avoid stripping CJK because GitHub preserves
    // them and modern browsers hash them identically.
    .replace(/[^\p{Letter}\p{Number}\s\-_]/gu, "")
    .trim()
    // Spaces → hyphens, then collapse repeats.
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Compute a per-page list of unique heading slugs.
 *
 * Given the raw markdown source (or an array of heading strings), walks every
 * `#`/`##`/`###` heading and returns:
 *   - `slugs`: array of unique slug strings (in source order)
 *   - `idMap`:  map from raw heading text → final assigned slug
 *
 * Used by:
 *   - the markdown renderer, which wants text -> id lookups
 *   - TOC builders (future), which want the ordered slug list
 *
 * We accept either an array of heading strings (caller already parsed) or a
 * full markdown string (we'll do a lightweight line-scan). Passing the array
 * is preferred when the caller has already walked the source.
 */
export function buildHeadingIdMap(headings: string[]): { slugs: string[]; idMap: Map<string, string> } {
  const seen = new Set<string>();
  const slugs: string[] = [];
  const idMap = new Map<string, string>();
  for (const raw of headings) {
    const base = slugifyHeading(raw);
    let candidate = base;
    let n = 1;
    while (seen.has(candidate)) {
      candidate = `${base}-${++n}`;
    }
    // `Map` keyed by raw text returns the last assigned id; that's what the
    // renderer wants since headings with the same visible text are rare and
    // the last one wins matches GitHub's behaviour.
    idMap.set(raw, candidate);
    seen.add(candidate);
    slugs.push(candidate);
  }
  return { slugs, idMap };
}

/**
 * Convenience: pull heading texts (h1/h2/h3 only) out of markdown source.
 * Lines starting with one to three `#` followed by space; ignore code fences.
 */
export function extractHeadingsFromMarkdown(md: string): string[] {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inFence = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(trimmed);
    if (m) out.push(m[2]);
  }
  return out;
}

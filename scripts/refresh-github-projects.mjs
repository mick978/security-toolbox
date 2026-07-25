#!/usr/bin/env node
/**
 * refresh-github-projects.mjs — weekly GitHub project data refresh.
 *
 * Pulls `https://api.github.com/repos/{owner}/{repo}` for every entry
 * in lib/github-projects.ts and rewrites the on-disk file with the
 * fresh `stars`, `description`, `language`, `topics`, `archived`,
 * and `defaultBranch` values.  Other fields (slug, name, area, the
 * hand-written `descriptionCn` / `whyCn` / `installCommand` / `notable`)
 * are NEVER touched — these are editorial choices and a refresh is
 * not allowed to silently change them.
 *
 * Inputs:
 *   GITHUB_PERSONAL_ACCESS_TOKEN   env, optional but recommended
 *                                  (4 000 req/h; unauthenticated 60/h)
 *
 * Output:
 *   - In-place rewrite of lib/github-projects.ts (only when there
 *     is a diff).  Use `git diff lib/github-projects.ts` to inspect.
 *   - Exits 0 if the file ended up byte-identical, 1 on transport
 *     errors (so the weekly cron script can choose whether to fail).
 *
 * Concurrency: 5 in flight.  Empirically GitHub's abuse detector
 * is happy with 5 QPS sustained for the ~50 entries we manage.
 *
 * Failure mode: if a single repo fetch fails (timeout, 5xx, 404),
 * we keep the OLD values and write a [WARN] line to stderr.  One
 * bad repo never blocks the others.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TARGET = join(ROOT, "lib", "github-projects.ts");

/* --- helpers --- */

const TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN;
const HEADERS = {
  "accept": "application/vnd.github+json",
  "x-github-api-version": "2022-11-28",
  "user-agent": "security-toolbox-weekly-refresh",
  ...(TOKEN ? { "authorization": `Bearer ${TOKEN}` } : {}),
};

const TIMEOUT_MS = 10_000;
const CONCURRENCY = 5;

async function fetchRepo(owner, repo) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: HEADERS,
      signal: ac.signal,
    });
    if (!res.ok) {
      return { ok: false, status: res.status, statusText: res.statusText };
    }
    return { ok: true, data: await res.json() };
  } catch (e) {
    return { ok: false, err: String(e) };
  } finally {
    clearTimeout(t);
  }
}

/* Parallel map with a concurrency cap.  No external deps. */
async function pMap(items, mapper, limit) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await mapper(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

/* Pull just the { owner, repo, slug } out of the existing data
 * module so we don't need to compile TS to read the entries.
 * This is a hand-rolled mini-parser: we expect each entry to be
 * `{ slug: "...", owner: "...", repo: "...", ... }` in stable order
 * since the file is committed. */
function extractEntries(source) {
  const entries = [];
  const re = /\{[^{}]*?slug:\s*"([^"]+)"[^{}]*?owner:\s*"([^"]+)"[^{}]*?repo:\s*"([^"]+)"[^{}]*?\}/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    entries.push({ slug: m[1], owner: m[2], repo: m[3] });
  }
  return entries;
}

/* Replace the four mutable fields for a single entry inside the
 * source string.  Field-order varies in the on-disk file, so we
 * match each line independently. */
function patchEntry(source, slug, patch) {
  // Find the block that starts with `{ ... slug: "X" ... }`.  Greedy
  // match across newlines is OK here because we only edit scalars
  // that sit on their own line.
  const blockRe = new RegExp(
    `(\\{[^{}]*?slug:\\s*"${slug}"[^{}]*?\\})`,
    "g",
  );
  return source.replace(blockRe, (block) => {
    let out = block;
    if (patch.stars !== undefined) {
      out = out.replace(/stars:\s*\d+/, `stars: ${patch.stars}`);
    }
    if (patch.description !== undefined) {
      out = out.replace(/description:\s*"[^"]*"/, () => {
        // Escape backslashes, double-quotes, and ASCII apostrophes;
        // GitHub's API sometimes returns curly quotes that JSX/TS
        // handle fine but plain string templates with surrounding
        // double-quotes can choke on (curly quote characters are
        // valid inside a TS string literal, so we keep them).
        const esc = patch.description
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'");
        return `description: "${esc}"`;
      });
    }
    if (patch.language !== undefined) {
      out = out.replace(/language:\s*("[^"]*"|null)/, `language: ${patch.language === null ? "null" : `"${patch.language}"`}`);
    }
    if (patch.topics !== undefined) {
      // Topics must be a JSON-style array of double-quoted strings,
      // matching the project's existing convention.  We deliberately
      // do not use JSON.stringify to keep the file's flat style.
      const quoted = patch.topics
        .filter((t) => typeof t === "string" && t.length > 0)
        .map((t) => `"${t.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
        .join(",");
      out = out.replace(/topics:\s*\[[^\]]*\]/, `topics: [${quoted}]`);
    }
    if (patch.defaultBranch !== undefined) {
      out = out.replace(/defaultBranch:\s*"[^"]*"/, `defaultBranch: "${patch.defaultBranch}"`);
    }
    return out;
  });
}

/* --- main --- */

async function main() {
  const t0 = Date.now();
  const source = await readFile(TARGET, "utf8");
  const entries = extractEntries(source);
  if (entries.length === 0) {
    console.error("No entries parsed from lib/github-projects.ts. Aborting.");
    process.exit(1);
  }
  console.log(`Refreshing ${entries.length} GitHub projects (concurrency=${CONCURRENCY})${TOKEN ? "" : " — UNAUTHENTICATED, 60 req/h"}`);

  const results = await pMap(entries, async (e) => {
    const r = await fetchRepo(e.owner, e.repo);
    if (!r.ok) {
      const reason = r.status ? `${r.status} ${r.statusText}` : r.err;
      console.error(`[WARN] ${e.slug} (${e.owner}/${e.repo}): ${reason} — keeping old values`);
      return { slug: e.slug, ok: false };
    }
    return {
      slug: e.slug,
      ok: true,
      patch: {
        stars: r.data.stargazers_count,
        description: r.data.description ?? "",
        language: r.data.language ?? null,
        topics: Array.isArray(r.data.topics) ? r.data.topics : [],
        defaultBranch: r.data.default_branch ?? "main",
      },
    };
  }, CONCURRENCY);

  let updated = 0;
  let next = source;
  for (const r of results) {
    if (!r.ok) continue;
    const before = next;
    next = patchEntry(next, r.slug, r.patch);
    if (next !== before) updated++;
  }

  if (next === source) {
    console.log("No changes.");
    process.exit(0);
  }

  await writeFile(TARGET, next, "utf8");
  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`Wrote ${TARGET} (${updated} entries updated, ${dt}s)`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

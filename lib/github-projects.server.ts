import "server-only";
import type { GitHubProject } from "./github-projects";

/** Server-only: fetches a project's README from raw.githubusercontent.com.
 *  Cached 24 h by Next (`revalidate: 86400`). Returns null on any failure.
 *  Live here (not in `./github-projects`) so client components can safely import
 *  types and data from the parent module without triggering the "server-only"
 *  marker at build time.
 *
 *  Hard 15s timeout: raw.githubusercontent.com can hang or be rate-limited;
 *  during `next build` every [slug] page calls this and a single slow
 *  upstream stalls the worker, which then aborts the build. We surface
 *  "no README" instead of blocking forever. Override via
 *  `GITHUB_README_TIMEOUT_MS` env if a heavier upstream is expected. */
export async function fetchReadme(p: GitHubProject): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${p.owner}/${p.repo}/${p.defaultBranch}/${p.readmePath}`;
  const timeoutMs = Number(process.env.GITHUB_README_TIMEOUT_MS) || 15_000;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      signal: ac.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
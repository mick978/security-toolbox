import "server-only";
import type { GitHubProject } from "./github-projects";

/** Server-only: fetches a project's README from raw.githubusercontent.com.
 *  Cached 24 h by Next (`revalidate: 86400`). Returns null on any failure.
 *  Live here (not in `./github-projects`) so client components can safely import
 *  types and data from the parent module without triggering the "server-only"
 *  marker at build time.
 */
export async function fetchReadme(p: GitHubProject): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${p.owner}/${p.repo}/${p.defaultBranch}/${p.readmePath}`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

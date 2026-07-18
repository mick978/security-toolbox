# Real GitHub Projects for MCP / Skills / AI Agent — Design

Date: 2026-07-18
Status: Approved (in-plan)

## Problem

`app/mcp/`, `app/agents/` and their data files (`lib/security-mcp.ts`, `lib/agents.ts`) are 100% fictional: invented MCP servers (`nmap-mcp-server`, `shodan-mcp-server`…), an invented "skill tree", and invented agent personas ("子域名猎手", "Web 漏洞猎人"…) with fabricated prompts. This is unacceptable for a real commercial project.

## Goal

Replace all fictional content with **real, verified GitHub projects** across the three sections, and make clicking a card open a **detail page that renders the project's real README / SKILL.md** fetched from GitHub. Zero fabricated content.

## Verified real projects (chosen)

All entries below were verified live via the GitHub API / `raw.githubusercontent.com` by research subagents. Star counts, languages, default branches, topics, install commands and README paths are real values captured today.

### MCP servers — 12 (`kind: "mcp"`)
| name | owner/repo | stars | lang | branch | readmePath | area |
|---|---|---|---|---|---|---|
| HexStrike AI | `0x4m4/hexstrike-ai` | 10356 | Python | master | README.md | exploit |
| Prowler MCP Server | `prowler-cloud/prowler` | 14100 | Python | master | mcp_server/README.md | compliance |
| Ghidra MCP | `bethington/ghidra-mcp` | 2833 | Java | main | README.md | incident |
| Snyk Agent Scan | `snyk/agent-scan` | 2788 | Python | main | README.md | defense |
| CVE MCP Server | `mukul975/cve-mcp-server` | 1086 | Python | main | README.md | vuln-scan |
| Cisco AI Defense MCP Scanner | `cisco-ai-defense/mcp-scanner` | 987 | Python | main | README.md | defense |
| Burp Suite MCP Server | `PortSwigger/mcp-server` | 984 | Kotlin | main | README.md | vuln-scan |
| MCP Kali Server | `Wh0am123/MCP-Kali-Server` | 771 | Python | main | README.md | exploit |
| SonarQube MCP Server | `SonarSource/sonarqube-mcp-server` | 598 | Java | master | README.md | vuln-scan |
| Shodan MCP Server | `w0h1v/mcp-shodan` | 144 | TypeScript | main | README.md | recon |
| VirusTotal MCP Server | `w0h1v/mcp-virustotal` | 138 | TypeScript | main | README.md | recon |
| REMnux MCP Server | `REMnux/remnux-mcp-server` | 104 | TypeScript | main | README.md | incident |

### Agent Skills — 10 (`kind: "skill"`)
| name | owner/repo | stars | area |
|---|---|---|---|
| Anthropic Agent Skills (Official) | `anthropics/skills` | 161949 | general |
| Superpowers | `obra/superpowers` | 256335 | general |
| Addy Osmani's Agent Skills | `addyosmani/agent-skills` | 78881 | general |
| Obsidian Skills | `kepano/obsidian-skills` | 42324 | general |
| wshobson Agents Marketplace | `wshobson/agents` | 37980 | general |
| Raptor | `gadievron/raptor` | 3340 | exploit |
| Microsoft Skills | `microsoft/skills` | 2758 | general |
| Claude-Red | `SnailSploit/Claude-Red` | 2708 | exploit |
| Claude-OSINT | `elementalsouls/Claude-OSINT` | 1949 | recon |
| ClawSec | `prompt-security/clawsec` | 1066 | defense |

### Security AI Agents — 11 (`kind: "agent"`)
Strix `usestrix/strix` (42138★, vuln-scan), PentestGPT `GreyDGL/PentestGPT` (14296★, exploit), CAI `aliasrobotics/cai` (9471★, exploit), garak `NVIDIA/garak` (8469★, defense), PurpleLlama `meta-llama/PurpleLlama` (4292★, defense), Vulnhuntr `protectai/vulnhuntr` (2704★, vuln-scan), burpgpt `aress31/burpgpt` (2335★, vuln-scan), Agentic Security `msoedov/agentic_security` (1931★, defense), hackingBuddyGPT `ipa-lab/hackingBuddyGPT` (1176★, exploit), Nebula `berylliumsec/nebula` (1067★, recon), OpenOSINT `OpenOSINT/OpenOSINT` (1026★, recon).

> Dedup: `0x4m4/hexstrike-ai` appears in both MCP and agent candidate lists. It is fundamentally an MCP server, so it lives only in the MCP section. Agents → 11.

## Data model

New file `lib/github-projects.ts` with the shared type:

```ts
export type SecurityArea = "recon" | "vuln-scan" | "exploit" | "defense" | "incident" | "compliance" | "general";
export type ProjectKind = "mcp" | "skill" | "agent";

export interface GitHubProject {
  slug: string;          // unique across all sections; URL path segment
  kind: ProjectKind;
  name: string;
  owner: string;
  repo: string;
  url: string;           // https://github.com/owner/repo
  description: string;   // real GitHub description
  stars: number;
  language?: string | null;
  topics: string[];
  defaultBranch: string;
  readmePath: string;    // e.g. "README.md" or "mcp_server/README.md"
  area: SecurityArea;
  installCommand?: string; // real command if documented, else undefined
  notable?: string;       // 1-line reputability note
}
```

Exports from `lib/github-projects.ts`:
- The `GitHubProject` / `SecurityArea` / `ProjectKind` types
- `securityAreas`: metadata array (name, icon, color) for the existing 6+1 areas
- `getReadmeUrl(p)` → raw.githubusercontent URL
- `fetchReadme(p)` → server-side fetch with `{ next: { revalidate: 86400 } }`, returns `string | null`
- `projectBySlug(slug)`: lookup across all three sections
- `projectsByKind(kind)`: list
- `formatStars(n)`: number → "10.4k" / "999"

Data placement:
- `lib/security-mcp.ts` (rewritten) → exports `mcpProjects: GitHubProject[]` and `skillProjects: GitHubProject[]`. The dead `agentPrompts` export is removed.
- `lib/agents.ts` (rewritten) → exports `agentProjects: GitHubProject[]`. The `agentCategories` export is replaced with a re-export from `lib/github-projects.ts` so the homepage can still compute per-area counts.

## Architecture — hybrid content (approved)

1. Local curated metadata drives **everything always visible**: card, header, filter chips, stats. Fast and reliable.
2. Detail page additionally `fetchReadme(project)` from GitHub raw content with ISR (`revalidate: 86400`). Renders the real README as markdown.
3. On any fetch failure (network, 404, rate limit), the detail page renders the **fallback view**: curated description, notable, install command, topics, plus a prominent "View on GitHub" button. The page never whitescreens.

### Routing
- `app/mcp/[slug]/page.tsx` — server component, handles both MCP servers and Skills (both live under `/mcp`). Uses `generateStaticParams()` for all MCP + Skill slugs, `export const revalidate = 86400`, `export const dynamicParams = true`.
- `app/agents/[slug]/page.tsx` — same pattern, for agents.
- The current master-detail side panel on the agents list page is removed; clicking an agent now navigates to its detail page (consistent with MCP and gives the README proper space).

### Markdown renderer
New `components/markdown.tsx`:
- `react-markdown` + `remark-gfm`
- Custom `a` component: externalize `href`, rewrite relative paths to absolute GitHub URLs.
- Custom `img` component: rewrite relative `src` to `https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}`; add `loading="lazy"`.
- No `rehype-raw` (raw HTML escaped — safe).
- Styled with `@tailwindcss/typography` `prose dark:prose-invert`, with custom overrides for code blocks / links to match the dark security theme.

### Dependencies (add)
- `react-markdown` (v9+ for React 19)
- `remark-gfm`
- `@tailwindcss/typography` (dev)

## File-by-file changes

1. **`lib/github-projects.ts`** (new) — shared types, area metadata, fetch + lookup + format helpers.
2. **`lib/security-mcp.ts`** (rewrite) — real `mcpProjects` (12) + `skillProjects` (10); remove `agentPrompts` and fictional types.
3. **`lib/agents.ts`** (rewrite) — real `agentProjects` (11). Re-export `agentCategories` (mapped from security areas) for homepage compatibility.
4. **`components/markdown.tsx`** (new) — markdown renderer with URL rewriting.
5. **`components/project-detail.tsx`** (new) — shared detail-page body used by both `/mcp/[slug]` and `/agents/[slug]`. Renders header (name, owner/repo badge, stars, language, topics, area badge, install command, GitHub link) + fetched README + fallback.
6. **`app/mcp/[slug]/page.tsx`** (new) — server route; `generateMetadata`, `generateStaticParams`, ISR.
7. **`app/agents/[slug]/page.tsx`** (new) — same pattern.
8. **`app/mcp/mcp-skills-client.tsx`** (update) — cards become `Link` to `/mcp/[slug]`; show real data (name, description, stars formatted, language badge, area badge). Keep tabs / search / category filter.
9. **`app/agents/agents-client.tsx`** (update) — cards become `Link` to `/agents/[slug]`; remove master-detail side panel; show real data.
10. **`app/page.tsx`** (update) — homepage AI-Agent stat + per-area counts use `agentProjects`.
11. **`package.json` + `tailwind.config.ts`** — add 3 deps + typography plugin.
12. **`tsconfig.json`** — no change expected (paths already cover `@/lib`, `@/components`).

## Error handling & edge cases

- **README fetch fails** → fallback view (curated description + GitHub CTA). Never crash the page.
- **Unknown slug** → `notFound()` (404), matching `/tools/[slug]` pattern.
- **README has no frontmatter** → renderer passes raw markdown through (no special-casing).
- **Relative images / links in README** → rewritten to absolute GitHub URLs by the renderer.
- **Rate limiting / network at build time** → fallback is baked into the static page; revalidation retries later.
- **Star drift** → accepted; numbers are real as of verification today. Display formatted (`10.4k`). README is always live, so freshness of prose is preserved.

## Out of scope (YAGNI)

- Runtime star refresh via GitHub API (extra rate-limit risk; not required).
- Search inside rendered README.
- Per-skill SKILL.md deep links (we render the repo README as the intro).
- Editing the homepage hero beyond updating the AI-Agent stat to use real counts.

## Testing / verification

- `pnpm build` (or `npm run build`) succeeds with the new deps and no type errors.
- Manually verify in `pnpm dev`:
  - `/mcp` shows 12 real MCP cards with real stars; clicking one opens `/mcp/<slug>` with the real README rendered (with images).
  - `/mcp` Skills tab shows 10 real skill repos; clicking renders their real README.
  - `/agents` shows 11 real agent cards; clicking opens detail page with real README.
  - Fallback works: temporarily break the GitHub URL (or use a slug with a bad path) → page still shows curated content + GitHub link, no white screen.
  - No fictional `nmap-mcp-server` / `子域名猎手` strings remain anywhere (`grep` check).
- Accessibility sanity: detail pages keep heading order, images have alt text (README images inherit GitHub alt).
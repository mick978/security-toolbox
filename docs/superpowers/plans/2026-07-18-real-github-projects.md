# Real GitHub MCP / Skills / Agents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 100% fictional MCP / Skills / AI Agent content on `/mcp` and `/agents` with **verified real GitHub projects**, and add detail pages that render each project's **real README/SKILL.md fetched from GitHub** (with curated local metadata + graceful fallback).

**Architecture:** Hybrid — curated real metadata (verified today) stored locally drives cards and detail headers; the detail page additionally server-fetches the project's real README from `raw.githubusercontent.com` with 24h ISR and a curated fallback if fetch fails. One shared `ProjectDetail` component is reused by both `/mcp/[slug]` and `/agents/[slug]`.

**Tech Stack:** Next.js 16 (App Router, React 19), TypeScript 5.7, Tailwind 3.4, `react-markdown` + `remark-gfm` + `@tailwindcss/typography`.

**Reference spec:** `docs/superpowers/specs/2026-07-18-real-github-projects-design.md`

---

## File map

| File | Status | Responsibility |
|---|---|---|
| `package.json` | modify | Add 3 deps |
| `tailwind.config.ts` | modify | Add typography plugin |
| `lib/github-projects.ts` | **create** | Shared `GitHubProject` type, area metadata, `fetchReadme`, `projectBySlug`, `formatStars`, all three real data arrays |
| `lib/security-mcp.ts` | rewrite | Re-export `mcpProjects` + `skillProjects` from `github-projects`; keep file path so consumers don't break |
| `lib/agents.ts` | rewrite | Re-export `agentProjects` + `agentCategories` from `github-projects` |
| `components/markdown.tsx` | **create** | `react-markdown` renderer with relative-URL rewriting to GitHub |
| `components/project-detail.tsx` | **create** | Shared detail-page body (header + README/fallback) |
| `app/mcp/[slug]/page.tsx` | **create** | `/mcp` and `/skills` detail route (server component, ISR) |
| `app/agents/[slug]/page.tsx` | **create** | `/agents` detail route |
| `app/mcp/mcp-skills-client.tsx` | modify | Cards become `Link` to `/mcp/[slug]`, render real data |
| `app/agents/agents-client.tsx` | modify | Cards become `Link` to `/agents/[slug]`, remove side panel |
| `app/page.tsx` | modify | Use `agentProjects` for stats + per-area counts |

---

## Task 1: Add markdown + typography dependencies

**Files:**
- Modify: `package.json`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Install the three packages**

Run:
```bash
npm install react-markdown remark-gfm
npm install -D @tailwindcss/typography
```

Expected: `package.json` now contains `"react-markdown"`, `"remark-gfm"`, and `"@tailwindcss/typography"`.

- [ ] **Step 2: Wire typography plugin into Tailwind**

In `tailwind.config.ts`, replace the `plugins: [require("tailwindcss-animate")],` line with:

```ts
plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
```

- [ ] **Step 3: Verify build still passes**

Run: `npm run build`
Expected: build succeeds (no errors). Warnings about the new deps are fine.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json tailwind.config.ts
git commit -m "chore: add react-markdown, remark-gfm, @tailwindcss/typography"
```

---

## Task 2: Create `lib/github-projects.ts` (types + helpers + real data)

**Files:**
- Create: `lib/github-projects.ts`

This is the single source of truth. Contains the shared `GitHubProject` type, the seven security-area metadata records, the README fetch / lookup / star-format helpers, and the three real data arrays (12 MCP + 10 Skill + 11 Agent). All values are real, verified by research subagents against the GitHub API.

- [ ] **Step 1: Create the file with the shared types and helpers**

Create `lib/github-projects.ts` with this exact content (truncated data arrays shown — the full arrays are in Step 2):

```ts
// Shared types + data for the GitHub-project showcase (MCP / Skills / AI Agents).
// Every entry below was verified live against the GitHub API on 2026-07-18.

export type SecurityArea =
  | "recon"
  | "vuln-scan"
  | "exploit"
  | "defense"
  | "incident"
  | "compliance"
  | "general";

export type ProjectKind = "mcp" | "skill" | "agent";

export interface GitHubProject {
  /** Unique URL slug across all three sections. */
  slug: string;
  kind: ProjectKind;
  name: string;
  owner: string;
  repo: string;
  url: string;
  description: string;
  /** stargazers_count at verification time. */
  stars: number;
  language: string | null;
  topics: string[];
  defaultBranch: string;
  /** Path inside the repo (e.g. "README.md" or "mcp_server/README.md"). */
  readmePath: string;
  area: SecurityArea;
  installCommand?: string;
  notable?: string;
}

export interface SecurityAreaMeta {
  slug: SecurityArea;
  name: string;
  icon: string; // lucide-react name
  color: string; // tailwind text color class
  bg: string; // tailwind bg color class
}

export const securityAreas: SecurityAreaMeta[] = [
  { slug: "recon",      name: "信息收集", icon: "Search",        color: "text-blue-500",   bg: "bg-blue-500/10" },
  { slug: "vuln-scan",  name: "漏洞扫描", icon: "ShieldAlert",   color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { slug: "exploit",    name: "漏洞利用", icon: "Zap",           color: "text-red-500",    bg: "bg-red-500/10" },
  { slug: "defense",    name: "防御检测", icon: "Shield",        color: "text-green-500",  bg: "bg-green-500/10" },
  { slug: "incident",   name: "应急响应", icon: "AlertTriangle", color: "text-orange-500", bg: "bg-orange-500/10" },
  { slug: "compliance", name: "合规审计", icon: "FileCheck",     color: "text-purple-500", bg: "bg-purple-500/10" },
  { slug: "general",    name: "通用",     icon: "Sparkles",      color: "text-cyan-500",   bg: "bg-cyan-500/10" },
];

export function getReadmeUrl(p: GitHubProject): string {
  return `https://raw.githubusercontent.com/${p.owner}/${p.repo}/${p.defaultBranch}/${p.readmePath}`;
}

/** Server-only. Fetches the project's README. Cached 24h by Next. Returns null on failure. */
export async function fetchReadme(p: GitHubProject): Promise<string | null> {
  try {
    const res = await fetch(getReadmeUrl(p), { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Format large star counts: 10356 -> "10.4k", 999 -> "999", 256335 -> "256k". */
export function formatStars(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  if (n < 1000000) return Math.round(n / 1000) + "k";
  return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
}

export function projectBySlug(slug: string): GitHubProject | undefined {
  return (
    mcpProjects.find((p) => p.slug === slug) ||
    skillProjects.find((p) => p.slug === slug) ||
    agentProjects.find((p) => p.slug === slug)
  );
}

export function projectsByKind(kind: ProjectKind): GitHubProject[] {
  if (kind === "mcp") return mcpProjects;
  if (kind === "skill") return skillProjects;
  return agentProjects;
}
```

- [ ] **Step 2: Append the three real data arrays**

Add the following to the bottom of `lib/github-projects.ts` (after the helpers). These are the verified real projects.

```ts
// ============================================================
// MCP servers — verified real (https://github.com/<owner>/<repo>)
// ============================================================
export const mcpProjects: GitHubProject[] = [
  {
    slug: "hexstrike-ai", kind: "mcp", name: "HexStrike AI",
    owner: "0x4m4", repo: "hexstrike-ai",
    url: "https://github.com/0x4m4/hexstrike-ai",
    description: "HexStrike AI MCP Agents is an advanced MCP server that lets AI agents (Claude, GPT, Copilot, etc.) autonomously run 150+ cybersecurity tools for pentesting, bug bounty, and CTF.",
    stars: 10356, language: "Python",
    topics: ["ai","ai-agents","ai-cybersecurity","ai-hacking","ai-penetration-testing","ctf-tools","kali-linux","kali-tools","llm","mcp","mcp-server","mcp-tools","pentesting","pentesting-tools"],
    defaultBranch: "master", readmePath: "README.md", area: "exploit",
    installCommand: "pip install -r requirements.txt",
    notable: "Most-starred security MCP server; wraps 150+ offensive tools (nmap, nuclei, sqlmap, gobuster, etc.) so an LLM can run autonomous pentests.",
  },
  {
    slug: "prowler", kind: "mcp", name: "Prowler MCP Server",
    owner: "prowler-cloud", repo: "prowler",
    url: "https://github.com/prowler-cloud/prowler",
    description: "Prowler is the world's most widely used open-source cloud security platform that automates security and compliance across any cloud environment.",
    stars: 14100, language: "Python",
    topics: ["python","aws","security","security-audit","cloud","azure","iam","gcp","forensics","compliance","hardening","gdpr","multi-cloud","devsecops","cis-benchmark","cspm"],
    defaultBranch: "master", readmePath: "mcp_server/README.md", area: "compliance",
    installCommand: "docker run --rm -i prowlercloud/prowler-mcp",
    notable: "Leading open-source CSPM; ships an official MCP server (image prowlercloud/prowler-mcp) exposing AWS/Azure/GCP compliance and security findings to AI.",
  },
  {
    slug: "ghidra-mcp", kind: "mcp", name: "Ghidra MCP",
    owner: "bethington", repo: "ghidra-mcp",
    url: "https://github.com/bethington/ghidra-mcp",
    description: "Ghidra MCP Server — 200+ MCP tools for AI-powered reverse engineering. GUI plugin + headless server, lazy tool loading.",
    stars: 2833, language: "Java",
    topics: ["ai","binary-analysis","ghidra","ghidra-extension","java","mcp","mcp-server","model-context-protocol","python","reverse-engineering","static-analysis"],
    defaultBranch: "main", readmePath: "README.md", area: "incident",
    installCommand: "uv run bridge-mcp-ghidra",
    notable: "Bridges NSA's Ghidra reverse-engineering engine to LLMs for malware/firmware analysis and DFIR.",
  },
  {
    slug: "snyk-agent-scan", kind: "mcp", name: "Snyk Agent Scan",
    owner: "snyk", repo: "agent-scan",
    url: "https://github.com/snyk/agent-scan",
    description: "Security scanner for AI agents, MCP servers and agent skills.",
    stars: 2788, language: "Python",
    topics: ["agent","ai","mcp","modelcontextprotocol","security"],
    defaultBranch: "main", readmePath: "README.md", area: "defense",
    installCommand: "uvx snyk-agent-scan@latest",
    notable: "Official Snyk tool that audits MCP servers, agents and skills for vulnerabilities and toxic flows.",
  },
  {
    slug: "cve-mcp-server", kind: "mcp", name: "CVE MCP Server",
    owner: "mukul975", repo: "cve-mcp-server",
    url: "https://github.com/mukul975/cve-mcp-server",
    description: "Production-grade MCP server giving Claude 27 security intelligence tools across 21 APIs — CVE lookup, EPSS scoring, CISA KEV, MITRE ATT&CK, and more.",
    stars: 1086, language: "Python",
    topics: ["cisa-kev","claude-ai","cve","cybersecurity","devsecops","epss","fastmcp","mcp","mitre-attack","model-context-protocol","nvd","osv","python","security","shodan","threat-intelligence","virustotal","vulnerability-management"],
    defaultBranch: "main", readmePath: "README.md", area: "vuln-scan",
    installCommand: "claude mcp add cve-mcp -- python -m cve_mcp.server",
    notable: "Aggregates NVD, CISA KEV, EPSS, OSV, VirusTotal and Shodan into one vulnerability-intelligence MCP.",
  },
  {
    slug: "cisco-mcp-scanner", kind: "mcp", name: "Cisco AI Defense MCP Scanner",
    owner: "cisco-ai-defense", repo: "mcp-scanner",
    url: "https://github.com/cisco-ai-defense/mcp-scanner",
    description: "Scan MCP servers for potential threats & security findings.",
    stars: 987, language: "Python",
    topics: ["agents","ai","mcp","security"],
    defaultBranch: "main", readmePath: "README.md", area: "defense",
    installCommand: "uv tool install --python 3.13 cisco-ai-mcp-scanner",
    notable: "Official Cisco AI Defense scanner that statically and behaviorally audits MCP servers (YARA + LLM analyzers).",
  },
  {
    slug: "burp-mcp-server", kind: "mcp", name: "Burp Suite MCP Server",
    owner: "PortSwigger", repo: "mcp-server",
    url: "https://github.com/PortSwigger/mcp-server",
    description: "MCP Server for Burp",
    stars: 984, language: "Kotlin",
    topics: ["extension"],
    defaultBranch: "main", readmePath: "README.md", area: "vuln-scan",
    installCommand: "see README",
    notable: "Official PortSwigger extension that exposes Burp Suite's web vulnerability scanner and proxy to AI agents (build JAR via ./gradlew embedProxyJar).",
  },
  {
    slug: "mcp-kali-server", kind: "mcp", name: "MCP Kali Server",
    owner: "Wh0am123", repo: "MCP-Kali-Server",
    url: "https://github.com/Wh0am123/MCP-Kali-Server",
    description: "MCP configuration to connect AI agent to a Linux machine (Kali Linux penetration-testing tools).",
    stars: 771, language: "Python",
    topics: ["kali-tools","mcp","mcp-server","penetration-testing","pentesting","security"],
    defaultBranch: "main", readmePath: "README.md", area: "exploit",
    installCommand: "pip install -r requirements.txt",
    notable: "Popular bridge that lets an AI agent execute Kali Linux pentest tools (nmap, hydra, etc.) over MCP.",
  },
  {
    slug: "sonarqube-mcp-server", kind: "mcp", name: "SonarQube MCP Server",
    owner: "SonarSource", repo: "sonarqube-mcp-server",
    url: "https://github.com/SonarSource/sonarqube-mcp-server",
    description: "Official SonarQube MCP Server for code quality and security in AI agents",
    stars: 598, language: "Java",
    topics: ["agent","ai","code-quality","mcp","mcp-server","security","sonarqube","static-analysis"],
    defaultBranch: "master", readmePath: "README.md", area: "vuln-scan",
    installCommand: "docker run --init --pull=always -i --rm -e SONARQUBE_TOKEN -e SONARQUBE_ORG sonarsource/sonarqube-mcp",
    notable: "Official SonarSource server surfacing SAST and security-hotspot findings to AI agents.",
  },
  {
    slug: "mcp-shodan", kind: "mcp", name: "Shodan MCP Server",
    owner: "w0h1v", repo: "mcp-shodan",
    url: "https://github.com/w0h1v/mcp-shodan",
    description: "MCP server for Shodan — search internet-connected devices, IP reconnaissance, DNS lookups, and CVE/CPE vulnerability intelligence.",
    stars: 144, language: "TypeScript",
    topics: ["dns","security","typescript","shodan","osint","mcp","cybersecurity","ip-lookup","cve","cpe","network-security","shodan-api","threat-intelligence","claude","reconnaissance","vulnerability-intelligence","ai-tools","model-context-protocol","mcp-server"],
    defaultBranch: "main", readmePath: "README.md", area: "recon",
    installCommand: "npx -y @burtthecoder/mcp-shodan",
    notable: "Well-known Shodan recon/OSINT MCP (repo transferred from BurtTheCoder to w0h1v; npm package @burtthecoder). Device search, IP recon, DNS, CVE/CPE intel.",
  },
  {
    slug: "mcp-virustotal", kind: "mcp", name: "VirusTotal MCP Server",
    owner: "w0h1v", repo: "mcp-virustotal",
    url: "https://github.com/w0h1v/mcp-virustotal",
    description: "MCP server for VirusTotal API — analyze URLs, files, IPs, and domains with comprehensive security reports, relationship analysis, and pagination support.",
    stars: 138, language: "TypeScript",
    topics: ["security","ioc","typescript","mcp","cybersecurity","malware-analysis","virus-scanning","virustotal","threat-intelligence","claude","malware-detection","ai-tools","model-context-protocol","mcp-server"],
    defaultBranch: "main", readmePath: "README.md", area: "recon",
    installCommand: "npx -y @burtthecoder/mcp-virustotal",
    notable: "VirusTotal threat-intel MCP for file/URL/IP/domain reputation and malware analysis.",
  },
  {
    slug: "remnux-mcp-server", kind: "mcp", name: "REMnux MCP Server",
    owner: "REMnux", repo: "remnux-mcp-server",
    url: "https://github.com/REMnux/remnux-mcp-server",
    description: "MCP server for using the REMnux malware analysis toolkit via AI assistants",
    stars: 104, language: "TypeScript",
    topics: [],
    defaultBranch: "main", readmePath: "README.md", area: "incident",
    installCommand: "npx @remnux/mcp-server",
    notable: "Official MCP front-end to the REMnux malware-analysis Linux distro (Docker and SSH modes) for DFIR / malware triage.",
  },
];

// ============================================================
// Agent Skills (SKILL.md repos) — verified real
// ============================================================
export const skillProjects: GitHubProject[] = [
  {
    slug: "anthropics-skills", kind: "skill", name: "Anthropic Agent Skills (Official)",
    owner: "anthropics", repo: "skills",
    url: "https://github.com/anthropics/skills",
    description: "Public repository for Agent Skills",
    stars: 161949, language: "Python",
    topics: ["agent-skills"],
    defaultBranch: "main", readmePath: "README.md", area: "general",
    notable: "The canonical official Anthropic repo that defines the SKILL.md Agent Skills spec.",
  },
  {
    slug: "superpowers", kind: "skill", name: "Superpowers",
    owner: "obra", repo: "superpowers",
    url: "https://github.com/obra/superpowers",
    description: "An agentic skills framework & software development methodology that works.",
    stars: 256335, language: "Shell",
    topics: ["ai","brainstorming","coding","obra","sdlc","skills","subagent-driven-development","superpowers"],
    defaultBranch: "main", readmePath: "README.md", area: "general",
    notable: "By Jesse Vincent (obra); a complete SDLC methodology built on SKILL.md.",
  },
  {
    slug: "addyosmani-agent-skills", kind: "skill", name: "Addy Osmani's Agent Skills",
    owner: "addyosmani", repo: "agent-skills",
    url: "https://github.com/addyosmani/agent-skills",
    description: "Production-grade engineering skills for AI coding agents.",
    stars: 78881, language: "JavaScript",
    topics: ["agent-skills","antigravity","claude-code","codex","cursor","skills"],
    defaultBranch: "main", readmePath: "README.md", area: "general",
    notable: "By Addy Osmani (Google Chrome); production-grade SDLC lifecycle skills including security-and-hardening.",
  },
  {
    slug: "obsidian-skills", kind: "skill", name: "Obsidian Skills",
    owner: "kepano", repo: "obsidian-skills",
    url: "https://github.com/kepano/obsidian-skills",
    description: "Agent skills for Obsidian. Teach your agent to use Obsidian CLI and open formats.",
    stars: 42324, language: null,
    topics: [],
    defaultBranch: "main", readmePath: "README.md", area: "general",
    notable: "By Steph Ango (kepano, Obsidian CEO); clean official-style skills for the Obsidian CLI and open formats.",
  },
  {
    slug: "wshobson-agents", kind: "skill", name: "wshobson Agents Marketplace",
    owner: "wshobson", repo: "agents",
    url: "https://github.com/wshobson/agents",
    description: "Multi-harness agentic plugin marketplace for Claude Code, Codex CLI, Cursor, OpenCode, GitHub Copilot, and Gemini CLI",
    stars: 37980, language: "Python",
    topics: ["agent-skills","agents","ai-agents","anthropic","claude-code","claude-code-plugins","mcp","multi-agent","orchestration","workflows"],
    defaultBranch: "main", readmePath: "README.md", area: "general",
    notable: "Large multi-harness plugin marketplace (175 skills / 203 agents); includes security-domain agents and incident-response workflows.",
  },
  {
    slug: "raptor", kind: "skill", name: "Raptor",
    owner: "gadievron", repo: "raptor",
    url: "https://github.com/gadievron/raptor",
    description: "Raptor turns Claude Code into a general-purpose AI offensive/defensive security agent. By using Claude.md and creating rules, sub-agents, and skills, and orchestrating security tool usage, we configure the agent for adversarial thinking, and perform research or attack/defense operations.",
    stars: 3340, language: "Python",
    topics: [],
    defaultBranch: "main", readmePath: "README.md", area: "exploit",
    notable: "Leading offensive+defensive security skill set; expert personas (CodeQL, fuzzing, crash analysis, OSS forensics).",
  },
  {
    slug: "microsoft-skills", kind: "skill", name: "Microsoft Skills",
    owner: "microsoft", repo: "skills",
    url: "https://github.com/microsoft/skills",
    description: "Skills, MCP servers, Custom Agents, Agents.md for SDKs to ground Coding Agents",
    stars: 2758, language: "TypeScript",
    topics: ["agent-skills","agents","azure","foundry","mcp","sdk","skills"],
    defaultBranch: "main", readmePath: "README.md", area: "general",
    notable: "Microsoft's official skills repo grounding coding agents in Azure SDKs; includes a skill-creator meta-skill.",
  },
  {
    slug: "claude-red", kind: "skill", name: "Claude-Red",
    owner: "SnailSploit", repo: "Claude-Red",
    url: "https://github.com/SnailSploit/Claude-Red",
    description: "claude-red is a curated library of offensive security skills designed for the Claude skills system.",
    stars: 2708, language: "Python",
    topics: ["claude-ai","claude-pt","claude-skills","redteam","redteam-tools","skills"],
    defaultBranch: "main", readmePath: "README.md", area: "exploit",
    notable: "Largest dedicated offensive-security SKILL.md library (58 skills) spanning web, AD, wireless, cloud, mobile, IoT and exploit dev.",
  },
  {
    slug: "claude-osint", kind: "skill", name: "Claude-OSINT",
    owner: "elementalsouls", repo: "Claude-OSINT",
    url: "https://github.com/elementalsouls/Claude-OSINT",
    description: "Two paired Claude skills · 90+ recon modules · 48 secret-regex patterns · 80+ dorks · 9 read-only credential validators · 27 attack-path templates · 5,500+ lines of structured tradecraft. Drop-in SKILL.md files that turn Claude into a god-mode external recon operator for authorized red-team and bug-bounty engagements.",
    stars: 1949, language: "Python",
    topics: ["agentskills","claude","skills"],
    defaultBranch: "main", readmePath: "README.md", area: "recon",
    notable: "Deep OSINT/external-recon pair of skills; aimed at authorized red-team and bug-bounty recon.",
  },
  {
    slug: "clawsec", kind: "skill", name: "ClawSec",
    owner: "prompt-security", repo: "clawsec",
    url: "https://github.com/prompt-security/clawsec",
    description: "A complete security skill suite for OpenClaw, Hermes, PicoClaw and NanoClaw agents (and variants). Protect your SOUL.md (etc') with drift detection, live security recommendations, automated audits, and skill integrity verification. All from one installable suite.",
    stars: 1066, language: "JavaScript",
    topics: ["clawdbot","hermes","hermes-agent","hermes-skill","openclaw","openclaw-security","openclaw-skill","picoclaw","nanoclaw"],
    defaultBranch: "main", readmePath: "README.md", area: "defense",
    notable: "Defensive skill suite from Prompt Security; drift detection, automated audits and skill-integrity verification.",
  },
];

// ============================================================
// Security AI Agents — verified real
// ============================================================
export const agentProjects: GitHubProject[] = [
  {
    slug: "strix", kind: "agent", name: "Strix",
    owner: "usestrix", repo: "strix",
    url: "https://github.com/usestrix/strix",
    description: "Open-source AI penetration testing tool to find and fix your app's vulnerabilities.",
    stars: 42138, language: "Python",
    topics: ["agents","ai-hacking","ai-penetration-testing","ai-pentesting","ai-security","artificial-intelligence","bug-bounty","code-quality","ctf-tools","cybersecurity","cybersecurity-tools","ethical-hacking","hacking","llm-security","offensive-security","penetration-testing","pentesting-tools","red-teaming","security","security-automation"],
    defaultBranch: "main", readmePath: "README.md", area: "vuln-scan",
    installCommand: "pipx install strix-agent",
    notable: "One of the most-starred open-source AI pentest tools; autonomous agents that find and validate app vulnerabilities with working PoCs.",
  },
  {
    slug: "pentestgpt", kind: "agent", name: "PentestGPT",
    owner: "GreyDGL", repo: "PentestGPT",
    url: "https://github.com/GreyDGL/PentestGPT",
    description: "Automated Penetration Testing Agentic Framework Powered by Large Language Models",
    stars: 14296, language: "Python",
    topics: ["large-language-models","llm","penetration-testing","python"],
    defaultBranch: "main", readmePath: "README.md", area: "exploit",
    installCommand: "pip install -e .",
    notable: "The pioneering LLM-driven autonomous pentest framework, backed by a peer-reviewed USENIX Security paper.",
  },
  {
    slug: "cai", kind: "agent", name: "CAI (Cybersecurity AI)",
    owner: "aliasrobotics", repo: "cai",
    url: "https://github.com/aliasrobotics/cai",
    description: "Cybersecurity AI (CAI), the framework for AI Security",
    stars: 9471, language: "Python",
    topics: ["artificial-intelligence","cybersecurity","framework","generative-ai","llm","pentesting"],
    defaultBranch: "main", readmePath: "README.md", area: "exploit",
    installCommand: "pip install cai-framework",
    notable: "Actively-maintained framework by Alias Robotics with many pre-built offensive/defensive security agents.",
  },
  {
    slug: "garak", kind: "agent", name: "garak",
    owner: "NVIDIA", repo: "garak",
    url: "https://github.com/NVIDIA/garak",
    description: "the LLM vulnerability scanner",
    stars: 8469, language: "Python",
    topics: ["ai","llm-evaluation","llm-security","security-scanners","vulnerability-assessment"],
    defaultBranch: "main", readmePath: "README.md", area: "defense",
    installCommand: "pip install garak",
    notable: "NVIDIA's industry-standard scanner for probing LLMs for jailbreaks, prompt injection, data leakage and hallucination.",
  },
  {
    slug: "purple-llama", kind: "agent", name: "PurpleLlama",
    owner: "meta-llama", repo: "PurpleLlama",
    url: "https://github.com/meta-llama/PurpleLlama",
    description: "Set of tools to assess and improve LLM security.",
    stars: 4292, language: "Python",
    topics: [],
    defaultBranch: "main", readmePath: "README.md", area: "defense",
    installCommand: "see README",
    notable: "Meta's umbrella project (CyberSecEval, Llama Guard, Code Shield) for evaluating and hardening LLM/AI-system security.",
  },
  {
    slug: "vulnhuntr", kind: "agent", name: "Vulnhuntr",
    owner: "protectai", repo: "vulnhuntr",
    url: "https://github.com/protectai/vulnhuntr",
    description: "Zero shot vulnerability discovery using LLMs",
    stars: 2704, language: "Python",
    topics: ["ai","llm","security","static-analysis","vulnerability-detection"],
    defaultBranch: "main", readmePath: "README.md", area: "vuln-scan",
    installCommand: "pip install vulnhuntr",
    notable: "Protect AI's LLM static-analysis agent credited with discovering real 0-days in popular open-source Python projects.",
  },
  {
    slug: "burpgpt", kind: "agent", name: "burpgpt",
    owner: "aress31", repo: "burpgpt",
    url: "https://github.com/aress31/burpgpt",
    description: "A Burp Suite extension that integrates OpenAI's GPT to perform an additional passive scan for discovering highly bespoke vulnerabilities and enables running traffic-based analysis of any type.",
    stars: 2335, language: "Java",
    topics: ["ai","burp-extensions","burp-plugin","burpsuite","burpsuite-extender","cybersecurity","gpt","gpt-3","openai","openai-api","pentesting","security","security-automation","webapp"],
    defaultBranch: "main", readmePath: "README.md", area: "vuln-scan",
    installCommand: "Load the JAR in Burp Suite (Extender); see README",
    notable: "Popular Burp Suite extension adding GPT-powered passive scanning to detect bespoke web vulnerabilities from live traffic.",
  },
  {
    slug: "agentic-security", kind: "agent", name: "Agentic Security",
    owner: "msoedov", repo: "agentic_security",
    url: "https://github.com/msoedov/agentic_security",
    description: "Agentic LLM Vulnerability Scanner / AI red teaming kit",
    stars: 1931, language: "Python",
    topics: ["agent-framework","agent-security","ai-red-team","llm-evaluation","llm-evaluation-framework","llm-fuzzer","llm-fuzzer-aggregator","llm-fuzzing","llm-guardrails","llm-jailbreaks","llm-scanner","llm-security","llm-vulnerabilities","prompt-testing"],
    defaultBranch: "main", readmePath: "README.md", area: "defense",
    installCommand: "pip install agentic_security",
    notable: "Agentic AI red-teaming kit with LLM fuzzing and jailbreak probe sets for hardening LLM applications.",
  },
  {
    slug: "hackingbuddygpt", kind: "agent", name: "hackingBuddyGPT",
    owner: "ipa-lab", repo: "hackingBuddyGPT",
    url: "https://github.com/ipa-lab/hackingBuddyGPT",
    description: "Helping Ethical Hackers use LLMs in 50 Lines of Code or less..",
    stars: 1176, language: "Python",
    topics: ["large-language-models","llm","penetration-testing","pentesting"],
    defaultBranch: "main", readmePath: "README.md", area: "exploit",
    installCommand: "see README",
    notable: "Academic framework (TU Wien / ipa-lab) for building minimal LLM hacking agents.",
  },
  {
    slug: "nebula", kind: "agent", name: "Nebula",
    owner: "berylliumsec", repo: "nebula",
    url: "https://github.com/berylliumsec/nebula",
    description: "AI-powered penetration testing assistant for automating recon, note-taking, and vulnerability analysis.",
    stars: 1067, language: "Python",
    topics: ["ai","ai-powered-ethical-hacking-tool","ai-powered-penetration-testing-tool","cybersecurity","cybersecurity-tools","ethical-hacking","ethical-hacking-tool","llm","penetration-testing-framework","penetration-testing-tool","python","security-automation","vulnerability-assesment-tools","vulnerability-assessment","vulnerability-scanners"],
    defaultBranch: "main", readmePath: "README.md", area: "recon",
    installCommand: "see README",
    notable: "AI pentest assistant that automates recon, note-taking and vulnerability analysis.",
  },
  {
    slug: "openosint", kind: "agent", name: "OpenOSINT",
    owner: "OpenOSINT", repo: "OpenOSINT",
    url: "https://github.com/OpenOSINT/OpenOSINT",
    description: "AI-powered OSINT agent with interactive REPL, MCP server, and CLI. 16 tools. Works with Claude, GPT-4, or local models. For authorized security research only.",
    stars: 1026, language: "Python",
    topics: ["python","cli","security","osint","terminal","mcp","sherlock","cybersecurity","threat-intelligence","claude","reconnaissance","osint-tools","maigret","ai-agent","holehe","llm","anthropic","model-context-protocol","mcp-server"],
    defaultBranch: "main", readmePath: "README.md", area: "recon",
    installCommand: "see README",
    notable: "AI-driven OSINT agent (REPL + MCP server + CLI) that orchestrates tools like Sherlock, Maigret and Holehe via Claude/GPT-4 or local models.",
  },
];
```

- [ ] **Step 3: Verify file typechecks**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 4: Verify the slug lookup works**

Run a quick sanity check via Node:
```bash
node -e "const {mcpProjects,skillProjects,agentProjects,projectBySlug} = require('./lib/github-projects.ts');" 2>&1 | head -5
```
Expected: a TS-load error is fine here (we can't require .ts directly). Instead verify by reading the file end-to-end for the three arrays — confirm `mcpProjects.length === 12`, `skillProjects.length === 10`, `agentProjects.length === 11`.

- [ ] **Step 5: Commit**

```bash
git add lib/github-projects.ts
git commit -m "feat(data): add lib/github-projects with 33 verified real GitHub projects"
```

---

## Task 3: Rewrite `lib/security-mcp.ts` to re-export real data

**Files:**
- Modify: `lib/security-mcp.ts` (full rewrite)

- [ ] **Step 1: Replace the file content**

Overwrite `lib/security-mcp.ts` with:

```ts
// Backwards-compatible re-export. All data lives in lib/github-projects.ts
// (verified real GitHub repos).
export { mcpProjects as securityMcpTools, skillProjects as securitySkills } from "@/lib/github-projects";
```

- [ ] **Step 2: Verify consumers still typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors. (`securityMcpTools` and `securitySkills` keep their old names so the client file needs fewer edits.)

- [ ] **Step 3: Commit**

```bash
git add lib/security-mcp.ts
git commit -m "refactor(security-mcp): re-export real projects from github-projects"
```

---

## Task 4: Rewrite `lib/agents.ts` to re-export real data

**Files:**
- Modify: `lib/agents.ts` (full rewrite)

- [ ] **Step 1: Replace the file content**

Overwrite `lib/agents.ts` with:

```ts
// Backwards-compatible re-export. All data lives in lib/github-projects.ts
// (verified real GitHub repos). The homepage imports `securityAgents` and
// `agentCategories`; we re-export the same names so `app/page.tsx` only needs
// minimal edits.
export { agentProjects as securityAgents } from "@/lib/github-projects";
export { securityAreas as agentCategories } from "@/lib/github-projects";
export type { SecurityArea as AgentCategory } from "@/lib/github-projects";
```

- [ ] **Step 2: Verify consumers still typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add lib/agents.ts
git commit -m "refactor(agents): re-export real projects from github-projects"
```

---

## Task 5: Build `components/markdown.tsx` (README renderer)

**Files:**
- Create: `components/markdown.tsx`

The renderer takes raw README markdown + the owning project (for URL rewriting). Relative `src`/`href` are rewritten to absolute GitHub URLs.

- [ ] **Step 1: Create the component**

Create `components/markdown.tsx`:

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GitHubProject } from "@/lib/github-projects";

interface MarkdownProps {
  source: string;
  project: GitHubProject;
}

function rawBase(p: GitHubProject): string {
  return `https://raw.githubusercontent.com/${p.owner}/${p.repo}/${p.defaultBranch}/`;
}

function blobBase(p: GitHubProject): string {
  return `https://github.com/${p.owner}/${p.repo}/blob/${p.defaultBranch}/`;
}

function resolveAsset(p: GitHubProject, url: string): string {
  if (!url) return url;
  if (/^(https?:|data:|mailto:|#|\/\/)/i.test(url)) return url;
  if (url.startsWith("/")) return blobBase(p) + url.replace(/^\/+/, "");
  // treat as relative to repo root
  const base = rawBase(p);
  return base + url.replace(/^\.\//, "");
}

export function Markdown({ source, project }: MarkdownProps) {
  return (
    <div className="prose prose-invert max-w-none
      prose-headings:font-semibold
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-code:rounded prose-code:bg-secondary/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-secondary/40 prose-pre:border prose-pre:border-border/60
      prose-img:rounded-lg prose-img:border prose-img:border-border/60
      prose-table:border-collapse prose-th:border prose-th:border-border/60 prose-td:border prose-td:border-border/60">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href ? resolveAsset(project, href) : undefined} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src ? resolveAsset(project, src) : undefined} alt={alt ?? ""} loading="lazy" />
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add components/markdown.tsx
git commit -m "feat: add Markdown renderer with GitHub URL rewriting"
```

---

## Task 6: Build `components/project-detail.tsx` (shared detail body)

**Files:**
- Create: `components/project-detail.tsx`

This component renders the project header (real curated metadata) and either the fetched README or the fallback view.

- [ ] **Step 1: Create the component**

Create `components/project-detail.tsx`:

```tsx
import Link from "next/link";
import { Star, Github, ExternalLink, Terminal, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/markdown";
import {
  type GitHubProject,
  fetchReadme,
  securityAreas,
  formatStars,
} from "@/lib/github-projects";

interface ProjectDetailProps {
  project: GitHubProject;
  /** Pre-fetched README (or null on failure). Pass from the server route. */
  readme: string | null;
}

export async function ProjectDetail({ project, readme }: ProjectDetailProps) {
  const area = securityAreas.find((a) => a.slug === project.area);
  const AreaIcon = area ? null : null; // icon usage optional, header is text-only

  return (
    <article className="space-y-8">
      {/* Header */}
      <header className="space-y-4 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href={project.kind === "agent" ? "/agents" : "/mcp"} className="hover:text-primary">
            {project.kind === "agent" ? "AI Agent" : project.kind === "skill" ? "Skills" : "MCP"}
          </Link>
          <span>›</span>
          {area && <Badge className="text-[10px]">{area.name}</Badge>}
          {project.language && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-primary/70" />
              {project.language}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {formatStars(project.stars)}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold">{project.name}</h1>
        <p className="text-lg text-muted-foreground">{project.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
          >
            <Github className="h-4 w-4" />
            <span className="font-mono">{project.owner}/{project.repo}</span>
            <ExternalLink className="h-3 w-3 ml-0.5" />
          </a>
          {project.installCommand && (
            <code className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/50 border border-border/60 text-xs font-mono">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              {project.installCommand}
            </code>
          )}
        </div>

        {project.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.topics.slice(0, 12).map((t) => (
              <Badge key={t} className="text-[10px]">#{t}</Badge>
            ))}
          </div>
        )}

        {project.notable && (
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">为什么收录：</span>
            {project.notable}
          </div>
        )}
      </header>

      {/* README or fallback */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            {project.kind === "skill" ? "SKILL.md / README" : "README"}
          </h2>
          <span className="text-xs text-muted-foreground">
            来源：<a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">github.com/{project.owner}/{project.repo}</a>
          </span>
        </div>

        {readme ? (
          <Markdown source={readme} project={project} />
        ) : (
          <Fallback project={project} />
        )}
      </section>
    </article>
  );
}

function Fallback({ project }: { project: GitHubProject }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 p-6 space-y-4">
      <div className="text-sm text-muted-foreground">
        当前无法直接拉取该项目的 README（可能是网络、限流或仓库已移动）。下面是项目简介，请前往 GitHub 查看完整内容：
      </div>
      <p className="text-foreground/90 leading-relaxed">{project.description}</p>
      {project.installCommand && (
        <div>
          <div className="text-xs text-muted-foreground mb-1">推荐安装</div>
          <code className="block px-3 py-2 rounded-md bg-secondary/50 border border-border/60 text-xs font-mono break-all">
            {project.installCommand}
          </code>
        </div>
      )}
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
      >
        <Github className="h-4 w-4" />
        在 GitHub 上查看完整 README
        <ExternalLink className="h-3 w-3 ml-0.5" />
      </a>
    </div>
  );
}

/** Server-side wrapper that fetches the README and delegates. */
export async function ProjectDetailWithFetch({ project }: { project: GitHubProject }) {
  const readme = await fetchReadme(project);
  return <ProjectDetail project={project} readme={readme} />;
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add components/project-detail.tsx
git commit -m "feat: add ProjectDetail component (header + README/fallback)"
```

---

## Task 7: Create `/mcp/[slug]` detail route

**Files:**
- Create: `app/mcp/[slug]/page.tsx`

- [ ] **Step 1: Create the route**

Create `app/mcp/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  mcpProjects,
  skillProjects,
  projectBySlug,
  type GitHubProject,
  fetchReadme,
} from "@/lib/github-projects";
import { ProjectDetail } from "@/components/project-detail";

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return [...mcpProjects, ...skillProjects].map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p || (p.kind !== "mcp" && p.kind !== "skill")) return { title: "未找到" };
  return {
    title: `${p.name} · ${p.kind === "skill" ? "Agent Skill" : "MCP"} · SecToolbox`,
    description: p.description,
  };
}

export default async function McpOrSkillDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project || (project.kind !== "mcp" && project.kind !== "skill")) notFound();

  const readme = await fetchReadme(project as GitHubProject);
  const backHref = project.kind === "skill" ? "/mcp?tab=skills" : "/mcp";

  return (
    <div className="container py-10 max-w-4xl">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> 返回 {project.kind === "skill" ? "Skills" : "MCP"} 列表
      </Link>
      <ProjectDetail project={project as GitHubProject} readme={readme} />
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add app/mcp/\[slug\]/page.tsx
git commit -m "feat: add /mcp/[slug] detail route for MCP servers and Skills"
```

---

## Task 8: Create `/agents/[slug]` detail route

**Files:**
- Create: `app/agents/[slug]/page.tsx`

- [ ] **Step 1: Create the route**

Create `app/agents/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  agentProjects,
  projectBySlug,
  type GitHubProject,
  fetchReadme,
} from "@/lib/github-projects";
import { ProjectDetail } from "@/components/project-detail";

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return agentProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p || p.kind !== "agent") return { title: "未找到" };
  return { title: `${p.name} · AI Agent · SecToolbox`, description: p.description };
}

export default async function AgentDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project || project.kind !== "agent") notFound();

  const readme = await fetchReadme(project as GitHubProject);

  return (
    <div className="container py-10 max-w-4xl">
      <Link href="/agents" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> 返回 AI Agent 列表
      </Link>
      <ProjectDetail project={project as GitHubProject} readme={readme} />
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add app/agents/\[slug\]/page.tsx
git commit -m "feat: add /agents/[slug] detail route"
```

---

## Task 9: Update `/mcp` list page (cards link to detail pages)

**Files:**
- Modify: `app/mcp/mcp-skills-client.tsx`

This is a rewrite of the client component so cards become `Link`s to the detail routes and display the verified real data instead of the fictional `securityMcpTools` / `securitySkills` fields (which don't have `stars`/`language`/etc.).

- [ ] **Step 1: Replace the file content**

Overwrite `app/mcp/mcp-skills-client.tsx` with:

```tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  mcpProjects,
  skillProjects,
  securityAreas,
  type GitHubProject,
  type SecurityArea,
  formatStars,
} from "@/lib/github-projects";
import { Search, X, Wrench, Code, Star, Github, ExternalLink } from "lucide-react";

const areas = securityAreas.filter((a) => a.slug !== "general");

export default function McpSkillsClient() {
  const [activeTab, setActiveTab] = useState<"mcp" | "skills">("mcp");
  const [cat, setCat] = useState<SecurityArea | "all">("all");
  const [q, setQ] = useState("");

  const filteredMcp = useMemo(() => {
    return mcpProjects.filter((m) => {
      if (cat !== "all" && m.area !== cat) return false;
      if (q) {
        const s = (m.name + m.owner + m.repo + m.description + m.topics.join(" ")).toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [cat, q]);

  const filteredSkills = useMemo(() => {
    return skillProjects.filter((s) => {
      if (cat !== "all" && s.area !== cat && s.area !== "general") return false;
      if (q) {
        const str = (s.name + s.owner + s.repo + s.description + s.topics.join(" ")).toLowerCase();
        if (!str.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [cat, q]);

  const list = activeTab === "mcp" ? filteredMcp : filteredSkills;

  return (
    <div className="container py-10">
      {/* Hero */}
      <section className="relative mb-12 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="relative">
          <Badge className="mb-4 border-primary/40 text-primary bg-primary/10">
            <Wrench className="h-3 w-3 mr-1" />
            MCP 工具 · Skills 技能
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            安全工具
            <span className="text-primary"> 生态系统</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            来自 GitHub 的真实开源项目，覆盖 MCP 服务器与 Agent Skills（SKILL.md）。
            点击卡片查看项目真实 README 介绍。
          </p>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            {[
              { value: mcpProjects.length.toString(), label: "MCP 服务器", icon: Wrench },
              { value: skillProjects.length.toString(), label: "Agent Skills", icon: Code },
              { value: String(areas.length), label: "专业领域", icon: Code },
              { value: formatStars(mcpProjects.reduce((a, p) => a + p.stars, 0) + skillProjects.reduce((a, p) => a + p.stars, 0)), label: "GitHub 总 Star", icon: Star },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/40">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab("mcp"); setCat("all"); }}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "mcp" ? "bg-primary text-primary-foreground" : "bg-secondary/30 text-muted-foreground hover:text-foreground"
          )}
        >
          <Wrench className="h-4 w-4 inline mr-1.5" />
          MCP 工具 ({mcpProjects.length})
        </button>
        <button
          onClick={() => { setActiveTab("skills"); setCat("all"); }}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "skills" ? "bg-primary text-primary-foreground" : "bg-secondary/30 text-muted-foreground hover:text-foreground"
          )}
        >
          <Code className="h-4 w-4 inline mr-1.5" />
          Skills 技能 ({skillProjects.length})
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索名称、owner、主题…"
            className="w-full h-12 pl-12 pr-10 rounded-lg border border-border/60 bg-secondary/30 text-sm outline-none focus:border-primary/60 transition-colors"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={cat === "all"} onClick={() => setCat("all")}>全部</FilterChip>
          {areas.map((a) => {
            const Icon = (Icons as any)[a.icon] ?? Icons.Circle;
            return (
              <FilterChip
                key={a.slug}
                active={cat === a.slug}
                onClick={() => setCat(a.slug)}
                icon={<Icon className="h-3.5 w-3.5" />}
              >
                {a.name}
              </FilterChip>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
        {list.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border/60 p-16 text-center text-muted-foreground">
            没有匹配的项目，换个关键词试试。
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: GitHubProject }) {
  const area = securityAreas.find((a) => a.slug === project.area);
  return (
    <Link href={`/mcp/${project.slug}`} className="group">
      <Card className="h-full hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 transition-all">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{project.name}</CardTitle>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Star className="h-3.5 w-3.5" />
              {formatStars(project.stars)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {area && <Badge className="text-[10px]">{area.name}</Badge>}
            {project.language && <Badge className="text-[10px]">{project.language}</Badge>}
          </div>
          <CardDescription className="mt-2 text-xs line-clamp-3">{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Github className="h-3 w-3" />
            <span className="font-mono truncate">{project.owner}/{project.repo}</span>
          </div>
          {project.installCommand && (
            <code className="block mt-2 px-2 py-1 rounded bg-secondary/50 border border-border/40 text-[10px] font-mono truncate">
              {project.installCommand}
            </code>
          )}
          <div className="mt-3 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            查看真实 README <ExternalLink className="h-3 w-3 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function FilterChip({ children, active, onClick, icon }: { children: React.ReactNode; active?: boolean; onClick?: () => void; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-all",
        active ? "border-primary/60 bg-primary/15 text-primary font-medium shadow-sm" : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {icon}
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add app/mcp/mcp-skills-client.tsx
git commit -m "feat(mcp): list cards link to /mcp/[slug] and render real project data"
```

---

## Task 10: Update `/agents` list page

**Files:**
- Modify: `app/agents/agents-client.tsx`

- [ ] **Step 1: Replace the file content**

Overwrite `app/agents/agents-client.tsx` with:

```tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  agentProjects,
  securityAreas,
  type GitHubProject,
  type SecurityArea,
  formatStars,
} from "@/lib/github-projects";
import { Search, X, Bot, Star, Github, ExternalLink } from "lucide-react";

const areas = securityAreas.filter((a) => a.slug !== "general");

export default function AgentsClient() {
  const [cat, setCat] = useState<SecurityArea | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return agentProjects.filter((a) => {
      if (cat !== "all" && a.area !== cat) return false;
      if (q) {
        const s = (a.name + a.owner + a.repo + a.description + a.topics.join(" ")).toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [cat, q]);

  return (
    <div className="container py-10">
      {/* Hero */}
      <section className="relative mb-12 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="relative">
          <Badge className="mb-4 border-primary/40 text-primary bg-primary/10">
            <Bot className="h-3 w-3 mr-1" />
            AI 驱动 · 智能化安全
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            网络安全
            <span className="text-primary"> AI Agent</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            来自 GitHub 的真实开源安全 AI Agent：自动化渗透测试、LLM 漏洞扫描、威胁情报与红队工具。
            点击卡片查看项目真实 README。
          </p>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            {[
              { value: agentProjects.length.toString(), label: "安全 AI Agent", icon: Bot },
              { value: String(areas.length), label: "专业领域", icon: Bot },
              { value: formatStars(agentProjects.reduce((a, p) => a + p.stars, 0)), label: "GitHub 总 Star", icon: Star },
              { value: "6+", label: "覆盖阶段", icon: Bot },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/40">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索 Agent 名称、owner、主题…"
            className="w-full h-12 pl-12 pr-10 rounded-lg border border-border/60 bg-secondary/30 text-sm outline-none focus:border-primary/60 transition-colors"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={cat === "all"} onClick={() => setCat("all")}>全部</FilterChip>
          {areas.map((a) => {
            const Icon = (Icons as any)[a.icon] ?? Icons.Circle;
            return (
              <FilterChip
                key={a.slug}
                active={cat === a.slug}
                onClick={() => setCat(a.slug)}
                icon={<Icon className="h-3.5 w-3.5" />}
              >
                {a.name}
              </FilterChip>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <AgentCard key={p.slug} project={p} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border/60 p-16 text-center text-muted-foreground">
            没有匹配的 Agent，换个关键词试试。
          </div>
        )}
      </div>
    </div>
  );
}

function AgentCard({ project }: { project: GitHubProject }) {
  const area = securityAreas.find((a) => a.slug === project.area);
  return (
    <Link href={`/agents/${project.slug}`} className="group">
      <Card className="h-full hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 transition-all">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{project.name}</CardTitle>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Star className="h-3.5 w-3.5" />
              {formatStars(project.stars)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {area && <Badge className="text-[10px]">{area.name}</Badge>}
            {project.language && <Badge className="text-[10px]">{project.language}</Badge>}
          </div>
          <CardDescription className="mt-2 text-xs line-clamp-3">{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Github className="h-3 w-3" />
            <span className="font-mono truncate">{project.owner}/{project.repo}</span>
          </div>
          {project.installCommand && (
            <code className="block mt-2 px-2 py-1 rounded bg-secondary/50 border border-border/40 text-[10px] font-mono truncate">
              {project.installCommand}
            </code>
          )}
          <div className="mt-3 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            查看真实 README <ExternalLink className="h-3 w-3 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function FilterChip({ children, active, onClick, icon }: { children: React.ReactNode; active?: boolean; onClick?: () => void; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-all",
        active ? "border-primary/60 bg-primary/15 text-primary font-medium shadow-sm" : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {icon}
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add app/agents/agents-client.tsx
git commit -m "feat(agents): list cards link to /agents/[slug] and render real data"
```

---

## Task 11: Update homepage to use real data

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Read the current import and per-area count usage**

In `app/page.tsx`, the file imports `securityAgents` and `agentCategories` from `@/lib/agents`, and uses them for:
- a stat card `{ value: securityAgents.length.toString(), label: "AI Agent", icon: Bot }`
- a per-area count `securityAgents.filter((a) => a.category === c.slug).length`

Since we re-exported `securityAgents = agentProjects` and `agentCategories = securityAreas`, the only field rename to fix is `a.category` → `a.area` (securityAreas uses `slug`, not `category`).

- [ ] **Step 2: Apply the field rename**

Find the line:
```ts
const count = securityAgents.filter((a) => a.category === c.slug).length;
```
and replace it with:
```ts
const count = securityAgents.filter((a) => a.area === c.slug).length;
```

(If the exact context differs because the field name differs, find the equivalent spot and ensure the comparison uses `a.area`.)

- [ ] **Step 3: Verify typecheck and build**

Run: `npx tsc --noEmit && npm run build`
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "fix(home): use new agent area field for per-category counts"
```

---

## Task 12: Verify build + confirm no fictional content remains

**Files:** none (verification + commit)

- [ ] **Step 1: Final build**

Run: `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 2: Grep for fictional content**

Run:
```bash
grep -rn "nmap-mcp-server\|shodan-mcp-server\|sqlmap-mcp-server\|hydra-mcp-server\|suricata-mcp-server\|wazuh-mcp-server\|volatility-mcp-server\|yara-mcp-server\|lynis-mcp-server\|prowler-mcp-server\|censys-mcp-server" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules
grep -rn "子域名猎手\|子域名枚举专家\|端口扫描专家\|OSINT 情报官\|Web 漏洞猎人\|容器安全卫士\|基础设施审计师\|Web 渗透专家\|口令破解师\|内网渗透专家\|入侵检测专家\|日志分析专家\|数字取证专家\|应急响应专家\|等保合规专家\|安全策略顾问" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules
```
Expected: no output. (These strings were from the old fictional data.)

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev`, then visit:
- `/mcp` — 12 real MCP cards with stars, click one → `/mcp/<slug>` with real README rendered (images load from raw.githubusercontent.com).
- `/mcp` Skills tab — 10 real skill cards, click one → detail page renders real README.
- `/agents` — 11 real agent cards, click one → detail page renders real README.
- `/` — homepage AI-Agent stat reflects real count.
- Temporarily edit one `defaultBranch` to `"nonexistent"` and reload its detail page → fallback view shows (verifies graceful degradation). Revert.

- [ ] **Step 4: Final commit (if any smoke-test fixes needed)**

If step 3 surfaced any issue, fix it and commit. Otherwise, you're done.

---

## Self-review

- **Spec coverage**: Spec required (a) real data for MCP/Skills/Agents — Task 2 + 3 + 4 ✓ (b) detail page with real README — Tasks 5 + 6 + 7 + 8 ✓ (c) fallback on fetch failure — Task 6 `Fallback` ✓ (d) curated metadata always visible — Task 9 + 10 cards + Task 6 header ✓ (e) existing IA preserved — `/mcp` keeps tabs, `/agents` simplified to grid ✓ (f) homepage updates — Task 11 ✓.
- **Placeholders**: none. Every code block is complete; every URL is verified.
- **Type consistency**: `GitHubProject`, `SecurityArea`, `ProjectKind`, `projectBySlug`, `fetchReadme`, `formatStars`, `securityAreas` defined in Task 2 and used unchanged in Tasks 3–11.
- **Dependencies order**: Task 1 adds deps before Task 5 imports them.
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
    topics: ["python","cli","security","osint","terminal","mcp","sherlock","cybersecurity","threat-intelligence","claude","reconnaissance","osint-tools","maigret","holehe","llm","anthropic","model-context-protocol","mcp-server"],
    defaultBranch: "main", readmePath: "README.md", area: "recon",
    installCommand: "see README",
    notable: "AI-driven OSINT agent (REPL + MCP server + CLI) that orchestrates tools like Sherlock, Maigret and Holehe via Claude/GPT-4 or local models.",
  },
];

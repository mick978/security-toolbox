// Shared types + data for the GitHub-project showcase (MCP / Skills / AI Agents).
// Every entry below was verified live against the GitHub API on 2026-07-18.
//
// NOTE: Do NOT place `import "server-only"` at the top of this file. Client
// components (e.g. mcp-skills-client.tsx, agents-client.tsx, network-client.tsx)
// import TYPE-only symbols from here; Next's webpack still marks the whole
// module as server-only and fails the build. Server-only enforcement is done
// by wrapping the function body in a dynamic `import()` inside fetchReadme.

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
  /** Chinese summary, 1-2 sentences. */
  descriptionCn?: string;
  /** Chinese version of the "why we include this" note. */
  whyCn?: string;
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

// NOTE: fetchReadme has moved to ./github-projects.server.ts so the heavy
// server-only import does not get pulled in by client components that only
// need types from this file. Import the server-only version directly from
// server components (pages and route handlers).

/** Format large star counts: 10356 -> "10.4k", 999 -> "999", 256335 -> "256k". */
export function formatStars(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 100000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
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

export function getNetworkProjects(): GitHubProject[] {
  return networkProjects;
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
    descriptionCn: "把 150+ 渗透测试工具（nmap、nuclei、sqlmap、gobuster 等）封装成 MCP server，让 Claude / GPT / Copilot 等大模型自主跑漏洞扫描、漏洞悬赏、CTF 题目。",
    whyCn: 'star 最高的"安全 MCP server"；把 nmap / nuclei / sqlmap 等上百款攻击工具一次接入 LLM。',
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
    descriptionCn: "世界上最广泛使用的开源云安全平台。其官方 MCP server（`mcp_server/`，镜像 `prowlercloud/prowler-mcp`）把 AWS / Azure / GCP 的合规与安全检测结果暴露给 AI。",
    whyCn: "开源云合规领域领头羊；CSPM 行业标杆，官方 MCP 镜像直接可用。",
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
    descriptionCn: "把 NSA 出品的 Ghidra 反编译引擎封装成 MCP，提供 200+ 工具给 AI 做恶意软件 / 固件逆向与 DFIR。GUI 插件 + 无头 server 两种部署形态，支持懒加载。",
    whyCn: "把 NSA 的 Ghidra 反编译能力接入 LLM，应急响应和恶意软件分析的利器。",
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
    descriptionCn: 'Snyk 官方的 AI 安全扫描工具，专门审计其他 MCP server、AI agent 和 agent skill 中的漏洞与"有毒流（toxic flows）"。',
    whyCn: "Snyk 官方出品，主动扫描 AI 代理本身的安全性。",
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
    descriptionCn: "生产级漏洞情报 MCP server，给 Claude 提供 27 个工具、覆盖 21 个 API（NVD、CISA KEV、EPSS、OSV、VirusTotal、Shodan、MITRE ATT&CK 等）。",
    whyCn: "把市面上主要的漏洞情报源整合到一个 MCP 接口。",
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
    descriptionCn: "思科 AI Defense 出品的 MCP scanner，用 YARA 规则 + LLM 分析器对 MCP server 做静态和行为审计。",
    whyCn: '大厂官方出品，专门扫描"其他 MCP 是否安全"，元层面的安全。',
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
    descriptionCn: "PortSwigger 官方 MCP server，把 Burp Suite 的 Web 漏洞扫描器和代理暴露给 AI agent。",
    whyCn: "官方出品，老牌 Web 安全工具 Burp 套件的官方 AI 接入。",
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
    descriptionCn: "连接 AI agent 到 Kali Linux 的 MCP 配置，让 agent 可以执行 Kali 自带的 nmap、hydra 等渗透测试工具。",
    whyCn: "让 AI 直接接管整套 Kali 工具链。",
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
    descriptionCn: "SonarSource 官方 MCP server，把 SAST（静态应用安全测试）和安全热点分析暴露给 AI agent。",
    whyCn: "代码质量巨头 SonarQube 的官方 AI 接入。",
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
    descriptionCn: "广受欢迎的 Shodan 侦察 / OSINT MCP。设备搜索、IP 侦察、DNS 查询、CVE/CPE 漏洞情报。仓库所有权由 BurtTheCoder 转给 w0h1v，npm 包名仍是 `@burtthecoder/mcp-shodan`。",
    whyCn: '互联网上"设备搜索"事实标准的 AI 接入。',
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
    descriptionCn: "VirusTotal 威胁情报 MCP，对文件 / URL / IP / 域名做信誉分析和关系图谱查询。",
    whyCn: "威胁情报最常用聚合服务的 AI 接入。",
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
    descriptionCn: "把 REMnux（专为恶意软件分析设计的 Linux 发行版）的工具栈通过 MCP 暴露给 AI assistant，支持 Docker 和 SSH 两种运行模式。",
    whyCn: "恶意软件分析的官方专用系统，DFIR 必备。",
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
    descriptionCn: "Anthropic 官方的 Agent Skills 仓库，定义 SKILL.md 格式的规范。",
    whyCn: '"标准定义者"，所有其他 Skill 仓库的参考。',
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
    descriptionCn: "Jesse Vincent (obra) 出品的完整 SDLC 方法论（脑暴 → TDD → 调试 → 评审），全部用 SKILL.md 写成。",
    whyCn: "star 最高的 Agent Skills 框架。",
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
    descriptionCn: "Google Chrome 工程师 Addy Osmani 出品的工程技能集，覆盖完整 SDLC 生命周期，含 `security-and-hardening` 安全加固有技能。",
    whyCn: "包含专门的安全加固有技能。",
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
    descriptionCn: "Obsidian CEO Steph Ango (kepano) 出品，教 AI 用 Obsidian CLI 和开放格式（Markdown / Bases / JSON Canvas 等）。",
    whyCn: "来自 Obsidian CEO 的官方风格 Skills。",
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
    descriptionCn: "多平台 agent 插件市场，覆盖 Claude Code / Codex CLI / Cursor / OpenCode / GitHub Copilot / Gemini CLI；共 175 个 Skills 和 203 个 Agent，含安全相关 agent 与事件响应 workflow。",
    whyCn: "大型多 harness 市场，含安全域内容。",
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
    descriptionCn: "把 Claude Code 改造为通用 AI 攻防安全 agent：通过规则、子 agent 和 Skills，编排各种安全工具，做对抗性研究 / 攻击 / 防御操作。",
    whyCn: "攻防一体的 Skills 集合，含 CodeQL、模糊测试、崩溃分析、OSS 取证等高级主题。",
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
    descriptionCn: "微软官方的 Skills 仓库，把 Coding Agent 接地到 Azure SDK（还含一个 `skill-creator` 元技能）。",
    whyCn: "微软官方，含 skill-creator。",
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
    descriptionCn: "精挑细选的进攻性安全 Skills 库，专为 Claude Skills 系统设计，含 58 个技能，覆盖 Web / AD / 无线 / 云 / 移动 / IoT 和漏洞利用开发。",
    whyCn: '"最大"的专门 offensive-security SKILL.md 库。',
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
    descriptionCn: '一对 Claude OSINT 技能，90+ 侦察模块、48 个密钥正则、80+ dorks、9 个只读凭据校验、27 个攻击路径模板、5500+ 行结构化战技。是 SKILL.md 文件，让 Claude 在授权的红队和漏洞悬赏场景中变成"上帝模式"的外部侦察员。',
    whyCn: "专门的 OSINT / 外部侦察技能。",
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
    descriptionCn: "Prompt Security 出品的完整防御技能套件，覆盖 OpenClaw / Hermes / PicoClaw / NanoClaw 等 agent。提供漂移检测、实时安全建议、自动审计、技能完整性校验。",
    whyCn: "Prompt Security（一家真实存在的 AI 安全公司）出品的防御套件。",
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
    descriptionCn: "开源 AI 渗透测试工具，自动发现并验证应用漏洞，输出可用的 PoC。",
    whyCn: "star 数最高的开源 AI 渗透工具。",
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
    descriptionCn: "LLM 驱动的自动化渗透测试 agent 框架。",
    whyCn: "LLM 自主渗透的开山之作，背靠 USENIX Security 学术论文。",
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
    descriptionCn: "CAI —— AI Security 框架。",
    whyCn: "Alias Robotics 积极维护，内置大量预构建的攻防 agent；在 CTF 和渗透研究中广泛使用。",
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
    descriptionCn: "NVIDIA 出品的 LLM 漏洞扫描器，对 LLM 做越狱、prompt 注入、数据泄露、幻觉等探测。",
    whyCn: "NVIDIA 官方，行业标准的 LLM 安全扫描工具。",
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
    descriptionCn: "Meta 的伞式项目（包含 CyberSecEval、Llama Guard、Code Shield），用于评估和强化 LLM / AI 系统的安全性。",
    whyCn: "Meta 官方 LLM 安全工具集。",
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
    descriptionCn: "用 LLM 做零样本漏洞发现。",
    whyCn: "Protect AI 的 LLM 静态分析 agent，发现过真实开源 Python 项目的 0-day。",
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
    descriptionCn: "集成 OpenAI GPT 的 Burp Suite 扩展，做附加的被动扫描，从实时流量中发现高度定制化的漏洞。",
    whyCn: "流行 Burp 扩展，给 Burp 加 GPT 扫描能力。",
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
    descriptionCn: "Agentic LLM 漏洞扫描 / AI 红队套件，含 LLM fuzzing 与越狱探测集，用于加固 LLM 应用。",
    whyCn: "专门的 LLM fuzzing 与 jailbreak 探测。",
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
    descriptionCn: "TU Wien / ipa-lab 的学术框架，用 50 行以内的代码起步构建 LLM 黑客 agent。",
    whyCn: "常用于学术 baseline，文档完善。",
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
    descriptionCn: "AI 驱动的渗透测试助手，自动做侦察、笔记和漏洞分析。",
    whyCn: "自动化的侦察 + 笔记实用工具。",
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
    descriptionCn: "AI 驱动的 OSINT agent，带交互式 REPL、MCP server 与 CLI；16 个工具；支持 Claude、GPT-4 或本地模型；专门编排 Sherlock / Maigret / Holehe 等侦察工具。",
    whyCn: "经典的 OSINT agent 编排示例。",
  },
];

// ============================================================
// Network Troubleshooting · MCP / Skills / Agents
// (network observability, packet capture, SRE, AIOps, DNS/WHOIS,
// IT basics — all verified live against the GitHub API on 2026-07-18)
// ============================================================
export const networkProjects: GitHubProject[] = [
  // ---- MCP ----
  {
    slug: "kubeshark", kind: "mcp", name: "Kubeshark",
    owner: "kubeshark", repo: "kubeshark",
    url: "https://github.com/kubeshark/kubeshark",
    description: "eBPF-powered network observability for Kubernetes. Indexes L4/L7 traffic with full K8s context, decrypts TLS without keys. Queryable by AI agents via MCP and humans via dashboard.",
    stars: 12000, language: "Go",
    topics: ["docker","kubernetes","golang","devops","pcap","rest","mcp","incident-response","grpc","sniffer","wireshark","cloud-native","sre","ebpf","network-analysis","observability","network-security","network-engineering","root-cause-analysis","network-observability"],
    defaultBranch: "master", readmePath: "README.md", area: "defense",
    installCommand: "kubectl apply -f https://raw.githubusercontent.com/kubeshark/kubeshark/master/deploy/manifests/kubeshark.yaml",
    descriptionCn: "eBPF 驱动的 Kubernetes 网络可观测性。索引 L4/L7 流量，带完整 K8s 上下文，无需密钥即可解密 TLS。同时面向 AI agent（通过 MCP）和人（通过 dashboard）。",
    whyCn: "K8s 网络可观测性领域的成熟项目，原生支持 MCP，把 eBPF 抓包能力直接接入 LLM。",
    notable: "Active project, latest release v53.3.0; mature K8s packet capture with first-class MCP support.",
  },
  {
    slug: "wiremcp", kind: "mcp", name: "WireMCP",
    owner: "0xKoda", repo: "WireMCP",
    url: "https://github.com/0xKoda/WireMCP",
    description: "An MCP for WireShark (tshark). Empower LLM's with realtime network traffic analysis capability.",
    stars: 547, language: "JavaScript",
    topics: ["mcp","wireshark","tshark","network-analysis","llm"],
    defaultBranch: "main", readmePath: "README.md", area: "recon",
    installCommand: "npm install -g wiremcp",
    descriptionCn: "把 WireShark (tshark) 包成 MCP，让 LLM 实时分析网络流量。",
    whyCn: "star 数最高的实时抓包 tshark 封装 MCP，MIT 许可，社区非常活跃。",
    notable: "Highest-starred tshark-wrapping MCP; MIT licensed; very active.",
  },
  {
    slug: "prometheus-mcp-server", kind: "mcp", name: "Prometheus MCP Server",
    owner: "pab1it0", repo: "prometheus-mcp-server",
    url: "https://github.com/pab1it0/prometheus-mcp-server",
    description: "A Model Context Protocol (MCP) server that enables AI agents and LLMs to query and analyze Prometheus metrics through standardized interfaces.",
    stars: 501, language: "Python",
    topics: ["devops","ai","mcp","prometheus","llm","model-context-protocol"],
    defaultBranch: "main", readmePath: "README.md", area: "incident",
    installCommand: "pip install prometheus-mcp-server",
    descriptionCn: "通过标准化接口，让 AI agent / LLM 查询和分析 Prometheus 指标。",
    whyCn: "star 数最高的 Prometheus MCP server（501★），Python 实现，已发布 ghcr.io 容器镜像。",
    notable: "Higher-starred community Prometheus MCP, Python, with v1.6.1, MIT, container image on ghcr.io.",
  },
  {
    slug: "netbox-mcp-server", kind: "mcp", name: "NetBox MCP Server",
    owner: "netboxlabs", repo: "netbox-mcp-server",
    url: "https://github.com/netboxlabs/netbox-mcp-server",
    description: "Model Context Protocol (MCP) server for read-only interaction with NetBox data in LLMs.",
    stars: 204, language: "Python",
    topics: ["mcp","netbox","mcp-server"],
    defaultBranch: "main", readmePath: "README.md", area: "compliance",
    installCommand: "uv run netbox-mcp-server",
    descriptionCn: "NetBox 的只读 MCP server，让 LLM 查询 NetBox 网络源数据（IPAM、设备、连接）。",
    whyCn: "NetBox Labs 官方维护，是网络拓扑/资产的权威来源。",
    notable: "Maintained by NetBox Labs (the upstream vendor), so authoritative.",
  },
  {
    slug: "sharkmcp", kind: "mcp", name: "SharkMCP",
    owner: "weirdmachine64", repo: "SharkMCP",
    url: "https://github.com/weirdmachine64/SharkMCP",
    description: "A swiss-knife MCP server for analysing PCAP files.",
    stars: 72, language: "Python",
    topics: ["mcp","traffic-analysis","wireshark","ctf"],
    defaultBranch: "main", readmePath: "README.md", area: "recon",
    installCommand: "pip install sharkmcp",
    descriptionCn: "分析 PCAP 文件的 MCP 万能瑞士军刀（通过 Wireshark 的 sharkd 接口）。",
    whyCn: "离线抓包分析，与实时抓包 WireMCP 互补，CTF 场景很常用。",
    notable: "Exposes Wireshark's `sharkd` programmatically; distinct from WireMCP's `tshark` wrap.",
  },
  {
    slug: "domain-mcp", kind: "mcp", name: "domain-mcp",
    owner: "rinadelph", repo: "domain-mcp",
    url: "https://github.com/rinadelph/domain-mcp",
    description: "MCP server for domain research - WHOIS, DNS, SSL certs, expired domains. No API keys needed.",
    stars: 59, language: "Python",
    topics: ["mcp","domain","whois","dns","ssl","recon"],
    defaultBranch: "main", readmePath: "README.md", area: "recon",
    installCommand: "uvx domain-mcp",
    descriptionCn: "域名调研 MCP：WHOIS / DNS / SSL 证书 / 过期域名，无需任何 API key。",
    whyCn: "MIT 协议，无 API key（用 RDAP + Cloudflare DoH + crt.sh），开箱即用。",
    notable: "MIT, no API keys (uses RDAP + Cloudflare DoH + crt.sh).",
  },
  {
    slug: "itmcp", kind: "mcp", name: "itmcp",
    owner: "andrewhopper", repo: "itmcp",
    url: "https://github.com/andrewhopper/itmcp",
    description: "MCP to provide secure IT tools for AI network troubleshooting (remote ssh, ping, nslookup, etc).",
    stars: 16, language: "Python",
    topics: ["mcp","network-troubleshooting","ssh","ping","nslookup","dig","tcpdump"],
    defaultBranch: "main", readmePath: "README.md", area: "recon",
    installCommand: "pip install itmcp",
    descriptionCn: "AI 网络排查的 IT 基础工具 MCP：SSH / ping / nslookup / dig / tcpdump。",
    whyCn: "填补了 IT 基础排查 MCP 的空白（小项目但定位精准）。",
    notable: "Small but well-scoped; fills the IT-troubleshooting niche.",
  },
  // ---- Skill ----
  {
    slug: "devops-security-agent-skills", kind: "skill", name: "DevOps & Security Agent Skills",
    owner: "BagelHole", repo: "DevOps-Security-Agent-Skills",
    url: "https://github.com/BagelHole/DevOps-Security-Agent-Skills",
    description: "Agent-ready DevOps, security, infrastructure, and compliance knowledge base with 80+ skills across Kubernetes, Terraform, AWS/Azure/GCP, AI platform operations, container hardening, SOC2/ISO27001, and incident response — plus ready-to-run scripts, templates, and playbooks.",
    stars: 41, language: "Shell",
    topics: ["docker","kubernetes","aws","security","devops","terraform","infrastructure-as-code","compliance","sre","cheatsheets","ai-agents","agentic-ai","agent-skills"],
    defaultBranch: "main", readmePath: "README.md", area: "general",
    installCommand: "克隆后放入 .claude/skills/ 或项目 skills 目录",
    descriptionCn: "面向 AI agent 的 DevOps / 安全 / 基础设施 / 合规知识库。含 80+ 个 Skill，覆盖 Kubernetes、Terraform、AWS/Azure/GCP、SOC2/ISO27001、事件响应，并附可运行的脚本、模板和 playbook。",
    whyCn: "我们规模下唯一的 Skill 仓库，覆盖 K8s / Terraform / 合规 / IR 等广度。",
    notable: "Only skills repo at our scale; covers K8s/Terraform/compliance/IR.",
  },
  {
    slug: "awesome-sre-skills", kind: "skill", name: "awesome-sre-skills",
    owner: "sinzin91", repo: "awesome-sre-skills",
    url: "https://github.com/sinzin91/awesome-sre-skills",
    description: "A curated list of AI agent skills for Site Reliability Engineering — monitoring, incident response, observability, and infrastructure.",
    stars: 7, language: null,
    topics: ["awesome","incident-response","awesome-list","sre","observability","ai-agents"],
    defaultBranch: "main", readmePath: "README.md", area: "general",
    descriptionCn: "面向 SRE 场景的 AI agent Skill 精选清单（监控 / IR / 可观测性 / 基础设施）。",
    whyCn: "CC0-1.0 协议的精选索引，用于发现更多 SRE / 观测类 Skill。",
    notable: "CC0-1.0; last updated 2026-07-04; matches the awesome-list pattern.",
  },
  // ---- Agent ----
  {
    slug: "mutil-rag-agent", kind: "agent", name: "multi-rag-agent",
    owner: "Kkkirito-123", repo: "mutil-rag-agent",
    url: "https://github.com/Kkkirito-123/mutil-rag-agent",
    description: "An improved multi-agent AIOps and RAG platform for OnCall troubleshooting, featuring LangGraph-based diagnosis workflows, Milvus vector search, MCP tool integration, Prometheus alert knowledge, and sanitized configuration for safe public deployment.",
    stars: 107, language: "Python",
    topics: ["aiops","multi-agent","rag","langgraph","incident-response","oncall"],
    defaultBranch: "main", readmePath: "README.md", area: "incident",
    installCommand: "docker compose up -d",
    descriptionCn: "多 agent AIOps + RAG 平台，专为 on-call 故障排查设计：LangGraph 编排的诊断流、Milvus 向量检索、MCP 工具集成、Prometheus 告警知识库，配置脱敏可公开部署。",
    whyCn: "star 最高的 AIOps / IR agent（107★），LangGraph + RAG + MCP 组合最完整。",
    notable: "Highest-starred agent among candidates; V3 with fast/deep dual-mode diagnosis.",
  },
  {
    slug: "iras", kind: "agent", name: "IRAS",
    owner: "krishnashakula", repo: "IRAS",
    url: "https://github.com/krishnashakula/IRAS",
    description: "Autonomous AI agent for incident response — triage, RCA, remediation, post-mortem, with human approval.",
    stars: 7, language: "Python",
    topics: ["python","devops","ai","incident-response","on-call","sre","agents","observability","fastapi","anthropic","langgraph","pydantic-ai"],
    defaultBranch: "master", readmePath: "README.md", area: "incident",
    installCommand: "pip install -r requirements.txt && docker compose up postgres && uvicorn app.main:app",
    descriptionCn: "面向事件响应的自主 AI agent：分诊、根因分析、修复、事后复盘，关键步骤带人工审批。",
    whyCn: "9 节点 LangGraph 流程 + 292 测试覆盖 + 持久化 checkpoint + 硬编码不变量（不靠 prompt），是 IR 领域最严谨的设计。",
    notable: "Cleanest scope (9-node LangGraph pipeline, 292 tests/99% coverage, durable checkpointing, hard-coded invariants).",
  },
];

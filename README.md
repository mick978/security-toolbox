<div align="center">

# 🛡️ SecToolbox

**A one-stop network-security triage handbook for red teams, blue teams, DFIR, and security engineers**

51 tools · 8 categories · 42 real-world playbooks · 33 curated AI-security ecosystem projects

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#license)

**English** · [简体中文](./README.zh-CN.md)

</div>

---

## 📖 Overview

**SecToolbox** is a fully static, backend-free security knowledge base built with the Next.js 16 App Router and pre-rendered end to end (SSG). It turns the scattered tools, commands, and mental models of day-to-day security work into a searchable, deep-linkable, copy-ready handbook.

Beyond tools and playbooks, the project maps out the **AI-era security engineering workflow** through three complementary open-source ecosystems: **MCP tools · Agent Skills · security AI agents**. Every project is sourced from public GitHub repositories and validated via the GitHub API — each card links straight to the real README.

## ✨ Features

- ⌘K / Ctrl+K global command-palette search
- One-click command copy with toast feedback
- Dual-axis filtering by platform and difficulty
- URL state sync (e.g. `?cat=dns` is directly shareable)
- Static generation for tool and playbook detail pages (SEO-friendly)
- Automatic "authorization required" banners on high-risk tools
- Dark theme · responsive / mobile-first layout

## 🧰 What's Inside

### Tool categories (8 categories / 51 tools)

| Category | Scope |
|---|---|
| DNS & domains | Resolution, Whois, DNS troubleshooting |
| Connectivity & routing | ping / traceroute / mtr |
| Ports & services | nmap / masscan / service fingerprinting |
| HTTP / TLS | Certificate chains, protocols, header analysis |
| Packet analysis | tcpdump / Wireshark / tshark |
| Vulnerability scanning | nuclei / host & web scanners |
| Logging & forensics | Host forensics, memory dumps, IOC analysis |
| Red team / cloud / mobile / SAST | Lateral movement, cloud credentials, mobile RE, code audit |

### Real-world playbooks (42 scenarios)

- **Network triage** — DNS resolution failures / HTTPS certificate errors / high latency / port exposure / site security checkups / log forensics
- **Cloud security** — AWS IMDS · GCP metadata · Azure IMDS · cloud credential lateral movement
- **Containers & Kubernetes** — Pod escape / privileged containers / RBAC privilege escalation / etcd encryption
- **Application security** — SQLi / XSS / SSRF / deserialization / JWT attacks
- **Mobile security** — Android smali / iOS class-dump / Frida dynamic instrumentation
- **Lateral movement** — Credential harvesting / domain enumeration / delegation attacks / Kerberos
- **Incident response** — Linux / Windows host forensics / memory dumps / IOC analysis

## 🤖 The Three AI-Security Ecosystems

The project curates 33 GitHub-API-validated open-source projects (data source: [`lib/github-projects.ts`](lib/github-projects.ts)).

| Section | Count | Path | Purpose |
|---|---|---|---|
| MCP servers | **12** | `/mcp` (MCP tab) | Wrap local CLIs / online services into "tools" an AI can call |
| Agent Skills | **10** | `/mcp` (Skills tab) | Give an AI an operating manual via `SKILL.md` — how to reason and execute step by step |
| Security AI agents | **11** | `/agents` | End-to-end autonomous agents that run pentests / vuln scans / threat intel by themselves |

### MCP tools · Model Context Protocol

MCP ([modelcontextprotocol.io](https://modelcontextprotocol.io)) is Anthropic's open standard for AI tool invocation. In one sentence: **wrap any tool — nmap, sqlmap, Shodan — into an endpoint an AI can call on demand.** Given a tool description plus an input schema, the LLM decides when to call which tool and with what arguments.

The 12 real security MCP servers included:

- 🛠️ **HexStrike AI** (`0x4m4/hexstrike-ai`) — exposes 150+ security tools (nmap / nuclei / sqlmap / gobuster) over MCP for autonomous pentesting
- ☁️ **Prowler MCP** (`prowler-cloud/prowler`) — official cloud-compliance MCP covering CIS Benchmarks for AWS / Azure / GCP
- 🔬 **Ghidra MCP** (`bethington/ghidra-mcp`) — connects the NSA's Ghidra decompiler to an AI for malware reverse engineering
- 🛡️ **Snyk Agent Scan** (`snyk/agent-scan`) — Snyk's official tool for auditing other MCP servers and agents themselves
- 📊 **CVE MCP** (`mukul975/cve-mcp-server`) — 27 vulnerability-intel tools integrating NVD / CISA KEV / EPSS / MITRE ATT&CK
- 🔍 **Cisco AI Defense MCP Scanner** (`cisco-ai-defense/mcp-scanner`) — Cisco's official YARA + LLM static analysis
- 🕷️ **Burp Suite MCP** (`PortSwigger/mcp-server`) — PortSwigger's official server exposing Burp proxy / scanner to AI
- ⚔️ **MCP Kali Server** (`Wh0am123/MCP-Kali-Server`) — brings the full Kali Linux toolchain to an AI
- 🔎 **SonarQube MCP** (`SonarSource/sonarqube-mcp-server`) — SonarSource's official SAST
- 🌐 **Shodan MCP** (`w0h1v/mcp-shodan`) — internet device search + DNS + CVE/CPE intel
- 🦠 **VirusTotal MCP** (`w0h1v/mcp-virustotal`) — file / URL / IP / domain reputation + relationship analysis
- 🔎 **REMnux MCP** (`REMnux/remnux-mcp-server`) — official MCP front-end for the REMnux malware-analysis distro

### Agent Skills · the `SKILL.md` operating manual

Skills are the reusable agent-capability format that emerged in 2025–2026: a directory containing a `SKILL.md` (YAML frontmatter + Markdown body) describing what the skill does, what inputs it needs, what rules to follow, and how to execute step by step. An AI agent loads these `SKILL.md` files at startup and instantly gains domain-expert capability.

The 10 real Agent Skills repositories included:

- 🏛️ **Anthropic Agent Skills (official)** (`anthropics/skills`) — the spec author; the original `SKILL.md` template
- 🦸 **Superpowers** (`obra/superpowers`) — a full SDLC methodology (brainstorm → TDD → debug → review)
- 🛠️ **Addy Osmani's skill set** (`addyosmani/agent-skills`) — engineering skills from a Google Chrome engineer, incl. security-and-hardening
- 📝 **Obsidian Skills** (`kepano/obsidian-skills`) — from Obsidian's CEO; teaches an AI to drive the Obsidian CLI
- 🧰 **wshobson Agents Marketplace** (`wshobson/agents`) — a cross-platform market of 175 skills / 203 agents
- 🦅 **Raptor** (`gadievron/raptor`) — offensive/defensive skill set: CodeQL / fuzzing / crash analysis
- 📦 **Microsoft Skills** (`microsoft/skills`) — Microsoft's official Azure-SDK-grounded skills
- 🔴 **Claude-Red** (`SnailSploit/Claude-Red`) — 58 offensive-security skills (web / AD / wireless / cloud / mobile / IoT)
- 🕵️ **Claude-OSINT** (`elementalsouls/Claude-OSINT`) — an OSINT / external-recon dual skill pack
- 🛡️ **ClawSec** (`prompt-security/clawsec`) — a defensive skill set from Prompt Security

### Security AI agents · end-to-end autonomy

Unlike MCP / Skills, which "give the AI tools," **an agent takes over the task itself** — you say "scan this subnet," and it decides which tools to run, how to make decisions, and how to write the report.

The 11 real security AI agents included:

- 🏆 **Strix** (`usestrix/strix`) — the hottest AI pentesting agent right now; autonomously discovers, verifies, and produces PoCs
- 🎯 **PentestGPT** (`GreyDGL/PentestGPT`) — an LLM pentesting framework backed by a USENIX Security paper
- 🤖 **CAI** (`aliasrobotics/cai`) — Alias Robotics' AI Security framework with prebuilt offensive/defensive agents
- 🛡️ **garak** (`NVIDIA/garak`) — NVIDIA's LLM vulnerability scanner (jailbreak / prompt injection)
- 💜 **PurpleLlama** (`meta-llama/PurpleLlama`) — Meta's LLM-security umbrella (CyberSecEval / Llama Guard / Code Shield)
- 🔐 **Vulnhuntr** (`protectai/vulnhuntr`) — Protect AI's zero-shot LLM static analysis; has found real 0-days
- 🕸️ **burpgpt** (`aress31/burpgpt`) — adds GPT-powered passive scanning to Burp to spot custom vulnerabilities
- 🎯 **Agentic Security** (`msoedov/agentic_security`) — an agentic LLM red-team suite (fuzzing / jailbreak probing)
- 🧪 **hackingBuddyGPT** (`ipa-lab/hackingBuddyGPT`) — TU Wien's academic framework, starts in ~50 lines of code
- 🌌 **Nebula** (`berylliumsec/nebula`) — an AI pentesting assistant for automated recon / notes / vuln analysis
- 🌐 **OpenOSINT** (`OpenOSINT/OpenOSINT`) — an AI OSINT agent orchestrating Sherlock / Maigret / Holehe

### How the three relate — one diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Your AI security assistant                │
├─────────────┬──────────────────┬─────────────────────────────┤
│   Skills    │    MCP Servers    │        AI Agent             │
│ (how to think)│ (which tools it has)│    (runs tasks itself)    │
├─────────────┼──────────────────┼─────────────────────────────┤
│ SKILL.md    │ tool-exposure     │ end-to-end autonomous agent │
│ operating   │ protocol          │ like an intern              │
│ manual      │ like a USB port   │                             │
│             │                  │                             │
│ • reasoning │ • tool descriptions│ • autonomous decisions      │
│   framework │ • input schemas    │ • tool selection            │
│ • step SOPs │ • call conventions │ • task orchestration        │
│ • caveats   │                  │ • result reporting          │
└─────────────┴──────────────────┴─────────────────────────────┘
```

A typical real-world combination:

1. **Load Skills** into the AI (e.g. `Claude-Red`'s `offensive-sqli`) → it knows *how to test SQL injection step by step*
2. **Connect MCP** (e.g. `HexStrike AI`, `Burp MCP`, `CVE MCP`) → it has a real sqlmap / Burp / CVE database to work with
3. **Agent mode** (e.g. `Strix`, `PentestGPT`) → it decides *which tool to run first, analyzes the output, and picks the next step*

## 🏗️ Tech Stack

- **Next.js 16** App Router · React Server Components · standalone output
- **TypeScript** in strict mode
- **Tailwind CSS 3** + a custom theme (CSS variables)
- **shadcn/ui**-style components (inlined, no CLI dependency)
- **cmdk** — ⌘K global search
- **lucide-react** — icons
- Backend-free · fully static SSG · all pages pre-rendered

## 🚀 Getting Started

```bash
git clone git@github.com:mick978/security-toolbox.git
cd security-toolbox
npm install

npm run dev     # local dev → http://localhost:3000
npm run build   # build the standalone output
npm start       # preview the production build locally
```

## 📦 Deployment

The repo ships with `scripts/deploy.sh` (Node 22+ / nginx). Flow: local `npm run build` (standalone) → package `.next/standalone` + `.next/static` → scp upload → generate a systemd unit (`Restart=always`) + nginx reverse proxy → `systemctl restart` + health check.

```bash
# 1) First-time SSH setup (generate a deploy key and push it to the host)
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_deploy -N "" -C hermes-deploy
ssh-copy-id -i ~/.ssh/id_ed25519_deploy.pub root@YOUR_HOST

# 2) One-command deploy
./scripts/deploy.sh
```

## 🗂️ Project Structure

```
app/
├── layout.tsx              Global layout + Header
├── page.tsx                Home: hero + categories + popular tools
├── tools/[slug]/page.tsx   Tool library + tool details (SSG)
├── cheatsheet/[slug]/…     Playbook list + details (SSG)
├── mcp/                     MCP / Skills ecosystem
└── agents/                  Security AI agent ecosystem
components/                  Header / CommandMenu / CodeBlock / ui
lib/
├── tools.ts                51 tool entries (single source of truth)
├── cheatsheets.ts          42 playbook SOPs
└── github-projects.ts      33 AI ecosystem projects (GitHub-API validated)
scripts/deploy.sh           one-command deploy script
```

## 🔧 Extending

- Add a tool: append an entry to the `tools` array in `lib/tools.ts`
- Add a playbook: append an entry to the `cheatsheets` array in `lib/cheatsheets.ts`
- Add an AI project: append an entry to `lib/github-projects.ts`

All pages (home / lists / details / search) update automatically.

## ⚠️ Disclaimer

This project is intended solely for **authorized security testing, education, and defensive research**. The tools and techniques it references may be offensive in nature — only use them against targets for which you have explicit written authorization. Users are solely responsible for legal and regulatory compliance.

## 📄 License

[MIT](LICENSE) © 2026 mick978

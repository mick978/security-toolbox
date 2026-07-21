<div align="center">

# 🛡️ SecToolbox

**A one-stop network-security triage handbook for red teams, blue teams, DFIR, and security engineers**

96 tools · 13 categories · 60 real-world playbooks · 44 curated AI-security ecosystem projects

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#license)

**English** · [简体中文](./README.zh-CN.md)

</div>

---

## 📖 Overview

**SecToolbox** is a curated, mostly-static security knowledge base built with the Next.js 16 App Router. It turns the scattered tools, commands, and mental models of day-to-day security work into a searchable, deep-linkable, copy-ready handbook — and goes further by mapping out the **AI-era security engineering workflow** through three complementary open-source ecosystems: **MCP tools · Agent Skills · security AI agents**, all sourced from public GitHub repositories and validated via the GitHub API.

Beyond reading, the site lets you **do** the work: a built-in ⌘K palette searches every tool in real time, a sandboxed `/api/exec` lets you run selected debug tools (DNS / connectivity / HTTP / TLS) straight from the page, and a star button + drawer remembers the things you actually use day to day. Auth is HMAC-signed cookies; the showcase pages (`/`, `/mcp`, `/agents`, `/network`) stay public, while `/tools` and `/cheatsheet` are login-walled.

## ✨ Features

- **⌘K / Ctrl+K** global command palette (cmdk) — search every tool, playbook, agent, and project
- **In-browser runner** — execute debug tools (dig, ping, curl, …) via `/api/exec/[slug]` without leaving the page
- **One-click copy** with toast feedback on every command block
- **Dual-axis filtering** by platform (linux / macos / windows / web) and difficulty (beginner → hard)
- **URL state sync** — `?cat=dns` and `/tools/<slug>` are both directly shareable
- **Favorites** — star button on every detail page, drawer in the header, persisted to `localStorage` (cross-tab synced via `storage` events)
- **Export Markdown** — download any tool page as a self-contained `.md` for tickets, wikis, or chat
- **Static generation** for the popular surface (SSG top-N + `dynamicParams = true` ISR for the long tail — SEO-friendly, no cold-start on hot pages)
- **Automatic "authorization required" banners** on high-risk tools (sqlmap / masscan / vulnscan)
- **Theme & accent picker** — light / dark / system-follow-OS, plus 6 accent presets (purple / blue / green / rose / amber / cyan) — `localStorage`-persisted
- **Mobile-first** — bottom tab bar on `< md` (首页 / 工具 / MCP / 案例 / 我的), drawer for full nav, all hit-targets ≥ 44px
- **i18n-ready** routing (`/zh/*` and `/en/*` locales; nginx currently rewrites `/en/*` → `/zh/*`)

## 🧰 What's Inside

### Tool categories (13 categories / 96 tools)

| Category | Scope |
|---|---|
| DNS & domains | Resolution, Whois, DNS troubleshooting |
| Connectivity & routing | ping / traceroute / mtr |
| Ports & services | nmap / masscan / service fingerprinting |
| HTTP / TLS | Certificate chains, protocols, header analysis |
| Packet analysis | tcpdump / Wireshark / tshark |
| Vulnerability scanning | nuclei / host & web scanners |
| Logging & forensics | Host forensics, memory dumps, IOC analysis |
| Recon | Subdomain enum, fingerprinting, OSINT |
| Exploit | sqlmap / metasploit / PoCs |
| C2 / tunneling | sliver / chisel / frp / ligolo |
| Reverse engineering | ghidra / radare2 / frida / jadx |
| Pentest post-exploitation | hydra / hashcat / crackmapexec / impacket |
| Online execution | Tools that can run inside the browser via `/api/exec` |

### Real-world playbooks (60 scenarios)

- **Network triage** — DNS resolution failures / HTTPS certificate errors / high latency / port exposure / site security checkups / log forensics
- **Cloud security** — AWS IMDS · GCP metadata · Azure IMDS · cloud credential lateral movement
- **Containers & Kubernetes** — Pod escape / privileged containers / RBAC privilege escalation / etcd encryption
- **Application security** — SQLi / XSS / SSRF / deserialization / JWT attacks
- **Mobile security** — Android smali / iOS class-dump / Frida dynamic instrumentation
- **Lateral movement** — Credential harvesting / domain enumeration / delegation attacks / Kerberos
- **Incident response** — Linux / Windows host forensics / memory dumps / IOC analysis

## 🤖 The Three AI-Security Ecosystems

The project curates **44 GitHub-API-validated** open-source projects (data source: [`lib/github-projects.ts`](lib/github-projects.ts)).

| Section | Count | Path | Purpose |
|---|---|---|---|
| MCP servers | **19** | `/mcp` (MCP tab) | Wrap local CLIs / online services into "tools" an AI can call |
| Agent Skills | **12** | `/mcp` (Skills tab) | Give an AI an operating manual via `SKILL.md` — how to reason and execute step by step |
| Security AI agents | **13** | `/agents` | End-to-end autonomous agents that run pentests / vuln scans / threat intel by themselves |

### MCP tools · Model Context Protocol

MCP ([modelcontextprotocol.io](https://modelcontextprotocol.io)) is Anthropic's open standard for AI tool invocation. In one sentence: **wrap any tool — nmap, sqlmap, Shodan — into an endpoint an AI can call on demand.** Given a tool description plus an input schema, the LLM decides when to call which tool and with what arguments.

The 19 real security MCP servers are listed under `/mcp`; highlights include HexStrike AI (150+ tools), Prowler (cloud CIS), Ghidra (RE), Burp Suite, Shodan, VirusTotal, SonarQube, REMnux, Cisco AI Defense MCP Scanner, Snyk Agent Scan, and CVE intelligence.

### Agent Skills · the `SKILL.md` operating manual

Skills are the reusable agent-capability format that emerged in 2025–2026: a directory containing a `SKILL.md` (YAML frontmatter + Markdown body) describing what the skill does, what inputs it needs, what rules to follow, and how to execute step by step. An AI agent loads these `SKILL.md` files at startup and instantly gains domain-expert capability.

The 12 real Agent Skills repositories are listed under `/mcp` (Skills tab); highlights include the Anthropic-authored spec, Superpowers (full SDLC methodology), Claude-Red (58 offensive skills), Obsidian Skills, Microsoft Skills, and Prompt Security's ClawSec.

### Security AI agents · end-to-end autonomy

Unlike MCP / Skills, which "give the AI tools," **an agent takes over the task itself** — you say "scan this subnet," and it decides which tools to run, how to make decisions, and how to write the report.

The 13 real security AI agents are listed under `/agents`; highlights include Strix (autonomous PoC), PentestGPT (USENIX-published), NVIDIA garak (LLM vuln scanner), Meta PurpleLlama, Protect AI Vulnhuntr (zero-shot static analysis), and CAI from Alias Robotics.

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

## 🛰️ Network troubleshooting & IP intelligence

Two additional showcases round out the surface:

- **`/network`** — 11 GitHub-verified tools for K8s observability, packet capture, and AIOps: Kubeshark (eBPF K8s packet capture), WireMCP (live tshark), Prometheus / NetBox MCP, multi-rag-agent (AIOps), etc.
- **`/ip-intel`** — single / batch IP lookup that aggregates `ip-api.com` (geo / ASN / Proxy) with Shodan InternetDB (open ports / known CVEs / hostnames) and exports CSV / JSON.

## 🏗️ Tech Stack

- **Next.js 16** App Router · React Server Components · standalone output
- **TypeScript** in strict mode (`tsc --noEmit` clean)
- **Tailwind CSS 3** + a custom theme (CSS variables) + 6 accent presets (`data-accent` swap)
- **shadcn/ui**-style components (inlined, no CLI dependency)
- **cmdk** — ⌘K global search
- **lucide-react** — icons
- **react-markdown** + **remark-gfm** + **mermaid** — READMEs and topology diagrams
- **react 19** · **sonner** toasts · localStorage-backed favorites store with `useSyncExternalStore`
- HMAC-signed cookie auth (`AUTH_USERS` + `AUTH_SECRET`) — middleware-gated routes, no third-party identity
- Mostly static SSG — top-N pages per dynamic route pre-rendered, the long tail falls through to ISR via `dynamicParams = true`

## 🚀 Getting Started

```bash
git clone git@github.com:mick978/security-toolbox.git
cd security-toolbox
npm install

npm run dev     # local dev → http://localhost:3000
npm run build   # build the standalone output
npm start       # preview the production build locally
```

### Environment

Create `.env.local` for dev or `/opt/sectoolbox/app/.env` for prod (see `deploy/.env.production` for the production template):

```bash
AUTH_USERS=admin:your-password
AUTH_SECRET=$(openssl rand -hex 32)   # 64 hex chars
AUTH_TTL_HOURS=168                    # optional, default 7 days
PORT=9119                             # only needed for prod standalone
```

## 📦 Deployment

The repo ships with a standalone build target (`next.config.mjs → output: "standalone"`). On the host, the recommended shape is:

- **nginx** listens on `:9119` (public), reverse-proxies to `127.0.0.1:3000`
- **next standalone** runs `node server.js` from `/opt/sectoolbox/app/standalone/`
- **systemd unit** (`Restart=on-failure`, hardening: `ProtectSystem=strict`, `NoNewPrivileges`, etc.) — template at `deploy/sectoolbox.service`
- **deploy key** `~/.ssh/id_ed25519_deploy` (no passphrase) — `~/.ssh/config.deploy` maps the alias `secbox` to the prod host

Reference deployment is at **http://47.109.63.111:9119/** (Aliyun, nginx :9119 → standalone :3000).

```bash
# 1) First-time SSH setup (generate a deploy key and push it to the host)
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_deploy -N "" -C hermes-deploy
ssh-copy-id -i ~/.ssh/id_ed25519_deploy.pub root@YOUR_HOST

# 2) Build + ship + restart (custom one-shot)
npm run build
tar -czf /tmp/sectoolbox.tar.gz -C .next standalone static
scp /tmp/sectoolbox.tar.gz root@YOUR_HOST:/tmp/
ssh root@YOUR_HOST 'bash -s' <<'REMOTE'
  set -e
  APP=/opt/sectoolbox/app
  STAMP=$(date +%Y%m%d-%H%M%S)
  [ -d $APP ] && mv $APP ${APP}.bak.$STAMP
  mkdir -p $APP && tar -xzf /tmp/sectoolbox.tar.gz -C $APP
  mkdir -p $APP/standalone/.next && cp -r $APP/static $APP/standalone/.next/static
  cp -p ${APP}.bak.$STAMP/.env $APP/.env   # preserve credentials
  pkill -f "node server.js" || true
  sleep 2
  cd $APP/standalone && nohup node server.js > /opt/sectoolbox/logs/app.log 2>&1 &
REMOTE

# 3) Health probe
curl -sI http://YOUR_HOST:9119/             # expect 200
curl -s  -X POST http://YOUR_HOST:9119/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"user":"admin","pass":"YOUR_PASSWORD"}' | head -c 200
curl -s  -X POST http://YOUR_HOST:9119/api/exec/dig \
  -H 'content-type: application/json' -d '{"args":{}}'   # expect {"error":"unauthenticated"}
```

A historical scripted variant lives at `scripts/deploy.sh`.

## 🗂️ Project Structure

```
app/
├── layout.tsx              Global layout + Header + MobileToolbar
├── page.tsx                Home: hero + categories + popular tools
├── tools/                   Tool library + tool details (SSG top-12 + ISR)
├── cheatsheet/              Playbook list + details (SSG top-10 + ISR)
├── agents/                  Security AI agent ecosystem
├── mcp/                     MCP servers + Agent Skills
├── network/                 Network troubleshooting showcase
├── ip-intel/                IP aggregation (geo + Shodan InternetDB)
├── about/                   About page
└── login/                   HMAC cookie login
components/                  Header / MobileToolbar / CommandMenu /
                            CodeBlock / ToolRunner / FavoriteButton /
                            ExportMarkdownButton / DetailToc /
                            FavoritesDrawer / ExploreHero / ExploreCard /
                            project-detail / markdown / mermaid / ui
lib/
├── tools.ts                96 tool entries (single source of truth)
├── cheatsheets.ts          60 playbook SOPs
├── executors.ts            whitelisted debug tools + arg validation
├── github-projects.ts      44 AI ecosystem projects (GitHub-API validated)
├── agents.ts               13 security AI agents + categories
├── theme.ts                light / dark / system + 6 accent presets
├── favorites.ts            localStorage-backed favorites store
├── export-md.ts            tool-page → markdown export
├── category-colors.ts      unified category color palette
├── labels.ts               i18n labels (platform / difficulty)
└── rate-limit.ts           per-IP exec rate limit (10/min default)
scripts/deploy.sh           legacy one-command deploy script
deploy/
├── README.md               deployment walkthrough
├── .env.production         production env template
├── sectoolbox.service      hardened systemd unit
└── start-server.sh         boots `node server.js` from .env
```

## 🔧 Extending

- **Add a tool**: append an entry to the `tools` array in `lib/tools.ts`. If it can run inside the browser, also add an `ExecutorSpec` in `lib/executors.ts` (whitelisted; shell injection impossible by construction).
- **Add a playbook**: append an entry to `lib/cheatsheets.ts`.
- **Add an AI project**: append an entry to `lib/github-projects.ts` (kind: `mcp` / `skill` / `agent` / `network`).
- **Add an accent preset**: extend `ACCENT_PRESETS` in `lib/theme.ts` and the matching `[data-accent="…"]` block in `app/globals.css`.
- **Add a category color**: extend the palette in `lib/category-colors.ts` (one source, used everywhere).

All pages (home / lists / details / search / favorites / theme) update automatically.

## ⚠️ Disclaimer

This project is intended solely for **authorized security testing, education, and defensive research**. The tools and techniques it references may be offensive in nature — only use them against targets for which you have explicit written authorization. Users are solely responsible for legal and regulatory compliance.

## 📄 License

[MIT](LICENSE) © 2026 mick978

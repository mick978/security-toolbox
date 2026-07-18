<div align="center">

# 🛡️ SecToolbox

**面向红队 / 蓝队 / DFIR / 安全工程师的一站式网络安全排查手册**

51 个工具 · 8 大分类 · 42 个实战场景 · 33 个精选 AI 安全生态项目

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#许可证)

**简体中文** · [English](./README.md)

</div>

---

## 📖 项目简介

**SecToolbox** 是一个纯静态、零后端的网络安全排查知识库，用 Next.js 16 App Router 构建，全站预渲染（SSG）。它把日常安全工作中零散的工具、命令和排查思路，整理成可搜索、可直链、可复制的结构化手册。

除了工具与场景速查，本项目还系统梳理了 **AI 时代安全工程师的工作流** —— 三个互补的开源生态：**MCP 工具 / Agent Skills / 安全 AI Agent**。所有项目数据来自 GitHub 公开仓库并经 API 校验，卡片可直接查看真实 README。

## ✨ 特性

- ⌘K / Ctrl+K 全局命令面板搜索
- 命令一键复制（带 toast 反馈）
- 平台 / 难度 双维度过滤
- URL 状态同步（如 `?cat=dns` 可直链分享）
- 工具详情 + 场景详情 静态生成（SEO 友好）
- 高危工具自动挂「授权提醒」横幅
- 暗色主题 · 移动端自适应

## 🧰 内容一览

### 工具分类（8 大类 / 51 个）

| 分类 | 覆盖范围 |
|---|---|
| DNS 与域名 | 解析、Whois、DNS 排错 |
| 连通性与路由 | ping / traceroute / mtr |
| 端口与服务 | nmap / masscan / 服务指纹 |
| HTTP / TLS | 证书链、协议、Header 分析 |
| 抓包分析 | tcpdump / Wireshark / tshark |
| 漏洞扫描 | nuclei / 主机与 Web 扫描 |
| 日志与取证 | 主机取证、内存 dump、IOC |
| 红队 / 云 / 移动 / 代码审计 | 内网横移、云凭据、移动逆向、SAST |

### 实战场景速查（42 个）

- **网络排查** — 域名解析异常 / HTTPS 证书错误 / 高延迟 / 端口开放性 / 站点安全体检 / 日志取证
- **云安全** — AWS IMDS · GCP metadata · Azure IMDS · 云凭据横移
- **容器与 K8s** — Pod 逃逸 / 特权容器 / RBAC 提权 / etcd 加密
- **应用安全** — SQLi / XSS / SSRF / 反序列化 / JWT 攻击
- **移动安全** — Android smali / iOS class-dump / Frida 动态插桩
- **内网横移** — 凭据收割 / 域内枚举 / 委派攻击 / Kerberos
- **应急响应** — Linux / Windows 主机取证 / 内存 dump / IOC 分析

## 🤖 三大 AI 安全生态

本项目收录 33 个经 GitHub API 校验的开源项目（数据源：[`lib/github-projects.ts`](lib/github-projects.ts)）。

| 板块 | 数量 | 路径 | 作用 |
|---|---|---|---|
| MCP 服务器 | **12** | `/mcp`（MCP 标签） | 把本地命令行 / 在线服务封装成 AI 可调用的「工具」 |
| Agent Skills | **10** | `/mcp`（Skills 标签） | 用 `SKILL.md` 给 AI 写「操作手册」，规定它怎么思考、怎么分步执行 |
| 安全 AI Agent | **11** | `/agents` | 端到端接管任务的自动代理，自主渗透 / 漏洞扫描 / 威胁情报 |

### MCP 工具 · Model Context Protocol

MCP（[modelcontextprotocol.io](https://modelcontextprotocol.io)）是 Anthropic 提出的「AI 工具调用」标准协议。核心思想：**把 nmap、sqlmap、Shodan 等任意工具封装成一个 AI 可随时调用的 endpoint**。LLM 拿到「工具描述 + 输入 schema」后，自动决定何时调用哪个工具、传什么参数。

收录的 12 个真实安全 MCP 服务器：

- 🛠️ **HexStrike AI**（`0x4m4/hexstrike-ai`）— 把 150+ 安全工具（nmap / nuclei / sqlmap / gobuster）暴露成 MCP，AI 自动跑渗透测试
- ☁️ **Prowler MCP**（`prowler-cloud/prowler`）— 官方云合规 MCP，覆盖 AWS / Azure / GCP 的 CIS Benchmark
- 🔬 **Ghidra MCP**（`bethington/ghidra-mcp`）— 把 NSA 的 Ghidra 反编译引擎接入 AI，做恶意软件逆向
- 🛡️ **Snyk Agent Scan**（`snyk/agent-scan`）— Snyk 官方工具，审计其他 MCP 服务器与 Agent 自身安全
- 📊 **CVE MCP**（`mukul975/cve-mcp-server`）— 集成 NVD / CISA KEV / EPSS / MITRE ATT&CK 的 27 个漏洞情报工具
- 🔍 **Cisco AI Defense MCP Scanner**（`cisco-ai-defense/mcp-scanner`）— 思科官方 YARA + LLM 静态分析
- 🕷️ **Burp Suite MCP**（`PortSwigger/mcp-server`）— PortSwigger 官方，把 Burp 代理 / 扫描器暴露给 AI
- ⚔️ **MCP Kali Server**（`Wh0am123/MCP-Kali-Server`）— 把 Kali Linux 整套工具链接入 AI
- 🔎 **SonarQube MCP**（`SonarSource/sonarqube-mcp-server`）— SonarSource 官方 SAST
- 🌐 **Shodan MCP**（`w0h1v/mcp-shodan`）— 互联网设备搜索 + DNS + CVE/CPE 情报
- 🦠 **VirusTotal MCP**（`w0h1v/mcp-virustotal`）— 文件 / URL / IP / 域名信誉 + 关系分析
- 🔎 **REMnux MCP**（`REMnux/remnux-mcp-server`）— 官方 REMnux 恶意软件分析发行版的 MCP 前端

### Agent Skills · `SKILL.md` 操作手册

Skills 是 2025-2026 兴起的 **Agent 可复用能力包** 形态：一个目录里放一个 `SKILL.md`（YAML frontmatter + Markdown 正文），描述「这个技能做什么、需要什么输入、遵循什么规则、分几步执行」。AI Agent 启动时加载这些 `SKILL.md`，即可立刻获得该领域的专家能力。

收录的 10 个真实 Agent Skills 仓库：

- 🏛️ **Anthropic Agent Skills（官方）**（`anthropics/skills`）— 规范定义者，`SKILL.md` 格式的原始模板
- 🦸 **Superpowers**（`obra/superpowers`）— 完整的 SDLC 方法论（脑暴 → TDD → 调试 → 评审）
- 🛠️ **Addy Osmani 技能集**（`addyosmani/agent-skills`）— Google Chrome 工程师出品，含 security-and-hardening
- 📝 **Obsidian Skills**（`kepano/obsidian-skills`）— Obsidian CEO 出品，教 AI 用 Obsidian CLI
- 🧰 **wshobson Agents Marketplace**（`wshobson/agents`）— 175 个技能 / 203 个 agent 的多平台市场
- 🦅 **Raptor**（`gadievron/raptor`）— 攻防安全技能集，CodeQL / 模糊测试 / 崩溃分析
- 📦 **Microsoft Skills**（`microsoft/skills`）— 微软官方 Azure SDK 接地技能
- 🔴 **Claude-Red**（`SnailSploit/Claude-Red`）— 58 个进攻性安全技能（Web / AD / 无线 / 云 / 移动 / IoT）
- 🕵️ **Claude-OSINT**（`elementalsouls/Claude-OSINT`）— OSINT / 外部侦察双技能包
- 🛡️ **ClawSec**（`prompt-security/clawsec`）— Prompt Security 出品的防御技能集

### 安全 AI Agent · 端到端自动代理

跟 MCP / Skills 这种「给 AI 加工具」不同，**Agent 是直接接管任务** —— 你说一句「扫一下这个网段」，它自己决定怎么调工具、怎么做决策、怎么写报告。

收录的 11 个真实安全 AI Agent：

- 🏆 **Strix**（`usestrix/strix`）— 当前最火的 AI 渗透测试 agent，自动发现 + 验证漏洞并产出 PoC
- 🎯 **PentestGPT**（`GreyDGL/PentestGPT`）— USENIX Security 论文背书的 LLM 渗透测试框架
- 🤖 **CAI**（`aliasrobotics/cai`）— Alias Robotics 的 AI Security 框架，预置多个攻防 agent
- 🛡️ **garak**（`NVIDIA/garak`）— NVIDIA 出品，LLM 漏洞扫描（越狱 / prompt 注入）
- 💜 **PurpleLlama**（`meta-llama/PurpleLlama`）— Meta 的 LLM 安全伞（CyberSecEval / Llama Guard / Code Shield）
- 🔐 **Vulnhuntr**（`protectai/vulnhuntr`）— Protect AI 的零样本 LLM 静态分析，已发现真实 0-day
- 🕸️ **burpgpt**（`aress31/burpgpt`）— 给 Burp 加 GPT 被动扫描，识别自定义漏洞
- 🎯 **Agentic Security**（`msoedov/agentic_security`）— Agentic LLM 红队套件（fuzzing / 越狱探测）
- 🧪 **hackingBuddyGPT**（`ipa-lab/hackingBuddyGPT`）— TU Wien 的学术框架，50 行代码起步
- 🌌 **Nebula**（`berylliumsec/nebula`）— AI 渗透测试助手，自动化侦察 / 笔记 / 漏洞分析
- 🌐 **OpenOSINT**（`OpenOSINT/OpenOSINT`）— AI OSINT agent，编排 Sherlock / Maigret / Holehe

### 三者关系 — 一张图看懂

```
┌─────────────────────────────────────────────────────────────┐
│                       你的 AI 安全助手                        │
├─────────────┬──────────────────┬─────────────────────────────┤
│   Skills    │    MCP Servers    │        AI Agent             │
│  (怎么想)   │   (能用啥工具)    │       (自己跑任务)          │
├─────────────┼──────────────────┼─────────────────────────────┤
│ SKILL.md    │ 工具暴露协议      │ 端到端自动代理              │
│ 操作手册    │ 像 USB 接口       │ 像一个实习生                │
│             │                  │                             │
│ • 思考框架  │ • 工具描述        │ • 自主决策                  │
│ • 分步 SOP  │ • 输入 schema     │ • 工具选择                  │
│ • 注意事项  │ • 调用规范        │ • 任务编排 / 结果汇报       │
└─────────────┴──────────────────┴─────────────────────────────┘
```

实战中通常这样组合：

1. 给 AI **加载 Skills**（如 `Claude-Red` 的 `offensive-sqli`）→ 它知道「SQL 注入该怎么按步骤测试」
2. 给 AI **接入 MCP**（如 `HexStrike AI`、`Burp MCP`、`CVE MCP`）→ 它有真实的 sqlmap / Burp / CVE 数据库可用
3. **Agent 模式**（如 `Strix`、`PentestGPT`）→ 它自己决定「先跑哪个工具、跑完分析、下一步做什么」

## 🏗️ 技术栈

- **Next.js 16** App Router · React Server Components · standalone 产物
- **TypeScript** 严格模式
- **Tailwind CSS 3** + 自定义主题（CSS 变量）
- **shadcn/ui** 风格组件（内嵌，不依赖 CLI）
- **cmdk** — ⌘K 全局搜索
- **lucide-react** — 图标
- 零后端 · 纯静态 SSG · 全站页面预渲染

## 🚀 快速开始

```bash
git clone git@github.com:mick978/security-toolbox.git
cd security-toolbox
npm install

npm run dev     # 本地开发 → http://localhost:3000
npm run build   # 构建 standalone 产物
npm start       # 本地预览生产版
```

## 📦 部署

仓库内置 `scripts/deploy.sh`（Node 22+ / nginx 服务器），流程：本地 `npm run build`（standalone）→ 打包 `.next/standalone` + `.next/static` → scp 上传 → 生成 systemd unit（`Restart=always`）+ nginx 反代 → `systemctl restart` + 健康检查。

```bash
# 1) 首次配置 SSH（生成部署密钥并注入目标机）
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_deploy -N "" -C hermes-deploy
ssh-copy-id -i ~/.ssh/id_ed25519_deploy.pub root@YOUR_HOST

# 2) 一键部署
./scripts/deploy.sh
```

## 🗂️ 目录结构

```
app/
├── layout.tsx              全局布局 + Header
├── page.tsx                首页 Hero + 分类 + 热门工具
├── tools/[slug]/page.tsx   工具库 + 工具详情（SSG）
├── cheatsheet/[slug]/…     场景速查列表 + 详情（SSG）
├── mcp/                     MCP / Skills 生态
└── agents/                  安全 AI Agent 生态
components/                  Header / CommandMenu / CodeBlock / ui
lib/
├── tools.ts                51 个工具元数据（单一数据源）
├── cheatsheets.ts          42 个场景 SOP
└── github-projects.ts      33 个 AI 生态项目（GitHub API 校验）
scripts/deploy.sh           一键部署脚本
```

## 🔧 扩展

- 新增工具：向 `lib/tools.ts` 的 `tools` 数组追加一条
- 新增场景：向 `lib/cheatsheets.ts` 的 `cheatsheets` 数组追加一条
- 新增 AI 项目：向 `lib/github-projects.ts` 追加一条

所有页面（首页 / 列表 / 详情 / 搜索）会自动更新。

## ⚠️ 免责声明

本项目仅供**授权的安全测试、教育与防御研究**使用。所收录的工具与技术可能具有攻击性，请务必在获得明确书面授权的目标上使用。使用者需自行承担合规与法律责任。

## 📄 许可证

[MIT](LICENSE) © 2026 mick978

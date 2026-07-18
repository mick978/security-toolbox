# SecToolbox · 网络安全排查工具速查

[![Live](https://img.shields.io/badge/live-47.109.63.111%3A9119-2ea44f?style=flat-square)](http://47.109.63.111:9119/)
[![Tools](https://img.shields.io/badge/tools-51-blue?style=flat-square)](http://47.109.63.111:9119/tools)
[![Cheatsheets](https://img.shields.io/badge/cheatsheets-42-purple?style=flat-square)](http://47.109.63.111:9119/cheatsheet)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#license)

> 面向 **红队 / 蓝队 / DFIR / DevOps / SRE / 安全工程师** 的一站式排查手册 — 51 个工具、8 大分类、42 个实战场景速查。
> **线上**：http://47.109.63.111:9119/

## 三大 AI Agent 生态

除了工具和场景速查，本仓库还整合了 **AI 时代安全工程师的工作流** —— 三个互补的开源生态：**MCP 工具 / Agent Skills / 安全 AI Agent**。所有内容来自 GitHub 公开项目（[lib/github-projects.ts](lib/github-projects.ts)），点点卡片即可看到项目真实的 README 介绍。

| 板块 | 数量 | 路径 | 作用 |
|---|---|---|---|
| MCP 服务器 | **12** | `/mcp` (MCP 工具标签) | 把本地命令行/在线服务封装成 AI 能调用的「工具」 |
| Agent Skills | **10** | `/mcp` (Skills 标签) | 用 `SKILL.md` 给 AI 写「操作手册」，告诉它怎么思考、怎么分步执行 |
| 安全 AI Agent | **11** | `/agents` | 直接接管任务、自动渗透 / 漏洞扫描 / 威胁情报的端到端 AI 代理 |

### MCP 工具 · Model Context Protocol

MCP（[modelcontextprotocol.io](https://modelcontextprotocol.io)）是 Anthropic 提出的「AI 工具调用」标准协议。一句话：**把 nmap、sqlmap、Shodan 等任何工具封装成一个 AI 能随时调用的 endpoint**。LLM 通过 MCP 拿到「工具描述 + 输入 schema」，自动决定何时调用哪个工具、传什么参数。

收录的 12 个真实安全 MCP 服务器（验证于 GitHub API）：

- 🛠️ **HexStrike AI**（`0x4m4/hexstrike-ai`，10.4k⭐）— 把 150+ 安全工具（nmap、nuclei、sqlmap、gobuster）暴露成 MCP，AI 自动跑渗透测试
- ☁️ **Prowler MCP**（`prowler-cloud/prowler`，14.1k⭐）— 官方云合规 MCP，覆盖 AWS / Azure / GCP 的 CIS Benchmark
- 🔬 **Ghidra MCP**（`bethington/ghidra-mcp`，2.8k⭐）— 把 NSA 的 Ghidra 反编译引擎接到 AI，做恶意软件逆向
- 🛡️ **Snyk Agent Scan**（`snyk/agent-scan`，2.8k⭐）— Snyk 官方工具，审计其他 MCP 服务器和 Agent 本身的安全
- 📊 **CVE MCP**（`mukul975/cve-mcp-server`，1.1k⭐）— 集成 NVD / CISA KEV / EPSS / MITRE ATT&CK 的 27 个漏洞情报工具
- 🔍 **Cisco AI Defense MCP Scanner**（`cisco-ai-defense/mcp-scanner`，987⭐）— 思科官方 YARA + LLM 静态分析
- 🕷️ **Burp Suite MCP**（`PortSwigger/mcp-server`，984⭐）— PortSwigger 官方，把 Burp 代理 / 扫描器暴露给 AI
- ⚔️ **MCP Kali Server**（`Wh0am123/MCP-Kali-Server`，771⭐）— 把 Kali Linux 整套工具链接入 AI
- 🔎 **SonarQube MCP**（`SonarSource/sonarqube-mcp-server`，598⭐）— SonarSource 官方 SAST
- 🌐 **Shodan MCP**（`w0h1v/mcp-shodan`，144⭐）— 互联网设备搜索 + DNS + CVE/CPE 情报
- 🦠 **VirusTotal MCP**（`w0h1v/mcp-virustotal`，138⭐）— 文件 / URL / IP / 域名信誉 + 关系分析
- 🔎 **REMnux MCP**（`REMnux/remnux-mcp-server`，104⭐）— 官方 REMnux 恶意软件分析 Linux 发行版的 MCP 前端

### Agent Skills · `SKILL.md` 操作手册

Skills 是 2025-2026 兴起的 **Agent 可复用能力包** 形态：一个目录里放一个 `SKILL.md`（YAML frontmatter + Markdown 正文），描述「这个技能做什么、需要什么输入、遵循什么规则、分几步执行」。AI Agent 启动时加载这些 `SKILL.md`，就能立刻拥有该领域的专家能力。

收录的 10 个真实 Agent Skills 仓库：

- 🏛️ **Anthropic Agent Skills（官方）**（`anthropics/skills`，162k⭐）— 规范定义者，`SKILL.md` 格式的原始模板
- 🦸 **Superpowers**（`obra/superpowers`，256k⭐）— 完整的 SDLC 方法论（脑暴 → TDD → 调试 → 评审）
- 🛠️ **Addy Osmani 技能集**（`addyosmani/agent-skills`，79k⭐）— Google Chrome 工程师出品的工程技能，含 security-and-hardening
- 📝 **Obsidian Skills**（`kepano/obsidian-skills`，42k⭐）— Obsidian CEO 出品，教 AI 用 Obsidian CLI
- 🧰 **wshobson Agents Marketplace**（`wshobson/agents`，38k⭐）— 175 个技能 / 203 个 agent 的多平台市场
- 🦅 **Raptor**（`gadievron/raptor`，3.3k⭐）— 攻防安全技能集，CodeQL / 模糊测试 / 崩溃分析
- 📦 **Microsoft Skills**（`microsoft/skills`，2.8k⭐）— 微软官方 Azure SDK 接地技能
- 🔴 **Claude-Red**（`SnailSploit/Claude-Red`，2.7k⭐）— **58 个** 进攻性安全技能（Web / AD / 无线 / 云 / 移动 / IoT）
- 🕵️ **Claude-OSINT**（`elementalsouls/Claude-OSINT`，1.9k⭐）— OSINT / 外部侦察双技能包
- 🛡️ **ClawSec**（`prompt-security/clawsec`，1.1k⭐）— Prompt Security 出品的防御技能集

### 安全 AI Agent · 端到端自动代理

跟 MCP / Skills 这种「给 AI 加工具」不同，**Agent 是直接接管任务** —— 你说一句「扫一下这个网段」，它自己决定怎么调工具、怎么做决策、怎么写报告。

收录的 11 个真实安全 AI Agent：

- 🏆 **Strix**（`usestrix/strix`，42k⭐）— 当前最火的 AI 渗透测试 agent，能自动发现 + 验证漏洞并产出 PoC
- 🎯 **PentestGPT**（`GreyDGL/PentestGPT`，14k⭐）— USENIX Security 论文背书的 LLM 渗透测试框架
- 🤖 **CAI**（`aliasrobotics/cai`，9.5k⭐）— Alias Robotics 的 AI Security 框架，预置多个攻防 agent
- 🛡️ **garak**（`NVIDIA/garak`，8.5k⭐）— NVIDIA 出品，LLM 漏洞扫描（越狱 / prompt 注入）
- 💜 **PurpleLlama**（`meta-llama/PurpleLlama`，4.3k⭐）— Meta 的 LLM 安全伞（CyberSecEval / Llama Guard / Code Shield）
- 🔐 **Vulnhuntr**（`protectai/vulnhuntr`，2.7k⭐）— Protect AI 的零样本 LLM 静态分析，已发现真实 0-day
- 🕸️ **burpgpt**（`aress31/burpgpt`，2.3k⭐）— 给 Burp 加 GPT 被动扫描，识别自定义漏洞
- 🎯 **Agentic Security**（`msoedov/agentic_security`，1.9k⭐）— Agentic LLM 红队套件（fuzzing / 越狱探测）
- 🧪 **hackingBuddyGPT**（`ipa-lab/hackingBuddyGPT`，1.2k⭐）— TU Wien 的学术框架，50 行代码起步
- 🌌 **Nebula**（`berylliumsec/nebula`，1.1k⭐）— AI 渗透测试助手，自动化侦察 / 笔记 / 漏洞分析
- 🌐 **OpenOSINT**（`OpenOSINT/OpenOSINT`，1.0k⭐）— AI OSINT agent，编排 Sherlock / Maigret / Holehe

### 三者关系 — 一张图看懂

```
┌─────────────────────────────────────────────────────────────┐
│                        你的 AI 安全助手                      │
├─────────────┬─────────────────┬─────────────────────────────┤
│   Skills    │    MCP Servers   │    AI Agent                │
│  (怎么想)   │    (能用啥工具)   │   (自己跑任务)              │
├─────────────┼─────────────────┼─────────────────────────────┤
│ SKILL.md    │ 工具暴露协议     │ 端到端自动代理              │
│ 操作手册    │ 像 USB 接口     │ 像一个实习生              │
│             │                 │                             │
│ • 思考框架  │ • 工具描述       │ • 自主决策                  │
│ • 分步 SOP  │ • 输入 schema    │ • 工具选择                  │
│ • 注意事项  │ • 调用规范       │ • 任务编排                  │
│             │                 │ • 结果汇报                  │
└─────────────┴─────────────────┴─────────────────────────────┘
```

实战中你会这样组合：

1. 给 AI **加载 Skills**（如 `Claude-Red` 的 `offensive-sqli`）→ 它知道「SQL 注入该怎么按步骤测试」
2. 给 AI **接入 MCP**（如 `HexStrike AI`、`Burp MCP`、`CVE MCP`）→ 它有真实的 sqlmap / Burp / CVE 数据库可用
3. **Agent 模式**（如 `Strix`、`PentestGPT`）→ 它自己决定「这次先跑哪个工具、跑完分析、下一步做什么」

### 怎么用这个站

1. **浏览卡片**：每个卡片显示该 GitHub 项目的真实 star 数、语言、领域标签
2. **点开详情**：服务器端从 GitHub 拉取真实 README（24h ISR 缓存），用 Markdown 渲染（图片 / 链接 / 代码块全部正常显示）
3. **跟着走 GitHub**：右上角 "GitHub Repo" 一键跳到源代码
4. **跑起来**：项目给出了真实安装命令（`npx -y @burtthecoder/mcp-shodan`、`pip install strix-agent` 等）

所有数据存放于 `lib/github-projects.ts`，每个项目都经过 GitHub API 实时验证存在、star 数 = 公开值。如发现 star 数过时，运行 `git pull` 后 Vercel 会自动重新验证。

## 技术栈

- **Next.js 16** App Router · RSC · standalone output
- **TypeScript** 严格模式
- **Tailwind CSS 3** + 自定义主题（CSS 变量）
- **shadcn/ui** 风格组件（内嵌，不依赖 CLI）
- **cmdk** — ⌘K 全局搜索
- **lucide-react** — 图标
- 零后端 · 纯静态 SSG · 98/98 页面预渲染

## 快速开始

```bash
git clone git@github.com:mick978/security-toolbox.git
cd security-toolbox
npm install
npm run dev         # http://localhost:3000
npm run build       # 构建 standalone 产物
npm start           # 本地预览生产版
```

## 一键部署到自有服务器

已内置 `scripts/deploy.sh`（Node 22+ / nginx 服务器），流程：

```bash
# 1) 首次配置 SSH（生成部署密钥并注入到目标机）
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_deploy -N "" -C hermes-deploy
ssh-copy-id -i ~/.ssh/id_ed25519_deploy.pub root@YOUR_HOST

cat >> ~/.ssh/config <<'EOF'
Host secbox
  HostName YOUR_HOST
  User root
  IdentityFile ~/.ssh/id_ed25519_deploy
  IdentitiesOnly yes
EOF

# 2) 一键部署（本地打包 → scp → 远端 systemd + nginx）
./scripts/deploy.sh
```

脚本会：
- 本地 `npm run build`（standalone 模式）
- 打包 `.next/standalone` + `.next/static` 上传到 `/opt/security-toolbox/`
- 生成 systemd unit `security-toolbox.service`（Restart=always）
- 生成 nginx 反代（默认 `:9119` → `127.0.0.1:3000`）
- `systemctl restart` + nginx reload + 健康检查

## 目录结构

```
app/
├── layout.tsx              全局布局 + Header
├── page.tsx                首页 Hero + 分类 + 热门工具
├── tools/
│   ├── page.tsx            工具库
│   └── [slug]/page.tsx     工具详情（SSG）
├── cheatsheet/
│   ├── page.tsx            场景速查列表
│   └── [slug]/page.tsx     场景详情（SSG）
└── not-found.tsx
components/
├── header.tsx · command-menu.tsx · code-block.tsx
└── ui/                     Button / Card / Badge / Toast / Command
lib/
├── tools.ts                51 个工具元数据（单一数据源）
├── cheatsheets.ts          42 个场景 SOP
└── utils.ts
scripts/
└── deploy.sh               一键部署（本仓库自用）
```

## 内容

**工具分类（8 大类 / 51 个）：**
- DNS 与域名 · 连通性与路由 · 端口与服务 · HTTP / TLS
- 抓包分析 · 漏洞扫描 · 日志与取证 · 在线一次性检查
- 红队工具 · 云与容器 · 移动逆向 · 代码审计

**场景速查（42 个）覆盖：**
- 网络排查（域名解析异常 / HTTPS 证书错误 / 高延迟 / 端口开放性 / 站点安全体检 / 日志取证）
- 云安全（AWS IMDS · GCP metadata · Azure IMDS · 云凭据横移）
- 容器与 K8s（Pod 逃逸 / 特权容器 / RBAC 提权 / etcd 加密）
- 应用安全（SQLi / XSS / SSRF / 反序列化 / JWT 攻击）
- 移动安全（Android smali / iOS class-dump / Frida 动态）
- 内网横移（凭据收割 / 域内枚举 / 委派攻击 / KRB5）
- 应急响应（Linux/Windows 主机取证 / 内存 dump / IOC 分析）

## 特性

- ⌘K / Ctrl+K 全局搜索
- 命令一键复制（带 toast 反馈）
- 平台 / 难度双维度过滤
- URL 状态同步（`?cat=dns` 可直链）
- 工具详情 + 场景详情 静态生成（SEO 友好）
- 高危工具自动挂"授权提醒"横幅
- 暗色主题 · 移动端自适应

## 扩展

- 新增工具：追加一条到 `lib/tools.ts` 的 `tools` 数组
- 新增场景：追加一条到 `lib/cheatsheets.ts` 的 `cheatsheets` 数组

所有页面（首页 / 列表 / 详情 / 搜索）会自动更新。

## License

MIT © 2026 mick978

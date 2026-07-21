<div align="center">

# 🛡️ SecToolbox

**面向红队 / 蓝队 / DFIR / 安全工程师的一站式网络安全排查手册**

96 个工具 · 13 大分类 · 60 个实战场景 · 44 个精选 AI 安全生态项目

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#许可证)

**简体中文** · [English](./README.md)

</div>

---

## 📖 项目简介

**SecToolbox** 是一个精选的、以静态渲染为主的安全排查知识库，用 Next.js 16 App Router 构建。它把日常安全工作中零散的工具、命令和排查思路，整理成可搜索、可直链、可复制的结构化手册——并进一步把 **AI 时代安全工程师的工作流** 系统性梳理成三个互补的开源生态：**MCP 工具 / Agent Skills / 安全 AI Agent**，所有项目都来自 GitHub 公开仓库并经 API 校验。

除了"读"，还能"做"：内置 ⌘K 命令面板实时搜索全部工具，沙箱化的 `/api/exec` 支持直接在页面里跑调试类工具（DNS / 连通性 / HTTP / TLS），星标 + 抽屉记住你高频用的那一小撮。认证走 HMAC 签名 cookie：公开页（`/`、`/mcp`、`/agents`、`/network`）对所有人开放，`/tools` 与 `/cheatsheet` 登录后才能看。

## ✨ 特性

- **⌘K / Ctrl+K** 全局命令面板（cmdk）——搜索全部工具、场景、Agent、项目
- **网页内执行器** —— 通过 `/api/exec/[slug]` 在页面上直接跑 dig / ping / curl 等调试工具
- **一键复制** —— 所有命令块，带 toast 反馈
- **双维度过滤** —— 平台（linux / macos / windows / web）× 难度（入门 → 进阶）
- **URL 状态同步** —— `?cat=dns` 和 `/tools/<slug>` 都可直链分享
- **收藏** —— 每个详情页星标 + header 抽屉，持久化到 `localStorage`（跨 tab 用 `storage` 事件同步）
- **导出 Markdown** —— 任意工具页一键导出 `.md`，用于工单、wiki、聊天
- **静态生成** —— 热门页 SSG top-N + `dynamicParams = true` 长尾走 ISR（SEO 友好，热页无冷启动）
- **高危工具自动挂「授权提醒」横幅** —— sqlmap / masscan / vulnscan
- **主题 + 主题色** —— 明 / 暗 / 跟随系统，外加 6 个 accent 预设（紫 / 蓝 / 绿 / 玫 / 琥珀 / 青），`localStorage` 持久化
- **移动端适配** —— `< md` 断点下底部 tab bar（首页 / 工具 / MCP / 案例 / 我的）+ 抽屉导航，所有触达目标 ≥ 44px
- **i18n 就绪** —— `/zh/*` 和 `/en/*` 双 locale 路由（当前 nginx 把 `/en/*` 308 到 `/zh/*`）

## 🧰 内容一览

### 工具分类（13 大类 / 96 个）

| 分类 | 覆盖范围 |
|---|---|
| DNS 与域名 | 解析、Whois、DNS 排错 |
| 连通性与路由 | ping / traceroute / mtr |
| 端口与服务 | nmap / masscan / 服务指纹 |
| HTTP / TLS | 证书链、协议、Header 分析 |
| 抓包分析 | tcpdump / Wireshark / tshark |
| 漏洞扫描 | nuclei / 主机与 Web 扫描 |
| 日志与取证 | 主机取证、内存 dump、IOC |
| 信息收集 | 子域枚举、指纹、OSINT |
| 漏洞利用 | sqlmap / metasploit / PoC |
| C2 / 隧道 | sliver / chisel / frp / ligolo |
| 逆向工程 | ghidra / radare2 / frida / jadx |
| 渗透后渗透 | hydra / hashcat / crackmapexec / impacket |
| 在线执行 | 可在浏览器内直接跑（`/api/exec`） |

### 实战场景速查（60 个）

- **网络排查** — 域名解析异常 / HTTPS 证书错误 / 高延迟 / 端口开放性 / 站点安全体检 / 日志取证
- **云安全** — AWS IMDS · GCP metadata · Azure IMDS · 云凭据横移
- **容器与 K8s** — Pod 逃逸 / 特权容器 / RBAC 提权 / etcd 加密
- **应用安全** — SQLi / XSS / SSRF / 反序列化 / JWT 攻击
- **移动安全** — Android smali / iOS class-dump / Frida 动态插桩
- **内网横移** — 凭据收割 / 域内枚举 / 委派攻击 / Kerberos
- **应急响应** — Linux / Windows 主机取证 / 内存 dump / IOC 分析

## 🤖 三大 AI 安全生态

本项目收录 **44 个经 GitHub API 校验** 的开源项目（数据源：[`lib/github-projects.ts`](lib/github-projects.ts)）。

| 板块 | 数量 | 路径 | 作用 |
|---|---|---|---|
| MCP 服务器 | **19** | `/mcp`（MCP 标签） | 把本地命令行 / 在线服务封装成 AI 可调用的「工具」 |
| Agent Skills | **12** | `/mcp`（Skills 标签） | 用 `SKILL.md` 给 AI 写「操作手册」，规定它怎么思考、怎么分步执行 |
| 安全 AI Agent | **13** | `/agents` | 端到端接管任务的自动代理，自主渗透 / 漏洞扫描 / 威胁情报 |

### MCP 工具 · Model Context Protocol

MCP（[modelcontextprotocol.io](https://modelcontextprotocol.io)）是 Anthropic 提出的「AI 工具调用」标准协议。核心思想：**把 nmap、sqlmap、Shodan 等任意工具封装成一个 AI 可随时调用的 endpoint**。LLM 拿到「工具描述 + 输入 schema」后，自动决定何时调用哪个工具、传什么参数。

`/mcp` 页下列出全部 19 个真实安全 MCP 服务器，重点包括：HexStrike AI（150+ 工具）、Prowler（云合规 CIS）、Ghidra（逆向）、Burp Suite、Shodan、VirusTotal、SonarQube、REMnux、Cisco AI Defense MCP Scanner、Snyk Agent Scan 等。

### Agent Skills · `SKILL.md` 操作手册

Skills 是 2025–2026 兴起的 **Agent 可复用能力包** 形态：一个目录里放一个 `SKILL.md`（YAML frontmatter + Markdown 正文），描述「这个技能做什么、需要什么输入、遵循什么规则、分几步执行」。AI Agent 启动时加载这些 `SKILL.md`，即可立刻获得该领域的专家能力。

`/mcp` 的 Skills 标签下列出全部 12 个真实仓库，重点包括：Anthropic 规范定义者、Superpowers（完整 SDLC 方法论）、Claude-Red（58 个进攻技能）、Obsidian Skills、Microsoft Skills、Prompt Security 的 ClawSec 等。

### 安全 AI Agent · 端到端自动代理

跟 MCP / Skills 这种「给 AI 加工具」不同，**Agent 是直接接管任务** —— 你说一句「扫一下这个网段」，它自己决定怎么调工具、怎么做决策、怎么写报告。

`/agents` 页下列出全部 13 个真实安全 AI Agent，重点包括：Strix（自动 PoC）、PentestGPT（USENIX 论文）、NVIDIA garak（LLM 漏洞扫描）、Meta PurpleLlama、Protect AI Vulnhuntr（零样本静态分析）、Alias Robotics 的 CAI 等。

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

## 🛰️ 网络排查 + IP 情报

除了工具库与 AI 生态，还有两个专题页：

- **`/network`** — 11 个经 GitHub 校验的 K8s 可观测性 / 抓包分析 / AIOps 工具：Kubeshark（eBPF K8s 抓包）、WireMCP（实时 tshark）、Prometheus / NetBox MCP、multi-rag-agent（AIOps）等
- **`/ip-intel`** — 单个 / 批量 IP 聚合：同时拉 `ip-api.com`（地理 / ASN / Proxy）和 Shodan InternetDB（开放端口 / 已知 CVE / Hostnames），支持 CSV / JSON 导出

## 🏗️ 技术栈

- **Next.js 16** App Router · React Server Components · standalone 产物
- **TypeScript** 严格模式（`tsc --noEmit` 通过）
- **Tailwind CSS 3** + 自定义主题（CSS 变量）+ 6 个 accent 预设（`data-accent` 切换）
- **shadcn/ui** 风格组件（内嵌，不依赖 CLI）
- **cmdk** — ⌘K 全局搜索
- **lucide-react** — 图标
- **react-markdown** + **remark-gfm** + **mermaid** — README 渲染 + 拓扑图
- **react 19** · **sonner** toast · localStorage 收藏 store（`useSyncExternalStore`）
- HMAC 签名 cookie 认证（`AUTH_USERS` + `AUTH_SECRET`）—— middleware 拦截路由，不依赖第三方身份
- 以静态 SSG 为主：每个动态路由 top-N 页预渲染，长尾走 `dynamicParams = true` 的 ISR

## 🚀 快速开始

```bash
git clone git@github.com:mick978/security-toolbox.git
cd security-toolbox
npm install

npm run dev     # 本地开发 → http://localhost:3000
npm run build   # 构建 standalone 产物
npm start       # 本地预览生产版
```

### 环境变量

开发环境用 `.env.local`，生产环境用 `/opt/sectoolbox/app/.env`（模板见 `deploy/.env.production`）：

```bash
AUTH_USERS=admin:your-password
AUTH_SECRET=$(openssl rand -hex 32)   # 64 hex chars
AUTH_TTL_HOURS=168                    # 可选，默认 7 天
PORT=9119                             # 仅生产 standalone 需要
```

## 📦 部署

仓库使用 standalone 构建目标（`next.config.mjs → output: "standalone"`）。推荐部署形态：

- **nginx** 监听 `:9119`（公网），反代到 `127.0.0.1:3000`
- **next standalone** 从 `/opt/sectoolbox/app/standalone/` 起 `node server.js`
- **systemd unit**（`Restart=on-failure`，加固：`ProtectSystem=strict`、`NoNewPrivileges` 等）—— 模板见 `deploy/sectoolbox.service`
- **部署密钥** `~/.ssh/id_ed25519_deploy`（无密码）—— `~/.ssh/config.deploy` 把别名 `secbox` 指向生产主机

参考部署：**http://47.109.63.111:9119/**（阿里云，nginx :9119 → standalone :3000）。

```bash
# 1) 首次配置 SSH（生成部署密钥并注入目标机）
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_deploy -N "" -C hermes-deploy
ssh-copy-id -i ~/.ssh/id_ed25519_deploy.pub root@YOUR_HOST

# 2) 构建 + 上传 + 重启（一次性）
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
  cp -p ${APP}.bak.$STAMP/.env $APP/.env   # 保留凭证
  pkill -f "node server.js" || true
  sleep 2
  cd $APP/standalone && nohup node server.js > /opt/sectoolbox/logs/app.log 2>&1 &
REMOTE

# 3) 健康探测
curl -sI http://YOUR_HOST:9119/             # 200
curl -s  -X POST http://YOUR_HOST:9119/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"user":"admin","pass":"YOUR_PASSWORD"}' | head -c 200
curl -s  -X POST http://YOUR_HOST:9119/api/exec/dig \
  -H 'content-type: application/json' -d '{"args":{}}'   # {"error":"unauthenticated"}
```

历史脚本版部署在 `scripts/deploy.sh`。

## 🗂️ 目录结构

```
app/
├── layout.tsx              全局布局 + Header + MobileToolbar
├── page.tsx                首页 Hero + 分类 + 热门工具
├── tools/                   工具库 + 工具详情（SSG top-12 + ISR）
├── cheatsheet/              场景速查列表 + 详情（SSG top-10 + ISR）
├── agents/                  安全 AI Agent 生态
├── mcp/                     MCP 服务器 + Agent Skills
├── network/                 网络排查 showcase
├── ip-intel/                IP 聚合（地理 + Shodan InternetDB）
├── about/                   关于页
└── login/                   HMAC cookie 登录
components/                  Header / MobileToolbar / CommandMenu /
                            CodeBlock / ToolRunner / FavoriteButton /
                            ExportMarkdownButton / DetailToc /
                            FavoritesDrawer / ExploreHero / ExploreCard /
                            project-detail / markdown / mermaid / ui
lib/
├── tools.ts                96 个工具元数据（单一数据源）
├── cheatsheets.ts          60 个场景 SOP
├── executors.ts            白名单调试工具 + 参数校验
├── github-projects.ts      44 个 AI 生态项目（GitHub API 校验）
├── agents.ts               13 个安全 AI Agent + 分类
├── theme.ts                明 / 暗 / 跟随系统 + 6 个 accent 预设
├── favorites.ts            localStorage 收藏 store
├── export-md.ts            工具页 → markdown 导出
├── category-colors.ts      分类色板（一处定义，全局复用）
├── labels.ts               i18n 标签（平台 / 难度）
└── rate-limit.ts           per-IP 执行限频（默认 10 次/分钟）
scripts/deploy.sh           旧版一键部署脚本
deploy/
├── README.md               部署详细步骤
├── .env.production         生产环境变量模板
├── sectoolbox.service      加固过的 systemd unit
└── start-server.sh         从 .env 起 node server.js
```

## 🔧 扩展

- **新增工具**：向 `lib/tools.ts` 的 `tools` 数组追加一条；如果它能在浏览器里跑，再在 `lib/executors.ts` 里加一条 `ExecutorSpec`（白名单 + 参数校验，结构上杜绝 shell 注入）。
- **新增场景**：向 `lib/cheatsheets.ts` 的 `cheatsheets` 数组追加一条。
- **新增 AI 项目**：向 `lib/github-projects.ts` 追加一条（kind：`mcp` / `skill` / `agent` / `network`）。
- **新增主题色**：在 `lib/theme.ts` 的 `ACCENT_PRESETS` 加一条，并在 `app/globals.css` 里加对应的 `[data-accent="…"]` 块。
- **新增分类色**：在 `lib/category-colors.ts` 的色板里加一条（单源，全局生效）。

所有页面（首页 / 列表 / 详情 / 搜索 / 收藏 / 主题）都会自动跟上。

## ⚠️ 免责声明

本项目仅供**授权的安全测试、教育与防御研究**使用。所收录的工具与技术可能具有攻击性，请务必在获得明确书面授权的目标上使用。使用者需自行承担合规与法律责任。

## 📄 许可证

[MIT](LICENSE) © 2026 mick978

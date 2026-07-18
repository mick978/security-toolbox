# 网络安全 AI 生态中文介绍

> 所有项目均经过 GitHub API 实时验证（2026-07-18），star 数为验证时点的公开值。
> 线上展示：<https://security-toolbox.vercel.app> · 数据源：`lib/github-projects.ts`
>
> **收录情况**：MCP 服务器 × 12、Agent Skills × 10、安全 AI Agent × 11，合计 33 个真实 GitHub 项目。
>
> **覆盖的安全阶段**：信息收集 / 漏洞扫描 / 漏洞利用 / 防御检测 / 应急响应 / 合规审计 / 通用。

---

## 一、MCP 服务器（12 个）

> 把 nmap、sqlmap、Shodan、AWS API 等"本地/在线工具"封装成 AI 可调用的标准 endpoint。LLM 通过 MCP 拿到工具描述与输入 schema，自动决定何时调用哪个工具、传什么参数。

### HexStrike AI（`hexstrike-ai`）

- **仓库**：[0x4m4/hexstrike-ai](https://github.com/0x4m4/hexstrike-ai)
- **Star**：10,356 ★
- **主语言**：Python · **默认分支**：`master` · **README**：`README.md`
- **领域**：漏洞利用
- **安装命令**：`pip install -r requirements.txt`
- **GitHub 简介**：HexStrike AI MCP Agents is an advanced MCP server that lets AI agents (Claude, GPT, Copilot, etc.) autonomously run 150+ cybersecurity tools for pentesting, bug bounty, and CTF.
- **中文介绍**：把 150+ 渗透测试工具（nmap、nuclei、sqlmap、gobuster 等）封装成 MCP server，让 Claude / GPT / Copilot 等大模型自主跑漏洞扫描、漏洞悬赏、CTF 题目。
- **为什么收录**：star 最高的"安全 MCP server"；把 nmap / nuclei / sqlmap 等上百款攻击工具一次接入 LLM。

---

### Prowler MCP Server（`prowler`）

- **仓库**：[prowler-cloud/prowler](https://github.com/prowler-cloud/prowler)
- **Star**：14,100 ★
- **主语言**：Python · **默认分支**：`master` · **README**：`mcp_server/README.md`
- **领域**：合规审计
- **安装命令**：`docker run --rm -i prowlercloud/prowler-mcp`
- **GitHub 简介**：Prowler is the world's most widely used open-source cloud security platform that automates security and compliance across any cloud environment.
- **中文介绍**：世界上最广泛使用的开源云安全平台。其官方 MCP server（`mcp_server/`，镜像 `prowlercloud/prowler-mcp`）把 AWS / Azure / GCP 的合规与安全检测结果暴露给 AI。
- **为什么收录**：开源云合规领域领头羊；CSPM 行业标杆，官方 MCP 镜像直接可用。

---

### Ghidra MCP（`ghidra-mcp`）

- **仓库**：[bethington/ghidra-mcp](https://github.com/bethington/ghidra-mcp)
- **Star**：2,833 ★
- **主语言**：Java · **默认分支**：`main` · **README**：`README.md`
- **领域**：应急响应
- **安装命令**：`uv run bridge-mcp-ghidra`
- **GitHub 简介**：Ghidra MCP Server — 200+ MCP tools for AI-powered reverse engineering. GUI plugin + headless server, lazy tool loading.
- **中文介绍**：把 NSA 出品的 Ghidra 反编译引擎封装成 MCP，提供 200+ 工具给 AI 做恶意软件 / 固件逆向与 DFIR。GUI 插件 + 无头 server 两种部署形态，支持懒加载。
- **为什么收录**：把 NSA 的 Ghidra 反编译能力接入 LLM，应急响应和恶意软件分析的利器。

---

### Snyk Agent Scan（`snyk-agent-scan`）

- **仓库**：[snyk/agent-scan](https://github.com/snyk/agent-scan)
- **Star**：2,788 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：防御检测
- **安装命令**：`uvx snyk-agent-scan@latest`
- **GitHub 简介**：Security scanner for AI agents, MCP servers and agent skills.
- **中文介绍**：Snyk 官方的 AI 安全扫描工具，专门审计其他 MCP server、AI agent 和 agent skill 中的漏洞与"有毒流（toxic flows）"。
- **为什么收录**：Snyk 官方出品，主动扫描 AI 代理本身的安全性。

---

### CVE MCP Server（`cve-mcp-server`）

- **仓库**：[mukul975/cve-mcp-server](https://github.com/mukul975/cve-mcp-server)
- **Star**：1,086 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：漏洞扫描
- **安装命令**：`claude mcp add cve-mcp -- python -m cve_mcp.server`
- **GitHub 简介**：Production-grade MCP server giving Claude 27 security intelligence tools across 21 APIs — CVE lookup, EPSS scoring, CISA KEV, MITRE ATT&CK, and more.
- **中文介绍**：生产级漏洞情报 MCP server，给 Claude 提供 27 个工具、覆盖 21 个 API（NVD、CISA KEV、EPSS、OSV、VirusTotal、Shodan、MITRE ATT&CK 等）。
- **为什么收录**：把市面上主要的漏洞情报源整合到一个 MCP 接口。

---

### Cisco AI Defense MCP Scanner（`cisco-mcp-scanner`）

- **仓库**：[cisco-ai-defense/mcp-scanner](https://github.com/cisco-ai-defense/mcp-scanner)
- **Star**：987 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：防御检测
- **安装命令**：`uv tool install --python 3.13 cisco-ai-mcp-scanner`
- **GitHub 简介**：Scan MCP servers for potential threats & security findings.
- **中文介绍**：思科 AI Defense 出品的 MCP scanner，用 YARA 规则 + LLM 分析器对 MCP server 做静态和行为审计。
- **为什么收录**：大厂官方出品，专门扫描"其他 MCP 是否安全"，元层面的安全。

---

### Burp Suite MCP Server（`burp-mcp-server`）

- **仓库**：[PortSwigger/mcp-server](https://github.com/PortSwigger/mcp-server)
- **Star**：984 ★
- **主语言**：Kotlin · **默认分支**：`main` · **README**：`README.md`
- **领域**：漏洞扫描
- **安装命令**：见 README（`./gradlew embedProxyJar` 构建 JAR 后加载到 Burp）
- **GitHub 简介**：MCP Server for Burp
- **中文介绍**：PortSwigger 官方 MCP server，把 Burp Suite 的 Web 漏洞扫描器和代理暴露给 AI agent。
- **为什么收录**：官方出品，老牌 Web 安全工具 Burp 套件的官方 AI 接入。

---

### MCP Kali Server（`mcp-kali-server`）

- **仓库**：[Wh0am123/MCP-Kali-Server](https://github.com/Wh0am123/MCP-Kali-Server)
- **Star**：771 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：漏洞利用
- **安装命令**：`pip install -r requirements.txt`
- **GitHub 简介**：MCP configuration to connect AI agent to a Linux machine (Kali Linux penetration-testing tools).
- **中文介绍**：连接 AI agent 到 Kali Linux 的 MCP 配置，让 agent 可以执行 Kali 自带的 nmap、hydra 等渗透测试工具。
- **为什么收录**：让 AI 直接接管整套 Kali 工具链。

---

### SonarQube MCP Server（`sonarqube-mcp-server`）

- **仓库**：[SonarSource/sonarqube-mcp-server](https://github.com/SonarSource/sonarqube-mcp-server)
- **Star**：598 ★
- **主语言**：Java · **默认分支**：`master` · **README**：`README.md`
- **领域**：漏洞扫描
- **安装命令**：`docker run --init --pull=always -i --rm -e SONARQUBE_TOKEN -e SONARQUBE_ORG sonarsource/sonarqube-mcp`
- **GitHub 简介**：Official SonarQube MCP Server for code quality and security in AI agents
- **中文介绍**：SonarSource 官方 MCP server，把 SAST（静态应用安全测试）和安全热点分析暴露给 AI agent。
- **为什么收录**：代码质量巨头 SonarQube 的官方 AI 接入。

---

### Shodan MCP Server（`mcp-shodan`）

- **仓库**：[w0h1v/mcp-shodan](https://github.com/w0h1v/mcp-shodan)
- **Star**：144 ★
- **主语言**：TypeScript · **默认分支**：`main` · **README**：`README.md`
- **领域**：信息收集
- **安装命令**：`npx -y @burtthecoder/mcp-shodan`
- **GitHub 简介**：MCP server for Shodan — search internet-connected devices, IP reconnaissance, DNS lookups, and CVE/CPE vulnerability intelligence.
- **中文介绍**：广受欢迎的 Shodan 侦察 / OSINT MCP。设备搜索、IP 侦察、DNS 查询、CVE/CPE 漏洞情报。仓库所有权由 BurtTheCoder 转给 w0h1v，npm 包名仍是 `@burtthecoder/mcp-shodan`。
- **为什么收录**：互联网上"设备搜索"事实标准的 AI 接入。

---

### VirusTotal MCP Server（`mcp-virustotal`）

- **仓库**：[w0h1v/mcp-virustotal](https://github.com/w0h1v/mcp-virustotal)
- **Star**：138 ★
- **主语言**：TypeScript · **默认分支**：`main` · **README**：`README.md`
- **领域**：信息收集
- **安装命令**：`npx -y @burtthecoder/mcp-virustotal`
- **GitHub 简介**：MCP server for VirusTotal API — analyze URLs, files, IPs, and domains with comprehensive security reports, relationship analysis, and pagination support.
- **中文介绍**：VirusTotal 威胁情报 MCP，对文件 / URL / IP / 域名做信誉分析和关系图谱查询。
- **为什么收录**：威胁情报最常用聚合服务的 AI 接入。

---

### REMnux MCP Server（`remnux-mcp-server`）

- **仓库**：[REMnux/remnux-mcp-server](https://github.com/REMnux/remnux-mcp-server)
- **Star**：104 ★
- **主语言**：TypeScript · **默认分支**：`main` · **README**：`README.md`
- **领域**：应急响应
- **安装命令**：`npx @remnux/mcp-server`
- **GitHub 简介**：MCP server for using the REMnux malware analysis toolkit via AI assistants
- **中文介绍**：把 REMnux（专为恶意软件分析设计的 Linux 发行版）的工具栈通过 MCP 暴露给 AI assistant，支持 Docker 和 SSH 两种运行模式。
- **为什么收录**：恶意软件分析的官方专用系统，DFIR 必备。

---

## 二、Agent Skills · SKILL.md 操作手册（10 个）

> SKILL.md 是 2025–2026 兴起的 Agent 能力复用格式：每个目录里一个 `SKILL.md`（YAML frontmatter + Markdown 正文），告诉 AI 这个技能做什么、需要什么输入、遵循什么规则、分几步执行。

### Anthropic Agent Skills (Official)（`anthropics-skills`）

- **仓库**：[anthropics/skills](https://github.com/anthropics/skills)
- **Star**：161,949 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：通用
- **GitHub 简介**：Public repository for Agent Skills
- **中文介绍**：Anthropic 官方的 Agent Skills 仓库，定义 SKILL.md 格式的规范。
- **为什么收录**："标准定义者"，所有其他 Skill 仓库的参考。

---

### Superpowers（`superpowers`）

- **仓库**：[obra/superpowers](https://github.com/obra/superpowers)
- **Star**：256,335 ★
- **主语言**：Shell · **默认分支**：`main` · **README**：`README.md`
- **领域**：通用
- **GitHub 简介**：An agentic skills framework & software development methodology that works.
- **中文介绍**：Jesse Vincent (obra) 出品的完整 SDLC 方法论（脑暴 → TDD → 调试 → 评审），全部用 SKILL.md 写成。
- **为什么收录**：star 最高的 Agent Skills 框架。

---

### Addy Osmani's Agent Skills（`addyosmani-agent-skills`）

- **仓库**：[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)
- **Star**：78,881 ★
- **主语言**：JavaScript · **默认分支**：`main` · **README**：`README.md`
- **领域**：通用
- **GitHub 简介**：Production-grade engineering skills for AI coding agents.
- **中文介绍**：Google Chrome 工程师 Addy Osmani 出品的工程技能集，覆盖完整 SDLC 生命周期，含 `security-and-hardening` 安全加固有技能。
- **为什么收录**：包含专门的安全加固有技能。

---

### Obsidian Skills（`obsidian-skills`）

- **仓库**：[kepano/obsidian-skills](https://github.com/kepano/obsidian-skills)
- **Star**：42,324 ★
- **主语言**：— · **默认分支**：`main` · **README**：`README.md`
- **领域**：通用
- **GitHub 简介**：Agent skills for Obsidian. Teach your agent to use Obsidian CLI and open formats.
- **中文介绍**：Obsidian CEO Steph Ango (kepano) 出品，教 AI 用 Obsidian CLI 和开放格式（Markdown / Bases / JSON Canvas 等）。
- **为什么收录**：来自 Obsidian CEO 的官方风格 Skills。

---

### wshobson Agents Marketplace（`wshobson-agents`）

- **仓库**：[wshobson/agents](https://github.com/wshobson/agents)
- **Star**：37,980 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：通用
- **GitHub 简介**：Multi-harness agentic plugin marketplace for Claude Code, Codex CLI, Cursor, OpenCode, GitHub Copilot, and Gemini CLI
- **中文介绍**：多平台 agent 插件市场，覆盖 Claude Code / Codex CLI / Cursor / OpenCode / GitHub Copilot / Gemini CLI；共 175 个 Skills 和 203 个 Agent，含安全相关 agent 与事件响应 workflow。
- **为什么收录**：大型多 harness 市场，含安全域内容。

---

### Raptor（`raptor`）

- **仓库**：[gadievron/raptor](https://github.com/gadievron/raptor)
- **Star**：3,340 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：漏洞利用
- **GitHub 简介**：Raptor turns Claude Code into a general-purpose AI offensive/defensive security agent. By using Claude.md and creating rules, sub-agents, and skills, and orchestrating security tool usage, we configure the agent for adversarial thinking, and perform research or attack/defense operations.
- **中文介绍**：把 Claude Code 改造为通用 AI 攻防安全 agent：通过规则、子 agent 和 Skills，编排各种安全工具，做对抗性研究 / 攻击 / 防御操作。
- **为什么收录**：攻防一体的 Skills 集合，含 CodeQL、模糊测试、崩溃分析、OSS 取证等高级主题。

---

### Microsoft Skills（`microsoft-skills`）

- **仓库**：[microsoft/skills](https://github.com/microsoft/skills)
- **Star**：2,758 ★
- **主语言**：TypeScript · **默认分支**：`main` · **README**：`README.md`
- **领域**：通用
- **GitHub 简介**：Skills, MCP servers, Custom Agents, Agents.md for SDKs to ground Coding Agents
- **中文介绍**：微软官方的 Skills 仓库，把 Coding Agent 接地到 Azure SDK（还含一个 `skill-creator` 元技能）。
- **为什么收录**：微软官方，含 skill-creator。

---

### Claude-Red（`claude-red`）

- **仓库**：[SnailSploit/Claude-Red](https://github.com/SnailSploit/Claude-Red)
- **Star**：2,708 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：漏洞利用
- **GitHub 简介**：claude-red is a curated library of offensive security skills designed for the Claude skills system.
- **中文介绍**：精挑细选的进攻性安全 Skills 库，专为 Claude Skills 系统设计，含 58 个技能，覆盖 Web / AD / 无线 / 云 / 移动 / IoT 和漏洞利用开发。
- **为什么收录**："最大"的专门 offensive-security SKILL.md 库。

---

### Claude-OSINT（`claude-osint`）

- **仓库**：[elementalsouls/Claude-OSINT](https://github.com/elementalsouls/Claude-OSINT)
- **Star**：1,949 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：信息收集
- **GitHub 简介**：Two paired Claude skills · 90+ recon modules · 48 secret-regex patterns · 80+ dorks · 9 read-only credential validators · 27 attack-path templates · 5,500+ lines of structured tradecraft. Drop-in SKILL.md files that turn Claude into a god-mode external recon operator for authorized red-team and bug-bounty engagements.
- **中文介绍**：一对 Claude OSINT 技能，90+ 侦察模块、48 个密钥正则、80+ dorks、9 个只读凭据校验、27 个攻击路径模板、5500+ 行结构化战技。是 SKILL.md 文件，让 Claude 在授权的红队和漏洞悬赏场景中变成"上帝模式"的外部侦察员。
- **为什么收录**：专门的 OSINT / 外部侦察技能。

---

### ClawSec（`clawsec`）

- **仓库**：[prompt-security/clawsec](https://github.com/prompt-security/clawsec)
- **Star**：1,066 ★
- **主语言**：JavaScript · **默认分支**：`main` · **README**：`README.md`
- **领域**：防御检测
- **GitHub 简介**：A complete security skill suite for OpenClaw, Hermes, PicoClaw and NanoClaw agents (and variants). Protect your SOUL.md (etc') with drift detection, live security recommendations, automated audits, and skill integrity verification. All from one installable suite.
- **中文介绍**：Prompt Security 出品的完整防御技能套件，覆盖 OpenClaw / Hermes / PicoClaw / NanoClaw 等 agent。提供漂移检测、实时安全建议、自动审计、技能完整性校验。
- **为什么收录**：Prompt Security（一家真实存在的 AI 安全公司）出品的防御套件。

---

## 三、安全 AI Agent · 端到端自动代理（11 个）

> 与 MCP / Skills 这种"给 AI 加工具"不同，Agent 是直接接管任务 —— 你说一句"扫一下这个网段"，它自己决定怎么调工具、怎么做决策、怎么写报告。

### Strix（`strix`）

- **仓库**：[usestrix/strix](https://github.com/usestrix/strix)
- **Star**：42,138 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：漏洞扫描
- **安装命令**：`pipx install strix-agent`
- **GitHub 简介**：Open-source AI penetration testing tool to find and fix your app's vulnerabilities.
- **中文介绍**：开源 AI 渗透测试工具，自动发现并验证应用漏洞，输出可用的 PoC。
- **为什么收录**：star 数最高的开源 AI 渗透工具。

---

### PentestGPT（`pentestgpt`）

- **仓库**：[GreyDGL/PentestGPT](https://github.com/GreyDGL/PentestGPT)
- **Star**：14,296 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：漏洞利用
- **安装命令**：`pip install -e .`
- **GitHub 简介**：Automated Penetration Testing Agentic Framework Powered by Large Language Models
- **中文介绍**：LLM 驱动的自动化渗透测试 agent 框架。
- **为什么收录**：LLM 自主渗透的开山之作，背靠 USENIX Security 学术论文。

---

### CAI (Cybersecurity AI)（`cai`）

- **仓库**：[aliasrobotics/cai](https://github.com/aliasrobotics/cai)
- **Star**：9,471 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：漏洞利用
- **安装命令**：`pip install cai-framework`
- **GitHub 简介**：Cybersecurity AI (CAI), the framework for AI Security
- **中文介绍**：CAI —— AI Security 框架。
- **为什么收录**：Alias Robotics 积极维护，内置大量预构建的攻防 agent；在 CTF 和渗透研究中广泛使用。

---

### garak（`garak`）

- **仓库**：[NVIDIA/garak](https://github.com/NVIDIA/garak)
- **Star**：8,469 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：防御检测
- **安装命令**：`pip install garak`
- **GitHub 简介**：the LLM vulnerability scanner
- **中文介绍**：NVIDIA 出品的 LLM 漏洞扫描器，对 LLM 做越狱、prompt 注入、数据泄露、幻觉等探测。
- **为什么收录**：NVIDIA 官方，行业标准的 LLM 安全扫描工具。

---

### PurpleLlama（`purple-llama`）

- **仓库**：[meta-llama/PurpleLlama](https://github.com/meta-llama/PurpleLlama)
- **Star**：4,292 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：防御检测
- **安装命令**：见 README
- **GitHub 简介**：Set of tools to assess and improve LLM security.
- **中文介绍**：Meta 的伞式项目（包含 CyberSecEval、Llama Guard、Code Shield），用于评估和强化 LLM / AI 系统的安全性。
- **为什么收录**：Meta 官方 LLM 安全工具集。

---

### Vulnhuntr（`vulnhuntr`）

- **仓库**：[protectai/vulnhuntr](https://github.com/protectai/vulnhuntr)
- **Star**：2,704 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：漏洞扫描
- **安装命令**：`pip install vulnhuntr`
- **GitHub 简介**：Zero shot vulnerability discovery using LLMs
- **中文介绍**：用 LLM 做零样本漏洞发现。
- **为什么收录**：Protect AI 的 LLM 静态分析 agent，发现过真实开源 Python 项目的 0-day。

---

### burpgpt（`burpgpt`）

- **仓库**：[aress31/burpgpt](https://github.com/aress31/burpgpt)
- **Star**：2,335 ★
- **主语言**：Java · **默认分支**：`main` · **README**：`README.md`
- **领域**：漏洞扫描
- **安装命令**：加载 JAR 到 Burp Suite (Extender)；见 README
- **GitHub 简介**：A Burp Suite extension that integrates OpenAI's GPT to perform an additional passive scan for discovering highly bespoke vulnerabilities and enables running traffic-based analysis of any type.
- **中文介绍**：集成 OpenAI GPT 的 Burp Suite 扩展，做附加的被动扫描，从实时流量中发现高度定制化的漏洞。
- **为什么收录**：流行 Burp 扩展，给 Burp 加 GPT 扫描能力。

---

### Agentic Security（`agentic-security`）

- **仓库**：[msoedov/agentic_security](https://github.com/msoedov/agentic_security)
- **Star**：1,931 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：防御检测
- **安装命令**：`pip install agentic_security`
- **GitHub 简介**：Agentic LLM Vulnerability Scanner / AI red teaming kit
- **中文介绍**：Agentic LLM 漏洞扫描 / AI 红队套件，含 LLM fuzzing 与越狱探测集，用于加固 LLM 应用。
- **为什么收录**：专门的 LLM fuzzing 与 jailbreak 探测。

---

### hackingBuddyGPT（`hackingbuddygpt`）

- **仓库**：[ipa-lab/hackingBuddyGPT](https://github.com/ipa-lab/hackingBuddyGPT)
- **Star**：1,176 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：漏洞利用
- **安装命令**：见 README
- **GitHub 简介**：Helping Ethical Hackers use LLMs in 50 Lines of Code or less..
- **中文介绍**：TU Wien / ipa-lab 的学术框架，用 50 行以内的代码起步构建 LLM 黑客 agent。
- **为什么收录**：常用于学术 baseline，文档完善。

---

### Nebula（`nebula`）

- **仓库**：[berylliumsec/nebula](https://github.com/berylliumsec/nebula)
- **Star**：1,067 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：信息收集
- **安装命令**：见 README
- **GitHub 简介**：AI-powered penetration testing assistant for automating recon, note-taking, and vulnerability analysis.
- **中文介绍**：AI 驱动的渗透测试助手，自动做侦察、笔记和漏洞分析。
- **为什么收录**：自动化的侦察 + 笔记实用工具。

---

### OpenOSINT（`openosint`）

- **仓库**：[OpenOSINT/OpenOSINT](https://github.com/OpenOSINT/OpenOSINT)
- **Star**：1,026 ★
- **主语言**：Python · **默认分支**：`main` · **README**：`README.md`
- **领域**：信息收集
- **安装命令**：见 README
- **GitHub 简介**：AI-powered OSINT agent with interactive REPL, MCP server, and CLI. 16 tools. Works with Claude, GPT-4, or local models. For authorized security research only.
- **中文介绍**：AI 驱动的 OSINT agent，带交互式 REPL、MCP server 与 CLI；16 个工具；支持 Claude、GPT-4 或本地模型；专门编排 Sherlock / Maigret / Holehe 等侦察工具。
- **为什么收录**：经典的 OSINT agent 编排示例。

---

## 附录：三者关系

```
┌─────────────────────────────────────────────────────────────┐
│                   你的  AI  安全 助手                       │
├─────────────┬─────────────────┬─────────────────────────────┤
│   Skills    │   MCP Servers   │     AI Agent               │
│  （怎么想）   │  （能用什么工具） │   （自己跑任务）            │
├─────────────┼─────────────────┼─────────────────────────────┤
│ SKILL.md    │   工具调用协议    │   端到端自动代理             │
│ 操作手册    │   像 USB 接口   │   像一个实习生             │
│             │                 │                             │
│ • 思考框架  │ • 工具描述      │ • 自主决策                  │
│ • 分步 SOP  │ • 输入 schema   │ • 工具选择                  │
│ • 注意事项  │ • 调用规范      │ • 任务编排                  │
│             │                 │ • 结果汇报                  │
└─────────────┴─────────────────┴─────────────────────────────┘
```

实战组合推荐：
- **全自动渗透**：Strix（agent）+ HexStrike AI / Prowler（mcp）+ Claude-Red / Raptor（skills）
- **漏洞研究**：Vulnhuntr（agent）+ CVE MCP + Shodan MCP
- **LLM 安全审计**：PentestGPT（agent）+ Raptor（skills）+ garak + ClawSec
- **云合规**：Prowler MCP + Microsoft Skills
- **OSINT 调查**：OpenOSINT（agent）+ Claude-OSINT（skills）+ Shodan MCP
- **应急响应**：REMnux MCP + Ghidra MCP

---

*最后更新：2026-07-18 · 由 SecToolbox 自动生成 · 数据源 `lib/github-projects.ts`*

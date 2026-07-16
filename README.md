# SecToolbox · 网络安全排查工具速查

面向 DevOps / SRE / 安全工程师的排查工具速查手册。收录 35 个常用工具、8 大分类、6 个典型排查场景。

## 技术栈

- **Next.js 15** (App Router, RSC)
- **TypeScript** 严格模式
- **Tailwind CSS 3** + 自定义主题（CSS 变量）
- **shadcn/ui** 风格组件（本项目内嵌简版，不依赖 CLI）
- **cmdk** — ⌘K 全局搜索
- **lucide-react** — 图标
- 零后端 · 纯静态 · 一键部署到 Vercel / Cloudflare Pages / Netlify

## 快速开始

```bash
cd security-toolbox
npm install         # 或 pnpm install / bun install
npm run dev         # http://localhost:3000

npm run build       # 构建
npm start           # 本地预览生产版
```

## 目录结构

```
app/
├── layout.tsx              全局布局 + Header + Toaster
├── page.tsx                首页 Hero + 分类 + 热门工具
├── globals.css             Tailwind + 主题变量
├── tools/
│   ├── page.tsx            工具库(带 Suspense)
│   ├── tools-client.tsx    过滤 / 搜索 / 分类切换
│   └── [slug]/page.tsx     工具详情(SSG generateStaticParams)
├── cheatsheet/page.tsx     场景速查
└── not-found.tsx           404
components/
├── header.tsx              导航
├── command-menu.tsx        ⌘K 面板
├── code-block.tsx          可复制的命令块
└── ui/                     按钮 / Card / Badge / Toast / Command
lib/
├── tools.ts                35 个工具的元数据（单一数据源）
├── cheatsheets.ts          6 个场景 SOP
└── utils.ts                cn 辅助
```

## 内容

**分类：**
- DNS 与域名（dig / nslookup / host / whois / dnsx）
- 连通性与路由（ping / traceroute / mtr / tcping）
- 端口与服务（nmap / masscan / naabu / netcat）
- HTTP / TLS（curl / httpie / testssl.sh / openssl）
- 抓包分析（tcpdump / wireshark / tshark / mitmproxy）
- 漏洞扫描（nuclei / nikto / trivy / grype）
- 日志与取证（ripgrep / jq / journalctl / goaccess）
- 一次性在线检查（crt.sh / SecurityHeaders / SSL Labs / IPinfo）

**场景速查：**
1. 域名解析异常
2. HTTPS 证书错误
3. 服务器延迟高
4. 服务端口是否开放
5. Web 站点安全体检
6. 日志异常访问取证

## 特性

- ⌘K / Ctrl+K 全局搜索
- 命令一键复制（带 toast 反馈）
- 平台 / 难度双维度过滤
- URL 状态同步（`?cat=dns` 可直链）
- 工具详情静态生成（SEO 友好）
- 高危工具自动挂"授权提醒"横幅
- 暗色主题 · 移动端自适应

## 部署

Vercel：`vercel deploy`
Cloudflare Pages：build cmd `npm run build`，output `.next`
静态导出（可选）：在 `next.config.mjs` 加 `output: 'export'`

## 扩展新工具

只改 `lib/tools.ts` 的 `tools` 数组，新增一条对象即可。所有页面（首页、工具库、详情、搜索）自动更新。

## License

MIT

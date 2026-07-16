# SecToolbox · 网络安全排查工具速查

[![Live](https://img.shields.io/badge/live-47.109.63.111%3A9119-2ea44f?style=flat-square)](http://47.109.63.111:9119/)
[![Tools](https://img.shields.io/badge/tools-51-blue?style=flat-square)](http://47.109.63.111:9119/tools)
[![Cheatsheets](https://img.shields.io/badge/cheatsheets-42-purple?style=flat-square)](http://47.109.63.111:9119/cheatsheet)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#license)

> 面向 **红队 / 蓝队 / DFIR / DevOps / SRE / 安全工程师** 的一站式排查手册 — 51 个工具、8 大分类、42 个实战场景速查。
> **线上**：http://47.109.63.111:9119/

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

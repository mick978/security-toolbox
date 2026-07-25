# SecToolbox · 周度内容自动刷新设计

**日期**：2026-07-25
**作者**：AO Expert + 协同设计
**状态**：已实施，进入观察期

## 1. 目标

让 `lib/github-projects.ts` 的 44 条项目数据（stars / description / language / topics / defaultBranch）每周自动从 GitHub API 拉取并写回，触发构建+重启，让生产站点的项目数据保持新鲜。

**不**自动入库新项目——新项目发现写到 `scripts/discover-new-projects.md` 作为人工 review 队列。

## 2. 数据流

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  cron.d      │───>│ refresh-     │───>│ refresh-     │
│  weekly      │    │ github-      │    │ weekly.sh    │
│  (Mon 04:07) │    │ projects.mjs │    │              │
└──────────────┘    └──────────────┘    └──────┬───────┘
                            │                  │
                            │ 写回            │ commit + build + restart
                            ▼                  ▼
                    ┌──────────────┐    ┌──────────────┐
                    │ lib/github-  │    │ systemd      │
                    │ projects.ts  │    │ security-    │
                    └──────────────┘    │ toolbox      │
                                        └──────────────┘
```

**辅助流程**（同一 cron 任务）：

```
refresh-github-projects.mjs ──> scripts/discover-new-projects.md (review queue)
```

## 3. 文件改动

| 文件 | 类型 | 说明 |
| --- | --- | --- |
| `scripts/refresh-github-projects.mjs` | 新增 | GitHub API 拉取 + 原地写回 |
| `scripts/discover-new-projects.mjs` | 新增 | GitHub Search 找新候选 → 写 review 队列 |
| `scripts/refresh-weekly.sh` | 新增 | 编排：refresh → commit → build → restart |

部署在 secbox：
- `/usr/local/bin/security-toolbox-refresh`（= `scripts/refresh-weekly.sh`）
- `/etc/cron.d/security-toolbox-weekly`（周 04:07 触发）
- `/etc/security-toolbox/refresh.env`（env，含 `GITHUB_PERSONAL_ACCESS_TOKEN`）
- `/var/log/security-toolbox-refresh.log`

## 4. 行为契约

### 4.1 `refresh-github-projects.mjs`

- 解析 `lib/github-projects.ts` 中的 `{slug, owner, repo}` 三元组（regex）
- 并发 5 路调 `GET https://api.github.com/repos/{owner}/{repo}`
- 每次请求超时 10s；单条失败 → 保留旧值 + 写 `[WARN]` 到 stderr
- 改写：仅覆盖 `stars` / `description` / `language` / `topics` / `defaultBranch`
- **不**触碰：slug / name / area / descriptionCn / whyCn / installCommand / notable / readmePath / kind
- 全部 entry 都没变化时退出 0 且不写文件

### 4.2 `discover-new-projects.mjs`

- 4 条 GitHub Search 查询覆盖 MCP/Agent/Skill/Network 4 个栏目
- 阈值：stars > 200（`DISCOVER_STARS_MIN` 可覆盖）
- 命中后**不**入库，写到 `scripts/discover-new-projects.md` 表格
- 与 `lib/github-projects.ts` 的 slug + owner/repo 去重（避免已知项目再出现）
- 失败非致命（不阻塞 deploy）

### 4.3 `refresh-weekly.sh`

- `source /etc/security-toolbox/refresh.env`
- 跑 refresh；若退出非零 → abort（不 commit、不 build）
- 跑 discovery；失败只写日志
- `git diff --quiet lib/github-projects.ts` 判断是否有变更；无变化 → 直接退出 0
- 有变化：commit（refresh-bot 本地）→ `npm run build` → blue-green 替换 standalone → `systemctl restart` → health check
- **不** `git push`（secbox 无 deploy key；commit 仅供 `git log` 审计）

## 5. 失败处理

| 失败 | 行为 |
| --- | --- |
| 单条 repo 拉取失败 | `[WARN]`，保留旧值，不阻塞 |
| 全部 5xx 配额爆 | refresh exit 1 → 整个 weekly job abort（不 commit、不 build、不 restart） |
| discovery 失败 | 写日志，跳过；不影响 refresh 路径 |
| `npm run build` 失败 | 旧 standalone 不动；service 不重启；写 `tail -40 log` 到日志；exit 1 |
| 部署后健康检查非 200/307 | service 进入 crash loop，运维通过 `journalctl -u security-toolbox` 排查 |
| cron 没跑 | `/var/log/security-toolbox-refresh.log` 没新行；运维查 cron 服务状态 |

## 6. 手工操作

**立即刷新一次**（绕过 cron）：
```bash
ssh secbox
set -a; . /etc/security-toolbox/refresh.env; set +a
/usr/local/bin/security-toolbox-refresh
```

**回滚一次刷新**：
```bash
ssh secbox "cd /opt/security-toolbox/repo && git revert HEAD --no-edit"
# 然后手工 build + deploy
```

**禁用 cron**：
```bash
ssh secbox "mv /etc/cron.d/security-toolbox-weekly /etc/cron.d/security-toolbox-weekly.disabled"
```

## 7. 不在本次范围

- `lib/tools.ts` / `lib/cheatsheets.ts` / `lib/news.ts` 自动更新——这些是手写策展内容，质量敏感
- 新项目自动入库——必须人工 review（`discover-new-projects.md` 队列）
- git push 到 origin——secbox 无凭据；如未来需要，单独配 deploy key
- 周报 / 邮件通知——后续如有需求再加

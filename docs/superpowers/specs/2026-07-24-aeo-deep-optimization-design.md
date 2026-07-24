# SecToolbox · AEO 深度优化设计

**日期**：2026-07-24
**作者**：AO Expert + 协同设计
**状态**：已批准，进入实施

## 1. 目标

让 AI 搜索/推荐引擎（ChatGPT、Perplexity、Claude、Gemini）能以"标题 + 事实 + 问答"形式直接引用 SecToolbox 的内容，重点是新增的 `/news` 资讯栏目。

**成功标准**：
- 18 篇资讯全部可被 Google Rich Results 识别为 `NewsArticle`
- AI 引擎能基于 `description + keyFacts + faq` 直接生成答案片段
- 站点 `llms.txt` 提供给 LLM 的简洁入口
- 现有 `/news` 详情页视觉风格零回归

## 2. 范围

**In**：
- 18 篇 `/news` 资讯：手写 `description / keyFacts / faq`
- `/news` `/tools` `/cheatsheets` 详情页：发对应类型 JSON-LD
- 首页与各目录页：发 `ItemList` JSON-LD
- `metadataBase` + `alternates.canonical` 全站
- sitemap 用真实日期
- `/llms.txt` 极简版（精选 10 篇）
- `/robots.txt` 放行主流 AI 爬虫
- `/news` 静态化（去掉 `force-dynamic`）

**Out**（明确不在本次）：
- 不做 `/llms-full.txt` 全量镜像
- 不做 FAQ 自动从正文抽取
- 不改 HMAC 鉴权与 `/api/exec`
- 不引入 CI
- 不动 i18n
- 不动现有视觉/动效

## 3. 数据模型变更

### NewsItem 新增字段（`lib/news.ts`）

```ts
export interface NewsItem {
  // 现有字段保留
  slug: string;
  title: string;
  date: string;            // ISO 8601
  category: NewsCategory;
  tags: string[];
  excerpt: string;
  body: string;
  cover?: string;
  // ↓ 新增
  description: string;              // 2-3 句，≤220 字符
  keyFacts: string[];               // 3-5 条，每条 ≤30 字符
  faq: { q: string; a: string }[];  // 2-3 个问答
}
```

### 编写规范

- `description`："X 是 Y（类型），它 Z（影响）。"句式，覆盖"是什么/为什么重要"，≤220 字符
- `keyFacts`：名词开头、≤30 字符，优先数字/版本/日期/CVE/影响面
- `faq`：问句要像真人会问的（非元问题）；答案在原文中可被验证
- 三字段必填，迁移期允许临时缺失（见 §6 降级）

## 4. JSON-LD 契约

### 4.1 `NewsArticle`（/news/[slug]）

```jsonc
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "@id": "{SITE_URL}/news/{slug}#article",
  "headline": "{title}",
  "description": "{description}",
  "datePublished": "{date}T00:00:00+08:00",
  "dateModified": "{date}T00:00:00+08:00",
  "inLanguage": "zh-CN",
  "keywords": "{tags.join(', ')}",
  "articleSection": "{category}",
  "author":   { "@type": "Organization", "@id": "{SITE_URL}/#org", "name": "SecToolbox" },
  "publisher":{ "@id": "{SITE_URL}/#org" },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "{SITE_URL}/news/{slug}" },
  "hasPart": [
    {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "{q}", "acceptedAnswer": { "@type": "Answer", "text": "{a}" } }
      ]
    }
  ]
}
```

`hasPart` 仅在 `faq.length > 0` 时输出。

### 4.2 `SoftwareSourceCode`（/tools/[slug]，动态）

字段映射：`name→name`、`description→description`、`category→applicationCategory`、`tags→keywords`、`repo→codeRepository`、`language→programmingLanguage`、`homepage→url`。

### 4.3 `HowTo`（/cheatsheets/[slug]，动态）

`step[]` 来自 `steps[]`，每项 `{ "@type": "HowToStep", "position": i+1, "name": title, "text": body }`。

### 4.4 `ItemList`（首页 + 各目录页）

```jsonc
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    { "@type": "ListItem", "position": i+1, "url": "{SITE_URL}/...", "name": "{title}" }
  ]
}
```

仅前 10 项。

### 4.5 站点级（layout.tsx 增强）

- `Organization.@id = "{SITE_URL}/#org"`
- `WebSite.inLanguage = "zh-CN"`
- 新增 `metadataBase = new URL(SITE_URL)`

## 5. URL 与 metadata

`lib/site.ts` 集中常量：

```ts
const DEFAULT = "https://sectoolbox.xiang.li";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || DEFAULT;
export const canonical = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
```

`SITE_URL` 同时被：
- `layout.tsx` 的 `metadataBase`
- 所有详情页 `alternates.canonical`
- 所有 JSON-LD 引用
- `app/sitemap.ts`
- `app/llms.txt/route.ts`

## 6. 错误处理与降级

| 失败 | 行为 |
| --- | --- |
| news 缺 `description` | meta description 退化到 `excerpt`；页面正常；脚本告警 |
| `keyFacts` < 3 或缺失 | 不渲染 facts 区块，JSON-LD 跳过 `hasPart` |
| `faq = []` | 不渲染 FAQ 区块，JSON-LD 跳过 `hasPart` |
| JSON-LD 构造抛错 | 不输出对应 script，console.warn，不阻塞渲染 |
| `NEXT_PUBLIC_SITE_URL` 未设 | 使用 `DEFAULT` 常量 |
| sitemap 数据缺日期 | 用 `import.meta.url` 的 mtime 或构建时间 |

## 7. /llms.txt

`app/llms.txt/route.ts`，`export const dynamic = "force-static"`，返回纯文本：

```
# SecToolbox
> 网络安全工具与速查手册：113 个工具、63 份速查、22 篇资讯。

## 主要栏目
- [工具目录]({SITE_URL}/tools): ...
- [应急速查]({SITE_URL}/cheatsheets): ...
- [最新资讯]({SITE_URL}/news): ...

## 资讯精选（最新 10 篇）
- [{title}]({SITE_URL}/news/{slug}) — {date}
- ...

## 站点信息
- 作者: SecToolbox Team
- 许可证: CC BY-NC-SA 4.0
- 抓取友好: 全文静态、JSON-LD 完整，欢迎 AI 引擎引用
```

## 8. /robots.txt

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: {SITE_URL}/sitemap.xml
```

## 9. /news 静态化

- `app/news/page.tsx` 删除 `export const dynamic = "force-dynamic"`
- `app/news/[slug]/page.tsx` 同样
- 数据是代码常量，无需 ISR

## 10. sitemap

`app/sitemap.ts` 改用各 item 的真实 `date` 字段，而非 `new Date()`：

```ts
news: newsArticles.map(n => ({
  url: `${SITE_URL}/news/${n.slug}`,
  lastModified: new Date(n.date),
  changeFrequency: "monthly" as const,
  priority: 0.7,
}))
```

`tools` / `cheatsheets` 同样改造（缺日期则用构建期 `new Date()`，但 news 一定有真实日期）。

## 11. 文件改动清单

| 文件 | 类型 | 说明 |
| --- | --- | --- |
| `lib/site.ts` | 新增 | SITE_URL 与 canonical helper |
| `lib/news.ts` | 修改 | NewsItem + 18 条数据补 3 字段 |
| `app/news/[slug]/page.tsx` | 修改 | NewsArticle JSON-LD + facts/faq 渲染 |
| `app/tools/[slug]/page.tsx` | 修改 | SoftwareSourceCode JSON-LD（动态） |
| `app/cheatsheets/[slug]/page.tsx` | 修改 | HowTo JSON-LD（动态） |
| `app/page.tsx` | 修改 | ItemList JSON-LD（首页） |
| `app/news/page.tsx` | 修改 | 删除 `force-dynamic`、加 ItemList |
| `app/tools/page.tsx` | 修改 | ItemList |
| `app/cheatsheets/page.tsx` | 修改 | ItemList |
| `app/mcp/page.tsx` | 修改 | ItemList |
| `app/agents/page.tsx` | 修改 | ItemList |
| `app/network/page.tsx` | 修改 | ItemList |
| `app/layout.tsx` | 修改 | metadataBase + Organization.@id + inLanguage |
| `app/sitemap.ts` | 修改 | 真实日期 |
| `app/llms.txt/route.ts` | 新增 | 静态 llms.txt |
| `public/robots.txt` | 新增 | AI 爬虫放行 |
| `scripts/validate-jsonld.mjs` | 新增 | JSON-LD 校验 |
| `scripts/validate-news-fields.mjs` | 新增 | news 字段完整性校验 |

## 12. 测试与验收

**验收清单**：
- [ ] 18 条 news 全部含 `description`、≥3 条 `keyFacts`、≥1 条 `faq`
- [ ] `/news/{slug}` 详情页 HTML 含 `NewsArticle` JSON-LD，字段正确
- [ ] `/news/{slug}` 含 `<dl>` facts 区块与 `<details>` FAQ 区块
- [ ] `/tools/{slug}` 含 `SoftwareSourceCode` JSON-LD
- [ ] `/cheatsheets/{slug}` 含 `HowTo` JSON-LD
- [ ] 首页与各目录页含 `ItemList` JSON-LD
- [ ] `layout.tsx` 含 `metadataBase`，所有详情页 `alternates.canonical` 正确
- [ ] `/robots.txt` 200 且含 AI 爬虫放行
- [ ] `/llms.txt` 200 且含精选 10 篇
- [ ] `sitemap.xml` 中 `lastModified` 与各 item 真实日期一致
- [ ] `node scripts/validate-jsonld.mjs` 退出码 0
- [ ] `node scripts/validate-news-fields.mjs` 退出码 0
- [ ] `npm run build` 成功

## 13. 风险与回滚

- 单一 `SITE_URL` 常量；改域名只改一处
- `lib/news.ts` 字段加法，向后兼容；未补齐的资讯优雅降级
- 任何修改 `git revert` 即可回滚

## 14. 后续（不在本次）

- CI 接入 + Lighthouse 评分门禁
- `/llms-full.txt` 全量镜像
- FAQ 自动从正文抽取
- i18n（`/zh` `/en` 路由）
- HMAC 升级 HTTPS

import { news, latestNews } from "@/lib/news";
import { tools } from "@/lib/tools";
import { cheatsheets } from "@/lib/cheatsheets";
import { SITE_URL, canonical } from "@/lib/site";

/* /llms.txt — the "site index" for LLM crawlers, per llmstxt.org.
 * Returns a tiny static text file with: H1, blockquote intro, links
 * to the main sections, then the 10 freshest news with their
 * AEO `description` so an LLM can answer "what is SecToolbox
 * currently writing about" without rendering any HTML.
 *
 * `force-static` is the right escape hatch: the file is content-
 * stable (data files only change at build), so we render once and
 * never re-evaluate. */
export const dynamic = "force-static";

function escapeMd(s: string): string {
  return s.replace(/([\\`*_{}\[\]()#+\-.!])/g, "\\$1");
}

function buildBody(): string {
  const lines: string[] = [];
  lines.push("# SecToolbox");
  lines.push("");
  lines.push(
    "> 网络安全工具与速查手册。" +
    `${tools.length} 个工具、${cheatsheets.length} 份速查、${news.length} 篇资讯。` +
    "覆盖 AI / 攻击 / 排查 三大方向，每篇都是可落地的复盘与分析。",
  );
  lines.push("");
  lines.push("## 主要栏目");
  lines.push(`- [工具目录](${canonical("/tools")}): ${tools.length} 个安全工具，按类别组织`);
  lines.push(`- [应急速查](${canonical("/cheatsheet")}): ${cheatsheets.length} 份实操 SOP`);
  lines.push(`- [最新资讯](${canonical("/news")}): ${news.length} 篇 AI / 攻击 / 排查 主题分析`);
  lines.push(`- [MCP / Skills](${canonical("/mcp")}): AI Agent 工具与提示词技能库`);
  lines.push(`- [AI Agent](${canonical("/agents")}): 智能化网络安全 AI Agent 目录`);
  lines.push(`- [网络自动化](${canonical("/network")}): 抓包、可观测性、SRE/AIOps 开源项目`);
  lines.push("");
  lines.push("## 资讯精选（最新 10 篇）");
  for (const n of latestNews(10)) {
    lines.push(`- [${escapeMd(n.title)}](${canonical(`/news/${n.slug}`)}) — ${n.date} — ${n.description}`);
  }
  lines.push("");
  lines.push("## 站点信息");
  lines.push("- 作者: SecToolbox 编辑组");
  lines.push("- 许可证: 内容遵循 MIT · 抓取与引用欢迎");
  lines.push("- 抓取友好: 全文静态、JSON-LD 完整，欢迎 AI 引擎引用与转述");
  lines.push(`- 站点首页: ${SITE_URL}`);
  lines.push("");
  return lines.join("\n");
}

export function GET() {
  return new Response(buildBody(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

// Convert a tool detail page to a self-contained Markdown document so
// users can download / paste it into a wiki, ticket or chat. The output
// mirrors the on-page structure:
//
//   - H1 title
//   - tagline / category / difficulty
//   - description
//   - install commands (```bash``` code fences, one per manager)
//   - examples (h3 + bash code fence + note)
//   - links (docs / homepage)
//
// Code fences use `bash` rather than `shell` for syntax highlighter
// compatibility. The output stays deliberately minimal — no frontmatter —
// so the user can paste it directly into any Markdown surface.

import type { Tool } from "@/lib/tools";

function mdFence(s: string): string {
  // Triple backticks would close the fence prematurely. Switch to tildes
  // if the body contains a sequence of three backticks.
  return /```/.test(s) ? "~~~" : "```";
}

export function toolToMarkdown(tool: Tool): string {
  const lines: string[] = [];
  lines.push(`# ${tool.name}`);
  lines.push("");
  if (tool.tagline) {
    lines.push(`> ${tool.tagline}`);
    lines.push("");
  }
  // Meta line: difficulty + platforms + category. Keep order stable.
  const meta: string[] = [];
  if (tool.category) meta.push(`分类: \`${tool.category}\``);
  meta.push(`难度: \`${tool.difficulty}\``);
  if (tool.platforms?.length) meta.push(`平台: ${tool.platforms.map((p) => `\`${p}\``).join(" ")}`);
  lines.push(meta.join(" · "));
  lines.push("");

  if (tool.description) {
    lines.push(tool.description);
    lines.push("");
  }

  if (tool.install?.length) {
    lines.push("## 安装");
    lines.push("");
    for (const i of tool.install) {
      lines.push(`### ${i.manager}`);
      const fence = mdFence(i.cmd);
      lines.push(`${fence}bash`);
      lines.push(i.cmd);
      lines.push(fence);
      lines.push("");
    }
  }

  if (tool.examples?.length) {
    lines.push("## 用法示例");
    lines.push("");
    for (const [idx, ex] of tool.examples.entries()) {
      lines.push(`### ${idx + 1}. ${ex.label}`);
      if (ex.note) {
        lines.push(`*${ex.note}*`);
      }
      const fence = mdFence(ex.cmd);
      lines.push(`${fence}bash`);
      lines.push(ex.cmd);
      lines.push(fence);
      lines.push("");
    }
  }

  if (tool.docs || tool.homepage) {
    lines.push("## 延伸阅读");
    lines.push("");
    if (tool.homepage) lines.push(`- 项目主页: <${tool.homepage}>`);
    if (tool.docs)     lines.push(`- 官方文档: <${tool.docs}>`);
    lines.push("");
  }

  // Footer — explicit provenance link.
  lines.push("---");
  lines.push(`*自动生成于 SecToolbox · <https://sectoolbox.example/tools/${tool.slug}>*`);

  return lines.join("\n");
}

export function triggerDownload(filename: string, content: string, mime: string = "text/markdown"): void {
  if (typeof window === "undefined") return;
  try {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke after the next microtask so Safari finishes the click.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    /* swallow — download is best-effort */
  }
}

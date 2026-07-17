"use client";

import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandFooter,
} from "@/components/ui/command";
import { tools, categories } from "@/lib/tools";
import { cheatsheets } from "@/lib/cheatsheets";

export interface CommandMenuHandle {
  open: () => void;
}

// 把 lucide 名映射到组件
const IconCache = new Map<string, React.ComponentType<{ className?: string }>>();
function getIcon(name?: string): React.ReactNode {
  if (!name) return <Icons.Terminal className="h-4 w-4" />;
  if (!IconCache.has(name)) {
    const Cmp = (Icons as any)[name] ?? Icons.Terminal;
    IconCache.set(name, Cmp);
  }
  const Cmp = IconCache.get(name)!;
  return <Cmp className="h-4 w-4" />;
}

// 分类 slug → 中文 label (UX: 给用户可读分类)
const CAT_LABEL: Record<string, string> = {
  network: "网络排查", attack: "攻击响应", system: "系统异常",
  cloud: "云安全", k8s: "K8s 集群", mobile: "移动逆向", lateral: "内网横向",
  recon: "信息收集", vulnscan: "漏洞扫描", exploit: "漏洞利用",
  pentest: "渗透后渗透", c2: "C2 / 隧道", reverse: "逆向工程",
  incident: "事件响应", forensics: "取证分析", monitoring: "监控",
  baseline: "基线检查",
  dns: "DNS 域名", connectivity: "连通路由", ports: "端口服务",
  "http-tls": "HTTP/TLS", capture: "抓包分析", logs: "日志取证", online: "在线快检",
};

export const CommandMenu = forwardRef<CommandMenuHandle>(function CommandMenu(_, ref) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));

  // 关弹层时清空 query (UX: state-preservation 友好)
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  // 全局快捷键: ⌘K / Ctrl+K / /
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA";
      // ⌘K / Ctrl+K 即使在 input 里也触发 (主流做法)
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      // / 仅在非 input 里触发 (避免吞字符)
      if (e.key === "/" && !isInput && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  // Enter 跳转当前第一个匹配项 (UX: 减少点击)
  // cmdk 原生已支持, 这里不再覆盖

  return (
    <CommandDialog open={open} onOpenChange={setOpen} query={query}>
      <CommandInput
        autoFocus
        placeholder="搜索工具、命令、案例…"
        onQueryChange={setQuery}
      />
      <CommandList>
        <CommandEmpty />
        {/* 分类 */}
        <CommandGroup heading={`分类 · ${categories.length}`}>
          {categories.map((c) => (
            <CommandItem
              key={c.slug}
              value={`分类 ${c.name} ${c.short} ${c.description}`}
              onSelect={() => {
                setOpen(false);
                router.push(`/tools?cat=${c.slug}`);
              }}
              icon={getIcon(c.icon)}
              description={c.short}
              shortcut="⏎"
              query={query}
            >
              {c.name}
            </CommandItem>
          ))}
        </CommandGroup>
        {/* 工具 */}
        <CommandGroup heading={`工具 · ${tools.length}`}>
          {tools.map((t) => (
            <CommandItem
              key={t.slug}
              value={`${t.name} ${t.tagline} ${t.tags.join(" ")} ${t.description}`}
              onSelect={() => {
                setOpen(false);
                router.push(`/tools/${t.slug}`);
              }}
              icon={getIcon(t.icon || getCatIcon(t.category))}
              description={t.tagline}
              query={query}
            >
              {t.name}
            </CommandItem>
          ))}
        </CommandGroup>
        {/* 案例 */}
        <CommandGroup heading={`排查案例 · ${cheatsheets.length}`}>
          {cheatsheets.map((c) => (
            <CommandItem
              key={c.slug}
              value={`案例 ${c.title} ${c.summary} ${c.tags.join(" ")} ${CAT_LABEL[c.category] ?? ""}`}
              onSelect={() => {
                setOpen(false);
                router.push(`/cheatsheet/${c.slug}`);
              }}
              icon={<Icons.BookOpen className="h-4 w-4" />}
              description={CAT_LABEL[c.category] ?? c.category}
              query={query}
            >
              {c.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      <CommandFooter
        counts={{
          categories: categories.length,
          tools: tools.length,
          cases: cheatsheets.length,
        }}
      />
    </CommandDialog>
  );
});

function getCatIcon(slug: string): string {
  const cat = categories.find((c) => c.slug === slug);
  return cat?.icon ?? "Terminal";
}
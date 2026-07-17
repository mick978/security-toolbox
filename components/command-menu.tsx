"use client";

import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useSyncExternalStore,
  useMemo,
} from "react";
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
import { cn } from "@/lib/utils";

export interface CommandMenuHandle {
  open: () => void;
}

// ============================================================
// 工具函数
// ============================================================

// lucide 名 → 组件
const IconCache = new Map<string, React.ComponentType<{ className?: string }>>();
function getIcon(name?: string): React.ReactNode {
  if (!name) return <Icons.Terminal className="h-3.5 w-3.5" />;
  if (!IconCache.has(name)) {
    const Cmp = (Icons as any)[name] ?? Icons.Terminal;
    IconCache.set(name, Cmp);
  }
  const Cmp = IconCache.get(name)!;
  return <Cmp className="h-3.5 w-3.5" />;
}

// 分类 slug → 中文 label
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

// 多 token fuzzy 高亮 (空格分词,转义正则)
function Highlight({ text, q }: { text: string; q: string }) {
  if (!q || !q.trim()) return <>{text}</>;
  const tokens = q.trim().split(/\s+/).filter(Boolean).map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  if (tokens.length === 0) return <>{text}</>;
  const re = new RegExp(`(${tokens.join("|")})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <mark
            key={i}
            className="rounded bg-yellow-200/70 dark:bg-yellow-500/30 px-0.5 text-foreground font-semibold"
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// ============================================================
// Recent (localStorage)
// ============================================================

const RECENT_KEY = "security-toolbox.cmdk.recent";

function readRecent(): { slug: string; type: "tool" | "cheat" }[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 5);
  } catch {
    return [];
  }
}

function writeRecent(slug: string, type: "tool" | "cheat") {
  if (typeof window === "undefined") return;
  try {
    const arr = readRecent();
    const next = [{ slug, type }, ...arr.filter((x) => x.slug !== slug)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    window.dispatchEvent(new StorageEvent("storage"));
  } catch {}
}

function useRecent() {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined") return () => {};
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    readRecent,
    () => []
  );
}

// ============================================================
// Scope Bar (Vercel 模式)
// ============================================================

type Scope = "all" | "tools" | "cheats" | "cats";
const SCOPES: { id: Scope; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "tools", label: "工具" },
  { id: "cheats", label: "案例" },
  { id: "cats", label: "分类" },
];

// ============================================================
// Component
// ============================================================

export const CommandMenu = forwardRef<CommandMenuHandle>(function CommandMenu(_, ref) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const router = useRouter();
  const recent = useRecent();

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }), []);

  // 关闭时清 query
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  // 全局快捷键: ⌘K / Ctrl+K / /
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement | null)?.isContentEditable;
      // IME 组合输入不拦截
      if (e.isComposing || e.keyCode === 229) return;

      // ⌘K / Ctrl+K 全局生效
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      // / 仅在非 input 中触发
      if (e.key === "/" && !inField && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  // 工具索引: 用 category 反查 icon (兜底)
  const catIconMap = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach((c) => m.set(c.slug, c.icon));
    return m;
  }, []);

  // 跳转 + 记录最近
  const goto = (url: string, slug: string, type: "tool" | "cheat") => {
    writeRecent(slug, type);
    setOpen(false);
    router.push(url);
  };

  // ⌘+Enter / Shift+Enter 在新标签打开
  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const active = document.querySelector('[cmdk-item][data-selected="true"]') as HTMLElement | null;
    if (!active) return;
    const href = active.getAttribute("data-href");
    if (!href) return;
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey || e.shiftKey)) {
      e.preventDefault();
      openInNewTab(href);
    }
  };

  const showTools = scope === "all" || scope === "tools";
  const showCheats = scope === "all" || scope === "cheats";
  const showCats = scope === "all" || scope === "cats";

  return (
    <CommandDialog open={open} onOpenChange={setOpen} query={query}>
      <div onKeyDown={handleKeyDown}>
        <CommandInput
          autoFocus
          placeholder="搜索工具 / 案例 / 分类…"
          onQueryChange={setQuery}
        />

        {/* Scope Bar */}
        <div className="flex items-center gap-1 border-b border-border/60 bg-muted/20 px-2 py-1.5 text-xs">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScope(s.id)}
              aria-pressed={scope === s.id}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                scope === s.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {s.label}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-muted-foreground hidden sm:inline">
            <kbd className="rounded border border-border/60 bg-background px-1 py-0.5 font-mono">⏎</kbd> 打开
            <span className="mx-1">·</span>
            <kbd className="rounded border border-border/60 bg-background px-1 py-0.5 font-mono">⇧⏎</kbd> 新标签
          </span>
        </div>

        <CommandList>
          <CommandEmpty query={query} />

          {/* 最近 */}
          {recent.length > 0 && !query.trim() && (
            <CommandGroup heading="最近使用">
              {recent.map((r) => {
                if (r.type === "tool") {
                  const t = tools.find((x) => x.slug === r.slug);
                  if (!t) return null;
                  return (
                    <CommandItem
                      key={"r-" + r.slug}
                      value={`recent ${t.slug} ${t.name} ${t.tagline}`}
                      onSelect={() => goto(`/tools/${t.slug}`, t.slug, "tool")}
                      icon={
                        <div className="grid h-6 w-6 place-items-center rounded bg-primary/10 text-primary">
                          {getIcon(t.icon || catIconMap.get(t.category))}
                        </div>
                      }
                      shortcut="recent"
                      query={query}
                    >
                      {t.name}
                    </CommandItem>
                  );
                } else {
                  const c = cheatsheets.find((x) => x.slug === r.slug);
                  if (!c) return null;
                  return (
                    <CommandItem
                      key={"r-" + r.slug}
                      value={`recent ${c.slug} ${c.title}`}
                      onSelect={() => goto(`/cheatsheet/${c.slug}`, c.slug, "cheat")}
                      icon={
                        <div className="grid h-6 w-6 place-items-center rounded bg-amber-500/10 text-amber-600">
                          <Icons.BookOpen className="h-3.5 w-3.5" />
                        </div>
                      }
                      shortcut="recent"
                      query={query}
                    >
                      {c.title}
                    </CommandItem>
                  );
                }
              })}
            </CommandGroup>
          )}

          {/* 工具 */}
          {showTools && (
            <CommandGroup heading={`工具 · ${tools.length}`}>
              {tools.map((t) => (
                <CommandItem
                  key={t.slug}
                  value={`tool ${t.name} ${t.tagline} ${t.tags.join(" ")} ${t.description}`}
                  onSelect={() => goto(`/tools/${t.slug}`, t.slug, "tool")}
                  data-href={`/tools/${t.slug}`}
                  icon={
                    <div className="grid h-6 w-6 place-items-center rounded bg-primary/10 text-primary">
                      {getIcon(t.icon || catIconMap.get(t.category))}
                    </div>
                  }
                  description={t.tagline}
                  shortcut="⏎"
                  query={query}
                >
                  {t.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* 案例 */}
          {showCheats && (
            <CommandGroup heading={`排查案例 · ${cheatsheets.length}`}>
              {cheatsheets.map((c) => (
                <CommandItem
                  key={c.slug}
                  value={`cheat ${c.title} ${c.summary} ${c.tags.join(" ")} ${CAT_LABEL[c.category] ?? ""}`}
                  onSelect={() => goto(`/cheatsheet/${c.slug}`, c.slug, "cheat")}
                  data-href={`/cheatsheet/${c.slug}`}
                  icon={
                    <div className="grid h-6 w-6 place-items-center rounded bg-amber-500/10 text-amber-600">
                      <Icons.BookOpen className="h-3.5 w-3.5" />
                    </div>
                  }
                  description={CAT_LABEL[c.category] ?? c.category}
                  shortcut="⏎"
                  query={query}
                >
                  {c.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* 分类 */}
          {showCats && (
            <CommandGroup heading={`分类 · ${categories.length}`}>
              {categories.map((c) => (
                <CommandItem
                  key={c.slug}
                  value={`分类 ${c.name} ${c.short} ${c.description}`}
                  onSelect={() => goto(`/tools?cat=${c.slug}`, c.slug, "tool")}
                  data-href={`/tools?cat=${c.slug}`}
                  icon={
                    <div className="grid h-6 w-6 place-items-center rounded bg-secondary text-muted-foreground">
                      {getIcon(c.icon)}
                    </div>
                  }
                  description={c.short}
                  shortcut="⏎"
                  query={query}
                >
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </div>

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
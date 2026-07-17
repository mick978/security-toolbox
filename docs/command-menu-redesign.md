# security-toolbox 命令面板 · 业界调研 + 最佳实践清单

调研基线:cmdk 仓库 12.8k★ / shadcn registry / Vercel docs 现行 / Next.js docs / GitHub ⌘K 现行 / Arco & TDesign 现行
项目位置:components/command-menu.tsx · components/header.tsx · lib/tools.ts(91) · lib/cheatsheets.ts(53)
现状:shadcn 默认 CommandDialog,平铺三组(分类/工具/案例),无图标、无快捷键提示、无 fuzzy 高亮、无最近(Recent)、无 secondary action、无 footer kbd hint

---

## §1  五个参考产品的截图描述 + 关键设计点

注:无真图,以 UI 快照 + DOM + 官方源码为依据逐条还原视觉。

### A. GitHub ⌘K (2024-2026 现行,自研)
入口:header 中部固定一个胶囊按钮 "Search or jump to…" `/`,点击或按 `/`(本页已聚焦)展开。
弹层:
  容器:固定居中,floating 居中,宽 ≈ 540px,白/深灰面板,bg-card、ring-1、shadow-lg、rounded-xl。
  顶部:单一搜索框,placeholder "Search code, repositories, users, issues, pull requests…",左侧 Magnifier 图标,右侧 "Clear" 按钮(有内容时)。
  本体内:`role="listbox"` Suggestions,每条 option 由图标(SVG 12x12)+ 代码片段 snippet 组成。常见两阶段:
    1. 输入前/空 query:scope 建议:`repo:dip/cmdk Search in this repository`,`org:dip Search in this organization`
    2. 输入后:listbox 各条显示 强匹配字符高亮(mark 黄色背景)。
  底部:左 "Search syntax tips" 帮助链接,无 kbd 提示 chip(因为这是命令面板不是 menu)。
移动端:无快捷键时入口按钮仍可点;输入仍走原键盘,但有右上 Close(Clear);无 app 交互。
性能:不基于 cmdk,自己用 fuse.js + 客户端索引,scope 解析在 tab 切换时增量计算。
视觉关键点:
  • 输入前→已进入 "interview" 状态(scope 提示),不是空列表
  • 每个 option 自带 SVG icon(关键)
  • 全文模糊 + mark 高亮
  • dialog overlay 半透明 50% bg-background/80 + 12px blur

### B. Linear command palette (业界标杆)
入口:任意页面 Cmd+K(`.button` 不常驻,但 IDE 风格 logo 区可绑),Linear 主页有显式 "⌘K" 按钮带 1px 提示。
弹层:居中偏上 ≈ 560px,圆角 12,阴影 lg,深色面板分明。
  顶 input:占位 "Search or jump to…",前缀 magnifier icon。
  立即默认渲染 三段固定结构(Suggested / Recent / Workspace),其中 **Recent 是基于 localStorage key "linear.recent" 维护的最近 5 条**。
  每条 option:左侧 type 图标(Issue = circle、Project = rocket、View = eye)、标题、右侧 ⌘1..⌘9 action shortcut(下拉)。
键盘特性:
  • Tab/Shift+Tab 跨分组切换
  • ↑↓ 跨 item
  • Enter 执行主 action,Cmd+Enter 执行 secondary
  • Cmd+K 关闭
移动端:iOS Linear 用 navigation sheet 上拉触达;此 web 端移动版本直接退化为全屏 modal。
性能:用 `<100ms` React Profiler 标的 response,内部用了 cmdk 的 looseness(filter) + client-side segment index。

### C. Vercel / Next.js docs ⌘K (cmdk 范式标准)
我亲点了 nextjs.org/docs ⌘K,真容逐字:
  顶部 button "Search documentation... ⌘K" + 单 kbd 提示,常驻 header 中。
  Dialog 内 header 区:h2 "Command Menu" + p 文案,无可见 input 顶部表单头(仅 label)。
  Pill 区:左 "App" / "Pages" toggle(Button 形态)、input combobox、右侧 "Esc" button 代替 close。
  内容:空 query 时直接列顶级目录(Introduction、Getting Started、App Router、Architecture、Pages Router、API Reference、Accessibility),每行有 image (Vercel logo style icon) + link。
  输入 "caching" → 17 行结果,每行 image + 标题 + 描述(最多 3 行 truncate)。
  无 explicit group heading,cmdk 隐式排序。
  Esc 按钮显式呈现,而非依赖键盘 — 这是 Vercel 的 a11y 巧思(键盘用户/鼠标用户都懂)。
关键设计点:
  • 没有"分类"标题,全靠语义排序(纯扁平 hit-list)
  • Right-aligned Esc button(Esc escape 是隐性 affordance,这里显化)
  • Tab/All/Pages 是 scope,不是分类
  • icon 自始至终是 image 而非 emoji

### D. Raycast 移植 → web(cmdk raycast preset)
Raycast 原生 macOS,但 cmdk 官方在 website/style/cmdk 下专门写了一套 raycast preset CSS。web 移植要点:
  • 常驻 macOS menubar 概念 → web 用 **floating center + 高度动态 max-h-[60vh]**
  • Raycast 主调:
    - 顶部 input 胶囊一体圆角
    - 1px 的 inner shadow 提示光晕
    - Selected item padding-y=8,圆角 6px,配色 `bg-blue/5 + text-blue`,光在左缘 2px
    - 每条项尾 shortcut 用 kbd `⌘1 .. ⌘9` 灰底
  • **0 transition** 仅 100ms,easing 默认
  • 移动端:Web 端 Raycast Store 没有 mobile;移植到 web 通常是 Capacitor / Tauri;响应式 web fallback 用全屏 modal(从底部上拉 28vh)。

### E. shadcn/ui Command 默认 demo
  • 入口为 button "open command"+ `<Kbd>` "⌘K"
  • 上 Dialog
  • input + lucide Search 图标,h-12
  • list max-h-[300px],item px-2 py-1.5 + `data-[selected='true']:bg-accent`
  • 默认 demo 三组:Settings(4)、Integrations(3)、Suggestions(2)
  • 缺什么:缺图标(只 lucide Search 一个)、缺快捷键、缺 fuzzy mark 高亮、缺 Recent、缺 secondary action、缺 footer hint
  • 这是享总命令面板 100% 当前状态

补充国内三家(Ant / TDesign / Arco / 字节 ByteDance Design):
  • Ant Design Modal 走传统 dialog,无 ⌘K;Ant Design 没有原生 CommandMenu,社区有 ProLayout 的 "PageHeader 的 quick jump" 但不是弹出
  • TDesign Dialog:示例 "Open Modal" + 中部 useDialog Hooks,内部 searchbox 入口 → 弹出结果列表;常用做法是 Dialog 包一个 List+Search;Dialog placement 默认 top,可 center
  • Arco Modal:实测顶部"搜索 ⌘ K"按钮(与 Vercel ⌘K button 高度一致);弹层与 ArcoCommand 实为相同品级,Modal 里塞 Form+List 实现;圆角 8
  • 字节 ArcoDesign/BYTEDesign:常用 dev-side 是 Lark 风格 — input 上方覆盖 sticky 分类 Tab、底部 footer 三键 `Esc ↵ ↑↓`,中栏 hits;命中飞行后右侧直接预览 pane(右滑 280)

---

## §2  通用模式提炼(10 条)

1. **入口是常驻 button,不只是 hover 触发**。GitHub / Next.js / Linear / Arco 都在 header 留一个胶囊,显式 "⌘K" 或 "⌘ /",无键盘用户也能直接点;桌面不悬停,移动端常驻。享总当前命令面板按钮 `header.tsx:49-58` 已有,但只 lg 断点显 kbd — 改成全断点显。

2. **居中 floating modal,non-dismiss-bubble**。bg-background/80 + backdrop-blur-sm,弹出在上方 ≈ 15vh 而非全屏 50vh 占视野;Vercel/Linear/cmdk raycast preset 一致。

3. **输入框右侧显式 Esc 按钮**(Vercel 模式)或右下 footer kbd hint ⌘K 唤起 ⏎ 选择 ↑↓ 切换,Esc 关闭(shadcn 默认)。两种都可,显式 Esc 按钮 a11y 更友好。

4. **分两组先:** ⎡ 顶部常驻 scope 区 ⎤ + ⎣ 中部 hit-list ⎦。scope 是 types tabs(Tools / Cheatsheets / Categories),而 hit-list 每条是 type+title+desc+action。Vercel App/Pages 即 scope。**不要**把所有都铺平只标 heading — heading 在 > 50 items 时才必要,而 < 200 items 用扁平 hit-list 反而更顺。

5. **每条结果 = icon + 标题 + 副标题 + 右侧 accessory**。accessory 通常三选一:category tag / ⌘数字快捷键 / chevron 箭头。shadcn 当前命令面板右侧硬塞一个 category 字符串 → 太噪,改 metadata 走 tag chip。

6. **fuzzy + 命中段 mark 高亮**。这是 cmdk `shouldFilter=false` + 自写 fuse 实现的标准动作。fuse 阈值 0.3,字段:title * 3、tagline * 2、tags * 1,命中区间渲染 `<mark class="bg-yellow-200 dark:bg-yellow-900/40 text-foreground">`。

7. **Recent 优先**。当 query 为空时,第一组是 "最近使用" max 5,localStorage 维护 key `security-toolbox.recent`,每次 onSelect push,maxLen 5,FIFO 淘汰。Linear 体验最明显。

8. **移动端 = bottom sheet 上拉 80vh,原生 input 自动获得焦点**。而非撑开全屏;关键 path:`max-md:inset-x-2 max-md:bottom-2 max-md:top-auto max-md:h-[80vh] max-md:rounded-2xl`。Esc/Pin 取消,触屏 swipe-down 关闭(可加 react-spring)。

9. **键盘 ⎡ ⎤**:Tab/Shift+Tab 跨分组,↑↓ 在组内;Enter 触发主 action,Cmd+Enter 触发 secondary action(收藏/复制命令),Shift+Enter 触发 tertiary(在新 tab 打开)。这是 Linear / Raycast 共有。

10. **二段 debounce + 异步 fetch**。query.length === 0 直接用本地缓存(全部);query.length > 0 走本地 fuzzy;若命中 < 3,150ms debounce 触发 `/api/search?q=...` 拉服务端 Algolia DocSearch 风格结果。`Command.Loading` (cmdk 1.1+) 用 `progress` 渲染。

附带性能:
  • 91 + 53 = 144 条<cmdk 默认 2000-3000 上限,不需虚拟化
  • 但 `<Command.List>` 必须 `max-h-[60vh] overflow-y-auto`
  • `transition: height 100ms ease` 接 cmdk 内置 `--cmdk-list-height`
  • `shouldFilter=true`(默认)已够用,不必自定义

---

## §3  Next.js + cmdk 最佳实践清单(可直接据之重写 command-menu.tsx)

### 3.1 入口修复(header.tsx)
  - [ ] button 全断点显 "搜索" + 全断点显 `<Kbd>⌘K</Kbd>`,不再 `hidden lg:inline`(当前 header.tsx:57 还在 lg)
  - [ ] aria-keyshortcuts="Meta+K Control+K"
  - [ ] 焦点态 `focus-visible:ring-2 focus-visible:ring-ring`

### 3.2 Dialog 容器
  - 保持 Radix Dialog;Container 用 `sm:max-w-[640px] max-md:inset-x-2 max-md:bottom-2 max-md:top-auto max-md:max-w-none max-md:h-[80vh]`,`shadow-2xl rounded-xl`
  - overlay `bg-black/40 backdrop-blur-[2px]`
  - 动画: `data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95`

### 3.3 Input 区(三段)
```tsx
<Command className="rounded-xl border bg-popover text-popover-foreground shadow-md">
  <div className="flex items-center border-b px-3" cmdk-input-wrapper>
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      autoFocus
      placeholder="搜索 91 个工具 / 53 个排查案例 / ESC 关闭"
      value={query}
      onValueChange={setQuery}
      className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
    />
    <button
      type="button"
      onClick={() => setOpen(false)}
      className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-accent"
      aria-label="Close"
    >esc</button>
  </div>

  {/* scope tabs */}
  <ScopeBar />  {/* All / Tools / Cheatsheets / Categories → 切 mutate query prefix */}
</Command>
```

### 3.4 Scope bar(Vercel 范式)
```tsx
function ScopeBar({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const opts = [
    { id: 'all', label: '全部', kb: 'All' },
    { id: 'tools', label: '工具', kb: 'T' },
    { id: 'cheats', label: '案例', kb: 'C' },
    { id: 'cats', label: '分类', kb: 'G' },
  ] as const;
  return (
    <div role="tablist" className="flex items-center gap-1 border-b px-2 py-2 text-xs">
      {opts.map(o => (
        <button
          key={o.id}
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id === 'all' ? '' : o.id + ' ')}
          className={cn(
            'rounded-full px-3 py-1 transition-colors',
            value === o.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent',
          )}
        >
          {o.label}
        </button>
      ))}
      <span className="ml-auto text-[10px] text-muted-foreground">⏎ 打开 · ⇧⏎ 新标签</span>
    </div>
  );
}
```

### 3.5 Recent 组(localStorage 持久化)
```tsx
const RECENT_KEY = 'security-toolbox.cmdk.recent';
function useRecent() {
  return useSyncExternalStore(
    cb => { window.addEventListener('storage', cb); return () => window.removeEventListener('storage', cb); },
    () => {
      try { return (JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') as string[]).slice(0, 5); }
      catch { return []; }
    },
  );
}
function pushRecent(slug: string) {
  try {
    const arr = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') as string[];
    const next = [slug, ...arr.filter(s => s !== slug)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    window.dispatchEvent(new StorageEvent('storage'));
  } catch { /* quota */ }
}
```

### 3.6 fuzzy + mark 高亮
cmdk 自带 filter,但不做 mark 高亮 — 自己渲染就够:
```tsx
function Highlight({ text, q }: { text: string; q: string }) {
  if (!q.trim()) return <>{text}</>;
  const tokens = q.trim().split(/\s+/).filter(Boolean).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${tokens.join('|')})`, 'gi');
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? <mark key={i} className="rounded bg-yellow-200/60 px-0.5 text-foreground dark:bg-yellow-500/30">{p}</mark> : <span key={i}>{p}</span>,
      )}
    </>
  );
}
```

### 3.7 单条结果(icon + title + desc + accessory)
```tsx
<CommandItem
  value={`${tool.slug} ${tool.name} ${tool.tagline} ${tool.tags.join(' ')}`}
  onSelect={() => { pushRecent(tool.slug); setOpen(false); router.push(`/tools/${tool.slug}`); }}
  className="group flex items-start gap-3 px-3 py-2.5 rounded-md data-[selected=true]:bg-accent"
>
  <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
    <Wrench className="h-3.5 w-3.5" />
  </div>
  <div className="min-w-0 flex-1">
    <div className="flex items-center gap-2">
      <Highlight text={tool.name} q={query} />
      <span className="rounded bg-secondary px-1.5 py-0 text-[10px] uppercase text-muted-foreground">{tool.category}</span>
    </div>
    <p className="truncate text-xs text-muted-foreground"><Highlight text={tool.tagline} q={query} /></p>
  </div>
  <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground group-data-[selected=true]:inline">↵</kbd>
</CommandItem>
```

### 3.8 键盘快捷键完整化
```tsx
<Command onKeyDown={(e) => {
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    const url = (selectedItem() as any)?.href;
    if (url) window.open(url, '_blank');
  }
  // Cmd+1..9 触发右侧 accessory
  if ((e.metaKey || e.ctrlKey) && /^[1-9]$/.test(e.key)) {
    e.preventDefault();
    runPinned(parseInt(e.key, 10));
  }
}}>
```
所有 `<Cmd+n>` 命中前展示 accessory 提示(Linear 模式)。

### 3.9 空状态 / Loading / Empty hint
```tsx
<CommandList className="max-h-[60vh] overflow-y-auto" style={{ height: 'var(--cmdk-list-height)' }}>
  <Command.Empty className="px-4 py-10 text-center text-sm text-muted-foreground">
    <p>没有匹配 "{query}"</p>
    <button onClick={() => navigator.clipboard.writeText(query)} className="mt-2 text-xs text-primary hover:underline">
      复制查询 →
    </button>
  </Command.Empty>
  {/* recent 空时隐藏整组 */}
  {recent.length > 0 && <CommandGroup heading="最近使用">...</CommandGroup>}
  <CommandGroup heading="工具">...</CommandGroup>
  <CommandGroup heading="排查案例">...</CommandGroup>
</CommandList>
```

### 3.10 Footer kbd 条(Next.js-style)
```tsx
<div className="flex items-center justify-between border-t px-3 py-2 text-[10px] text-muted-foreground">
  <div className="flex items-center gap-2">
    <Kbd>↑</Kbd><Kbd>↓</Kbd><span>切换</span>
    <Kbd>⏎</Kbd><span>打开</span>
    <Kbd>⇧</Kbd><Kbd>⏎</Kbd><span>新标签</span>
  </div>
  <div className="flex items-center gap-2">
    <span>由 cmdk 驱动</span>
    <Kbd>esc</Kbd>
  </div>
</div>
```

### 3.11 性能 / 可访问性
  - [ ] `autoFocus` input,dialog 打开即聚焦
  - [ ] `loop`(cmdk)循环跨越顶端/底端
  - [ ] `<Command.Loading>` 当远程搜索异步
  - [ ] `<Command.Separator alwaysRender />` 在 fixed Recent / Tools 之间
  - [ ] `prefers-reduced-motion` 时禁掉 zoom/fade animation
  - [ ] 144 条 < 3000,无需 `shouldFilter=false` + 虚拟化;但当 > 500 时切 `react-virtuoso`
  - [ ] `Intl.Segmenter` 切 zh/CJK 分词,key 一致
  - [ ] `navigator.userAgent` 测移动 → max-md 切 bottom-sheet 样式
  - [ ] SSR 关闭 `open={false}` 状态,避免 hydration mismatch

### 3.12 移动端关键路径
  - [ ] max-md:<DialogContent>` className="inset-x-2 bottom-2 top-auto max-w-none h-[80vh] rounded-2xl translate-y-full data-[state=open]:translate-y-0"
  - [ ] 移除 `<ScopeBar>` tab视觉,scope 改成 modal 顶 chip
  - [ ] `<CommandList>` 自动 scroll-into-view with scroll-padding 8px(防键盘遮挡)

### 3.13 Ant/TDesign/Arco 启发
  - TDesign Dialog 的 placement=top 是良好默认,横向居中,floating top=15vh
  - ArcoModal 类名 `rounded` 比 8 改 12 更现代
  - 国内用户字号 base 14→15,行高 22;字号 ≥ 15 优于 14

---

## §4 给你直接复制的最小骨架(整合以上)

```tsx
// components/command-menu.tsx
"use client";
import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { Search, Wrench, BookOpen, Tag, Star, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { tools, categories } from "@/lib/tools";
import { cheatsheets } from "@/lib/cheatsheets";
import { cn } from "@/lib/utils";

const RECENT_KEY = "security-toolbox.cmdk.recent";
const readRecent = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 5); } catch { return []; } };
const writeRecent = (slug: string) => {
  try {
    const arr = readRecent();
    localStorage.setItem(RECENT_KEY, JSON.stringify([slug, ...arr.filter(s => s !== slug)].slice(0, 5)));
    window.dispatchEvent(new StorageEvent("storage"));
  } catch {}
};
const useRecent = () => useSyncExternalStore(
  cb => { window.addEventListener("storage", cb); return () => window.removeEventListener("storage", cb); },
  readRecent,
  () => [],
);

const Highlight = ({ text, q }: { text: string; q: string }) => {
  if (!q.trim()) return <>{text}</>;
  const toks = q.trim().split(/\s+/).filter(Boolean).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${toks.join("|")})`, "gi");
  const out = text.split(re);
  return <>{out.map((p, i) => i % 2 ? <mark key={i} className="rounded bg-yellow-200/70 dark:bg-yellow-500/30 px-0.5 text-foreground">{p}</mark> : <span key={i}>{p}</span>)}</>;
};

const iconForType = (t: "tool" | "cheat" | "cat") =>
  t === "tool" ? <Wrench className="h-3.5 w-3.5" /> : t === "cheat" ? <BookOpen className="h-3.5 w-3.5" /> : <Tag className="h-3.5 w-3.5" />;

export const CommandMenu = forwardRef<{ open: () => void }>(function CommandMenu(_, ref) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "tools" | "cheats" | "cats">("all");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const recent = useRecent();
  useImperativeHandle(ref, () => ({ open: () => setOpen(true) }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if (inField) return;
      if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setOpen(v => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // remote → debounce
  useEffect(() => {
    if (!query.trim()) { setLoading(false); return; }
    const h = setTimeout(() => setLoading(true), 250);
    return () => { clearTimeout(h); setLoading(false); };
  }, [query]);

  const goto = (slug: string, url: string) => { writeRecent(slug); setOpen(false); router.push(url); };

  const showTools = scope === "all" || scope === "tools";
  const showCheats = scope === "all" || scope === "cheats";
  const showCats = scope === "all" || scope === "cats";
  const filteredTools = useCommandState(s => s.search);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        aria-label="命令面板"
        className={cn(
          "p-0 gap-0 max-w-[640px] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl",
          "max-md:inset-x-2 max-md:bottom-2 max-md:top-auto max-md:translate-y-0",
          "max-md:h-[80vh] max-md:rounded-2xl",
        )}
      >
        <DialogTitle className="sr-only">命令面板</DialogTitle>
        <DialogDescription className="sr-only">搜索工具、排查案例、分类。</DialogDescription>

        <CommandPrimitive loop className="flex flex-col">
          {/* Input row */}
          <div className="flex items-center gap-2 border-b px-3" cmdk-input-wrapper>
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <CommandPrimitive.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="搜索工具、命令、案例…"
              className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => setOpen(false)}
              className="rounded border bg-muted px-1.5 text-[10px] text-muted-foreground hover:bg-accent"
              aria-label="Close command menu"
            >esc</button>
          </div>

          {/* Scope */}
          <div className="flex items-center gap-1 border-b px-2 py-1.5 text-xs">
            {(["all", "tools", "cheats", "cats"] as const).map(s => (
              <button
                key={s}
                onClick={() => setScope(s)}
                aria-pressed={scope === s}
                className={cn("rounded-full px-2.5 py-0.5", scope === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}
              >
                {s === "all" ? "全部" : s === "tools" ? "工具" : s === "cheats" ? "案例" : "分类"}
              </button>
            ))}
            <span className="ml-auto text-[10px] text-muted-foreground">⏎ 打开 · ⇧⏎ 新标签 · ⌘1..9 收藏</span>
          </div>

          {/* List */}
          <CommandPrimitive.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden" style={{ height: "var(--cmdk-list-height)" }}>
            <CommandPrimitive.Empty className="px-4 py-12 text-center text-sm text-muted-foreground">
              <p>没有匹配 "{query}"</p>
              <button onClick={() => navigator.clipboard.writeText(query)} className="mt-2 text-xs text-primary hover:underline">复制查询 →</button>
            </CommandPrimitive.Empty>

            {recent.length > 0 && !query && (
              <CommandPrimitive.Group heading="最近使用" className="px-1 py-1">
                {recent.map((slug: string) => {
                  const t = tools.find(x => x.slug === slug) || cheatsheets.find(x => x.slug === slug);
                  if (!t) return null;
                  const isTool = "name" in t;
                  return (
                    <CommandPrimitive.Item
                      key={"r-" + slug}
                      value={`recent ${t.slug}`}
                      onSelect={() => goto(t.slug, isTool ? `/tools/${t.slug}` : `/cheatsheet/${t.slug}`)}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-accent"
                    >
                      <Star className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">{isTool ? (t as any).name : (t as any).title}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">recent</span>
                    </CommandPrimitive.Item>
                  );
                })}
              </CommandPrimitive.Group>
            )}

            {loading && (
              <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                搜索在线…
              </div>
            )}

            {showTools && (
              <CommandPrimitive.Group heading={`工具 · ${tools.length}`} className="px-1 py-1">
                {tools.map(tool => (
                  <CommandPrimitive.Item
                    key={tool.slug}
                    value={`tool ${tool.name} ${tool.tagline} ${tool.tags.join(" ")}`}
                    onSelect={() => goto(tool.slug, `/tools/${tool.slug}`)}
                    className="group flex items-start gap-3 rounded-md px-3 py-2.5 text-sm aria-selected:bg-accent"
                  >
                    <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                      {iconForType("tool")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary">
                          <Highlight text={tool.name} q={query} />
                        </span>
                        <span className="rounded bg-secondary px-1.5 text-[10px] uppercase text-muted-foreground">{tool.category}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        <Highlight text={tool.tagline} q={query} />
                      </p>
                    </div>
                    <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground group-aria-selected:inline">↵</kbd>
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            )}

            {showCheats && (
              <CommandPrimitive.Group heading={`排查案例 · ${cheatsheets.length}`} className="px-1 py-1">
                {cheatsheets.map(c => (
                  <CommandPrimitive.Item
                    key={c.slug}
                    value={`cheat ${c.title} ${c.summary} ${c.tags.join(" ")}`}
                    onSelect={() => goto(c.slug, `/cheatsheet/${c.slug}`)}
                    className="group flex items-start gap-3 rounded-md px-3 py-2.5 text-sm aria-selected:bg-accent"
                  >
                    <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-amber-500/10 text-amber-600">
                      {iconForType("cheat")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Highlight text={c.title} q={query} />
                        <span className="rounded bg-secondary px-1.5 text-[10px] uppercase text-muted-foreground">{c.category}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        <Highlight text={c.summary} q={query} />
                      </p>
                    </div>
                    <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground group-aria-selected:inline">↵</kbd>
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            )}

            {showCats && (
              <CommandPrimitive.Group heading="分类" className="px-1 py-1">
                {categories.map(c => (
                  <CommandPrimitive.Item
                    key={c.slug}
                    value={`分类 ${c.name} ${c.short}`}
                    onSelect={() => goto(c.slug, `/tools?cat=${c.slug}`)}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-accent"
                  >
                    <div className="grid h-7 w-7 place-items-center rounded-md bg-secondary text-muted-foreground">
                      {iconForType("cat")}
                    </div>
                    <span><Highlight text={c.name} q={query} /></span>
                    <span className="ml-auto text-xs text-muted-foreground">{c.short}</span>
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            )}
          </CommandPrimitive.List>

          {/* Footer kbd bar */}
          <div className="flex items-center justify-between border-t px-3 py-1.5 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span><kbd className="rounded border bg-muted px-1">↑</kbd><kbd className="rounded border bg-muted px-1 ml-0.5">↓</kbd> 切换</span>
              <span><kbd className="rounded border bg-muted px-1">↵</kbd> 打开</span>
              <span><kbd className="rounded border bg-muted px-1">⇧</kbd>+<kbd className="rounded border bg-muted px-1">↵</kbd> 新标签</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{tools.length + cheatsheets.length} 条</span>
              <kbd className="rounded border bg-muted px-1">esc</kbd>
            </div>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
});
```

---

## §5 改造 checklist(ship 顺序)

 1. [ ] header.tsx:Kbd 全断点显 + `aria-keyshortcuts`
 2. [ ] command-menu.tsx:替换为上方 §4 骨架
 3. [ ] 添加 `useRecent` + writeRecent
 4. [ ] 添加 Highlight 组件,工具/案例都接上
 5. [ ] 添加 Scope Bar
 6. [ ] 添加 Footer kbd bar
 7. [ ] 添加 Cmd+1..9 收藏逻辑(可选 v1.1)
 8. [ ] 移动端 bottom-sheet 样式断点
 9. [ ] Trigger cmd / ⌘K 检测 inField 不拦截(已存在,但 LibreOffice IME 输入时仍可能被吞,加 `e.isComposing`)
 10. [ ] Lighthouse a11y pass + locale zh-CN


"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search, X, CornerDownLeft, ArrowUp, ArrowDown, Hash, Box, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// 高亮匹配字符 (UX rule: feedback clarity)
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-primary/20 text-primary font-semibold rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

// 大尺寸对话框: top 20vh, max-w-2xl (Linear / Raycast 标准)
export function CommandDialog({
  open,
  onOpenChange,
  children,
  query = "",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
  query?: string;
}) {
  // ESC 关闭 (a11y: escape-routes)
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // body 滚动锁 (mobile UX: 防止背景滚动)
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[12vh] sm:pt-[15vh] px-4 animate-in fade-in-0"
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-border/50 bg-popover text-popover-foreground shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-4"
        onClick={(e) => e.stopPropagation()}
      >
        <CommandPrimitive
          loop
          // group heading 字号 + 字重 (UX: hierarchy)
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/70"
        >
          {children}
        </CommandPrimitive>
      </div>
    </div>
  );
}

export const Command = CommandPrimitive;

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & { onQueryChange?: (v: string) => void }
>(({ className, onQueryChange, ...props }, ref) => (
  <div className="flex items-center border-b border-border/60 px-4 h-14">
    <Search className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
    <CommandPrimitive.Input
      ref={ref}
      onValueChange={onQueryChange}
      className={cn(
        "flex h-12 w-full rounded-md bg-transparent text-base outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
    {/* close kbd - 右上角 */}
    <kbd className="ml-2 hidden sm:inline-flex items-center gap-1 rounded border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
      ESC
    </kbd>
  </div>
));
CommandInput.displayName = "CommandInput";

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    // max-h 控制 + 滚动条样式
    className={cn("max-h-[60vh] overflow-y-auto overflow-x-hidden p-2", className)}
    {...props}
  />
));
CommandList.displayName = "CommandList";

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <div className="py-12 text-center text-sm text-muted-foreground" ref={ref as any}>
    <Search className="mx-auto h-8 w-8 mb-2 opacity-30" />
    <div>无匹配结果</div>
    <div className="mt-1 text-xs text-muted-foreground/60">试试换个关键词,或直接浏览分类</div>
  </div>
));
CommandEmpty.displayName = "CommandEmpty";

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:select-none",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = "CommandGroup";

// 增强版 Item: 图标 + 标题 + 描述 + 右键快捷提示
export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
    icon?: React.ReactNode;
    shortcut?: string;
    description?: string;
    query?: string;
  }
>(({ className, icon, shortcut, description, query, children, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      // 圆角、内边距、悬停态 (UX: state-clarity)
      "relative flex cursor-pointer select-none items-center gap-3 rounded-md px-2.5 py-2 text-sm outline-none transition-colors",
      "data-[selected=true]:bg-primary/10 data-[selected=true]:text-accent-foreground data-[selected=true]:aria-selected:bg-primary/10",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      className
    )}
    {...props}
  >
    {icon && <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">{icon}</span>}
    <span className="flex-1 truncate font-medium">
      {typeof children === "string" && query ? <Highlight text={children} query={query} /> : children}
    </span>
    {description && (
      <span className="hidden md:inline text-xs text-muted-foreground/70 truncate max-w-[200px]">{description}</span>
    )}
    {shortcut && (
      <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
        {shortcut}
      </kbd>
    )}
  </CommandPrimitive.Item>
));
CommandItem.displayName = "CommandItem";

// 底部快捷键提示条 (UX: keyboard-shortcuts)
export function CommandFooter({ counts }: { counts?: { categories: number; tools: number; cases: number } }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-border/60 bg-background px-1 py-0.5 font-mono">
            <ArrowUp className="h-2.5 w-2.5 inline" />
          </kbd>
          <kbd className="rounded border border-border/60 bg-background px-1 py-0.5 font-mono">
            <ArrowDown className="h-2.5 w-2.5 inline" />
          </kbd>
          切换
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-border/60 bg-background px-1 py-0.5 font-mono">
            <CornerDownLeft className="h-2.5 w-2.5 inline" />
          </kbd>
          打开
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-border/60 bg-background px-1 py-0.5 font-mono">esc</kbd>
          关闭
        </span>
      </div>
      {counts && (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Box className="h-3 w-3" /> {counts.tools}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> {counts.cases}
          </span>
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" /> {counts.categories}
          </span>
        </div>
      )}
    </div>
  );
}

// 兼容 shadcn 老用法
export const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
);
CommandShortcut.displayName = "CommandShortcut";
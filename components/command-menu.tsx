"use client";

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandDialog } from "@/components/ui/command";
import { tools, categories } from "@/lib/tools";
import { cheatsheets } from "@/lib/cheatsheets";

export interface CommandMenuHandle {
  open: () => void;
}

export const CommandMenu = forwardRef<CommandMenuHandle>(function CommandMenu(_, ref) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // 焦点在输入框时不拦截 / / k
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="搜索工具、命令、场景…" />
        <CommandList>
          <CommandEmpty>无匹配结果</CommandEmpty>
          <CommandGroup heading="分类">
            {categories.map((c) => (
              <CommandItem
                key={c.slug}
                value={`分类 ${c.name} ${c.short}`}
                onSelect={() => {
                  setOpen(false);
                  router.push(`/tools?cat=${c.slug}`);
                }}
              >
                <span className="text-muted-foreground mr-2">分类</span>
                {c.name}
                <span className="text-xs text-muted-foreground ml-auto">{c.short}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="工具">
            {tools.map((t) => (
              <CommandItem
                key={t.slug}
                value={`${t.name} ${t.tagline} ${t.tags.join(" ")}`}
                onSelect={() => {
                  setOpen(false);
                  router.push(`/tools/${t.slug}`);
                }}
              >
                <span className="font-mono text-xs text-primary mr-2">{t.name}</span>
                <span className="text-muted-foreground text-xs">{t.tagline}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="排查案例">
            {cheatsheets.map((c) => (
              <CommandItem
                key={c.slug}
                value={`案例 ${c.title} ${c.summary} ${c.tags.join(" ")}`}
                onSelect={() => {
                  setOpen(false);
                  router.push(`/cheatsheet/${c.slug}`);
                }}
              >
                <span className="text-muted-foreground mr-2 text-xs">案例</span>
                {c.title}
                <span className="text-xs text-muted-foreground ml-auto">{c.category}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
});
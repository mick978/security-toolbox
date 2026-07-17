"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Search, BookOpenText, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandMenu } from "@/components/command-menu";

const nav = [
  { href: "/", label: "首页", icon: Home },
  { href: "/tools", label: "工具库", icon: Search },
  { href: "/cheatsheet", label: "排查案例", icon: BookOpenText },
];

export function Header() {
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5 text-primary" />
            <span>SecToolbox</span>
            <span className="hidden md:inline text-xs text-muted-foreground ml-2 font-normal">
              网络安全排查手册
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{n.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="ml-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border/60 bg-secondary/40 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="打开搜索"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden md:inline">搜索</span>
              <kbd className="inline-flex rounded bg-background border border-border/60 px-1 py-0.5 text-[10px] font-mono">⌘K</kbd>
            </button>
          </nav>
        </div>
      </header>
      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />
    </>
  );
}

"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export function CodeBlock({ cmd, className }: { cmd: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      toast("已复制到剪贴板");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast("复制失败，请手动选中");
    }
  };
  return (
    <div className={cn("group relative rounded-md border border-border/60 bg-secondary/40 dark:bg-black/60", className)}>
      <pre className="overflow-x-auto p-3 pr-12 text-xs font-mono text-foreground">
        <code>{cmd}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-border/60 bg-secondary/60 px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="复制"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

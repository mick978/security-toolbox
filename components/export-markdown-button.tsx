"use client";
// Export as Markdown button.
//
// Detail pages hand in a `filename` + pre-rendered `content`. Clicking
// the button uses a Blob URL to trigger a download. The button briefly
// shows a "done" state so users get visual confirmation the file landed.

import { useState } from "react";
import { Download, Check } from "lucide-react";
import { triggerDownload } from "@/lib/export-md";
import { cn } from "@/lib/utils";

interface Props {
  filename: string;
  content: string;
  /** Optional label override; defaults to the i18n "导出 Markdown" key. */
  label?: string;
  className?: string;
}

export function ExportMarkdownButton({ filename, content, label, className }: Props) {
  const [done, setDone] = useState(false);
  const onClick = () => {
    triggerDownload(filename, content);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };
  const Icon = done ? Check : Download;
  // Inlined labels (app is single-locale; next-intl was a phantom dep with
  // no provider and threw at runtime). Callers can still override the
  // visible label via the `label` prop.
  const visibleLabel = label ?? "导出 Markdown";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="导出 Markdown"
      title="下载为 Markdown 文件"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 rounded-md border border-border/60 bg-secondary/40 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{done ? "已导出" : visibleLabel}</span>
    </button>
  );
}

"use client";

// Tiny copy-to-clipboard button. Used inside tool/MCP cards for install
// commands and curl snippets. Falls back to `document.execCommand("copy")`
// when `navigator.clipboard` is unavailable (older Safari, http:// origins).
//
// The button is intentionally minimal — a single 14×14 icon, no label, with
// a hover-only background. Keeps the parent layout untouched (inline-block).

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  /** Text to copy when the button is clicked. */
  text: string;
  /** Optional accessible label override. Defaults to "复制". */
  label?: string;
  /** Extra classes appended to the wrapper. */
  className?: string;
}

export function CopyButton({ text, label = "复制", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts (HTTP, older Safari).
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* swallow — copy failure shouldn't break the page */
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground/70 transition-colors",
        "hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
        copied && "text-emerald-500",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
    </button>
  );
}
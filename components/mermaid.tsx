"use client";
import { useEffect, useRef, useState } from "react";

let mermaidPromise: Promise<typeof import("mermaid").default> | null = null;
function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
      const mermaid = m.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "strict",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        themeVariables: {
          background: "transparent",
          primaryColor: "#1e293b",
          primaryTextColor: "#e2e8f0",
          primaryBorderColor: "#334155",
          lineColor: "#64748b",
          secondaryColor: "#0f172a",
          tertiaryColor: "#020617",
        },
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const id = useRef(`m-${Math.random().toString(36).slice(2, 10)}`);

  useEffect(() => {
    let cancelled = false;
    loadMermaid()
      .then((mermaid) => mermaid.render(id.current, chart))
      .then(({ svg }) => { if (!cancelled) setSvg(svg); })
      .catch((e) => { if (!cancelled) setErr(String(e?.message || e)); });
    return () => { cancelled = true; };
  }, [chart]);

  if (err) {
    return (
      <pre className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded p-3 overflow-x-auto">
        mermaid 渲染失败：{err}
        {"\n\n"}
        {chart}
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      className="my-3 p-4 border border-border rounded-lg bg-muted/20 overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg || '<div class="text-xs text-muted-foreground">渲染中…</div>' }}
    />
  );
}

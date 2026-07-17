"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body style={{ background: "#0a0a0a", color: "white", padding: 40, fontFamily: "monospace" }}>
        <h1>⚠️ Global Error Caught</h1>
        <pre style={{ color: "#f87171", whiteSpace: "pre-wrap" }}>
          {error?.message || "no message"}{"\n"}
          digest: {error?.digest || "none"}{"\n"}
          stack: {error?.stack?.substring(0, 500) || "no stack"}
        </pre>
        <button onClick={reset} style={{ padding: "8px 16px", marginTop: 16, cursor: "pointer" }}>
          Try Again
        </button>
      </body>
    </html>
  );
}

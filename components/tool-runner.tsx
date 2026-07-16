"use client";
// components/tool-runner.tsx
// 网页内工具执行器：表单 -> POST /api/exec/<slug> -> 结果
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Loader2, Terminal, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// 复制 ArgSpec 类型（避免 client 引 server-only lib）
type ArgType = "domain" | "ip" | "host" | "port" | "url" | "enum" | "flag" | "cipher";
export interface ArgSpec {
  name: string;
  label: string;
  type: ArgType;
  required?: boolean;
  placeholder?: string;
  default?: string;
  options?: string[];
  help?: string;
}

export interface ToolRunnerProps {
  slug: string;
  description: string;
  argsTemplate: ArgSpec[];
}

interface RunResp {
  ok: boolean;
  error?: string;
  slug?: string;
  binary?: string;
  args?: string[];
  stdout?: string;
  stderr?: string;
  code?: number;
  timedOut?: boolean;
  durationMs?: number;
  rateRemaining?: number;
}

export function ToolRunner({ slug, description, argsTemplate }: ToolRunnerProps) {
  const [form, setForm] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const a of argsTemplate) init[a.name] = a.default ?? "";
    return init;
  });
  const [ack, setAck] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [resp, setResp] = React.useState<RunResp | null>(null);

  const setField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ack) return;
    setLoading(true);
    setResp(null);
    try {
      const r = await fetch(`/api/exec/${slug}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ args: form }),
      });
      const j = await r.json();
      setResp(j);
    } catch (err) {
      setResp({ ok: false, error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  };

  const success = resp?.ok && (resp?.code === 0 || (resp?.stdout ?? "").length > 0);
  const statusColor = !resp ? "" : success ? "text-emerald-500" : "text-red-500";

  return (
    <div className="rounded-lg border border-primary/40 bg-primary/[0.03] p-5">
      <div className="flex items-center gap-2 mb-1">
        <Play className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold">在线执行</h3>
        <Badge className="ml-1 bg-emerald-500/15 text-emerald-500 border-emerald-500/30">Beta</Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>

      <form onSubmit={submit} className="space-y-3">
        {argsTemplate.map((a) => (
          <div key={a.name} className="space-y-1">
            <label className="text-xs font-medium flex items-center gap-1.5">
              {a.label}
              {a.required && <span className="text-red-500">*</span>}
              {a.help && <span className="text-muted-foreground font-normal">— {a.help}</span>}
            </label>
            {a.type === "enum" && a.options ? (
              <select
                value={form[a.name] ?? ""}
                onChange={(e) => setField(a.name, e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {a.options.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            ) : (
              <input
                type="text"
                value={form[a.name] ?? ""}
                onChange={(e) => setField(a.name, e.target.value)}
                placeholder={a.placeholder}
                required={a.required}
                autoComplete="off"
                spellCheck={false}
                className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
          </div>
        ))}

        <label className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            我确认所测试目标为<strong className="text-foreground"> 自有资产 </strong>或已获得<strong className="text-foreground"> 明确书面授权</strong>，且遵守当地法律法规。执行 IP 与时间将记录在服务器日志。
          </span>
        </label>

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={!ack || loading} className="min-w-[110px]">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> 执行中</> : <><Play className="h-4 w-4" /> 立即执行</>}
          </Button>
          <span className="text-xs text-muted-foreground">
            限速 10 次 / 分钟 / IP，单次超时 8~30s
          </span>
        </div>
      </form>

      {resp && (
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            {resp.ok
              ? (success
                ? <CheckCircle2 className={cn("h-4 w-4", statusColor)} />
                : <AlertTriangle className={cn("h-4 w-4", statusColor)} />)
              : <XCircle className={cn("h-4 w-4", statusColor)} />}
            <span className={cn("font-medium", statusColor)}>
              {resp.ok
                ? (success ? "执行成功" : `已执行（非零 exit ${resp.code}${resp.timedOut ? " · 超时" : ""}）`)
                : "执行失败"}
            </span>
            {typeof resp.durationMs === "number" && (
              <span className="text-xs text-muted-foreground">· {resp.durationMs}ms</span>
            )}
            {typeof resp.rateRemaining === "number" && (
              <span className="text-xs text-muted-foreground ml-auto">剩余额度 {resp.rateRemaining}/10</span>
            )}
          </div>

          {resp.error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-500">
              {resp.error}
            </div>
          )}

          {resp.args && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">实际执行命令</div>
              <pre className="rounded-md bg-muted/50 border border-border p-3 text-xs font-mono overflow-x-auto">
                <span className="text-primary">$</span> {resp.binary} {resp.args.map((a) => /[\s"']/.test(a) ? JSON.stringify(a) : a).join(" ")}
              </pre>
            </div>
          )}

          {(resp.stdout || resp.stderr) && (
            <div>
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <Terminal className="h-3 w-3" /> 输出
              </div>
              <pre className="rounded-md bg-black/60 border border-border p-3 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap max-h-[520px]">
                {resp.stdout}
                {resp.stderr && (
                  <span className="text-yellow-400/90">
                    {resp.stdout ? "\n\n--- stderr ---\n" : ""}{resp.stderr}
                  </span>
                )}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

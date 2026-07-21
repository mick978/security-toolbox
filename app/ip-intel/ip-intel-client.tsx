"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Globe, Search, AlertTriangle, Server, Download, Loader2, Copy, Check, ArrowRight, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ExploreHero, ExploreHeroBadge } from "@/components/explore-hero";
import { EmptyResults } from "@/components/empty-results";

interface IpIntelRow {
  ip: string;
  ok: boolean;
  error?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  isp?: string;
  org?: string;
  asn?: string;
  proxy?: boolean;
  hosting?: boolean;
  mobile?: boolean;
  ports?: number[];
  vulns?: string[];
  cpes?: string[];
  hostnames?: string[];
  tags?: string[];
}

interface ApiResp {
  ok: boolean;
  error?: string;
  total?: number;
  truncated?: boolean;
  truncatedFrom?: number;
  rows?: IpIntelRow[];
}

const SAMPLE = "1.1.1.1\n8.8.8.8\n47.109.63.111\n185.220.101.1";

export default function IpIntelClient() {
  const [raw, setRaw] = useState("");
  const [rows, setRows] = useState<IpIntelRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [truncatedFrom, setTruncatedFrom] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => {
    if (rows.length === 0) return null;
    const okCount = rows.filter((r) => r.ok).length;
    const proxy = rows.filter((r) => r.proxy).length;
    const hosting = rows.filter((r) => r.hosting).length;
    const withVulns = rows.filter((r) => (r.vulns?.length ?? 0) > 0).length;
    const withPorts = rows.filter((r) => (r.ports?.length ?? 0) > 0).length;
    return { total: rows.length, okCount, proxy, hosting, withVulns, withPorts };
  }, [rows]);

  async function submit() {
    setErr(null);
    setLoading(true);
    setTruncatedFrom(null);
    try {
      const res = await fetch("/api/ip-intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw }),
      });
      const data: ApiResp = await res.json();
      if (!data.ok) {
        setErr(data.error ?? "查询失败");
        setRows([]);
      } else {
        setRows(data.rows ?? []);
        if (data.truncated && data.truncatedFrom) setTruncatedFrom(data.truncatedFrom);
      }
    } catch (e: any) {
      setErr(e?.message ?? "网络错误");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function loadSample() { setRaw(SAMPLE); }

  function downloadCsv() {
    if (rows.length === 0) return;
    const headers = [
      "ip", "ok", "country", "countryCode", "region", "city",
      "isp", "org", "asn",
      "proxy", "hosting", "mobile",
      "ports", "vulns", "cpes", "hostnames", "tags", "error",
    ];
    const escape = (v: any) => {
      if (v === undefined || v === null) return "";
      const s = Array.isArray(v) ? v.join("|") : String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push([
        r.ip, r.ok, r.country, r.countryCode, r.region, r.city,
        r.isp, r.org, r.asn,
        r.proxy, r.hosting, r.mobile,
        r.ports, r.vulns, r.cpes, r.hostnames, r.tags, r.error,
      ].map(escape).join(","));
    }
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ip-intel-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyJson() {
    await navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  /* Fake "source" counter for the hero — pages where we don't have
   * a known total use static numbers until telemetry exists. */
  const totalStats = [
    { value: "ip-api.com",   label: "地理 / ASN / Proxy",          icon: Globe },
    { value: "Shodan",       label: "端口 / CVE / 主机名",         icon: Server },
    { value: "0",            label: "登录后配额",                   icon: ShieldAlert },
    { value: "免 key",        label: "免费使用",                     icon: ArrowRight },
  ];

  return (
    <div className="min-h-screen">
      <ExploreHero
        badge={<ExploreHeroBadge icon={Globe}>IP 情报查询</ExploreHeroBadge>}
        titleLine1="批量 IP"
        titleLine2="情报聚合"
        tldr={
          <>
            粘贴 IP 列表 → 同时拉取
            <span className="text-foreground font-medium"> ip-api.com </span>
            (地理/ASN/Proxy标记) 与
            <span className="text-foreground font-medium"> Shodan InternetDB </span>
            (开放端口 / 已知 CVE / Hostnames) →
            <span className="text-foreground font-medium"> 一键导出 CSV </span>
            做进一步排查。
          </>
        }
        stats={totalStats}
      />

      <section className="container pt-section">
        <Card className="overflow-hidden border-border/60 transition-all duration-200 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/15">
          <CardContent className="pt-6">
            <label className="text-xs text-muted-foreground mb-2 block">
              输入 IP（每行一个，或用逗号 / 空格分隔；单次最多 100 个）
            </label>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={6}
              spellCheck={false}
              placeholder="1.1.1.1&#10;8.8.8.8&#10;47.109.63.111"
              className="w-full font-mono text-sm rounded-md border border-border bg-secondary/30 px-3 py-2 focus:outline-none focus:border-primary/60"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={submit}
                disabled={loading || raw.trim().length === 0}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? "查询中…" : "开始查询"}
              </button>
              <button
                onClick={loadSample}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-4 py-2 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                加载示例
              </button>
              <button
                onClick={() => { setRaw(""); setRows([]); setErr(null); setTruncatedFrom(null); }}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-4 py-2 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                清空
              </button>
              {rows.length > 0 && (
                <>
                  <button
                    onClick={downloadCsv}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-4 py-2 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <Download className="h-4 w-4" /> 导出 CSV
                  </button>
                  <button
                    onClick={copyJson}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-4 py-2 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    {copied ? "已复制" : "复制 JSON"}
                  </button>
                </>
              )}
            </div>

            {err && (
              <div className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                {err}
              </div>
            )}
            {truncatedFrom && (
              <div className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-200">
                ⚠️ 检测到 {truncatedFrom} 个 IP，已截取前 100 个查询（受上游速率限制）。
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {summary && (
        <section className="container pt-block">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <SumCell label="总数" value={summary.total} />
            <SumCell label="成功" value={summary.okCount} tone="ok" />
            <SumCell label="失败" value={summary.total - summary.okCount} tone={summary.total - summary.okCount > 0 ? "warn" : "muted"} />
            <SumCell label="Proxy/VPN" value={summary.proxy} tone={summary.proxy > 0 ? "warn" : "muted"} />
            <SumCell label="数据中心" value={summary.hosting} tone="muted" />
            <SumCell label="有 CVE" value={summary.withVulns} tone={summary.withVulns > 0 ? "danger" : "muted"} />
          </div>
        </section>
      )}

      <section className="container pt-block pb-section">
        <div className="space-y-3">
          {rows.map((r) => (
            <ResultRow key={r.ip} row={r} single={rows.length === 1} />
          ))}
        </div>
      </section>

      {rows.length === 0 && !loading && (
        <section className="container pb-section">
          <EmptyResults
            title="还没查询"
            hint="粘贴一段 IP 上来开始。下面是结果字段说明，看一眼就懂。"
            suggestions={[
              { label: "加载示例", href: "#sample" },
              { label: "看下面字段说明", href: "#legend" },
              { label: "了解数据源",  href: "/about" },
            ]}
          />

          <div id="legend" className="mt-4 rounded-xl border border-border/60 bg-secondary/20 p-6">
            <div className="font-medium text-foreground mb-3 text-sm">字段说明</div>
            <ul className="space-y-1.5 text-xs list-disc pl-5">
              <li><span className="text-foreground font-medium">地理位置</span>：国家 / 省 / 市，配合 ASN 判断归属运营商或云厂商。</li>
              <li><span className="text-foreground font-medium">Proxy / Hosting</span>：ip-api 标记该 IP 是否为已知代理 / VPN / 云主机段。判断"是不是真人 IP"的重要参考。</li>
              <li><span className="text-foreground font-medium">Shodan Ports</span>：Shodan 上一次扫描该 IP 时看到的开放端口。有 22/3389/6379 需重点关注。</li>
              <li><span className="text-foreground font-medium">Vulns (CVE)</span>：Shodan 根据端口 banner 匹配到的已知 CVE。<span className="text-red-700 dark:text-red-300 font-medium">出现 CVE 编号说明该主机存在已公开漏洞</span>。</li>
              <li><span className="text-foreground font-medium">Tags</span>：Shodan 打的标签，例如 <code className="font-mono">tor</code>、<code className="font-mono">vpn</code>、<code className="font-mono">honeypot</code>、<code className="font-mono">cdn</code>。</li>
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

function SumCell({ label, value, tone = "muted" }: { label: string; value: number; tone?: "ok" | "warn" | "danger" | "muted" }) {
  const toneCls = {
    ok: "text-emerald-700 dark:text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
    warn: "text-amber-700 dark:text-amber-200 border-amber-500/40 bg-amber-500/10",
    danger: "text-red-700 dark:text-red-300 border-red-500/40 bg-red-500/10",
    muted: "text-muted-foreground border-border bg-secondary/30",
  }[tone];
  return (
    <div className={cn("rounded-md border px-3 py-2", toneCls)}>
      <div className="text-[10px] uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function ResultRow({ row, single }: { row: IpIntelRow; single: boolean }) {
  const flags: { label: string; tone: "warn" | "danger" | "info" }[] = [];
  if (row.proxy) flags.push({ label: "Proxy/VPN", tone: "warn" });
  if (row.hosting) flags.push({ label: "数据中心", tone: "info" });
  if (row.mobile) flags.push({ label: "移动网络", tone: "info" });
  if ((row.vulns?.length ?? 0) > 0) flags.push({ label: `${row.vulns!.length} CVE`, tone: "danger" });
  if (row.tags?.includes("tor")) flags.push({ label: "Tor 出口", tone: "danger" });
  if (row.tags?.includes("honeypot")) flags.push({ label: "蜜罐", tone: "warn" });

  return (
    <Card className="overflow-hidden border-border/60 transition-all duration-200 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/15">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono text-base font-semibold">{row.ip}</span>
          {row.countryCode && (
            <Badge className="text-xs">
              {row.countryCode}{row.country ? ` · ${row.country}` : ""}
            </Badge>
          )}
          {!row.ok && (
            <Badge className="text-xs border-red-500/60 text-red-700 dark:text-red-300 bg-red-500/10">
              查询失败
            </Badge>
          )}
          {flags.map((f) => (
            <Badge
              key={f.label}
              className={cn(
                "text-xs",
                f.tone === "danger" && "border-red-500/60 text-red-700 dark:text-red-300 bg-red-500/10",
                f.tone === "warn" && "border-amber-500/60 text-amber-700 dark:text-amber-200 bg-amber-500/10",
                f.tone === "info" && "border-sky-500/60 text-sky-700 dark:text-sky-300 bg-sky-500/10",
              )}
            >
              {f.label}
            </Badge>
          ))}
        </div>

        {row.error && (
          <div className="text-xs text-red-700 dark:text-red-300 mb-2">{row.error}</div>
        )}

        <div className={cn("grid gap-3 text-xs", single ? "md:grid-cols-2" : "md:grid-cols-3")}>
          <Field label="地理" value={[row.city, row.region, row.country].filter(Boolean).join(" / ")} />
          <Field label="ASN" value={row.asn} mono />
          <Field label="ISP" value={row.isp} />
          <Field label="Org" value={row.org} />
          {row.hostnames && row.hostnames.length > 0 && (
            <Field label="Hostnames" value={row.hostnames.join(", ")} mono />
          )}
          {row.tags && row.tags.length > 0 && (
            <Field label="Shodan Tags" value={row.tags.join(", ")} mono />
          )}
        </div>

        {row.ports && row.ports.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <Server className="h-3.5 w-3.5" /> 开放端口（Shodan）
            </div>
            <div className="flex flex-wrap gap-1">
              {row.ports.map((p) => (
                <span key={p} className="font-mono text-xs px-1.5 py-0.5 rounded border border-border bg-secondary/40">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {row.vulns && row.vulns.length > 0 && (
          <div className="mt-3 pt-3 border-t border-red-500/30">
            <div className="flex items-center gap-1.5 text-xs text-red-700 dark:text-red-300 mb-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> 已知 CVE（Shodan InternetDB · {row.vulns.length} 项）
            </div>
            <div className="flex flex-wrap gap-1">
              {row.vulns.slice(0, 40).map((v) => (
                <a
                  key={v}
                  href={`https://nvd.nist.gov/vuln/detail/${v}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs px-1.5 py-0.5 rounded border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/20"
                >
                  {v}
                </a>
              ))}
              {row.vulns.length > 40 && (
                <span className="text-xs text-muted-foreground">…还有 {row.vulns.length - 40} 项，导出 CSV 查看</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">{label}</div>
      <div className={cn("text-foreground", mono && "font-mono", !value && "text-muted-foreground italic")}>
        {value || "—"}
      </div>
    </div>
  );
}

// lib/ip-intel.ts
// IP 地理位置 + 威胁情报聚合。全部走免 key 数据源：
//   - ip-api.com/batch     免费 15 req/min，最多 100 IP/次，含 country/city/isp/org/as/proxy/hosting/mobile
//   - internetdb.shodan.io 免费无 key，含 ports/vulns/cpes/hostnames/tags
// 服务端 fetch，客户端只拿聚合后的结果。

export interface IpIntelRow {
  ip: string;
  ok: boolean;
  error?: string;
  // 地理 / 归属
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  isp?: string;
  org?: string;
  asn?: string; // 例如 "AS15169 Google LLC"
  // 威胁标记
  proxy?: boolean;
  hosting?: boolean;
  mobile?: boolean;
  // Shodan InternetDB
  ports?: number[];
  vulns?: string[];
  cpes?: string[];
  hostnames?: string[];
  tags?: string[];
}

// IPv4 简易校验（IPv6 也放行，交给上游 API 判定）
const IPV4_RE = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
const IPV6_HINT = /:/;

export function isLikelyIp(s: string): boolean {
  return IPV4_RE.test(s) || IPV6_HINT.test(s);
}

// 拆分 textarea：换行 / 逗号 / 空格 / 分号
export function parseIpList(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const chunk of raw.split(/[\s,;]+/)) {
    const t = chunk.trim();
    if (!t) continue;
    if (!isLikelyIp(t)) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

interface IpApiBatchItem {
  status: string;
  message?: string;
  query: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  isp?: string;
  org?: string;
  as?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
}

async function fetchIpApiBatch(ips: string[]): Promise<Map<string, IpApiBatchItem>> {
  const map = new Map<string, IpApiBatchItem>();
  if (ips.length === 0) return map;
  // ip-api free: HTTP only, fields 用位掩码或字符串
  const fields = "status,message,query,country,countryCode,regionName,city,isp,org,as,mobile,proxy,hosting";
  const url = `http://ip-api.com/batch?fields=${fields}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ips),
      // 12s 硬超时（AbortController）
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return map;
    const arr = (await res.json()) as IpApiBatchItem[];
    for (const item of arr) {
      if (item?.query) map.set(item.query, item);
    }
  } catch {
    // 静默降级 —— 单 IP 结果仍会由 Shodan 补一部分
  }
  return map;
}

interface ShodanIdbResp {
  ip: string;
  ports?: number[];
  vulns?: string[];
  cpes?: string[];
  hostnames?: string[];
  tags?: string[];
}

async function fetchShodanIdb(ip: string): Promise<ShodanIdbResp | null> {
  try {
    const res = await fetch(`https://internetdb.shodan.io/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null; // 404 = 该 IP 无公开端口指纹
    return (await res.json()) as ShodanIdbResp;
  } catch {
    return null;
  }
}

export async function queryIpIntel(ips: string[]): Promise<IpIntelRow[]> {
  if (ips.length === 0) return [];

  // 并发调用：ip-api batch（一次） + Shodan idb（逐个 IP，并发上限 10）
  const [ipApiMap, shodanMap] = await Promise.all([
    fetchIpApiBatch(ips),
    (async () => {
      const map = new Map<string, ShodanIdbResp | null>();
      // 分批并发，避免开太多 socket
      const CONCURRENCY = 10;
      let cursor = 0;
      async function worker() {
        while (cursor < ips.length) {
          const idx = cursor++;
          const ip = ips[idx];
          const r = await fetchShodanIdb(ip);
          map.set(ip, r);
        }
      }
      const workers = Array.from({ length: Math.min(CONCURRENCY, ips.length) }, () => worker());
      await Promise.all(workers);
      return map;
    })(),
  ]);

  return ips.map<IpIntelRow>((ip) => {
    const g = ipApiMap.get(ip);
    const s = shodanMap.get(ip);
    if (!g && !s) {
      return { ip, ok: false, error: "所有数据源均查询失败或超时" };
    }
    if (g && g.status !== "success") {
      // ip-api 明确失败（保留 Shodan 结果如果有）
      return {
        ip,
        ok: !!s,
        error: g.message ?? "ip-api 返回失败",
        ports: s?.ports,
        vulns: s?.vulns,
        cpes: s?.cpes,
        hostnames: s?.hostnames,
        tags: s?.tags,
      };
    }
    return {
      ip,
      ok: true,
      country: g?.country,
      countryCode: g?.countryCode,
      region: g?.regionName,
      city: g?.city,
      isp: g?.isp,
      org: g?.org,
      asn: g?.as,
      proxy: g?.proxy,
      hosting: g?.hosting,
      mobile: g?.mobile,
      ports: s?.ports,
      vulns: s?.vulns,
      cpes: s?.cpes,
      hostnames: s?.hostnames,
      tags: s?.tags,
    };
  });
}

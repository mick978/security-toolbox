// app/api/ip-intel/route.ts
// POST { ips: string[] } -> { ok, rows: IpIntelRow[], truncated?, total }

import { NextRequest, NextResponse } from "next/server";
import { parseIpList, queryIpIntel } from "@/lib/ip-intel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IPS = 100;

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "请求体不是合法 JSON" }, { status: 400 });
  }

  // 兼容三种输入：{ ips: [...] } / { ip: "1.1.1.1" } / { raw: "1.1.1.1\n2.2.2.2" }
  let ips: string[] = [];
  if (Array.isArray(body?.ips)) {
    ips = parseIpList(body.ips.join("\n"));
  } else if (typeof body?.ip === "string") {
    ips = parseIpList(body.ip);
  } else if (typeof body?.raw === "string") {
    ips = parseIpList(body.raw);
  }

  if (ips.length === 0) {
    return NextResponse.json({ ok: false, error: "未识别到任何合法 IP 地址" }, { status: 400 });
  }

  const truncated = ips.length > MAX_IPS;
  const target = truncated ? ips.slice(0, MAX_IPS) : ips;

  const rows = await queryIpIntel(target);

  return NextResponse.json({
    ok: true,
    total: target.length,
    truncated,
    truncatedFrom: truncated ? ips.length : undefined,
    rows,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: "POST { ips: string[] } | { ip: string } | { raw: string }",
    maxIps: MAX_IPS,
    sources: ["ip-api.com/batch (地理/ASN/proxy/hosting)", "internetdb.shodan.io (ports/CVE/tags)"],
  });
}

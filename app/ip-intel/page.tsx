export const dynamic = "force-dynamic";

// app/ip-intel/page.tsx — 服务端入口，导出 metadata
import type { Metadata } from "next";
import IpIntelClient from "./ip-intel-client";

export const metadata: Metadata = {
  title: "IP 情报查询 · security-toolbox",
  description: "单个 / 批量 IP 地理位置 + ASN + 威胁标记 + Shodan 端口 / CVE 一站查询。",
};

export default function Page() {
  return <IpIntelClient />;
}

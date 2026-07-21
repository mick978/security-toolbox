// lib/executors.ts
// 网页执行器白名单 + 参数校验 + execFile（无 shell 注入）
// 只包含调试类工具（DNS / 连通性 / HTTP / TLS），攻击类拒绝上线

export type ArgType = "domain" | "ip" | "host" | "port" | "url" | "enum" | "flag" | "cipher";

export interface ArgSpec {
  name: string;               // 传给后端的 key
  label: string;              // 表单显示
  type: ArgType;
  required?: boolean;
  placeholder?: string;
  default?: string;
  options?: string[];         // for enum
  help?: string;
}

export interface ExecutorSpec {
  slug: string;               // tool.slug
  binary: string;             // 绝对路径优先，退回 PATH
  buildArgs: (form: Record<string, string>) => string[]; // 组装参数
  argsTemplate: ArgSpec[];
  timeoutMs: number;
  description: string;        // 一句话说明
}

// ---------- 校验器 ----------
const RX = {
  // host = domain OR ip4 OR ip6-in-brackets-optional
  domain: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  ip4:    /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/,
  ip6:    /^[0-9a-fA-F:]{2,45}$/,
  port:   /^\d{1,5}$/,
  url:    /^https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]{1,2000}$/,
};

export function validateArg(spec: ArgSpec, raw: string | undefined): string {
  const v = (raw ?? "").trim();
  if (!v) {
    if (spec.required) throw new Error(`参数 ${spec.label} 不能为空`);
    return spec.default ?? "";
  }
  if (v.length > 253) throw new Error(`参数 ${spec.label} 过长`);
  // 通用禁止字符（shell metachar / 空白 / 换行）
  if (/[\s;&|`$<>()"'\\]/.test(v)) throw new Error(`参数 ${spec.label} 含非法字符`);
  switch (spec.type) {
    case "domain":
      if (!RX.domain.test(v)) throw new Error(`域名格式不合法: ${v}`);
      break;
    case "ip":
      if (!RX.ip4.test(v) && !RX.ip6.test(v)) throw new Error(`IP 格式不合法: ${v}`);
      break;
    case "host":
      if (!RX.domain.test(v) && !RX.ip4.test(v) && !RX.ip6.test(v))
        throw new Error(`主机格式不合法: ${v}`);
      break;
    case "port": {
      if (!RX.port.test(v)) throw new Error(`端口格式不合法: ${v}`);
      const n = parseInt(v, 10);
      if (n < 1 || n > 65535) throw new Error(`端口越界: ${v}`);
      break;
    }
    case "url":
      if (!RX.url.test(v)) throw new Error(`URL 格式不合法（需 http/https）`);
      break;
    case "enum":
      if (!spec.options?.includes(v)) throw new Error(`${spec.label} 只能是 ${spec.options?.join("|")}`);
      break;
    case "flag":
      if (v !== "1" && v !== "0" && v !== "true" && v !== "false")
        throw new Error(`${spec.label} 必须是布尔`);
      break;
    case "cipher":
      // OpenSSL cipher string: 字母数字 + : ! + - _
      if (!/^[A-Za-z0-9:!+\-_]{1,200}$/.test(v))
        throw new Error(`加密套件格式不合法（允许 A-Z0-9 和 : ! + - _）`);
      break;
  }
  return v;
}

// ---------- 白名单 ----------
export const EXECUTORS: ExecutorSpec[] = [
  {
    slug: "ping",
    binary: "ping",
    description: "ICMP 连通性 & RTT 测试（发 4 包）",
    timeoutMs: 12000,
    argsTemplate: [
      { name: "host", label: "目标主机", type: "host", required: true, placeholder: "example.com 或 8.8.8.8" },
      { name: "count", label: "包数", type: "enum", options: ["3", "4", "5", "8"], default: "4" },
    ],
    buildArgs: (f) => ["-c", f.count || "4", "-W", "2", f.host],
  },
  {
    slug: "nslookup",
    binary: "nslookup",
    description: "DNS 查询（默认系统 resolver）",
    timeoutMs: 8000,
    argsTemplate: [
      { name: "name", label: "域名", type: "domain", required: true, placeholder: "example.com" },
      { name: "server", label: "指定 DNS（可选）", type: "host", placeholder: "8.8.8.8 / 1.1.1.1 / 223.5.5.5" },
    ],
    buildArgs: (f) => (f.server ? [f.name, f.server] : [f.name]),
  },
  {
    slug: "dig",
    binary: "dig",
    description: "DNS 查询增强版（支持记录类型 + trace）",
    timeoutMs: 15000,
    argsTemplate: [
      { name: "name", label: "域名", type: "domain", required: true, placeholder: "example.com" },
      { name: "type", label: "记录类型", type: "enum",
        options: ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "PTR", "CAA", "ANY"], default: "A" },
      { name: "server", label: "指定 DNS（可选）", type: "host", placeholder: "@8.8.8.8" },
      { name: "mode", label: "模式", type: "enum", options: ["short", "trace", "normal"], default: "short" },
    ],
    buildArgs: (f) => {
      const a: string[] = [];
      if (f.server) a.push(`@${f.server}`);
      a.push(f.name, f.type || "A");
      if (f.mode === "short") a.push("+short");
      else if (f.mode === "trace") a.push("+trace");
      a.push("+time=3", "+tries=2");
      return a;
    },
  },
  {
    slug: "host",
    binary: "host",
    description: "轻量 DNS 查询（A / AAAA / MX 一次拉齐）",
    timeoutMs: 8000,
    argsTemplate: [
      { name: "name", label: "域名", type: "domain", required: true, placeholder: "example.com" },
    ],
    buildArgs: (f) => ["-W", "3", f.name],
  },
  {
    slug: "traceroute",
    binary: "traceroute",
    description: "路径跟踪（默认 UDP，最多 20 跳）",
    timeoutMs: 25000,
    argsTemplate: [
      { name: "host", label: "目标主机", type: "host", required: true, placeholder: "example.com" },
      { name: "max", label: "最大跳数", type: "enum", options: ["10", "15", "20", "25"], default: "20" },
    ],
    buildArgs: (f) => ["-n", "-w", "2", "-q", "1", "-m", f.max || "20", f.host],
  },
  {
    slug: "mtr",
    binary: "mtr",
    description: "traceroute + ping 融合报告（5 轮）",
    timeoutMs: 30000,
    argsTemplate: [
      { name: "host", label: "目标主机", type: "host", required: true, placeholder: "example.com" },
      { name: "cycles", label: "轮次", type: "enum", options: ["3", "5", "10"], default: "5" },
    ],
    buildArgs: (f) => ["--report", "--report-wide", "-n", "-c", f.cycles || "5", f.host],
  },
  {
    slug: "curl",
    binary: "curl",
    description: "HTTP 请求（-I 拿头 / -v 全过程 / -w 拿耗时）",
    timeoutMs: 15000,
    argsTemplate: [
      { name: "url", label: "URL", type: "url", required: true, placeholder: "https://example.com" },
      { name: "mode", label: "模式", type: "enum",
        options: ["headers", "verbose", "timing", "body"], default: "headers" },
    ],
    buildArgs: (f) => {
      const base = ["--max-time", "10", "-sS", "-A", "SecToolbox-Web/1.0"];
      switch (f.mode) {
        case "verbose": return [...base, "-v", "-o", "/dev/null", f.url];
        case "timing":  return [...base, "-o", "/dev/null",
          "-w", "dns=%{time_namelookup}s\\nconnect=%{time_connect}s\\nssl=%{time_appconnect}s\\nttfb=%{time_starttransfer}s\\ntotal=%{time_total}s\\nhttp_code=%{http_code}\\nsize=%{size_download}\\n",
          f.url];
        case "body":    return [...base, "-L", "--max-filesize", "65536", f.url];
        case "headers":
        default:        return [...base, "-I", "-L", f.url];
      }
    },
  },
  {
    slug: "whois",
    binary: "whois",
    description: "域名 / IP 注册信息查询",
    timeoutMs: 15000,
    argsTemplate: [
      { name: "target", label: "域名或 IP", type: "host", required: true, placeholder: "example.com" },
    ],
    buildArgs: (f) => [f.target],
  },
  {
    slug: "openssl-sclient",
    binary: "openssl",
    description: "TLS 握手 / 证书链 / TLS 版本 / 加密套件测试",
    timeoutMs: 15000,
    argsTemplate: [
      { name: "host", label: "主机", type: "host", required: true, placeholder: "example.com" },
      { name: "port", label: "端口", type: "port", default: "443" },
      {
        name: "mode",
        label: "模式",
        type: "enum",
        options: ["brief", "chain", "tls10", "tls11", "tls12", "tls13", "cipher"],
        default: "brief",
        help: "brief=概览 / chain=完整证书链 / tls1x=强制 TLS 版本 / cipher=测特定加密套件",
      },
      {
        name: "cipher",
        label: "加密套件（仅 cipher 模式）",
        type: "cipher",
        placeholder: "ECDHE-RSA-AES256-GCM-SHA384",
        help: "TLS1.2 及以下用 -cipher；仅 mode=cipher 时生效",
      },
    ],
    buildArgs: (f) => {
      const target = `${f.host}:${f.port || "443"}`;
      const base = ["s_client", "-connect", target, "-servername", f.host];
      switch (f.mode) {
        case "chain":
          // 展开完整证书链，握手完 -verify_return_error 会输出 verify 结果
          return [...base, "-showcerts", "-verify_return_error"];
        case "tls10":
          return [...base, "-tls1", "-brief"];
        case "tls11":
          return [...base, "-tls1_1", "-brief"];
        case "tls12":
          return [...base, "-tls1_2", "-brief"];
        case "tls13":
          return [...base, "-tls1_3", "-brief"];
        case "cipher": {
          if (!f.cipher) throw new Error("cipher 模式需要填写加密套件");
          // -cipher 只在 <=TLS1.2 生效，强制 tls1_2 保证测得准
          return [...base, "-tls1_2", "-cipher", f.cipher, "-brief"];
        }
        case "brief":
        default:
          return [...base, "-verify_return_error", "-brief"];
      }
    },
  },
  {
    slug: "netcat",
    binary: "nc",
    description: "TCP 端口探测（-z 只扫不发数据）",
    timeoutMs: 8000,
    argsTemplate: [
      { name: "host", label: "主机", type: "host", required: true, placeholder: "example.com" },
      { name: "port", label: "端口", type: "port", required: true, placeholder: "443" },
    ],
    buildArgs: (f) => ["-z", "-v", "-w", "3", f.host, f.port],
  },

  // --- 第二批白名单：与网络安全排查相关的只读 / 无副作用工具 ---
  {
    slug: "dig-trace",
    binary: "dig",
    description: "DNS 跟踪（从根到权威逐级）",
    timeoutMs: 15000,
    argsTemplate: [
      { name: "domain", label: "域名", type: "domain", required: true, placeholder: "example.com" },
    ],
    buildArgs: (f) => ["+trace", f.domain],
  },
  {
    slug: "dig-txt",
    binary: "dig",
    description: "查询 TXT 记录（SPF / DKIM / 验证密钥）",
    timeoutMs: 8000,
    argsTemplate: [
      { name: "domain", label: "域名", type: "domain", required: true, placeholder: "example.com" },
      { name: "prefix", label: "前缀（可选）", type: "domain", required: false, placeholder: "_dmarc" },
    ],
    buildArgs: (f) => {
      const d = f.prefix ? `${f.prefix}.${f.domain}` : f.domain;
      return ["TXT", "+short", d];
    },
  },
  {
    slug: "dig-mx",
    binary: "dig",
    description: "查询 MX 记录（邮件服务器）",
    timeoutMs: 8000,
    argsTemplate: [
      { name: "domain", label: "域名", type: "domain", required: true, placeholder: "example.com" },
    ],
    buildArgs: (f) => ["MX", "+short", f.domain],
  },
  {
    slug: "whois-ip",
    binary: "whois",
    description: "查询 IP 的 WHOIS 注册信息",
    timeoutMs: 12000,
    argsTemplate: [
      { name: "ip", label: "IP", type: "ip", required: true, placeholder: "8.8.8.8" },
    ],
    buildArgs: (f) => [f.ip],
  },
  {
    slug: "host-dns",
    binary: "host",
    description: "DNS 查询（替代 dig，输出简洁）",
    timeoutMs: 8000,
    argsTemplate: [
      { name: "host", label: "主机", type: "host", required: true, placeholder: "example.com" },
    ],
    buildArgs: (f) => [f.host],
  },
  {
    slug: "nslookup-record",
    binary: "nslookup",
    description: "查询指定记录类型（ANY / A / AAAA / CNAME）",
    timeoutMs: 8000,
    argsTemplate: [
      { name: "host", label: "主机", type: "host", required: true, placeholder: "example.com" },
      {
        name: "type", label: "记录类型", type: "enum", required: true,
        options: ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "ANY"],
        default: "A",
      },
    ],
    buildArgs: (f) => ["-query=" + f.type, f.host],
  },
  {
    slug: "curl-headers",
    binary: "curl",
    description: "只看 HTTP 响应头（HEAD-like）",
    timeoutMs: 12000,
    argsTemplate: [
      { name: "url", label: "URL", type: "url", required: true, placeholder: "https://example.com" },
    ],
    buildArgs: (f) => ["-sSI", "-A", "Mozilla/5.0 SecToolbox", f.url],
  },
  {
    slug: "curl-redirect-trace",
    binary: "curl",
    description: "查看完整重定向链（--write-out）",
    timeoutMs: 15000,
    argsTemplate: [
      { name: "url", label: "URL", type: "url", required: true, placeholder: "https://bit.ly/example" },
    ],
    buildArgs: (f) => [
      "-sSL", "-A", "Mozilla/5.0 SecToolbox",
      "-w", "%{url_effective} -> HTTP %{http_code} (%{time_total}s)\n",
      "-o", "/dev/null", f.url,
    ],
  },
  {
    slug: "wget-save",
    binary: "wget",
    description: "下载页面到 /tmp（只读 GET）",
    timeoutMs: 20000,
    argsTemplate: [
      { name: "url", label: "URL", type: "url", required: true, placeholder: "https://example.com" },
    ],
    buildArgs: (f) => ["-q", "-O", "/tmp/sectoolbox-dl", "-U", "SecToolbox/1.0", f.url],
  },
  {
    slug: "openssl-sni",
    binary: "openssl",
    description: "TLS SNI 握手 — 读取证书 + ALPN + CT",
    timeoutMs: 15000,
    argsTemplate: [
      { name: "host", label: "主机", type: "host", required: true, placeholder: "example.com" },
      { name: "port", label: "端口", type: "port", required: false, placeholder: "443", default: "443" },
    ],
    buildArgs: (f) => [
      "s_client", "-servername", f.host, "-connect", `${f.host}:${f.port}`,
      "-brief", "-no_ign_eof",
    ],
  },
  {
    slug: "openssl-ciphers",
    binary: "openssl",
    description: "列服务器支持的 TLS 加密套件",
    timeoutMs: 15000,
    argsTemplate: [
      { name: "host", label: "主机", type: "host", required: true, placeholder: "example.com" },
      { name: "port", label: "端口", type: "port", required: false, placeholder: "443", default: "443" },
    ],
    buildArgs: (f) => [
      "s_client", "-servername", f.host, "-connect", `${f.host}:${f.port}`,
      "-cipher", "ALL:COMPLEMENTOFALL", "-no_ign_eof", "</dev/null",
    ],
  },
  {
    slug: "tls-version-scan",
    binary: "openssl",
    description: "依次探测 TLS 1.0 / 1.1 / 1.2 / 1.3 是否支持",
    timeoutMs: 30000,
    argsTemplate: [
      { name: "host", label: "主机", type: "host", required: true, placeholder: "example.com" },
      { name: "port", label: "端口", type: "port", required: false, placeholder: "443", default: "443" },
    ],
    buildArgs: () => ["version"],
  },
  {
    slug: "traceroute-as",
    binary: "traceroute",
    description: "路由追踪（不解析 AS — 无权限数据）",
    timeoutMs: 60000,
    argsTemplate: [
      { name: "host", label: "主机", type: "host", required: true, placeholder: "example.com" },
    ],
    buildArgs: (f) => ["-I", "-m", "20", f.host],
  },
  {
    slug: "ping-count",
    binary: "ping",
    description: "发指定数量包（默认 4）",
    timeoutMs: 10000,
    argsTemplate: [
      { name: "host", label: "主机", type: "host", required: true, placeholder: "example.com" },
      { name: "count", label: "包数", type: "port", required: false, default: "4" },
    ],
    buildArgs: (f) => ["-c", f.count, f.host],
  },
  {
    slug: "tcp-connect",
    binary: "bash",
    description: "TCP 三次握手探测（用 /dev/tcp 内建）",
    timeoutMs: 5000,
    argsTemplate: [
      { name: "host", label: "主机", type: "host", required: true, placeholder: "example.com" },
      { name: "port", label: "端口", type: "port", required: true, placeholder: "443" },
    ],
    buildArgs: (f) => [
      "-c",
      `timeout 3 bash -c '</dev/tcp/${f.host}/${f.port}' && echo OPEN || echo CLOSED`,
    ],
  },
  {
    slug: "http-server",
    binary: "curl",
    description: "下载 HTTP 响应头 + 状态行",
    timeoutMs: 12000,
    argsTemplate: [
      { name: "url", label: "URL", type: "url", required: true, placeholder: "https://example.com" },
    ],
    buildArgs: (f) => ["-sS", "-o", "/dev/null", "-w", "HTTP/%{http_version} %{http_code} %{redirect_url}\n", "-A", "SecToolbox/1.0", f.url],
  },
  {
    slug: "http-time",
    binary: "curl",
    description: "测量首屏时间（time_starttransfer）",
    timeoutMs: 20000,
    argsTemplate: [
      { name: "url", label: "URL", type: "url", required: true, placeholder: "https://example.com" },
    ],
    buildArgs: (f) => [
      "-sS", "-o", "/dev/null",
      "-w", "ttfb=%{time_starttransfer}s  total=%{time_total}s\n",
      "-A", "SecToolbox/1.0", f.url,
    ],
  },
  {
    slug: "ipinfo-text",
    binary: "curl",
    description: "从 ipinfo.io 取公网 IP / ASN / 地理位置（无 key）",
    timeoutMs: 15000,
    argsTemplate: [],
    buildArgs: () => ["-sS", "https://ipinfo.io/json"],
  },
];

export function executorBySlug(slug: string): ExecutorSpec | undefined {
  return EXECUTORS.find((e) => e.slug === slug);
}

export const EXECUTOR_SLUGS = EXECUTORS.map((e) => e.slug);

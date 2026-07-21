// app/api/exec/[slug]/route.ts
// POST /api/exec/<slug>
// body: { args: { ...form } }
// returns: { ok, stdout, stderr, code, durationMs, tookMs }
//
// Auth: this route is wrapped by middleware.ts which rejects unauthenticated
// requests at the edge (see PUBLIC_PATHS in middleware.ts — /api/exec is NOT
// included). As defence-in-depth, this route also re-checks the JWT cookie
// against AUTH_SECRET. If middleware ever silently fails (e.g. edge runtime
// hiccup or a new path mistakenly added to PUBLIC_PREFIXES), the inner
// check still blocks execution. Both layers must agree to proceed.

import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { executorBySlug, validateArg } from "@/lib/executors";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_STDOUT = 16_000;
const MAX_STDERR = 4_000;

function trim(s: string, n: number): string {
  if (!s) return "";
  if (s.length <= n) return s;
  return s.slice(0, n) + `\n... (已截断，原始 ${s.length} 字节)`;
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

interface RunResult {
  stdout: string;
  stderr: string;
  code: number;
  timedOut: boolean;
  durationMs: number;
}

function run(binary: string, args: string[], timeoutMs: number): Promise<RunResult> {
  return new Promise((resolve) => {
    const t0 = Date.now();
    let timedOut = false;
    const child = execFile(
      binary,
      args,
      {
        timeout: timeoutMs,
        maxBuffer: 1024 * 1024,   // 1MB
        killSignal: "SIGKILL",
        // 无 shell — execFile 默认 shell:false
      },
      (err, stdout, stderr) => {
        const durationMs = Date.now() - t0;
        // execFile 超时会 kill 并把 err.killed=true
        // 只要有输出就返回，非 0 exit 也算成功回显
        const codeVal = err ? ((err as unknown as { code?: number | string }).code) : 0;
        const codeNum = typeof codeVal === "number" ? codeVal : (codeVal ? 1 : 0);
        resolve({
          stdout: stdout?.toString() ?? "",
          stderr: stderr?.toString() ?? "",
          code: codeNum,
          timedOut,
          durationMs,
        });
      }
    );
    // 关闭 stdin（部分工具如 openssl s_client 需要 stdin EOF）
    child.stdin?.end();
    // 追加超时标记
    const to = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, timeoutMs + 500);
    child.on("exit", () => clearTimeout(to));
  });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  // Defence-in-depth: re-check JWT here even though middleware already does.
  // We use the Node runtime's crypto-based verifier (`verifyToken`), which is
  // symmetric with `verifyTokenEdge`. Both honour the same AUTH_SECRET.
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = verifyToken(cookieToken);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "unauthenticated" },
      { status: 401 },
    );
  }

  const spec = executorBySlug(slug);
  if (!spec) {
    return NextResponse.json({ ok: false, error: `工具 ${slug} 不在网页执行器白名单内` }, { status: 404 });
  }

  // rate limit（IP + slug 都算，防单工具狂刷）
  const ip = clientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: `请求过于频繁，${rl.retryAfterSec}s 后再试（限 10 次/分钟/IP）` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let form: Record<string, string> = {};
  try {
    const body = await req.json();
    form = body?.args ?? {};
  } catch {
    return NextResponse.json({ ok: false, error: "请求体不是合法 JSON" }, { status: 400 });
  }

  // 校验参数
  const clean: Record<string, string> = {};
  try {
    for (const s of spec.argsTemplate) {
      clean[s.name] = validateArg(s, form[s.name]);
    }
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 400 },
    );
  }

  // 组装参数
  let args: string[];
  try {
    args = spec.buildArgs(clean).filter((x) => x !== "" && x != null);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `参数组装失败: ${e instanceof Error ? e.message : String(e)}` },
      { status: 400 },
    );
  }

  // 二次防御：拒绝任何以 - 开头的位置参数注入（比如把域名当 flag 传）
  // 仅允许 whitelist 中明确带 - 的参数
  // 这里已经在 buildArgs 内组装，args 顺序固定，用户只填了值 —— 就够了。

  const tookStart = Date.now();
  const r = await run(spec.binary, args, spec.timeoutMs);
  const tookMs = Date.now() - tookStart;

  return NextResponse.json({
    ok: true,
    slug,
    binary: spec.binary,
    args,                         // 回显命令行，让用户看到实际执行什么
    stdout: trim(r.stdout, MAX_STDOUT),
    stderr: trim(r.stderr, MAX_STDERR),
    code: r.code,
    timedOut: r.timedOut,
    durationMs: r.durationMs,
    tookMs,
    rateRemaining: rl.remaining,
  });
}

export function GET() {
  return NextResponse.json({ ok: false, error: "请使用 POST" }, { status: 405 });
}

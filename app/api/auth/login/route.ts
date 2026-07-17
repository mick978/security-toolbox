import { NextResponse, type NextRequest } from "next/server";
import { verifyCredentials, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let user: string, pass: string, next: string;
  try {
    const body = await req.json();
    user = String(body.user || "").trim();
    pass = String(body.pass || "");
    next = typeof body.next === "string" ? body.next : "/";
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!user || !pass) {
    return NextResponse.json({ error: "missing credentials" }, { status: 400 });
  }

  const verified = verifyCredentials(user, pass);
  if (!verified) {
    // 恒定延迟，防止暴力破解时序探测
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const token = signToken(verified);
  const ttlH = Number(process.env.AUTH_TTL_HOURS) || 168;

  // 兜底：若 next 是外链或不以 / 开头，回首页
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const res = NextResponse.json({ ok: true, user: verified, next: safeNext });
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.AUTH_COOKIE_INSECURE !== "1",
    path: "/",
    maxAge: ttlH * 3600,
  });
  return res;
}

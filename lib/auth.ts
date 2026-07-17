/**
 * B1 零依赖登录：HMAC-SHA256 签名的 cookie session
 *
 * 环境变量：
 *   AUTH_USERS=admin:密码1,guest:密码2   （逗号分隔多用户，冒号分隔用户:密码）
 *   AUTH_SECRET=一段长随机字符串         （用于 HMAC 签名，务必改）
 *   AUTH_TTL_HOURS=168                    （可选，session 有效期小时，默认 7 天）
 */
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "sectbx_auth";
const DEFAULT_TTL_HOURS = 168; // 7 天

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET 未设置或长度不足 16 字符");
  }
  return s;
}

function getTtlMs(): number {
  const h = Number(process.env.AUTH_TTL_HOURS) || DEFAULT_TTL_HOURS;
  return h * 3600 * 1000;
}

/** 解析 AUTH_USERS 环境变量为 { user: password } 映射 */
function getUsers(): Record<string, string> {
  const raw = process.env.AUTH_USERS || "";
  const out: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const [u, p] = pair.split(":");
    if (u && p) out[u.trim()] = p.trim();
  }
  return out;
}

/** 校验用户名+密码，成功返回用户名，失败 null */
export function verifyCredentials(user: string, pass: string): string | null {
  const users = getUsers();
  const expected = users[user];
  if (!expected) return null;
  // 恒定时间比较，防止时序侧信道
  const a = Buffer.from(pass);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? user : null;
}

/** base64url 编解码 */
function b64uEncode(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64uDecode(s: string): Buffer {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

/** 签发 session token：payload = { u, exp } */
export function signToken(user: string): string {
  const payload = { u: user, exp: Date.now() + getTtlMs() };
  const payloadB64 = b64uEncode(JSON.stringify(payload));
  const sig = createHmac("sha256", getSecret()).update(payloadB64).digest();
  return `${payloadB64}.${b64uEncode(sig)}`;
}

/** 校验 token，成功返回用户名，失败 null */
export function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  const expectedSig = createHmac("sha256", getSecret()).update(payloadB64).digest();
  const providedSig = b64uDecode(sigB64);
  if (expectedSig.length !== providedSig.length) return null;
  if (!timingSafeEqual(expectedSig, providedSig)) return null;

  try {
    const payload = JSON.parse(b64uDecode(payloadB64).toString("utf8"));
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return typeof payload.u === "string" ? payload.u : null;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;

/**
 * Edge runtime 版 token 校验（Web Crypto API）
 * 仅供 middleware.ts 使用；服务端逻辑用 lib/auth.ts
 */

export const AUTH_COOKIE_NAME = "sectbx_auth";

function b64uDecodeToBytes(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function b64uDecodeToString(s: string): string {
  return new TextDecoder().decode(b64uDecodeToBytes(s));
}

function timingSafeEq(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyTokenEdge(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) return null;

  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64))
  );
  const provided = b64uDecodeToBytes(sigB64);
  if (!timingSafeEq(expected, provided)) return null;

  try {
    const payload = JSON.parse(b64uDecodeToString(payloadB64));
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return typeof payload.u === "string" ? payload.u : null;
  } catch {
    return null;
  }
}

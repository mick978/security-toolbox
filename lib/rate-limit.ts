// lib/rate-limit.ts
// 极简内存滑动窗 rate limit（单进程有效；集群/Serverless 不适用，本项目单实例足够）

interface Bucket {
  hits: number[];    // 时间戳数组（ms）
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_HITS  = 10;

export function checkRateLimit(key: string): { ok: boolean; retryAfterSec: number; remaining: number } {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) { b = { hits: [] }; buckets.set(key, b); }
  // drop expired
  b.hits = b.hits.filter((t) => now - t < WINDOW_MS);
  if (b.hits.length >= MAX_HITS) {
    const oldest = b.hits[0];
    return { ok: false, retryAfterSec: Math.ceil((WINDOW_MS - (now - oldest)) / 1000), remaining: 0 };
  }
  b.hits.push(now);
  return { ok: true, retryAfterSec: 0, remaining: MAX_HITS - b.hits.length };
}

// 定期清扫，避免内存泄漏
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) {
      v.hits = v.hits.filter((t) => now - t < WINDOW_MS);
      if (v.hits.length === 0) buckets.delete(k);
    }
  }, WINDOW_MS).unref?.();
}

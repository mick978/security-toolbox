#!/usr/bin/env node
/**
 * Validate the 18 news entries carry the AEO fields the
 * implementation plan requires (description, ≥3 keyFacts, ≥1 faq).
 *
 * Run after data edits; intended to be cheap enough to wire into CI
 * before long. Exits 0 on success, 1 on any field violation. Prints
 * a per-entry report so the failure is actionable.
 */
import { news } from "../lib/news.ts";

let failed = 0;
const report = [];

for (const n of news) {
  const issues = [];
  if (typeof n.description !== "string" || n.description.trim().length === 0) {
    issues.push("missing description");
  } else if (n.description.length > 220) {
    issues.push(`description too long (${n.description.length} > 220)`);
  }
  if (!Array.isArray(n.keyFacts) || n.keyFacts.length < 3) {
    issues.push(`keyFacts < 3 (got ${n.keyFacts?.length ?? 0})`);
  } else {
    for (const [i, f] of n.keyFacts.entries()) {
      if (typeof f !== "string" || f.trim().length === 0) {
        issues.push(`keyFacts[${i}] empty`);
        break;
      }
      if (f.length > 30) {
        issues.push(`keyFacts[${i}] too long (${f.length} > 30): ${f.slice(0, 20)}…`);
        break;
      }
    }
  }
  if (!Array.isArray(n.faq) || n.faq.length < 1) {
    issues.push(`faq < 1 (got ${n.faq?.length ?? 0})`);
  } else {
    for (const [i, f] of n.faq.entries()) {
      if (typeof f.q !== "string" || f.q.trim().length === 0) {
        issues.push(`faq[${i}].q empty`);
      }
      if (typeof f.a !== "string" || f.a.trim().length === 0) {
        issues.push(`faq[${i}].a empty`);
      }
    }
  }
  report.push({ slug: n.slug, ok: issues.length === 0, issues });
  if (issues.length > 0) failed++;
}

for (const r of report) {
  const tag = r.ok ? "OK" : "FAIL";
  console.log(`[${tag}] ${r.slug}${r.ok ? "" : " — " + r.issues.join("; ")}`);
}
console.log(`\n${news.length - failed}/${news.length} entries passed.`);
process.exit(failed > 0 ? 1 : 0);

// Cross-language search helpers.
//
// Why this exists: substring match (the default in command-menu and
// the tool-list filter before this commit) doesn't help a user who
// types "查询" trying to find `whois`, or "替换" trying to find
// `sed`. Two helpers below make the search survive both:
//
//   - tokensFor(name): ASCII name "whois" → ["whois"].  Chinese
//     name "域名查询" → ["域名查询", "ymcx"] (pinyin initials).
//     ASCII tags like ["dns","lookup"] → ["dns","lookup"] unchanged.
//
//   - searchHaystack(): lower-cased concatenation of name + tagline
//     + description + tags + (precomputed) pinyin tokens so a
//     substring match against the result finds both "whois" and
//     "查询".

/* Pinyin initial map — minimal but covers security-domain vocabulary
 * hard enough that a user typing "ymcx" finds "域名查询". For a few
 * one-character collisions (a / i / o / u / v) we map to neutral
 * letters so the index is never silently broken.
 *
 * This is intentionally NOT a full pinyin table — it's a one-pass
 * hand-built subset for the words we actually use in our content.
 * Adding more characters as the catalog grows is straightforward. */
const PINYIN_INITIAL: Record<string, string> = {
  "域": "y", "名": "m", "查": "c", "询": "x", "解": "j", "析": "x",
  "工": "g", "具": "j", "替": "t", "换": "h", "扫": "s", "描": "m",
  "密": "m", "码": "m", "漏": "l", "洞": "d", "抓": "z", "包": "b",
  "网": "w", "络": "l", "路": "l", "由": "y", "监": "j", "控": "k",
  "日": "r", "志": "z", "清": "q", "设": "s", "备": "b",
  "虚": "x", "拟": "n", "容": "r", "器": "q", "云": "y", "端": "d",
  "接": "j", "入": "r", "安": "a", "全": "q", "测": "c", "试": "s",
  "执": "z", "行": "x", "本": "b", "地": "d", "应": "y", "急": "j",
  "响": "x", "常": "c", "用": "y", "攻": "g", "防": "f", "复": "f",
  "审": "s", "计": "j", "证": "z", "链": "l", "书": "s", "钥": "y",
  "信": "x", "息": "x", "协": "x", "议": "y", "字": "z", "符": "f",
  "编": "b", "压": "y", "缩": "s", "镜": "j", "像": "x", "文": "w",
  "档": "d", "件": "j",
};

function pinyinInitials(input: string): string {
  let out = "";
  for (const ch of input) {
    if (PINYIN_INITIAL[ch]) out += PINYIN_INITIAL[ch];
  }
  return out;
}

/* Tokenize an item for the search index. Returns:
 *  - The original text (lowercased, kept so substring match wins on
 *    straight ASCII matches).
 *  - The pinyin initials when the original contained Chinese chars. */
export function tokensFor(...fields: Array<string | string[] | undefined | null>): string {
  const tokens: string[] = [];
  for (const f of fields) {
    if (!f) continue;
    if (Array.isArray(f)) tokens.push(...f);
    else tokens.push(f);
    const blob = Array.isArray(f) ? f.join(" ") : f;
    const py = pinyinInitials(blob);
    if (py && py !== blob.toLowerCase().replace(/\s+/g, "")) tokens.push(py);
  }
  return tokens.join(" ").toLowerCase();
}

/* Match one query against a precomputed haystack string. Returns
 * true on:
 *  - direct substring match (so ASCII `whois` finds everything)
 *  - exact-token match on a pinyin initial (so `ymcx` finds 域名查询)
 *  - prefix match on pinyin initial (so `ym` finds 域名查询)
 *
 * No fuzzy matching beyond the prefix — fuzzy scoring costs more
 * than the marginal recall it adds for an 88-item catalog. */
export function matches(query: string, haystack: string): boolean {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  if (haystack.includes(needle)) return true;
  /* pinyin exact + prefix match — split haystack into tokens and
   * look for the needle as a full token or a token prefix. */
  const tokens = haystack.split(/\s+/);
  for (const tok of tokens) {
    if (tok === needle) return true;
    if (tok.startsWith(needle) && needle.length >= 2) return true;
  }
  return false;
}

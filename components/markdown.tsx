import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GitHubProject } from "@/lib/github-projects";

interface MarkdownProps {
  source: string;
  project: GitHubProject;
}

function rawBase(p: GitHubProject): string {
  return `https://raw.githubusercontent.com/${p.owner}/${p.repo}/${p.defaultBranch}/`;
}

function blobBase(p: GitHubProject): string {
  return `https://github.com/${p.owner}/${p.repo}/blob/${p.defaultBranch}/`;
}

function resolveAsset(p: GitHubProject, url: string, base: string = rawBase(p)): string {
  if (!url) return url;
  if (/^(https?:|data:||#|\/\/)/i.test(url)) return url;
  if (url.startsWith("/")) return blobBase(p) + url.replace(/^\/+/, "");
  // treat as relative to repo root
  return base + url.replace(/^\.\//, "");
}

/**
 * Strip the decorative "badge banners" that nearly every GitHub README opens
 * with — the `<p align="center">` blocks containing `<img src="…shields.io…">`
 * badges. react-markdown's CommonMark parser drops unknown HTML blocks as
 * plain text (so we end up rendering the raw `<p …>` markup on the page),
 * and even if we wire rehype-raw the badges add no value to a security
 * cheatsheet. We trim the first contiguous run of such paragraphs instead of
 * all `<p align>` tags so legitimate ones deeper in a README are preserved.
 */
function stripBannerBlocks(src: string): string {
  // Drop `<p align="center">…</p>` and `<div align="center">…</div>` blocks
  // wherever they appear in the README. We keep a contiguous run scan so
  // legitimate `<p align="…">` paragraphs that wrap actual prose paragraphs
  // (rare) survive once we hit a non-banner tag — but in practice GitHub
  // READMEs lean heavily on banner-shaped HTML, so the simpler "drop all
  // matched banner pairs" rule covers both the opening badges and the
  // "please star this repo" closer without false positives.
  const pairRe = new RegExp(
    '<(?:p|div)\\b[^>]*align\\s*=\\s*["\']?center["\']?[^>]*>' +
      '[\\s\\S]*?<\\/(?:p|div)>',
    'gi',
  );
  return src.replace(pairRe, '');
}

/**
 * Trim the contiguous run of `<p align="center">…</p>` or
 * `<div align="center">…</div>` blocks at the top of the README.
 *
 * Most GitHub READMEs open with a centered logo + shields.io badge banner.
 * react-markdown's CommonMark parser leaves unknown HTML blocks as plain
 * text, which renders the raw `<p …>` markup on the page. Stripping these
 * banners (a) is invisible to readers because they're decorative, and
 * (b) makes the actual README content render from the first heading.
 *
 * Non-greedy match per block; stop when we hit a non-banner line so a
 * stray mid-file `<p align="center">…</p>` is left alone.
 */
function stripBadgeBanner(src: string): string {
  const blockRe = new RegExp(
    '^\\s*<(?:p|div)\\b[^>]*align\\s*=\\s*["\']?center["\']?[^>]*>' +
      '[\\s\\S]*?<\\/(?:p|div)>\\s*',
    'i',
  );
  let out = src;
  for (let i = 0; i < 20 && blockRe.test(out); i++) {
    out = out.replace(blockRe, '');
  }
  return out.trimStart();
}

export function Markdown({ source, project }: MarkdownProps) {
  // Strip both the opening badge banner and any lingering centered block
  // (e.g. closing "please star this repo" wrappers) before rendering.
  const cleaned = stripBadgeBanner(stripBannerBlocks(source ?? ""));
  return (
    <div className="prose dark:prose-invert max-w-none
      prose-headings:font-semibold
      prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4 prose-h1:border-b prose-h1:border-border/50 prose-h1:pb-2
      prose-h2:text-xl prose-h2:mt-7 prose-h2:mb-3
      prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2
      prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
      prose-code:rounded prose-code:bg-secondary/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-foreground prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-secondary/40 prose-pre:text-foreground prose-pre:border prose-pre:border-border/60 prose-pre:shadow-sm
      prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-foreground/90
      prose-img:rounded-lg prose-img:border prose-img:border-border/60 prose-img:shadow-sm
      prose-table:border-collapse prose-th:border prose-th:border-border/60 prose-th:bg-secondary/40 prose-td:border prose-td:border-border/60
      prose-ul:my-4 prose-li:my-1
      prose-strong:text-foreground prose-strong:font-semibold">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href ? resolveAsset(project, href, blobBase(project)) : undefined} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src ? resolveAsset(project, src) : undefined} alt={alt ?? ""} loading="lazy" />
          ),
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ArticleMarkdown - lightweight renderer for the news/blog article body.
 *
 * Sibling to <Markdown /> in components/markdown.tsx, but WITHOUT that
 * component's GitHubProject coupling (the README resolver / banner
 * stripping logic makes no sense for authored articles). Blog bodies are
 * self-contained markdown authored in lib/news.ts, so all we need is
 * react-markdown + GFM tables + the same prose styling recipe.
 *
 * External links open in a new tab with safe rel, since article links
 * point at sources / references outside the app. */

export function ArticleMarkdown({ source }: { source: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none
      prose-headings:font-semibold prose-headings:scroll-mt-20
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
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {source ?? ""}
      </ReactMarkdown>
    </div>
  );
}

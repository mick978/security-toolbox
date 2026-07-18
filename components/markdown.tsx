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
  if (/^(https?:|data:|mailto:|#|\/\/)/i.test(url)) return url;
  if (url.startsWith("/")) return blobBase(p) + url.replace(/^\/+/, "");
  // treat as relative to repo root
  return base + url.replace(/^\.\//, "");
}

export function Markdown({ source, project }: MarkdownProps) {
  return (
    <div className="prose prose-invert max-w-none
      prose-headings:font-semibold
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-code:rounded prose-code:bg-secondary/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-secondary/40 prose-pre:border prose-pre:border-border/60
      prose-img:rounded-lg prose-img:border prose-img:border-border/60
      prose-table:border-collapse prose-th:border prose-th:border-border/60 prose-td:border prose-td:border-border/60">
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
        {source}
      </ReactMarkdown>
    </div>
  );
}
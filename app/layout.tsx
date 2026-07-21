import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { MobileToolbar } from "@/components/mobile-toolbar";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { Shield, Github, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "SecToolbox · 网络安全排查工具集",
  description: "命令、示例、一键复制 —— 面向 DevOps / SRE / 安全工程师的网络安全排查工具速查手册。",
};

// Mobile-first viewport. Without this the layout assumes 980px desktop width
// on phones and content overflows horizontally. themeColor matches the dark
// background so the address bar doesn't flash white on iOS Safari.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sectoolbox.dev";
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* Inter / Fira Code / Inter Tight — preconnect cuts first-paint
            by ~200ms. Inter Tight is the optical-size variant that gives
            large headings a more confident silhouette (ao.aiolaola.com style). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&family=Inter+Tight:wght@600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* No-flash theme bootstrap. Runs synchronously before paint so dark
            / light + accent + text-color resolve before the first frame.
            Reads the same 7 localStorage keys (sectoolbox.theme,
            sectoolbox.accent, sectoolbox.text, sectoolbox.fontFamily,
            sectoolbox.fontSize, sectoolbox.animations, sectoolbox.radius)
            as lib/theme.ts so the persisted preference is honored before
            React hydration runs. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var t = localStorage.getItem('sectoolbox.theme');
                  var a = localStorage.getItem('sectoolbox.accent');
                  var x = localStorage.getItem('sectoolbox.text');
                  var f = localStorage.getItem('sectoolbox.fontFamily');
                  var s = localStorage.getItem('sectoolbox.fontSize');
                  var an = localStorage.getItem('sectoolbox.animations');
                  var r = localStorage.getItem('sectoolbox.radius');
                  var eff = (t === 'light' || (t === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches)) ? 'light' : 'dark';
                  var html = document.documentElement;
                  html.classList.toggle('dark', eff === 'dark');
                  if (a) html.dataset.accent = a;
                  html.dataset.text = x || 'default';
                  html.dataset.font = f || 'sans';
                  html.dataset.size = s || 'medium';
                  html.dataset.animations = an || 'on';
                  html.dataset.radius = r || 'soft';
                  var fontStacks = {
                    sans: '"Inter","SF Pro Display",-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif',
                    serif: 'ui-serif,Georgia,Cambria,"Times New Roman","Songti SC",serif',
                    mono: 'ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace'
                  };
                  var sizeMap = { small: '14px', medium: '16px', large: '18px' };
                  html.style.fontFamily = fontStacks[f || 'sans'];
                  html.style.fontSize = sizeMap[s || 'medium'];
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* Structured data — keeps search engines from treating us
            as a faceless SPA. SoftwareApplication schema for the
            whole site, plus Organization for the brand profile
            next to the search result. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${siteUrl}/#organization`,
                  name: "SecToolbox",
                  url: siteUrl,
                  description: "面向工程师的网络安全排查手册",
                  sameAs: ["https://github.com/mick978/security-toolbox"],
                },
                {
                  "@type": "WebSite",
                  "@id": `${siteUrl}/#website`,
                  url: siteUrl,
                  name: "SecToolbox",
                  inLanguage: "zh-CN",
                  publisher: { "@id": `${siteUrl}/#organization` },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/tools?q={search_term_string}` },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "SoftwareApplication",
                  name: "SecToolbox",
                  applicationCategory: "DeveloperApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: 0, priceCurrency: "CNY" },
                  url: siteUrl,
                  description: "免费开源 · 网络安全排查手册",
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        {/* Skip link — visible only when focused (e.g. when a keyboard user
          tabs in). Goes straight to the <main> landmark so users don't
          have to tab past the header / nav. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          跳到正文
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile bottom tab bar — hidden md+; pb-20 above keeps page
            content from being covered by the 56px bar + safe-area inset. */}
        <MobileToolbar />

        {/* Footer - ao.aiolaola.com style */}
        <footer className="border-t border-border/60 mt-24">
          <div className="container py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Brand */}
              <div>
                <Link href="/" className="flex items-center gap-2 font-semibold mb-4 text-gradient text-xl">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <span>SecToolbox</span>
                </Link>
                <p className="text-sm text-muted-foreground mb-4">
                  面向工程师的网络安全排查手册。
                </p>
                <p className="text-xs text-muted-foreground">
                  所有扫描 / 渗透类工具仅限对拥有明确授权的目标使用。
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-semibold mb-4">产品</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors">
                      工具库
                    </Link>
                  </li>
                  <li>
                    <Link href="/cheatsheet" className="text-muted-foreground hover:text-foreground transition-colors">
                      排查案例
                    </Link>
                  </li>
                  <li>
                    <Link href="/ip-intel" className="text-muted-foreground hover:text-foreground transition-colors">
                      IP 情报查询
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-semibold mb-4">资源</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      GitHub 仓库
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors">
                      全部工具
                    </Link>
                  </li>
                  <li>
                    <Link href="/cheatsheet" className="text-muted-foreground hover:text-foreground transition-colors">
                      排查速查
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Community */}
              <div>
                <h4 className="font-semibold mb-4">社区</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      提 Issue
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      Star on GitHub
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-12 pt-6 border-t border-border/60 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground">
                © SecToolbox · 面向工程师的网络安全排查手册
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  v0.1 · 最近更新 2026-07
                </span>
                <a
                  href="https://github.com/mick978/security-toolbox/blob/main/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
                >
                  更新日志
                </a>
                <span>MIT License</span>
              </div>
            </div>
          </div>
        </footer>

        <Toaster />
      </body>
    </html>
  );
}
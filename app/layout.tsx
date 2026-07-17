import type { Metadata } from "next";
import "./globals.css";
import { HeaderWrapper } from "@/components/header-wrapper";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "SecToolbox · 网络安全排查工具集",
  description: "命令、示例、一键复制 —— 面向 DevOps / SRE / 安全工程师的网络安全排查工具速查手册。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <HeaderWrapper />
        <main>{children}</main>
        <footer className="border-t border-border/60 mt-24 py-10 text-center text-sm text-muted-foreground">
          <p>
            SecToolbox · 面向工程师的网络安全排查手册 ·
            <a href="https://github.com" className="hover:text-primary ml-1">MIT</a>
          </p>
          <p className="mt-2 text-xs">
            所有扫描 / 渗透类工具仅限对拥有明确授权的目标使用。
          </p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}

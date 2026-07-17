import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "SecToolbox · 网络安全排查工具集",
  description: "命令、示例、一键复制 —— 面向 DevOps / SRE / 安全工程师的网络安全排查工具速查手册。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}

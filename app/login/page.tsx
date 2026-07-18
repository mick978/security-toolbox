"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, Loader2, ShieldCheck, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState("/");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setNext(sp.get("next") || "/");
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass, next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error === "invalid credentials" ? "用户名或密码错误" : "登录失败");
        setLoading(false);
        return;
      }
      window.location.href = data.next || "/";
    } catch {
      setErr("网络错误，请重试");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Site-style gradient backdrop */}
      <div className="absolute inset-0 hero-gradient opacity-60" aria-hidden="true" />
      <div className="absolute inset-0 grid-bg opacity-20" aria-hidden="true" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Brand header — matches /mcp and /agents hero */}
        <div className="text-center mb-6 space-y-3">
          <div className="flex justify-center">
            <Badge className="border-primary/40 text-primary bg-primary/10">
              <ShieldCheck className="h-3 w-3 mr-1" />
              SecToolbox · 授权访问
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            网络运维 <span className="text-primary">&amp; 安全排查</span>
            <br />
            一站式平台
          </h1>
          <p className="text-sm text-muted-foreground">
            请使用授权账号登录以使用工具与速查内容。
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur shadow-2xl shadow-primary/5 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6 text-sm font-medium text-muted-foreground">
            <Lock className="h-4 w-4 text-primary" />
            <span>账号登录</span>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-muted-foreground mb-1.5"
              >
                用户名
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-secondary/40 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/60 focus:bg-secondary/60 transition-colors"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-muted-foreground mb-1.5"
              >
                密码
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-secondary/40 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/60 focus:bg-secondary/60 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {err && (
              <div
                role="alert"
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
              >
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  登录中…
                </>
              ) : (
                "登录"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/40 text-[11px] text-muted-foreground/80 text-center leading-relaxed">
            仅限授权用户使用 · 所有操作将被记录
          </div>
        </div>

        {/* Footer link */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

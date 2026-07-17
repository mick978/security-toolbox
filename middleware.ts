import { NextResponse, type NextRequest } from "next/server";
import { verifyTokenEdge, AUTH_COOKIE_NAME } from "./lib/auth-edge";

// 白名单：登录页 / 登录 API / 静态资源
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 白名单直接放行
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // 静态资源、Next.js 内部路径直接放行（matcher 已过滤大部分，这里兜底）
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/case-images") ||
    /\.(png|jpe?g|gif|svg|ico|webp|css|js|map|txt|xml)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = await verifyTokenEdge(token);
  if (user) return NextResponse.next();

  // API 请求返回 401 JSON
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 页面请求跳转到 /login?next=<原路径>
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // 匹配所有路径，但排除 Next.js 内部和静态文件
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

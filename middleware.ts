import { NextResponse, type NextRequest } from "next/server";
import { verifyTokenEdge, AUTH_COOKIE_NAME } from "./lib/auth-edge";

// === Whitelist ===
// Always-public paths (no login required)
const PUBLIC_PATHS = [
  // Login and auth API
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  // Showcase pages (read-only MCP / Skills / Agents / Network catalog — public)
  "/",
  "/mcp",
  "/agents",
  "/network",
  "/sitemap.xml",
  "/robots.txt",
  "/case-images",
];

// Path-prefix patterns that are public (any sub-path under these is too)
const PUBLIC_PREFIXES = [
  // Skill catalog lives under /mcp?tab=skills and detail at /mcp/[slug]
  "/mcp/",
  "/agents/",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Whitelist exact paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 2) Whitelist prefixes (so /mcp/<slug>, /agents/<slug> are public)
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 3) Next.js internals + static assets (defensive — matcher already filters most)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(png|jpe?g|gif|svg|ico|webp|css|js|map|txt|xml)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 4) Anything else requires auth
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = await verifyTokenEdge(token);
  if (user) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Match all paths, but exclude Next.js internals and static files.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

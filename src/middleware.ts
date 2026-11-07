import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/constants";
import { verifySessionToken } from "@/lib/jwt";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const session = await verifySessionToken(token);
  return Boolean(session);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (pathname.startsWith("/admin")) {
    const isPublic = PUBLIC_ADMIN_PATHS.some(
      (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`),
    );
    if (isPublic) return NextResponse.next();

    if (await hasValidSession(request)) return NextResponse.next();

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  // 公开的只读请求与评论提交、登录不拦截
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return NextResponse.next();
  }
  if (pathname === "/api/comments" && method === "POST") {
    return NextResponse.next();
  }

  if (await hasValidSession(request)) return NextResponse.next();

  return NextResponse.json({ ok: false, error: "未登录或登录已过期" }, { status: 401 });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/posts/:path*",
    "/api/categories/:path*",
    "/api/tags/:path*",
    "/api/comments/:path*",
    "/api/settings/:path*",
    "/api/upload",
    "/api/auth/logout",
  ],
};

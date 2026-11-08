import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/constants";
import { JwtConfigError, verifySessionToken } from "@/lib/jwt";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

type SessionState = { valid: boolean; configError?: string };

async function getSessionState(request: NextRequest): Promise<SessionState> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return { valid: false };

  try {
    const session = await verifySessionToken(token);
    return { valid: Boolean(session) };
  } catch (error) {
    if (error instanceof JwtConfigError) {
      return { valid: false, configError: error.message };
    }
    throw error;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (pathname.startsWith("/admin")) {
    const isPublic = PUBLIC_ADMIN_PATHS.some(
      (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`),
    );
    if (isPublic) return NextResponse.next();

    const state = await getSessionState(request);
    if (state.configError) {
      return new NextResponse(`服务配置错误：${state.configError}`, {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    if (state.valid) return NextResponse.next();

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

  const state = await getSessionState(request);
  if (state.configError) {
    return NextResponse.json({ ok: false, error: state.configError }, { status: 500 });
  }
  if (state.valid) return NextResponse.next();

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
    "/api/admin/comments/:path*",
  ],
};

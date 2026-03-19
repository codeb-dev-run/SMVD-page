import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "auth-token";
const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
);

const LOGIN_PATH = "/admin/login";
const DASHBOARD_PATH = "/admin/dashboard/home";

async function verifyTokenEdge(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET_KEY, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

function checkCsrf(request: NextRequest): NextResponse | null {
  const method = request.method;
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return null;
  }

  // 상태 변경 요청 (POST/PUT/DELETE/PATCH)에 대해 Origin 검증
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin) {
    // Origin 없는 요청은 서버 간 호출일 수 있으므로 Referer로 대체 검증
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        const refererHost = new URL(referer).host;
        if (host && refererHost !== host) {
          return NextResponse.json(
            { error: "CSRF validation failed" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "CSRF validation failed" },
          { status: 403 }
        );
      }
    }
    // Origin과 Referer 모두 없으면 서버 사이드/curl 등 허용 (JWT로 보호됨)
    return null;
  }

  try {
    const originHost = new URL(origin).host;
    if (host && originHost !== host) {
      return NextResponse.json(
        { error: "CSRF validation failed" },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "CSRF validation failed" },
      { status: 403 }
    );
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login: 이미 인증된 사용자는 대시보드로 리다이렉트
  if (pathname === LOGIN_PATH) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      const valid = await verifyTokenEdge(token);
      if (valid) {
        return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
      }
    }
    return NextResponse.next();
  }

  // /admin/* 및 /api/admin/* 보호
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const valid = await verifyTokenEdge(token);
  if (!valid) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // CSRF 검증: 인증된 API 요청에 대해 Origin/Referer 확인
  if (pathname.startsWith("/api/admin")) {
    const csrfError = checkCsrf(request);
    if (csrfError) return csrfError;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

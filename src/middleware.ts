import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const middleware = withAuth(
  function middleware(req) {
    // 관리자 페이지 접근 시 역할 확인
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const token = req.nextauth.token;

      // 관리자 역할 확인
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        // 관리자 경로 접근 시 토큰 확인
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // 관리자 경로 보호 (로그인 페이지 제외)
    "/admin/:path((?!login).*)",
    // API 경로 중 관리자 API 보호
    "/api/admin/:path*",
  ],
};

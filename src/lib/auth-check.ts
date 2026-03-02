import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth/auth";
import { unauthorizedResponse, errorResponse } from "@/lib/api-response";
import { NextResponse } from "next/server";
import { adminRatelimit, getClientIp } from "@/lib/ratelimit";
import { env } from "@/lib/env";

type AuthSuccessResult = {
  authenticated: true;
  session: Awaited<ReturnType<typeof getServerSession<typeof authOptions>>>;
};

type AuthFailureResult = {
  authenticated: false;
  session: null;
  error: NextResponse;
};

export type AuthResult = AuthSuccessResult | AuthFailureResult;

export async function checkAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { authenticated: false, session: null, error: unauthorizedResponse() };
  }

  return { authenticated: true, session };
}

export async function checkAdminAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { authenticated: false, session: null, error: unauthorizedResponse() };
  }

  if (session.user.role !== "admin") {
    return {
      authenticated: false,
      session: null,
      error: errorResponse("관리자 권한이 필요합니다", "FORBIDDEN", 403),
    };
  }

  return { authenticated: true, session };
}

/**
 * Fast admin auth check using JWT token directly.
 * Skips getServerSession overhead — use when middleware already validates the route.
 * Requires the request object to read the JWT cookie.
 */
export async function checkAdminAuthFast(
  request: Request
): Promise<AuthResult> {
  const token = await getToken({
    req: request as Parameters<typeof getToken>[0]["req"],
    secret: env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return { authenticated: false, session: null, error: unauthorizedResponse() };
  }

  if (token.role !== "admin") {
    return {
      authenticated: false,
      session: null,
      error: errorResponse("관리자 권한이 필요합니다", "FORBIDDEN", 403),
    };
  }

  return {
    authenticated: true,
    session: {
      user: {
        id: token.id as string,
        email: token.email as string,
        role: token.role as string,
        name: token.name ?? null,
        image: null,
      },
      expires: new Date(
        (token.exp as number) * 1000
      ).toISOString(),
    },
  };
}

/**
 * Combined admin auth + rate limit check.
 * Use this in admin API routes to enforce both authentication and rate limiting.
 *
 * @param request - The incoming request (used to extract client IP)
 * @returns AuthResult with rate-limit-aware error responses
 */
export async function checkAdminAuthWithRateLimit(
  request: Request
): Promise<AuthResult> {
  // Auth check first (cheaper than rate limit lookup)
  const authResult = await checkAdminAuth();
  if (!authResult.authenticated) return authResult;

  // Rate limit check
  const ip = getClientIp(request);
  const { success } = await adminRatelimit.limit(ip);
  if (!success) {
    return {
      authenticated: false,
      session: null,
      error: errorResponse(
        "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        "RATE_LIMIT_EXCEEDED",
        429
      ),
    };
  }

  return authResult;
}

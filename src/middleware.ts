import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/auth/signin",
  "/auth/signup",
  "/api/auth",
  "/api/health",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const signInUrl = new URL("/auth/signin", request.url);
    if (pathname !== "/") {
      signInUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals, static assets, the auth API, and the file proxy
  // (which has its own access controls in place).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/files|api/auth|robots.txt|sitemap.xml|assets|.*\\..*).*)",
  ],
};

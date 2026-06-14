import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

export const { auth: middlewareAuth } = NextAuth(authConfig);

export default middlewareAuth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const protectedPaths = ["/dashboard", "/events"];
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const needsProfileName =
    !!session?.user?.id && !session.user.name?.trim();
  const profileExemptPaths = [
    "/login/complete-profile",
    "/login",
    "/error",
    "/api/auth",
  ];
  const isProfileExempt = profileExemptPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (needsProfileName && isProtected && !isProfileExempt) {
    const profileUrl = new URL("/login/complete-profile", req.url);
    profileUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(profileUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/events/:path*"],
};

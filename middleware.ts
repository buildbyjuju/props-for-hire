import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isComingSoonEnabled } from "@/lib/coming-soon";

function isStaticAsset(pathname: string) {
  return /\.(png|jpe?g|gif|svg|ico|webp|woff2?|txt|xml)$/i.test(pathname);
}

export function middleware(request: NextRequest) {
  if (!isComingSoonEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    isStaticAsset(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

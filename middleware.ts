import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isInMaintenance() {
  return process.env.MAINTENANCE_MODE === "true";
}

export function middleware(req: NextRequest) {
  const maintenance = isInMaintenance();
  if (!maintenance) return NextResponse.next();

  const { pathname } = req.nextUrl;

  const allowPrefixes = ["/_next", "/api/auth", "/maintenance", "/admin"];
  const allowExact = ["/favicon.ico", "/robots.txt", "/sitemap.xml"];

  if (allowExact.includes(pathname) || allowPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/maintenance";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/:path*"],
};

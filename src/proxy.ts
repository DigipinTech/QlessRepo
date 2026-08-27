import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE, ROLE_HOME_PATH, type StaffRole } from "@/lib/auth/constants";

// Route-prefix -> roles allowed to view it. Checked here for fast redirects;
// every page/route handler also re-checks via requireRole/getSession since
// Proxy coverage can silently drop on a matcher change (Next.js guidance).
const PROTECTED_PREFIXES: Array<{ prefix: string; roles: StaffRole[] }> = [
  { prefix: "/super-admin", roles: ["SUPER_ADMIN"] },
  { prefix: "/admin", roles: ["HOSPITAL_ADMIN"] },
  { prefix: "/doctor", roles: ["DOCTOR"] },
  { prefix: "/reception", roles: ["RECEPTIONIST"] },
];

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = PROTECTED_PREFIXES.find((p) => pathname.startsWith(p.prefix));
  if (!match) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as StaffRole;
    if (!match.roles.includes(role)) {
      return NextResponse.redirect(new URL(ROLE_HOME_PATH[role] ?? "/login", request.url));
    }
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/super-admin/:path*", "/admin/:path*", "/doctor/:path*", "/reception/:path*"],
};

import { auth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "https://www.lattice-protocol.com",
  "https://lattice-protocol.com",
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost:3000",
];

function corsHeadersFor(origin: string | null): Record<string, string> {
  const allowOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : "https://www.lattice-protocol.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

function handleApi(req: NextRequest): NextResponse {
  const origin = req.headers.get("origin");
  const headers = corsHeadersFor(origin);

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers });
  }

  const res = NextResponse.next();
  for (const [k, v] of Object.entries(headers)) {
    res.headers.set(k, v);
  }
  return res;
}

const authMiddleware = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const onboardingCompleted = (req.auth as any)?.onboardingCompleted ?? false;

  if (!isLoggedIn) return NextResponse.next();

  if (!onboardingCompleted && !nextUrl.pathname.startsWith("/onboarding") && !nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  if (onboardingCompleted && nextUrl.pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/home", nextUrl));
  }

  return NextResponse.next();
});

export default function middleware(req: NextRequest, ev: any) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return handleApi(req);
  }
  return (authMiddleware as any)(req, ev);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/workspace/:path*",
    "/publish/:path*",
    "/home/:path*",
    "/onboarding/:path*",
  ],
};

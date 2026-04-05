import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const onboardingCompleted = (req.auth as any)?.onboardingCompleted ?? true;

  // 未ログインは対象外（NextAuthのデフォルト動作に任せる）
  if (!isLoggedIn) return NextResponse.next();

  // オンボーディング未完了 → /onboarding にリダイレクト
  if (!onboardingCompleted && !nextUrl.pathname.startsWith("/onboarding") && !nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  // オンボーディング完了済みで /onboarding にアクセス → /home へ
  if (onboardingCompleted && nextUrl.pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/home", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/workspace/:path*", "/publish/:path*", "/home/:path*", "/onboarding/:path*"],
};

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const userId = request.nextUrl.searchParams.get("state");

  if (!code || !userId) {
    return NextResponse.redirect(
      new URL("/settings?error=gmail_failed", process.env.NEXTAUTH_URL)
    );
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/connections/gmail/callback`,
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      console.error("Gmail token error:", tokens);
      return NextResponse.redirect(
        new URL("/settings?error=gmail_token", process.env.NEXTAUTH_URL)
      );
    }

    const profileRes = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/profile",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const profile = await profileRes.json();

    await prisma.userConnection.deleteMany({
      where: { userId, provider: "gmail" },
    });

    await prisma.userConnection.create({
      data: {
        userId,
        provider: "gmail",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        scope: "gmail.readonly gmail.send",
        metadata: JSON.stringify({
          email: profile.emailAddress || "",
        }),
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
      },
    });

    return NextResponse.redirect(
      new URL("/settings?success=gmail", process.env.NEXTAUTH_URL)
    );
  } catch (error) {
    console.error("Gmail callback error:", error);
    return NextResponse.redirect(
      new URL("/settings?error=gmail_failed", process.env.NEXTAUTH_URL)
    );
  }
}
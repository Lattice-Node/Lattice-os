import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?error=unauthorized`);
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?error=no_code`);
  }

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/connections/discord/callback`,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?error=token_failed`);
    }

    const webhook = tokenData.webhook;
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?error=user_not_found`);
    }

    const existing = await prisma.userConnection.findFirst({
      where: { userId: user.id, provider: "discord" },
    });

    const connectionData = {
      provider: "discord",
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || "",
      scope: tokenData.scope || "",
      metadata: JSON.stringify({
        webhookId: webhook?.id || "",
        webhookUrl: webhook?.url || "",
        webhookChannelId: webhook?.channel_id || "",
        guildId: webhook?.guild_id || "",
        guildName: webhook?.name || "Discord",
      }),
    };

    if (existing) {
      await prisma.userConnection.update({
        where: { id: existing.id },
        data: connectionData,
      });
    } else {
      await prisma.userConnection.create({
        data: { userId: user.id, ...connectionData },
      });
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?connected=discord`);
  } catch {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?error=discord_failed`);
  }
}
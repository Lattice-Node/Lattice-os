import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.plan === "free") {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?error=upgrade`);
  }

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/connections/discord/callback`,
    response_type: "code",
    scope: "webhook.incoming identify",
  });

  return NextResponse.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
}
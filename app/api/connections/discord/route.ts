import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/connections/discord/callback`,
    response_type: "code",
    scope: "identify guilds webhooks.incoming",
  });

  return NextResponse.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
}
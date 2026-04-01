import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ ok: false }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return NextResponse.json({ ok: false }, { status: 404 });

  const { token, platform } = await request.json();
  if (!token) return NextResponse.json({ ok: false }, { status: 400 });

  await prisma.deviceToken.upsert({
    where: { token },
    update: { userId: user.id, platform: platform || "web" },
    create: { userId: user.id, token, platform: platform || "web" },
  });

  return NextResponse.json({ ok: true });
}
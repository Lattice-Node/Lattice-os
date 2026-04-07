import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { addCredits } from "@/lib/credits";

export async function POST(req: Request) {
  const session = await authAny(req);
  if (!session?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  if (!code || typeof code !== "string") return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.email },
    select: { id: true, referredBy: true, createdAt: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.referredBy) return NextResponse.json({ error: "既に招待コードが適用されています" }, { status: 409 });

  const hoursSinceCreation = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation > 24) return NextResponse.json({ error: "招待コードは登録後24時間以内に適用できます" }, { status: 400 });

  const inviter = await prisma.user.findFirst({ where: { referralCode: code.toUpperCase() } });
  if (!inviter) return NextResponse.json({ error: "無効な招待コードです" }, { status: 404 });
  if (inviter.id === user.id) return NextResponse.json({ error: "自分の招待コードは使用できません" }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { referredBy: inviter.id } });
  await prisma.user.update({ where: { id: inviter.id }, data: { referralCount: { increment: 1 } } });
  await addCredits(user.id, 10, "distributed", "referral", inviter.id);

  return NextResponse.json({ success: true, bonus: 10 });
}

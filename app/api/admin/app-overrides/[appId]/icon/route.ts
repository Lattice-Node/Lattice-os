import { NextResponse } from "next/server";
import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ appId: string }> }) {
  const session = await authAny(req);
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  if (user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { appId } = await params;

  await prisma.appOverride.upsert({
    where: { appId },
    create: { appId, iconImageUrl: null },
    update: { iconImageUrl: null },
  });

  return NextResponse.json({ ok: true });
}

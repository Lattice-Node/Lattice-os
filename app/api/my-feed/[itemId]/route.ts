import { NextResponse } from "next/server";
import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await authAny(req);
  if (!session?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;
  const item = await prisma.publicFeedItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.publicFeedItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}

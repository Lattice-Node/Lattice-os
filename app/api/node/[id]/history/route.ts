import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authAny(req);
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const node = await prisma.node.findUnique({ where: { id }, select: { userId: true } }).catch(() => null);
  if (!node || node.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const exchanges = await prisma.nodeExchange.findMany({
    where: { nodeId: id },
    orderBy: { createdAt: "desc" },
    take: 10,
  }).catch(() => []);

  return NextResponse.json({ exchanges });
}

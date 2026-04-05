import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const node = await prisma.node.findUnique({ where: { id }, select: { userId: true } });
  if (!node || node.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await prisma.nodeMessage.findMany({
    where: { nodeId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

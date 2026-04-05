import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const agent = await prisma.userAgent.findUnique({ where: { id }, select: { userId: true } });
  if (!agent || agent.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const logs = await prisma.agentLog.findMany({
    where: { agentId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ logs });
}

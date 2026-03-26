import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const logs = await prisma.agentLog.findMany({
    where: { agentId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ logs });
}
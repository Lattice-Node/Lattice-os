import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const session = await authAny(req);
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.creditTransaction.deleteMany({ where: { userId: user.id } });
  await prisma.taskCompletion.deleteMany({ where: { userId: user.id } });
  await prisma.deviceToken.deleteMany({ where: { userId: user.id } });
  await prisma.linkCode.deleteMany({ where: { userId: user.id } });
  await prisma.userConnection.deleteMany({ where: { userId: user.id } });
  await prisma.agentLog.deleteMany({ where: { userId: user.id } });
  await prisma.userAgent.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ success: true });
}
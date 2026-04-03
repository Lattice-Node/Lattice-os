import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, plan: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.role !== "admin") {
    const agentCount = await prisma.userAgent.count({ where: { userId: user.id } });
    if (user.plan === "free" && agentCount >= 3) {
      return NextResponse.json({ error: "Free plan limit: max 3 agents" }, { status: 403 });
    }
    if ((user.plan === "starter" || user.plan === "personal") && agentCount >= 10) {
      return NextResponse.json({ error: "Starter plan limit: max 10 agents" }, { status: 403 });
    }
  }

  const { agentId } = await req.json();
  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 });
  }

  const source = await prisma.userAgent.findFirst({
    where: { id: agentId, isPublic: true },
  });
  if (!source) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const agent = await prisma.userAgent.create({
    data: {
      userId: user.id,
      name: source.name,
      description: source.description,
      prompt: source.prompt,
      trigger: source.trigger,
      triggerCron: source.triggerCron,
      connections: source.connections,
      outputType: "app",
      outputConfig: "{}",
      originalAuthorId: source.userId,
    },
  });

  await prisma.userAgent.update({
    where: { id: source.id },
    data: { publicUseCount: { increment: 1 } },
  });

  return NextResponse.json({ agent });
}
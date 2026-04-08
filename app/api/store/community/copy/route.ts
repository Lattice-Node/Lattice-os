import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authAny } from "@/lib/auth-any";
import { getPlanLimits } from "@/lib/plan-limits";

function detectRequiredFeatures(text: string) {
  const lower = text.toLowerCase();
  return {
    needsToolUse: lower.includes("fetch_url") || lower.includes("send_gmail"),
    needsGmail: lower.includes("gmail") || lower.includes("未読メール") || lower.includes("メール要約") || lower.includes("メール取得") || lower.includes("メールを取得"),
  };
}

export async function POST(req: Request) {
  const session = await authAny(req);
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.email },
    select: { id: true, plan: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const limits = getPlanLimits(user.plan, user.role);
  const isPaid = user.role === "admin" || limits.toolUse;

  // Phase 1: agent count limit
  if (limits.agentCap !== -1) {
    const agentCount = await prisma.userAgent.count({ where: { userId: user.id } });
    if (agentCount >= limits.agentCap) {
      return NextResponse.json(
        { error: `エージェント上限 (${limits.agentCap}体) に達しました。プランをアップグレードしてください。` },
        { status: 403 }
      );
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

  // Check feature requirements
  const agentText = [source.name, source.description, source.prompt].join(" ");
  const features = detectRequiredFeatures(agentText);

  if (features.needsToolUse && !isPaid) {
    return NextResponse.json({ error: "Tool Use requires Starter plan or above" }, { status: 403 });
  }

  if (features.needsGmail) {
    const gmailConn = await prisma.userConnection.findFirst({
      where: { userId: user.id, provider: "gmail" },
    });
    if (!gmailConn) {
      return NextResponse.json({ error: "Gmail connection required" }, { status: 403 });
    }
  }

  // Copy agent
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

  // Increment use count on source
  await prisma.userAgent.update({
    where: { id: source.id },
    data: { publicUseCount: { increment: 1 } },
  });

  return NextResponse.json({ agent });
}

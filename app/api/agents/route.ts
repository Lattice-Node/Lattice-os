import { NextResponse } from "next/server";

function calcNextRunAt(cronExpr: string): Date | null {
  if (!cronExpr) return null;
  try {
    let h: number, m: number;
    // Support both "HH:MM" and cron "M H * * *" formats
    const hmMatch = cronExpr.match(/^(\d{1,2}):(\d{2})$/);
    if (hmMatch) {
      h = parseInt(hmMatch[1], 10);
      m = parseInt(hmMatch[2], 10);
    } else {
      const parts = cronExpr.trim().split(/\s+/);
      if (parts.length >= 2) {
        m = parseInt(parts[0], 10);
        h = parseInt(parts[1], 10);
      } else {
        return null;
      }
    }
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
    // JST hour h:m → UTC = h-9 (handle day rollover)
    const now = new Date();
    const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const year = jstNow.getUTCFullYear();
    const month = jstNow.getUTCMonth();
    const day = jstNow.getUTCDate();
    let next = new Date(Date.UTC(year, month, day, h - 9, m, 0, 0));
    if (next.getTime() <= now.getTime()) {
      next = new Date(next.getTime() + 24 * 60 * 60 * 1000);
    }
    return next;
  } catch {
    return null;
  }
}
import { prisma } from "@/lib/prisma";
import { authAny } from "@/lib/auth-any";
import { getPlanLimits } from "@/lib/plan-limits";

export async function GET(req: Request) {
  const session = await authAny(req);
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) return NextResponse.json({ agents: [] });

  const agents = await prisma.userAgent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ agents });
}

export async function POST(req: Request) {
  const session = await authAny(req);
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email: session.email, name: session.user.name ?? "" },
    });
  }

  // Phase 1: enforce agent cap from plan-limits (admin bypasses)
  const limits = getPlanLimits(user.plan, user.role);
  if (limits.agentCap !== -1) {
    const agentCount = await prisma.userAgent.count({ where: { userId: user.id } });
    if (agentCount >= limits.agentCap) {
      return NextResponse.json(
        { error: `エージェント上限 (${limits.agentCap}体) に達しました。プランをアップグレードしてください。` },
        { status: 403 }
      );
    }
  }

  const { name, description, prompt, trigger, triggerCron, connections, outputType, outputConfig } = await req.json();
  const nextRunAt = trigger === "schedule" && triggerCron
    ? calcNextRunAt(triggerCron)
    : null;

  const agent = await prisma.userAgent.create({
    data: {
      userId: user.id,
      name,
      description: description ?? "",
      prompt,
      trigger,
      triggerCron: triggerCron ?? "",
      connections: connections ?? "[]",
      outputType: outputType ?? "app",
      outputConfig: outputConfig ?? "{}",
      nextRunAt,
    },
  });
  return NextResponse.json({ agent });
}
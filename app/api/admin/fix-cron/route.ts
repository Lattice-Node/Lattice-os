import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function calcNextRunAt(cronExpr: string): Date | null {
  if (!cronExpr) return null;
  let h: number, m: number;
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
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  // Fix all active scheduled agents
  const agents = await prisma.userAgent.findMany({
    where: { active: true, trigger: "schedule" },
    select: { id: true, triggerCron: true, nextRunAt: true },
  });

  const results = [];
  for (const agent of agents) {
    const newNext = calcNextRunAt(agent.triggerCron || "");
    if (newNext) {
      await prisma.userAgent.update({
        where: { id: agent.id },
        data: { nextRunAt: newNext },
      });
      results.push({
        id: agent.id,
        cron: agent.triggerCron,
        oldNextRunAt: agent.nextRunAt?.toISOString() || null,
        newNextRunAt: newNext.toISOString(),
      });
    }
  }

  return NextResponse.json({ ok: true, fixed: results.length, results });
}

import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";
import { getPlanLimits, isResetDue, startOfCurrentMonth, nextResetDate } from "@/lib/plan-limits";

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) {
    return jsonWithCors(req, { error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        plan: true,
        role: true,
        monthlyRunsUsed: true,
        monthlyRunsResetAt: true,
      },
    });

    if (!user) {
      return jsonWithCors(req, { error: "User not found" }, { status: 404 });
    }

    // Lazy reset if month has rolled over
    let used = user.monthlyRunsUsed;
    const now = new Date();
    if (isResetDue(user.monthlyRunsResetAt, now)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          monthlyRunsUsed: 0,
          monthlyRunsResetAt: startOfCurrentMonth(now),
        },
      });
      used = 0;
    }

    const limits = getPlanLimits(user.plan, user.role);
    const cap = limits.monthlyRunsCap;
    const nextReset = nextResetDate(now);

    return jsonWithCors(req, {
      plan: user.plan || "free",
      monthlyRunsUsed: used,
      monthlyRunsCap: cap,
      remaining: Math.max(0, cap - used),
      nextResetAt: nextReset.toISOString(),
      agentCap: limits.agentCap,
      webSearch: limits.webSearch,
      toolUse: limits.toolUse,
      memoryInjection: limits.memoryInjection,
    });
  } catch (e) {
    console.error("[api/usage] failed:", e);
    return jsonWithCors(req, { error: "Failed" }, { status: 500 });
  }
}

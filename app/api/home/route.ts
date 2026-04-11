import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";
import { updateLoginStreak } from "@/lib/streak";
import { checkStreakAchievements, unlockAchievement } from "@/lib/achievements";

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) {
    return jsonWithCors(req, { isLoggedIn: false }, { status: 200 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true, name: true, displayName: true, handle: true,
        avatarUrl: true, credits: true, plan: true, role: true,
      },
    }).catch(() => null);

    if (!user) {
      return jsonWithCors(req, { isLoggedIn: false }, { status: 200 });
    }

    const agentCount = await prisma.userAgent.count({ where: { userId: user.id } });

    // Streak + achievements (fire-and-forget, don't block response)
    let streak = { currentStreak: 0, longestStreak: 0 };
    let newAchievement = null;
    try {
      const sr = await updateLoginStreak(user.id);
      if (sr) {
        streak = sr;
        if (sr.incremented && sr.currentStreak === 1 && !sr.broken) {
          newAchievement = await unlockAchievement(user.id, "first_login");
        }
        if (sr.incremented) {
          const sa = await checkStreakAchievements(user.id, sr.currentStreak);
          if (sa) newAchievement = sa;
        }
      }
    } catch {}

    // Next scheduled execution
    const nextAgent = await prisma.userAgent.findFirst({
      where: { userId: user.id, active: true, nextRunAt: { gt: new Date() } },
      orderBy: { nextRunAt: "asc" },
      select: { name: true, nextRunAt: true },
    }).catch(() => null);

    return jsonWithCors(req, {
      isLoggedIn: true,
      userId: user.id,
      name: user.displayName || user.name || "",
      avatarUrl: user.avatarUrl || null,
      credits: user.credits ?? 0,
      plan: user.role === "admin" ? "business" : (user.plan || "free"),
      agentCount,
      nextExecution: nextAgent ? { agentName: nextAgent.name, scheduledAt: nextAgent.nextRunAt!.toISOString() } : null,
      streak,
      newAchievement,
    });
  } catch (e) {
    console.error("[api/home] failed:", e);
    return jsonWithCors(req, { error: "Failed" }, { status: 500 });
  }
}

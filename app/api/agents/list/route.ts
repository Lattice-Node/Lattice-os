import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";

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
      select: { id: true, credits: true },
    });
    if (!user) return jsonWithCors(req, { error: "Not found" }, { status: 404 });

    const agents = await prisma.userAgent.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayRuns = await prisma.agentLog.count({
      where: { userId: user.id, createdAt: { gte: todayStart } },
    });

    return jsonWithCors(req, {
      credits: user.credits ?? 0,
      agents: JSON.parse(JSON.stringify(agents)),
      todayRuns,
    });
  } catch (e) {
    console.error("[api/agents/list] failed:", e);
    return jsonWithCors(req, { error: "Failed" }, { status: 500 });
  }
}

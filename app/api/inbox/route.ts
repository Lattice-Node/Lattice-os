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
    const logs = await prisma.agentLog.findMany({
      where: {
        userId: session.userId,
        status: "success",
        output: { not: "" },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        output: true,
        createdAt: true,
        agent: { select: { id: true, name: true } },
      },
    });

    const items = logs.map((l) => ({
      id: l.id,
      output: l.output,
      createdAt: l.createdAt.toISOString(),
      agentId: l.agent.id,
      agentName: l.agent.name,
    }));

    return jsonWithCors(req, { items });
  } catch (e) {
    console.error("[api/inbox] failed:", e);
    return jsonWithCors(req, { error: "Failed" }, { status: 500 });
  }
}

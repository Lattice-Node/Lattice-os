import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request) {
  const session = await authAny(req);

  let userPlan = "free";
  let isPaid = false;
  let connectedProviders: string[] = [];
  const isLoggedIn = !!session?.userId;

  try {
    if (isLoggedIn && session) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, plan: true, role: true },
      });
      isPaid = user?.role === "admin" || ["starter", "personal", "pro", "business"].includes(user?.plan || "");
      userPlan = user?.role === "admin" ? "business" : (user?.plan || "free");

      const userConnections = user?.id
        ? await prisma.userConnection.findMany({
            where: { userId: user.id },
            select: { provider: true },
          })
        : [];
      connectedProviders = userConnections.map((c) => c.provider);
    }

    const templates = await prisma.agentTemplate.findMany({
      orderBy: { useCount: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        prompt: true,
        trigger: true,
        triggerCron: true,
        variables: true,
      },
    });

    const communityAgents = await prisma.userAgent.findMany({
      where: { isPublic: true },
      orderBy: { publicUseCount: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        prompt: true,
        trigger: true,
        triggerCron: true,
        publicUseCount: true,
        runCount: true,
        user: { select: { name: true, displayName: true, handle: true, avatarUrl: true } },
      },
      take: 50,
    });

    return jsonWithCors(req, {
      templates: JSON.parse(JSON.stringify(templates)),
      communityAgents: JSON.parse(JSON.stringify(communityAgents)),
      isPaid,
      userPlan,
      connectedProviders,
      isLoggedIn,
    });
  } catch (e) {
    console.error("[api/store/data] failed:", e);
    return jsonWithCors(req, { error: "Failed" }, { status: 500 });
  }
}

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
      select: { id: true, plan: true, role: true },
    });

    const isPaid = user?.role === "admin" || ["starter", "personal", "pro", "business"].includes(user?.plan || "");

    const userConnections = user?.id
      ? await prisma.userConnection.findMany({
          where: { userId: user.id },
          select: { provider: true },
        })
      : [];
    const connectedProviders = userConnections.map((c) => c.provider);

    return jsonWithCors(req, { isPaid, connectedProviders });
  } catch (e) {
    console.error("[api/agents/templates] failed:", e);
    return jsonWithCors(req, { error: "Failed" }, { status: 500 });
  }
}

import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";

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

    return jsonWithCors(req, {
      isLoggedIn: true,
      name: user.displayName || user.name || "",
      avatarUrl: user.avatarUrl || null,
      credits: user.credits ?? 0,
      plan: user.role === "admin" ? "business" : (user.plan || "free"),
      agentCount,
    });
  } catch (e) {
    console.error("[api/home] failed:", e);
    return jsonWithCors(req, { error: "Failed" }, { status: 500 });
  }
}

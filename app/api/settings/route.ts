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
      select: {
        email: true,
        name: true,
        credits: true,
        plan: true,
        currentPeriodEnd: true,
        role: true,
        handle: true,
        displayName: true,
        avatarUrl: true,
        publicId: true,
      },
    });

    if (!user) {
      return jsonWithCors(req, { error: "Not found" }, { status: 404 });
    }

    return jsonWithCors(req, {
      name: user.name ?? "",
      email: user.email ?? "",
      image: user.avatarUrl ?? "",
      credits: user.credits ?? 30,
      distributedCredits: 0,
      purchasedCredits: 0,
      plan: user.plan ?? "free",
      currentPeriodEnd: user.currentPeriodEnd?.toISOString() ?? null,
      role: user.role ?? "user",
      handle: user.handle ?? null,
      displayName: user.displayName ?? "",
      avatarUrl: user.avatarUrl ?? null,
      publicId: user.publicId ?? null,
    });
  } catch (e) {
    console.error("[api/settings] failed:", e);
    return jsonWithCors(req, { error: "Failed" }, { status: 500 });
  }
}

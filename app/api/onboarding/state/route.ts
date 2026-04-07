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
      select: { onboardingCompleted: true },
    }).catch(() => null);

    return jsonWithCors(req, {
      onboardingCompleted: user?.onboardingCompleted ?? false,
    });
  } catch (e) {
    console.error("[api/onboarding/state] failed:", e);
    return jsonWithCors(req, { error: "Failed" }, { status: 500 });
  }
}

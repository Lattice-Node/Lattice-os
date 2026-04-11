import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";
import { unlockAchievement } from "@/lib/achievements";

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function POST(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) {
    return jsonWithCors(req, { error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { onboardingCompleted: true },
  });

  // Trigger first_login achievement
  try {
    await unlockAchievement(session.userId, "first_login");
  } catch {}

  return jsonWithCors(req, { ok: true });
}

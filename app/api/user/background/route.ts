import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";
import { BACKGROUND_THEMES } from "@/lib/backgrounds";

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) {
    return jsonWithCors(req, { error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { backgroundTheme: true, customBackgroundUrl: true, plan: true, role: true },
  });
  return jsonWithCors(req, {
    theme: user?.backgroundTheme || "dark",
    customUrl: user?.customBackgroundUrl || null,
    plan: user?.role === "admin" ? "pro" : (user?.plan || "free"),
  });
}

export async function PUT(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) {
    return jsonWithCors(req, { error: "Unauthorized" }, { status: 401 });
  }
  const { theme } = await req.json();
  const themeObj = BACKGROUND_THEMES.find((t) => t.id === theme);
  if (!themeObj) {
    return jsonWithCors(req, { error: "Invalid theme" }, { status: 400 });
  }

  // Pro check
  if (themeObj.isPro) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { plan: true, role: true },
    });
    const isPro = user?.role === "admin" || user?.plan === "pro" || user?.plan === "business";
    if (!isPro) {
      return jsonWithCors(req, { error: "Pro required" }, { status: 403 });
    }
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { backgroundTheme: theme },
  });

  return jsonWithCors(req, { ok: true });
}

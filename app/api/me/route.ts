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
    });
    if (!user) {
      return jsonWithCors(req, { error: "Not found" }, { status: 404 });
    }
    return jsonWithCors(req, user);
  } catch (e) {
    console.error("[api/me] failed:", e);
    return jsonWithCors(req, { error: "Failed" }, { status: 500 });
  }
}

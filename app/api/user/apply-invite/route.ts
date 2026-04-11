import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function POST(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) {
    return jsonWithCors(req, { error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return jsonWithCors(req, { error: "Code required" }, { status: 400 });
  }

  // Check if already invited
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { invitedByUserId: true },
  });
  if (user?.invitedByUserId) {
    return jsonWithCors(req, { error: "Already invited" }, { status: 400 });
  }

  // Find inviter
  const inviter = await prisma.user.findUnique({
    where: { inviteCode: code },
    select: { id: true },
  });
  if (!inviter || inviter.id === session.userId) {
    return jsonWithCors(req, { error: "Invalid code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { invitedByUserId: inviter.id },
  });

  return jsonWithCors(req, { ok: true });
}

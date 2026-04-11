import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function GET(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) return jsonWithCors(req, { error: "Unauthorized" }, { status: 401 });

  let user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { inviteCode: true },
  });

  if (!user?.inviteCode) {
    const code = generateInviteCode();
    await prisma.user.update({
      where: { id: session.userId },
      data: { inviteCode: code },
    });
    user = { inviteCode: code };
  }

  const invitees = await prisma.user.findMany({
    where: { invitedByUserId: session.userId },
    select: { id: true, name: true, displayName: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return jsonWithCors(req, {
    inviteCode: user.inviteCode,
    inviteUrl: `https://www.lattice-protocol.com/join/?code=${user.inviteCode}`,
    invitees: invitees.map((u) => ({
      name: u.displayName || u.name || "ユーザー",
      joinedAt: u.createdAt.toISOString(),
    })),
    totalInvited: invitees.length,
    creditsEarned: invitees.length * 10,
  });
}

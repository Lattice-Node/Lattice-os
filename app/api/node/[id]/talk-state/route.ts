import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await authAny(req);
  if (!session?.userId) {
    return jsonWithCors(req, { error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const node = await prisma.node.findUnique({
      where: { id },
      select: { id: true, name: true, userId: true, openingVoice: true, openingVoiceCreatedAt: true },
    }).catch(() => null);

    if (!node || node.userId !== session.userId) {
      return jsonWithCors(req, { error: "Not found" }, { status: 404 });
    }

    const latestExchange = await prisma.nodeExchange.findFirst({
      where: { nodeId: id },
      orderBy: { createdAt: "desc" },
    }).catch(() => null);

    return jsonWithCors(req, {
      nodeId: node.id,
      nodeName: node.name,
      latestExchange: latestExchange ? JSON.parse(JSON.stringify(latestExchange)) : null,
      openingVoice: node.openingVoice ?? null,
      openingVoiceCreatedAt: node.openingVoiceCreatedAt?.toISOString() ?? null,
    });
  } catch (e) {
    console.error("[api/node/[id]/talk-state] failed:", e);
    return jsonWithCors(req, { error: "Failed" }, { status: 500 });
  }
}

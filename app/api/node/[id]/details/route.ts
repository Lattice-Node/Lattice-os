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
    const node = await prisma.node.findUnique({ where: { id } }).catch(() => null);
    if (!node || node.userId !== session.userId) {
      return jsonWithCors(req, { error: "Not found" }, { status: 404 });
    }

    const [memoryCount, exchangeCount, latestDiary, recentExchanges] = await Promise.all([
      prisma.nodeMemory.count({ where: { nodeId: id } }).catch(() => 0),
      prisma.nodeExchange.count({ where: { nodeId: id } }).catch(() => 0),
      prisma.nodeDiary.findFirst({ where: { nodeId: id }, orderBy: { createdAt: "desc" } }).catch(() => null),
      prisma.nodeExchange.findMany({ where: { nodeId: id }, orderBy: { createdAt: "desc" }, take: 10 }).catch(() => []),
    ]);

    return jsonWithCors(req, {
      node: JSON.parse(JSON.stringify(node)),
      memoryCount,
      exchangeCount,
      latestDiary: latestDiary ? JSON.parse(JSON.stringify(latestDiary)) : null,
      recentExchanges: JSON.parse(JSON.stringify(recentExchanges)),
    });
  } catch (e) {
    console.error("[api/node/[id]/details] failed:", e);
    return jsonWithCors(req, { error: "Failed" }, { status: 500 });
  }
}

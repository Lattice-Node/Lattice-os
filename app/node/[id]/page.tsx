import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NodeDetailClient from "./NodeDetailClient";

export default async function NodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login/");

  const { id } = await params;
  const node = await prisma.node.findUnique({ where: { id } }).catch(() => null);
  if (!node || node.userId !== session.user.id) redirect("/node/");

  const [memoryCount, exchangeCount, latestDiary, recentExchanges] = await Promise.all([
    prisma.nodeMemory.count({ where: { nodeId: id } }).catch(() => 0),
    prisma.nodeExchange.count({ where: { nodeId: id } }).catch(() => 0),
    prisma.nodeDiary.findFirst({ where: { nodeId: id }, orderBy: { createdAt: "desc" } }).catch(() => null),
    prisma.nodeExchange.findMany({ where: { nodeId: id }, orderBy: { createdAt: "desc" }, take: 10 }).catch(() => []),
  ]);

  return (
    <NodeDetailClient
      node={JSON.parse(JSON.stringify(node))}
      memoryCount={memoryCount}
      exchangeCount={exchangeCount}
      latestDiary={latestDiary ? JSON.parse(JSON.stringify(latestDiary)) : null}
      recentExchanges={JSON.parse(JSON.stringify(recentExchanges))}
    />
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TalkClient from "./TalkClient";

export default async function TalkPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const node = await prisma.node.findUnique({ where: { id } }).catch(() => null);
  if (!node || node.userId !== session.user.id) redirect("/node");

  const latestExchange = await prisma.nodeExchange.findFirst({
    where: { nodeId: id },
    orderBy: { createdAt: "desc" },
  }).catch(() => null);

  return (
    <TalkClient
      nodeId={node.id}
      nodeName={node.name}
      latestExchange={latestExchange ? JSON.parse(JSON.stringify(latestExchange)) : null}
    />
  );
}

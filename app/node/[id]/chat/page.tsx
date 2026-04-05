import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChatClient from "./ChatClient";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const node = await prisma.node.findUnique({ where: { id } }).catch(() => null);
  if (!node || node.userId !== session.user.id) redirect("/node");

  const messages = await prisma.nodeMessage.findMany({
    where: { nodeId: id },
    orderBy: { createdAt: "asc" },
  }).catch(() => []);

  return (
    <ChatClient
      nodeId={node.id}
      nodeName={node.name}
      initialMessages={JSON.parse(JSON.stringify(messages))}
    />
  );
}

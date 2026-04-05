import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NodeClient from "./NodeClient";

export default async function NodePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const nodes = await prisma.node.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return <NodeClient nodes={JSON.parse(JSON.stringify(nodes))} />;
}

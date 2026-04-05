import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InboxList from "./InboxList";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect("/login");

  const logs = await prisma.agentLog.findMany({
    where: {
      userId: user.id,
      status: "success",
      output: { not: "" },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      output: true,
      createdAt: true,
      agent: {
        select: { id: true, name: true },
      },
    },
  });

  const serialized = logs.map((l) => ({
    id: l.id,
    output: l.output,
    createdAt: l.createdAt.toISOString(),
    agentId: l.agent.id,
    agentName: l.agent.name,
  }));

  return <InboxList items={serialized} />;
}
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StoreList from "./StoreList";

export default async function StorePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, plan: true, role: true },
  });

  const templates = await prisma.agentTemplate.findMany({
    orderBy: { useCount: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      prompt: true,
      trigger: true,
      triggerCron: true,
      variables: true,
    },
  });

  const isPaid = user?.role === "admin" || ["starter", "personal", "pro", "business"].includes(user?.plan || "");
  const userPlan = user?.role === "admin" ? "business" : (user?.plan || "free");

  const userConnections = user?.id
    ? await prisma.userConnection.findMany({
        where: { userId: user.id },
        select: { provider: true },
      })
    : [];
  const connectedProviders = userConnections.map((c) => c.provider);

  const communityAgents = await prisma.userAgent.findMany({
    where: { isPublic: true },
    orderBy: { publicUseCount: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      prompt: true,
      trigger: true,
      triggerCron: true,
      publicUseCount: true,
      runCount: true,
      user: { select: { name: true } },
    
    },
    take: 50,
  });

  return (
    <div className="page">
      <p className="page-label">エージェントストア</p>
      <h1 className="page-title">エージェントを探す</h1>
      <StoreList
        templates={JSON.parse(JSON.stringify(templates))}
        isPaid={isPaid}
        userPlan={userPlan}
        connectedProviders={connectedProviders}
        communityAgents={JSON.parse(JSON.stringify(communityAgents))}
      />
    </div>
  );
}

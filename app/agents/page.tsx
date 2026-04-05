import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AgentsList from "./AgentsList";

export default async function AgentsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, distributedCredits: true, purchasedCredits: true },
  });
  if (!user) redirect("/login");

  const agents = await prisma.userAgent.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayRuns = await prisma.agentLog.count({
    where: {
      userId: user.id,
      createdAt: { gte: todayStart },
    },
  });

  return (
    <div className="page">
      <p className="page-label">マイエージェント</p>
      <h1 className="page-title">マイエージェント</h1>

      <div className="stat-row">
        <div className="stat-box animate-in">
          <p className="stat-number" style={{ color: "var(--accent)" }}>
            {agents.filter((a) => a.active).length}
          </p>
          <p className="stat-label">稼働中</p>
        </div>
        <div className="stat-box animate-in">
          <p className="stat-number" style={{ color: "var(--green)" }}>{user.distributedCredits + user.purchasedCredits}</p>
          <p className="stat-label">残りクレジット</p>
        </div>
        <div className="stat-box animate-in">
          <p className="stat-number">{todayRuns}</p>
          <p className="stat-label">今日の実行</p>
        </div>
      </div>

      <AgentsList agents={JSON.parse(JSON.stringify(agents))} />
    </div>
  );
}
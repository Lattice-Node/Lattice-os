import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StoreList from "./StoreList";
import Link from "next/link";

export default async function StorePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user?.email;

  // User data (only if logged in)
  let userPlan = "free";
  let isPaid = false;
  let connectedProviders: string[] = [];

  if (isLoggedIn) {
    const user = await prisma.user.findUnique({
      where: { email: session!.user!.email! },
      select: { id: true, plan: true, role: true },
    });
    isPaid = user?.role === "admin" || ["starter", "personal", "pro", "business"].includes(user?.plan || "");
    userPlan = user?.role === "admin" ? "business" : (user?.plan || "free");

    const userConnections = user?.id
      ? await prisma.userConnection.findMany({
          where: { userId: user.id },
          select: { provider: true },
        })
      : [];
    connectedProviders = userConnections.map((c) => c.provider);
  }

  // Public data (always fetch)
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
      user: { select: { name: true, displayName: true, handle: true, avatarUrl: true } },
    },
    take: 50,
  });

  return (
    <div className="page">
      {/* Guest header - only show when not logged in */}
      {!isLoggedIn && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #2e3440" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 24, height: 24, background: "#6c71e8", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>Lattice</span>
          </Link>
          <Link href="/login" style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#6c71e8", color: "#fff", textDecoration: "none" }}>
            ログイン
          </Link>
        </div>
      )}

      <p className="page-label">エージェントストア</p>
      <h1 className="page-title">エージェントを探す</h1>
      <StoreList
        templates={JSON.parse(JSON.stringify(templates))}
        isPaid={isPaid}
        userPlan={userPlan}
        connectedProviders={connectedProviders}
        communityAgents={JSON.parse(JSON.stringify(communityAgents))}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}

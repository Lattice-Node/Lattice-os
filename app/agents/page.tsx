import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AgentsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const agents = user
    ? await prisma.userAgent.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#e5e5e5", paddingTop: 56 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/" style={{ fontSize: 13, color: "#444", textDecoration: "none" }}>
            Home
          </Link>
          <span style={{ color: "#2a2a2a", fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: "#666" }}>Agents</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#f0f0f0", margin: "0 0 6px" }}>Agents</h1>
            <p style={{ fontSize: 13, color: "#444", margin: 0 }}>
              {agents.length === 0 ? "エージェントはまだありません" : `${agents.length}個のエージェント`}
            </p>
          </div>
          <Link
            href="/agents/new"
            style={{
              backgroundColor: "#5b5fc7",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            + 新規作成
          </Link>
        </div>

        {/* Empty */}
        {agents.length === 0 && (
          <div style={{
            border: "1px solid #1a1a1a",
            borderRadius: 8,
            padding: "56px 32px",
            textAlign: "center",
            backgroundColor: "#111",
          }}>
            <p style={{ color: "#444", fontSize: 14, margin: "0 0 6px" }}>エージェントがありません</p>
            <p style={{ color: "#2e2e2e", fontSize: 13, margin: "0 0 24px" }}>
              自然言語で話しかけるだけで自動化エージェントを作れます
            </p>
            <Link
              href="/agents/new"
              style={{
                display: "inline-block",
                backgroundColor: "#5b5fc7",
                color: "#fff",
                padding: "9px 20px",
                borderRadius: 6,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              最初のエージェントを作る
            </Link>
          </div>
        )}

        {/* List */}
        {agents.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {agents.map((agent) => (
              <Link key={agent.id} href={`/agents/${agent.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  border: "1px solid #1a1a1a",
                  borderRadius: 8,
                  padding: "18px 20px",
                  backgroundColor: "#111",
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: 14, color: "#e8e8e8", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {agent.name}
                    </p>
                    <div style={{ display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 12, color: "#3a3a3a" }}>
                        {agent.trigger || "手動"}
                      </span>
                      <span style={{ fontSize: 12, color: "#3a3a3a" }}>
                        {agent.runCount}回実行
                      </span>
                      <span style={{ fontSize: 12, color: "#3a3a3a" }}>
                        {new Date(agent.createdAt).toLocaleDateString("ja-JP")}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 16 }}>
                    <span style={{
                      fontSize: 11,
                      color: agent.active ? "#4ade80" : "#3a3a3a",
                      backgroundColor: agent.active ? "#0a1f12" : "#141414",
                      padding: "3px 10px",
                      borderRadius: 999,
                      border: `1px solid ${agent.active ? "#143320" : "#1e1e1e"}`,
                      whiteSpace: "nowrap",
                    }}>
                      {agent.active ? "稼働中" : "停止中"}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
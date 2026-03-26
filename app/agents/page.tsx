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
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#f5f5f5", margin: 0 }}>Agents</h1>
            <p style={{ color: "#555", marginTop: 6, fontSize: 13, margin: "6px 0 0" }}>
              {agents.length}個のエージェントが登録されています
            </p>
          </div>
          <Link
            href="/agents/new"
            style={{
              backgroundColor: "#5b5fc7",
              color: "#fff",
              padding: "9px 18px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            + 新しいエージェント
          </Link>
        </div>

        {agents.length === 0 ? (
          <div style={{
            border: "1px solid #1e1e1e",
            borderRadius: 8,
            padding: "60px 40px",
            textAlign: "center",
            backgroundColor: "#111",
          }}>
            <p style={{ color: "#555", fontSize: 14, margin: 0 }}>まだエージェントがありません</p>
            <p style={{ color: "#3a3a3a", fontSize: 13, marginTop: 8 }}>
              自然言語で話しかけるだけで自動化エージェントを作れます
            </p>
            <Link
              href="/agents/new"
              style={{
                display: "inline-block",
                marginTop: 20,
                backgroundColor: "#5b5fc7",
                color: "#fff",
                padding: "9px 18px",
                borderRadius: 6,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              最初のエージェントを作る
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {agents.map((agent) => (
              <Link key={agent.id} href={`/agents/${agent.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  border: "1px solid #1e1e1e",
                  borderRadius: 8,
                  padding: "18px 22px",
                  backgroundColor: "#111",
                  transition: "border-color 0.15s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 15, color: "#f0f0f0", margin: 0 }}>
                        {agent.name}
                      </p>
                      {agent.description && (
                        <p style={{ color: "#555", fontSize: 13, margin: "4px 0 0" }}>
                          {agent.description}
                        </p>
                      )}
                    </div>
                    <span style={{
                      fontSize: 11,
                      color: agent.active ? "#4ade80" : "#555",
                      backgroundColor: agent.active ? "#0f2a1a" : "#181818",
                      padding: "3px 10px",
                      borderRadius: 999,
                      border: `1px solid ${agent.active ? "#1a4a2a" : "#222"}`,
                      whiteSpace: "nowrap",
                      marginLeft: 12,
                    }}>
                      {agent.active ? "稼働中" : "停止中"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                    <span style={{ fontSize: 12, color: "#444" }}>トリガー: {agent.trigger || "手動"}</span>
                    <span style={{ fontSize: 12, color: "#444" }}>実行: {agent.runCount}回</span>
                    <span style={{ fontSize: 12, color: "#444" }}>
                      作成: {new Date(agent.createdAt).toLocaleDateString("ja-JP")}
                    </span>
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
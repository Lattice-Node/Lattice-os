import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CostAnalysisPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (user?.role !== "admin") redirect("/home");

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const logs = await prisma.claudeUsageLog.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });

  const totalCost = logs.reduce((sum, l) => sum + (l.costJpyEstimate || 0), 0);
  const totalCalls = logs.length;
  const totalInputTokens = logs.reduce((s, l) => s + l.inputTokens, 0);
  const totalOutputTokens = logs.reduce((s, l) => s + l.outputTokens, 0);
  const totalCacheRead = logs.reduce((s, l) => s + l.cacheReadTokens, 0);
  const totalCacheWrite = logs.reduce((s, l) => s + l.cacheWriteTokens, 0);
  const totalWebSearches = logs.reduce((s, l) => s + l.webSearches, 0);

  // Group by route
  const byRoute: Record<string, { calls: number; cost: number; inputTokens: number; outputTokens: number }> = {};
  for (const l of logs) {
    if (!byRoute[l.route]) byRoute[l.route] = { calls: 0, cost: 0, inputTokens: 0, outputTokens: 0 };
    byRoute[l.route].calls += 1;
    byRoute[l.route].cost += l.costJpyEstimate || 0;
    byRoute[l.route].inputTokens += l.inputTokens;
    byRoute[l.route].outputTokens += l.outputTokens;
  }

  // Group by user (top 10 by cost)
  const byUser: Record<string, { calls: number; cost: number }> = {};
  for (const l of logs) {
    const key = l.userId || "(anonymous)";
    if (!byUser[key]) byUser[key] = { calls: 0, cost: 0 };
    byUser[key].calls += 1;
    byUser[key].cost += l.costJpyEstimate || 0;
  }
  const topUsers = Object.entries(byUser)
    .sort(([, a], [, b]) => b.cost - a.cost)
    .slice(0, 10);

  // Get user emails for top users
  const userIds = topUsers.map(([id]) => id).filter((id) => id !== "(anonymous)");
  const users = userIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true, plan: true } })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  // Cache hit rate
  const cacheHitRate = totalInputTokens + totalCacheRead > 0
    ? (totalCacheRead / (totalInputTokens + totalCacheRead)) * 100
    : 0;

  const fmt = (n: number) => n.toLocaleString();
  const fmtCost = (n: number) => `¥${Math.round(n).toLocaleString()}`;

  return (
    <main style={{ background: "#0a0a0a", color: "#e8eaf0", minHeight: "100vh", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Claude API Cost Analysis</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>Past 30 days · {totalCalls.toLocaleString()} calls</p>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <Card label="Total Cost" value={fmtCost(totalCost)} sub={`${fmt(totalCalls)} calls`} />
        <Card label="Cache Hit Rate" value={`${cacheHitRate.toFixed(1)}%`} sub={`${fmt(totalCacheRead)} read / ${fmt(totalCacheWrite)} write`} />
        <Card label="Total Tokens" value={fmt(totalInputTokens + totalOutputTokens)} sub={`in: ${fmt(totalInputTokens)}, out: ${fmt(totalOutputTokens)}`} />
        <Card label="Web Searches" value={fmt(totalWebSearches)} sub={`~${fmtCost(totalWebSearches * 1.55)}`} />
      </div>

      {/* By route */}
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>By Route</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 32 }}>
        <thead>
          <tr style={{ background: "#1a1a1a" }}>
            <th style={th}>Route</th>
            <th style={th}>Calls</th>
            <th style={th}>Input Tokens</th>
            <th style={th}>Output Tokens</th>
            <th style={th}>Cost</th>
            <th style={th}>Cost / Call</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(byRoute).sort(([, a], [, b]) => b.cost - a.cost).map(([route, s]) => (
            <tr key={route} style={{ borderBottom: "1px solid #222" }}>
              <td style={td}>{route}</td>
              <td style={td}>{fmt(s.calls)}</td>
              <td style={td}>{fmt(s.inputTokens)}</td>
              <td style={td}>{fmt(s.outputTokens)}</td>
              <td style={td}>{fmtCost(s.cost)}</td>
              <td style={td}>{fmtCost(s.cost / Math.max(1, s.calls))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Top users */}
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Top 10 Users by Cost</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#1a1a1a" }}>
            <th style={th}>User</th>
            <th style={th}>Plan</th>
            <th style={th}>Calls</th>
            <th style={th}>Cost</th>
          </tr>
        </thead>
        <tbody>
          {topUsers.map(([userId, s]) => {
            const u = userMap.get(userId);
            return (
              <tr key={userId} style={{ borderBottom: "1px solid #222" }}>
                <td style={td}>{u?.email || userId}</td>
                <td style={td}>{u?.plan || "-"}</td>
                <td style={td}>{fmt(s.calls)}</td>
                <td style={td}>{fmtCost(s.cost)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}

function Card({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 16 }}>
      <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>{value}</p>
      <p style={{ fontSize: 11, color: "#666", margin: 0 }}>{sub}</p>
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#aaa", borderBottom: "1px solid #333" };
const td: React.CSSProperties = { padding: "10px 12px", color: "#e8eaf0" };

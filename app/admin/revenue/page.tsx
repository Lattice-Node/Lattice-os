import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getYtdRevenue, getMonthlyRevenue } from "@/lib/revenue";

export const dynamic = "force-dynamic";

const YEARLY_CAP = 800_000;
const THRESHOLDS = {
  yellow: 600_000,
  orange: 700_000,
  red: 750_000,
};

export default async function RevenuePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (user?.role !== "admin") redirect("/home");

  const ytd = await getYtdRevenue();
  const monthly = await getMonthlyRevenue();
  const remaining = Math.max(0, YEARLY_CAP - ytd);

  // Recent transactions
  const recent = await prisma.revenueRecord.findMany({
    orderBy: { date: "desc" },
    take: 50,
  });

  // Status color
  let statusColor = "#22c55e"; // green
  let statusLabel = "OK";
  if (ytd >= THRESHOLDS.red) {
    statusColor = "#ef4444";
    statusLabel = "DANGER — auto-stop active";
  } else if (ytd >= THRESHOLDS.orange) {
    statusColor = "#f97316";
    statusLabel = "WARNING";
  } else if (ytd >= THRESHOLDS.yellow) {
    statusColor = "#eab308";
    statusLabel = "CAUTION";
  }

  const fmt = (n: number) => `¥${n.toLocaleString()}`;
  const monthLabels = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const maxMonth = Math.max(...monthly, 1);

  return (
    <main style={{ background: "#0a0a0a", color: "#e8eaf0", minHeight: "100vh", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Revenue Dashboard</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>JASSO scholarship cap: ¥800,000 / year</p>

      {/* YTD summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "#111", border: `2px solid ${statusColor}`, borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px", textTransform: "uppercase" }}>YTD Revenue</p>
          <p style={{ fontSize: 32, fontWeight: 800, margin: "0 0 4px", color: statusColor }}>{fmt(ytd)}</p>
          <p style={{ fontSize: 12, color: statusColor, margin: 0, fontWeight: 600 }}>{statusLabel}</p>
        </div>
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px", textTransform: "uppercase" }}>Remaining</p>
          <p style={{ fontSize: 32, fontWeight: 800, margin: "0 0 4px" }}>{fmt(remaining)}</p>
          <p style={{ fontSize: 12, color: "#666", margin: 0 }}>before ¥800,000 cap</p>
        </div>
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px", textTransform: "uppercase" }}>Cap Usage</p>
          <p style={{ fontSize: 32, fontWeight: 800, margin: "0 0 4px" }}>{((ytd / YEARLY_CAP) * 100).toFixed(1)}%</p>
          <div style={{ width: "100%", height: 8, background: "#222", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, (ytd / YEARLY_CAP) * 100)}%`, height: "100%", background: statusColor }} />
          </div>
        </div>
      </div>

      {/* Thresholds */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 16, marginBottom: 32 }}>
        <p style={{ fontSize: 11, color: "#888", margin: "0 0 12px", textTransform: "uppercase" }}>Threshold Markers</p>
        <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
          <div><span style={{ color: "#eab308" }}>●</span> Caution: {fmt(THRESHOLDS.yellow)}</div>
          <div><span style={{ color: "#f97316" }}>●</span> Warning: {fmt(THRESHOLDS.orange)}</div>
          <div><span style={{ color: "#ef4444" }}>●</span> Auto-stop: {fmt(THRESHOLDS.red)}</div>
        </div>
      </div>

      {/* Monthly bar chart */}
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Monthly Revenue ({new Date().getUTCFullYear()})</h2>
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 20, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160 }}>
          {monthly.map((amt, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>{amt > 0 ? fmt(amt) : ""}</div>
              <div style={{
                width: "100%",
                height: `${(amt / maxMonth) * 130}px`,
                minHeight: 1,
                background: "linear-gradient(180deg, #6c71e8, #4f54bf)",
                borderRadius: "4px 4px 0 0",
              }} />
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{monthLabels[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CSV export link */}
      <div style={{ marginBottom: 24 }}>
        <a
          href="/api/admin/revenue-csv"
          style={{ display: "inline-block", padding: "10px 20px", background: "#6c71e8", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}
        >
          Download CSV (for tax filing)
        </a>
      </div>

      {/* Recent transactions */}
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Recent Transactions</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#1a1a1a" }}>
            <th style={th}>Date</th>
            <th style={th}>Platform</th>
            <th style={th}>Product</th>
            <th style={th}>Type</th>
            <th style={th}>Amount</th>
            <th style={th}>External ID</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((r) => (
            <tr key={r.id} style={{ borderBottom: "1px solid #222" }}>
              <td style={td}>{new Date(r.date).toLocaleDateString("ja-JP")}</td>
              <td style={td}>{r.platform}</td>
              <td style={td}>{r.productId}</td>
              <td style={td}>{r.transactionType}</td>
              <td style={td}>{fmt(r.amount)}</td>
              <td style={{ ...td, fontFamily: "monospace", fontSize: 11, color: "#666" }}>{r.externalId?.slice(0, 24) || "-"}</td>
            </tr>
          ))}
          {recent.length === 0 && (
            <tr>
              <td colSpan={6} style={{ ...td, textAlign: "center", color: "#666", padding: 24 }}>No transactions yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}

const th: React.CSSProperties = { padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#aaa", borderBottom: "1px solid #333" };
const td: React.CSSProperties = { padding: "10px 12px", color: "#e8eaf0" };

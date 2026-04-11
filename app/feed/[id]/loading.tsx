export default function Loading() {
  return (
    <main style={{ minHeight: "100%", paddingBottom: 40, background: "var(--bg)", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ height: 20, width: 64, background: "var(--surface)", borderRadius: 6, margin: "12px 0 24px" }} className="animate-pulse" />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--surface)" }} className="animate-pulse" />
          <div>
            <div style={{ height: 16, width: 128, background: "var(--surface)", borderRadius: 6, marginBottom: 8 }} className="animate-pulse" />
            <div style={{ height: 12, width: 80, background: "var(--surface)", borderRadius: 6 }} className="animate-pulse" />
          </div>
        </div>
        <div style={{ height: 28, width: "75%", background: "var(--surface)", borderRadius: 6, marginBottom: 12 }} className="animate-pulse" />
        <div style={{ height: 12, width: 160, background: "var(--surface)", borderRadius: 6, marginBottom: 24 }} className="animate-pulse" />
        <div style={{ borderTop: "1px solid var(--border)", marginBottom: 24 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[100, 100, 83, 100, 67].map((w, i) => (
            <div key={i} style={{ height: 16, width: `${w}%`, background: "var(--surface)", borderRadius: 6 }} className="animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}

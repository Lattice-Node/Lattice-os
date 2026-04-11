export default function FeedLoading() {
  return (
    <main style={{ minHeight: "100%", paddingBottom: 20, background: "var(--bg)", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ padding: "16px 0 8px" }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>FEED</p>
          <div style={{ height: 28, width: 128, background: "var(--surface)", borderRadius: 6 }} className="animate-pulse" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--border)" }} className="animate-pulse" />
                <div>
                  <div style={{ height: 14, width: 120, background: "var(--border)", borderRadius: 6, marginBottom: 6 }} className="animate-pulse" />
                  <div style={{ height: 10, width: 80, background: "var(--border)", borderRadius: 6 }} className="animate-pulse" />
                </div>
              </div>
              <div style={{ height: 18, width: "75%", background: "var(--border)", borderRadius: 6, marginBottom: 10 }} className="animate-pulse" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                <div style={{ height: 14, width: "100%", background: "var(--border)", borderRadius: 6 }} className="animate-pulse" />
                <div style={{ height: 14, width: "100%", background: "var(--border)", borderRadius: 6 }} className="animate-pulse" />
                <div style={{ height: 14, width: "83%", background: "var(--border)", borderRadius: 6 }} className="animate-pulse" />
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", gap: 20 }}>
                <div style={{ height: 14, width: 48, background: "var(--border)", borderRadius: 6 }} className="animate-pulse" />
                <div style={{ height: 14, width: 48, background: "var(--border)", borderRadius: 6 }} className="animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

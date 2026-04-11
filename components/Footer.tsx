import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #1a1a1a", padding: "32px 24px" }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#5b5fc7"/>
            <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#5b5fc7" opacity="0.6"/>
            <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#5b5fc7" opacity="0.6"/>
            <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#5b5fc7" opacity="0.3"/>
          </svg>
          <span style={{ fontSize: 14, color: "#444" }}>Lattice</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <Link href="/privacy/" style={{ fontSize: 13, color: "#444", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms/" style={{ fontSize: 13, color: "#444", textDecoration: "none" }}>Terms</Link>
          <Link href="/tokushoho/" style={{ fontSize: 13, color: "#444", textDecoration: "none" }}>特商法</Link>
          <Link href="https://x.com/Lattice_Node" style={{ fontSize: 13, color: "#444", textDecoration: "none" }}>X</Link>
        </div>
        <span style={{ fontSize: 13, color: "#333" }}>&copy; 2026 Lattice</span>
      </div>
    </footer>
  );
}
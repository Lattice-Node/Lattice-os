import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      background: "#111827",
      color: "#9ca3af",
      padding: "56px 24px 32px"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 48, marginBottom: 48
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, background: "#6366f1",
                borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ color: "#fff", fontSize: 16, fontWeight: 900 }}>L</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Lattice</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.8, maxWidth: 280, color: "#9ca3af" }}>
              AIをもっと身近に。プロンプト集・AI比較・副業スペース・最新ニュース。
              AIを使いたいすべての人のためのプラットフォーム。
            </p>
          </div>

          {/* サービス */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "0.05em" }}>
              サービス
            </h4>
            {[
              { href: "/marketplace", label: "プロンプト集" },
              { href: "/compare", label: "AI比較ツール" },
              { href: "/work", label: "AI副業" },
              { href: "/work/space", label: "Work Space" },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{
                display: "block", fontSize: 14, color: "#9ca3af",
                textDecoration: "none", marginBottom: 10,
                transition: "color 0.15s"
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* コンテンツ */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "0.05em" }}>
              コンテンツ
            </h4>
            {[
              { href: "/blog", label: "AIブログ" },
              { href: "/news", label: "AIニュース" },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{
                display: "block", fontSize: 14, color: "#9ca3af",
                textDecoration: "none", marginBottom: 10
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* 会社情報 */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "0.05em" }}>
              その他
            </h4>
            {[
              { href: "/privacy", label: "プライバシーポリシー" },
              { href: "/terms", label: "利用規約" },
              { href: "/login", label: "ログイン" },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{
                display: "block", fontSize: 14, color: "#9ca3af",
                textDecoration: "none", marginBottom: 10
              }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          paddingTop: 28,
          borderTop: "1px solid #1f2937",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12
        }}>
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            © 2026 Lattice. All rights reserved.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="https://x.com/Lattice_Node" style={{
              fontSize: 13, color: "#6b7280", textDecoration: "none"
            }}>
              X (Twitter)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
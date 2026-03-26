import Nav from "@/components/Nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIニュース | Lattice - 最新AI情報まとめ",
  description: "国内外の主要メディアからAI最新情報をまとめて配信。毎日更新。",
  alternates: { canonical: "https://lattice-protocol.com/news" },
};

export const revalidate = 3600;

export default async function NewsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8f7f4", color: "#1a1a1a" }}>
      <Nav />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ede9fe", color: "#6366f1", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 16 }}>
            毎日更新
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, marginBottom: 10, letterSpacing: "-0.02em" }}>
            AIニュース
          </h1>
          <p style={{ fontSize: 15, color: "#5a5a5a" }}>
            国内外の主要メディアからAI最新情報をまとめて配信
          </p>
        </div>
        <div style={{ textAlign: "center", padding: "80px 0", color: "#9a9a9a" }}>
          <p style={{ fontSize: 16 }}>ニュースを準備中です。しばらくお待ちください。</p>
        </div>
      </div>
    </main>
  );
}
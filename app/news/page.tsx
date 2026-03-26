import Nav from "@/components/Nav";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIニュース | Lattice - 最新AI情報まとめ",
  description: "国内外の主要メディアからAI最新情報をまとめて配信。毎日更新。",
  alternates: { canonical: "https://lattice-protocol.com/news" },
};

export const revalidate = 3600;

export default async function NewsPage() {
  const news = await prisma.news.findMany({
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const jaNews = news.filter(n => n.language === "ja" || !n.language);
  const enNews = news.filter(n => n.language === "en");

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-primary)" }}>
      <Nav />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--accent-light)", color: "var(--accent)", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 16 }}>
            毎日更新
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, marginBottom: 10, letterSpacing: "-0.02em" }}>
            AIニュース
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
            国内外の主要メディアからAI最新情報をまとめて配信
          </p>
        </div>

        {jaNews.length > 0 && (
          <div style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              日本語ニュース
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {jaNews.map(item => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)", padding: "20px 24px",
                    transition: "box-shadow 0.15s, transform 0.15s",
                    cursor: "pointer"
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-md)";
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                      (e.currentTarget as HTMLDivElement).style.transform = "none";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", background: "var(--accent-light)", padding: "2px 8px", borderRadius: 20 }}>
                            {item.source}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {new Date(item.publishedAt).toLocaleDateString("ja-JP")}
                          </span>
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 6 }}>
                          {item.title}
                        </h3>
                        {item.summary && (
                          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                            {item.summary}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: 18, color: "var(--text-muted)", flexShrink: 0 }}>↗</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {enNews.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              English News
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {enNews.map(item => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)", padding: "20px 24px",
                    transition: "box-shadow 0.15s"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#4285f4", background: "#eff6ff", padding: "2px 8px", borderRadius: 20 }}>
                            {item.source}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {new Date(item.publishedAt).toLocaleDateString("ja-JP")}
                          </span>
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.5 }}>
                          {item.title}
                        </h3>
                      </div>
                      <span style={{ fontSize: 18, color: "var(--text-muted)", flexShrink: 0 }}>↗</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {news.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
            <p style={{ fontSize: 16 }}>ニュースを準備中です。しばらくお待ちください。</p>
          </div>
        )}
      </div>
    </main>
  );
}
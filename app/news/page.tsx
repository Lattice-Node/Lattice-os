import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIニュース | Lattice - 最新AI情報まとめ",
  description: "国内外の主要メディアからAI最新情報をまとめて配信。ITmedia・ASCII・TechCrunchなど信頼性の高いメディアのAIニュースを毎時更新。",
  alternates: { canonical: "https://lattice-protocol.com/news" },
};

export const revalidate = 1800;

export default async function NewsPage() {
  const [jaNews, enNews] = await Promise.all([
    prisma.newsArticle.findMany({ where: { lang: "ja" }, orderBy: { publishedAt: "desc" }, take: 30 }),
    prisma.newsArticle.findMany({ where: { lang: "en" }, orderBy: { publishedAt: "desc" }, take: 30 }),
  ]);

  return (
    <main style={{ minHeight: "100vh", background: "#f8f8f6", color: "#111827", fontFamily: "'DM Sans', 'Hiragino Sans', 'Yu Gothic', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        .news-card { transition: box-shadow 0.2s, transform 0.15s; }
        .news-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .tab-btn { transition: all 0.15s; cursor: pointer; }
      `}</style>
      <Nav />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ede9fe", color: "#6366f1", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 16 }}>
            自動更新
          </div>
          <h1 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, color: "#111827", marginBottom: 8, letterSpacing: "-0.02em" }}>
            AIニュース
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>国内外の主要メディアからAI最新情報をまとめて配信</p>
        </div>

        {/* Japanese News */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #f0eeeb" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>日本語</h2>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{jaNews.length}件</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {jaNews.map(article => (
              <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div className="news-card" style={{ background: "#fff", border: "1.5px solid #eeece8", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", background: "#ede9fe", padding: "2px 8px", borderRadius: 10 }}>
                          {article.source}
                        </span>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>
                          {new Date(article.publishedAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", lineHeight: 1.5 }}>
                        {article.title}
                      </div>
                      {article.summary && (
                        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, marginTop: 6 }}>
                          {article.summary}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 16, color: "#d1d5db", flexShrink: 0 }}>→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* English News */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #f0eeeb" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>English</h2>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{enNews.length} articles</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {enNews.map(article => (
              <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div className="news-card" style={{ background: "#fff", border: "1.5px solid #eeece8", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#d1fae5", padding: "2px 8px", borderRadius: 10 }}>
                          {article.source}
                        </span>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>
                          {new Date(article.publishedAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", lineHeight: 1.5 }}>
                        {article.title}
                      </div>
                      {article.summary && (
                        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, marginTop: 6 }}>
                          {article.summary}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 16, color: "#d1d5db", flexShrink: 0 }}>→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
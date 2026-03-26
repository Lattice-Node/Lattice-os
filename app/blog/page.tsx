import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI繝悶Ο繧ｰ | Lattice - AI豢ｻ逕ｨ陦薙・蜑ｯ讌ｭ繝ｻ譛譁ｰ諠・ｱ",
  description: "ChatGPT豢ｻ逕ｨ陦薙・AI蜑ｯ讌ｭ縺ｮ蟋九ａ譁ｹ繝ｻ譛譁ｰAI繝・・繝ｫ隗｣隱ｬ縺ｪ縺ｩ縲、I繧偵ｂ縺｣縺ｨ菴ｿ縺・％縺ｪ縺吶◆繧√・險倅ｺ九ｒ豈朱ｱ譖ｴ譁ｰ縲・,
  alternates: { canonical: "https://lattice-protocol.com/blog" },
};

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ minHeight: "100vh", background: "#f8f8f6", color: "#111827", fontFamily: "'DM Sans', 'Hiragino Sans', 'Yu Gothic', sans-serif" }}>
      
      <Nav />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ede9fe", color: "#6366f1", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 16 }}>
            豈朱ｱ譖ｴ譁ｰ
          </div>
          <h1 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, color: "#111827", marginBottom: 8, letterSpacing: "-0.02em" }}>
            AI繝悶Ο繧ｰ
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>AI豢ｻ逕ｨ陦薙・蜑ｯ讌ｭ繝ｻ譛譁ｰ諠・ｱ繧呈ｯ朱ｱ譖ｴ譁ｰ</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {posts.map((post, i) => (
            <Link key={post.id} href={"/blog/" + post.slug} style={{ textDecoration: "none" }}>
              <div className="blog-card" style={{ background: "#fff", border: "1.5px solid #eeece8", borderRadius: 14, padding: "24px", display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, background: i % 3 === 0 ? "#ede9fe" : i % 3 === 1 ? "#d1fae5" : "#fef3c7", borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  {i % 3 === 0 ? "､・ : i % 3 === 1 ? "庁" : "嶋"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8, lineHeight: 1.5 }}>{post.title}</h2>
                  <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginBottom: 10 }}>{post.description}</p>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>{new Date(post.createdAt).toLocaleDateString("ja-JP")}</span>
                </div>
                <span style={{ fontSize: 18, color: "#d1d5db", flexShrink: 0 }}>竊・/span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
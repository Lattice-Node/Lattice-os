import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "AIプロンプトブログ | Lattice",
  description: "AIプロンプトの使い方・副業での稼ぎ方・ChatGPT活用術を発信するブログ。",
};

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ minHeight: "100vh", background: "#080b14", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 8 }}>ブログ</h1>
          <p style={{ color: "#8b92a9", fontSize: 14 }}>AIプロンプトの使い方・副業での稼ぎ方・ChatGPT活用術</p>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#4a5068" }}>記事を準備中です</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "#0d1120", border: "1px solid #1c2136", borderRadius: 12, padding: "24px", transition: "border-color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = "#3b82f655"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = "#1c2136"}
                >
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#e8eaf0", marginBottom: 8 }}>{post.title}</div>
                  <div style={{ fontSize: 13, color: "#8b92a9", lineHeight: 1.6, marginBottom: 12 }}>{post.description}</div>
                  <div style={{ fontSize: 11, color: "#4a5068" }}>{new Date(post.createdAt).toLocaleDateString("ja-JP")}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
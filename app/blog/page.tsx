import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ChatGPTプロンプト完全ガイド・AI活用ブログ | Lattice",
  description: "ChatGPTプロンプトの使い方・無料テンプレート・AI副業で稼ぐ方法を発信。コピペで使えるプロンプト集・仕事効率化・副業術を毎週更新中。",
  keywords: ["ChatGPTプロンプト", "プロンプト テンプレート", "AI副業", "ChatGPT使い方", "プロンプト 無料"],
  openGraph: {
    title: "ChatGPTプロンプト完全ガイド・AI活用ブログ | Lattice",
    description: "コピペで使えるChatGPTプロンプト集・AI副業術を毎週更新",
    type: "website",
    url: "https://lattice-os.vercel.app/blog",
  },
  alternates: {
    canonical: "https://lattice-os.vercel.app/blog",
  },
};

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ minHeight: "100vh", background: "#080b14", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <style>{`.blog-card { transition: border-color 0.15s; } .blog-card:hover { border-color: #3b82f655 !important; }`}</style>
      <Nav />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 8 }}>
            ChatGPTプロンプト・AI活用ブログ
          </h1>
          <p style={{ color: "#8b92a9", fontSize: 14 }}>
            コピペで使えるプロンプト集・AI副業術・ChatGPT活用法を毎週更新
          </p>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#4a5068" }}>記事を準備中です</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                <div className="blog-card" style={{ background: "#0d1120", border: "1px solid #1c2136", borderRadius: 12, padding: "24px" }}>
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
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Nav from "@/components/Nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIブログ | Lattice - AI活用術・副業・最新情報",
  description: "ChatGPT活用術・AI副業の始め方・最新AIツール解説を毎週更新。",
  alternates: { canonical: "https://lattice-protocol.com/blog" },
};

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ minHeight: "100vh", background: "#f8f7f4", color: "#1a1a1a" }}>
      <Nav />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ede9fe", color: "#6366f1", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 16 }}>
            毎週更新
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, marginBottom: 10, letterSpacing: "-0.02em" }}>
            AIブログ
          </h1>
          <p style={{ fontSize: 15, color: "#5a5a5a" }}>AI活用術・副業・最新情報を毎週更新</p>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#9a9a9a" }}>
            <p>記事を準備中です。</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {posts.map((post, i) => (
              <Link key={post.id} href={"/blog/" + post.slug} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#fff", border: "1px solid #e8e6e0",
                  borderRadius: 12, padding: "24px",
                  display: "flex", gap: 20, alignItems: "flex-start",
                  marginBottom: 2
                }}>
                  <div style={{
                    width: 40, height: 40, background: "#ede9fe",
                    borderRadius: 8, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: "#6366f1"
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 8, lineHeight: 1.5 }}>
                      {post.title}
                    </h2>
                    <p style={{ fontSize: 13, color: "#5a5a5a", lineHeight: 1.7, marginBottom: 10 }}>
                      {post.description}
                    </p>
                    <span style={{ fontSize: 12, color: "#9a9a9a" }}>
                      {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  <span style={{ fontSize: 18, color: "#9a9a9a", flexShrink: 0 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
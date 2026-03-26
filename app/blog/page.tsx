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
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-primary)" }}>
      <Nav />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--accent-light)", color: "var(--accent)", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 16 }}>
            毎週更新
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, marginBottom: 10, letterSpacing: "-0.02em" }}>
            AIブログ
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
            AI活用術・副業の始め方・最新AIツール解説
          </p>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
            <p>記事を準備中です。</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {posts.map((post, i) => (
              <Link key={post.id} href={"/blog/" + post.slug} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "24px",
                  transition: "box-shadow 0.15s, transform 0.15s",
                  display: "flex", gap: 24, alignItems: "flex-start"
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
                  <div style={{
                    width: 40, height: 40, background: "var(--accent-light)",
                    borderRadius: "var(--radius-sm)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: 13, fontWeight: 800, color: "var(--accent)"
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.5 }}>
                      {post.title}
                    </h2>
                    {post.description && (
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 }}>
                        {post.description}
                      </p>
                    )}
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  <span style={{ fontSize: 18, color: "var(--text-muted)", flexShrink: 0 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
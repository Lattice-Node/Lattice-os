import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return { title: "Lattice" };
  return {
    title: `${post.title} | Lattice`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://lattice-protocol.com/blog/${post.slug}`,
      siteName: "Lattice",
      locale: "ja_JP",
      type: "article",
    },
  };
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, "<h2 style=\"font-size:20px;font-weight:800;margin:32px 0 12px;color:#e8eaf0;letter-spacing:-0.02em\">$1</h2>")
    .replace(/^### (.+)$/gm, "<h3 style=\"font-size:16px;font-weight:700;margin:24px 0 8px;color:#e8eaf0\">$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong style=\"color:#e8eaf0\">$1</strong>")
    .replace(/`(.+?)`/g, "<code style=\"background:#1a1e2e;color:#81C784;padding:2px 6px;border-radius:4px;font-size:13px\">$1</code>")
    .replace(/^- (.+)$/gm, "<li style=\"margin-bottom:6px;color:#c8cad8\">$1</li>")
    .replace(/(<li.*<\/li>\n?)+/g, "<ul style=\"padding-left:20px;margin:12px 0\">$&</ul>")
    .replace(/\n\n/g, "</p><p style=\"margin-bottom:16px;line-height:1.8;color:#c8cad8\">")
    .replace(/^(?!<[h|u|p])(.+)$/gm, "<p style=\"margin-bottom:16px;line-height:1.8;color:#c8cad8\">$1</p>");
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) notFound();

  return (
    <main style={{ minHeight: "100vh", background: "#080b14", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/blog" style={{ fontSize: 13, color: "#8b92a9", textDecoration: "none", display: "inline-block", marginBottom: 32 }}>← ブログ一覧</Link>

        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12, lineHeight: 1.3 }}>{post.title}</h1>
          <div style={{ fontSize: 12, color: "#4a5068" }}>{new Date(post.createdAt).toLocaleDateString("ja-JP")}</div>
        </div>

        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />

        <div style={{ marginTop: 48, padding: "24px", background: "#0d1120", border: "1px solid #1c2136", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>AIプロンプトを探してみませんか？</div>
          <div style={{ fontSize: 13, color: "#8b92a9", marginBottom: 16 }}>無料から使えるプロンプトが21個以上あります</div>
          <Link href="/marketplace" style={{ background: "#2563eb", color: "#fff", textDecoration: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 700, display: "inline-block" }}>
            プロンプトを見る →
          </Link>
        </div>
      </div>
    </main>
  );
}
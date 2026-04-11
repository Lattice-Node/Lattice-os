import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { FeedDetailContent } from "./FeedDetailContent";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await prisma.publicFeedItem.findUnique({
    where: { id },
    select: { title: true, previewText: true, agentName: true, isHidden: true, user: { select: { displayName: true } } },
  });
  if (!item || item.isHidden) return { title: "Not Found | Lattice" };

  const displayTitle = item.title || item.agentName;
  return {
    title: `${displayTitle} | Lattice`,
    description: item.previewText,
    openGraph: { title: displayTitle, description: item.previewText, type: "article", siteName: "Lattice", url: `https://www.lattice-protocol.com/feed/${id}` },
    twitter: { card: "summary_large_image", title: displayTitle, description: item.previewText },
  };
}

export default async function FeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await prisma.publicFeedItem.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      previewText: true,
      resultText: true,
      agentName: true,
      createdAt: true,
      likeCount: true,
      viewCount: true,
      isHidden: true,
      user: { select: { displayName: true, handle: true, avatarUrl: true } },
      agent: { select: { id: true, name: true, description: true, isPublic: true } },
    },
  });

  if (!item || item.isHidden) notFound();

  // Increment view count
  await prisma.publicFeedItem.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const displayTitle = item.title || item.agentName;
  const displayName = item.user.displayName || "ユーザー";
  const handle = item.user.handle || displayName.toLowerCase().replace(/\s+/g, "");
  const initial = displayName.charAt(0).toUpperCase();
  const absoluteTime = format(new Date(item.createdAt), "yyyy年M月d日 HH:mm", { locale: ja });

  return (
    <main style={{ minHeight: "100%", paddingBottom: 40, background: "var(--bg)", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
        {/* Back */}
        <Link href="/feed/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "12px 0", marginBottom: 8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          フィード
        </Link>

        {/* Author */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          {item.user.avatarUrl ? (
            <img src={item.user.avatarUrl} alt="" width={44} height={44} style={{ borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--btn-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--btn-text)", fontWeight: 600, fontSize: 18 }}>{initial}</div>
          )}
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{displayName}</p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "'Space Mono', monospace", margin: 0 }}>@{handle}</p>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-display)", margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>{displayTitle}</h1>

        {/* Time */}
        <p style={{ fontSize: 12, color: "var(--text-disabled)", fontFamily: "'Space Mono', monospace", margin: "0 0 20px" }}>{absoluteTime}</p>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 24px" }} />

        {/* Markdown content — rendered client-side */}
        <FeedDetailContent
          resultText={item.resultText}
          feedItemId={item.id}
          title={displayTitle}
          likeCount={item.likeCount}
          viewCount={item.viewCount + 1}
          agent={item.agent}
        />
      </div>
    </main>
  );
}

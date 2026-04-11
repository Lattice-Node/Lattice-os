import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const alt = "Lattice Feed Post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let item: { title: string; previewText: string; agentName: string; isHidden: boolean; user: { displayName: string } } | null = null;
  try {
    item = await prisma.publicFeedItem.findUnique({
      where: { id },
      select: {
        title: true,
        previewText: true,
        agentName: true,
        isHidden: true,
        user: { select: { displayName: true } },
      },
    });
  } catch (e) {
    console.error("[OG_IMAGE]", e);
  }

  if (!item || item.isHidden) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "sans-serif" }}>
          <div style={{ fontSize: 72, fontWeight: "bold", display: "flex" }}>Lattice</div>
          <div style={{ fontSize: 28, opacity: 0.6, marginTop: 20, display: "flex" }}>AI agent platform</div>
        </div>
      ),
      { ...size },
    );
  }

  const displayTitle = item.title || item.agentName || "Untitled";
  const preview = (item.previewText || "").slice(0, 140);
  const authorName = item.user?.displayName || "Lattice";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0a0a0a", display: "flex", flexDirection: "column", padding: "80px", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 32, opacity: 0.6, marginBottom: 30, display: "flex", letterSpacing: "0.05em" }}>LATTICE</div>
        <div style={{ fontSize: 68, fontWeight: "bold", marginBottom: 30, lineHeight: 1.15, display: "flex", maxWidth: "1040px" }}>{displayTitle}</div>
        <div style={{ fontSize: 28, opacity: 0.75, lineHeight: 1.5, display: "flex", maxWidth: "1040px" }}>{preview}</div>
        <div style={{ marginTop: "auto", fontSize: 24, opacity: 0.5, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex" }}>@{authorName}</div>
          <div style={{ display: "flex" }}>·</div>
          <div style={{ display: "flex" }}>lattice-protocol.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

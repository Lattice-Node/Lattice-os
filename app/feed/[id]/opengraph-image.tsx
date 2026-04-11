import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const alt = "Lattice Feed Post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LATTICE_RED = "#CC0000";
const BG_COLOR = "#0a0a0a";
const GEAR_COLOR = "#1a1a1a";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let item: { title: string; previewText: string; agentName: string; isHidden: boolean; user: { displayName: string } } | null = null;
  try {
    item = await prisma.publicFeedItem.findUnique({
      where: { id },
      select: { title: true, previewText: true, agentName: true, isHidden: true, user: { select: { displayName: true } } },
    });
  } catch (e) {
    console.error("[OG_IMAGE]", e);
  }

  if (!item || item.isHidden) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", background: BG_COLOR, display: "flex", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 12, background: LATTICE_RED, display: "flex" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "sans-serif" }}>
            <div style={{ fontSize: 72, fontWeight: "bold", display: "flex" }}>LATTICE</div>
            <div style={{ fontSize: 28, opacity: 0.6, marginTop: 20, display: "flex" }}>AI agent platform</div>
          </div>
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
      <div style={{ width: "100%", height: "100%", background: BG_COLOR, display: "flex", position: "relative", fontFamily: "sans-serif", color: "white" }}>
        {/* Red accent line */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 12, background: LATTICE_RED, display: "flex" }} />

        {/* Gear silhouette */}
        <div style={{ position: "absolute", right: -40, bottom: -40, width: 320, height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="320" height="320" viewBox="0 0 680 680" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(340 340)" fill={GEAR_COLOR}>
              <rect x="-34" y="-228" width="68" height="66" rx="10" />
              <rect x="-34" y="-228" width="68" height="66" rx="10" transform="rotate(45)" />
              <rect x="-34" y="-228" width="68" height="66" rx="10" transform="rotate(90)" />
              <rect x="-34" y="-228" width="68" height="66" rx="10" transform="rotate(135)" />
              <rect x="-34" y="-228" width="68" height="66" rx="10" transform="rotate(180)" />
              <rect x="-34" y="-228" width="68" height="66" rx="10" transform="rotate(225)" />
              <rect x="-34" y="-228" width="68" height="66" rx="10" transform="rotate(270)" />
              <rect x="-34" y="-228" width="68" height="66" rx="10" transform="rotate(315)" />
              <circle r="178" />
            </g>
            <circle cx="340" cy="340" r="128" fill={BG_COLOR} />
            <circle cx="340" cy="340" r="52" fill={GEAR_COLOR} />
          </svg>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", padding: "80px 80px 80px 92px", flex: 1, position: "relative" }}>
          {/* Brand header */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
            <div style={{ width: 64, height: 64, background: "#1c1c1e", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: "bold", color: LATTICE_RED }}>L</div>
            <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: "0.1em", opacity: 0.9, display: "flex" }}>LATTICE</div>
          </div>

          {/* Title */}
          <div style={{ fontSize: 72, fontWeight: "bold", lineHeight: 1.15, marginBottom: 32, maxWidth: 1000, display: "flex" }}>{displayTitle}</div>

          {/* Preview */}
          <div style={{ fontSize: 30, opacity: 0.75, lineHeight: 1.5, maxWidth: 1000, display: "flex" }}>{preview}</div>

          {/* Footer */}
          <div style={{ marginTop: "auto", fontSize: 24, opacity: 0.5, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex" }}>@{authorName}</div>
            <div style={{ display: "flex" }}>·</div>
            <div style={{ display: "flex" }}>lattice-protocol.com</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

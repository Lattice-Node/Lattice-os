"use client";

import { useRef, useState } from "react";
import { useHaptics } from "@/hooks/useHaptics";
import { nativeFetch } from "@/lib/native-fetch";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

type FeedItem = {
  id: string;
  title: string;
  previewText: string;
  agentName: string;
  likeCount: number;
  viewCount: number;
  isLikedByMe: boolean;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    handle: string;
    avatarUrl: string | null;
  };
};

export default function FeedItemCard({ item, onLikeToggle }: { item: FeedItem; onLikeToggle: (newState: boolean) => void }) {
  const { trigger } = useHaptics();
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reported, setReported] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handlePressStart = () => {
    setPressed(true);
    trigger("light");
  };
  const handlePressEnd = () => setPressed(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    trigger("light");
    const newState = !item.isLikedByMe;
    onLikeToggle(newState);
    try {
      const res = await nativeFetch("/api/feed/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedItemId: item.id }),
      });
      if (!res.ok) throw new Error();
    } catch {
      onLikeToggle(!newState);
    }
  };

  const openReport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!reported) setShowReport(true);
  };

  const displayName = item.user.displayName || "ユーザー";
  const handle = item.user.handle || displayName.toLowerCase().replace(/\s+/g, "");
  const initial = displayName.charAt(0).toUpperCase();
  const displayTitle = item.title || item.agentName;
  const relativeTime = formatDistanceToNow(new Date(item.createdAt), { locale: ja, addSuffix: true });

  return (
    <>
      <div
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, transition: "transform .1s, border-color .15s", transform: pressed ? "scale(0.97)" : "scale(1)", cursor: "pointer" }}
      >
        {/* Header: avatar + name + time */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {item.user.avatarUrl ? (
              <img src={item.user.avatarUrl} alt="" width={40} height={40} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--btn-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--btn-text)", fontWeight: 600, fontSize: 16, fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>
                {initial}
              </div>
            )}
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>{displayName}</p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "'Space Mono', monospace", margin: 0 }}>@{handle}</p>
            </div>
          </div>
          <span style={{ fontSize: 11, color: "var(--text-disabled)", fontFamily: "'Space Mono', monospace", flexShrink: 0, marginLeft: 8 }}>{relativeTime}</span>
        </div>

        {/* Title */}
        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-display)", margin: "0 0 6px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {displayTitle}
        </p>

        {/* Preview text */}
        {item.previewText && (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 14px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.previewText}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <button onClick={handleLike} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: item.isLikedByMe ? "#ef4444" : "var(--text-secondary)", fontSize: 13, fontFamily: "'Space Mono', monospace", padding: "4px 8px", borderRadius: 8, cursor: "pointer", transition: "all 0.15s" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={item.isLikedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
            <span>{item.likeCount}</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-disabled)", fontSize: 13, fontFamily: "'Space Mono', monospace", padding: "4px 8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            <span>{item.viewCount}</span>
          </div>
          <button onClick={openReport} style={{ display: "flex", alignItems: "center", background: "none", border: "none", color: reported ? "var(--text-disabled)" : "var(--text-secondary)", padding: "4px 8px", borderRadius: 8, cursor: reported ? "default" : "pointer", marginLeft: "auto", opacity: reported ? 0.5 : 1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
          </button>
        </div>
      </div>

      {/* Report modal */}
      {showReport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setShowReport(false)}>
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24, maxWidth: 360, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-display)", margin: "0 0 8px" }}>投稿を通報</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px" }}>この投稿の問題点を教えてください</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {[
                { value: "spam", label: "スパム・宣伝" },
                { value: "inappropriate", label: "不適切な内容" },
                { value: "harassment", label: "嫌がらせ" },
                { value: "privacy", label: "個人情報を含む" },
                { value: "other", label: "その他" },
              ].map((opt) => (
                <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "var(--bg)", borderRadius: 10, cursor: "pointer", fontSize: 14, color: "var(--text-primary)", border: reportReason === opt.value ? "1px solid var(--btn-bg)" : "1px solid transparent" }}>
                  <input type="radio" name="report-reason" value={opt.value} checked={reportReason === opt.value} onChange={(e) => setReportReason(e.target.value)} style={{ accentColor: "var(--btn-bg)" }} />
                  {opt.label}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setShowReport(false); setReportReason(""); }} style={{ flex: 1, padding: 12, borderRadius: 12, fontSize: 14, fontWeight: 600, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", cursor: "pointer", fontFamily: "inherit" }}>キャンセル</button>
              <button
                disabled={!reportReason || reportSubmitting}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setReportSubmitting(true);
                  try {
                    const res = await nativeFetch("/api/feed/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feedItemId: item.id, reason: reportReason }) });
                    if (res.ok) { setReported(true); setShowReport(false); setReportReason(""); }
                  } catch {} finally { setReportSubmitting(false); }
                }}
                style={{ flex: 1, padding: 12, borderRadius: 12, fontSize: 14, fontWeight: 600, border: "none", background: !reportReason ? "var(--border)" : "var(--accent)", color: "#fff", cursor: !reportReason ? "default" : "pointer", fontFamily: "inherit", opacity: reportSubmitting ? 0.5 : 1 }}
              >
                {reportSubmitting ? "送信中..." : "通報する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

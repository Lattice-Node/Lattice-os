"use client";

import { useState } from "react";
import { useHaptics } from "@/hooks/useHaptics";
import { nativeFetch } from "@/lib/native-fetch";

export function LikeButton({ feedItemId, initialCount, initialLiked }: { feedItemId: string; initialCount: number; initialLiked: boolean }) {
  const { trigger } = useHaptics();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const handleLike = async () => {
    trigger("light");
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => c + (newLiked ? 1 : -1));
    try {
      const res = await nativeFetch("/api/feed/like", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feedItemId }) });
      if (!res.ok) throw new Error();
    } catch {
      setLiked(!newLiked);
      setCount((c) => c + (newLiked ? -1 : 1));
    }
  };

  return (
    <button onClick={handleLike} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: liked ? "#ef4444" : "var(--text-secondary)", fontSize: 14, fontFamily: "'Space Mono', monospace", padding: "8px 12px", borderRadius: 10, cursor: "pointer", transition: "all 0.15s" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
      <span>{count} いいね</span>
    </button>
  );
}

export function ShareButton({ id, title }: { id: string; title: string }) {
  const handleShare = async () => {
    const url = `https://www.lattice-protocol.com/feed/${id}`;
    const text = `${title} | Lattice`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title, text, url }); } catch {}
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
    }
  };

  return (
    <button onClick={handleShare} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
      シェア
    </button>
  );
}

export function XPostButton({ id, title, previewText }: { id: string; title: string; previewText: string }) {
  const handleXPost = async () => {
    const url = `https://www.lattice-protocol.com/feed/${id}`;
    const trimmed = previewText.length > 80 ? previewText.slice(0, 80) + "..." : previewText;
    const postText = `${title}\n\n${trimmed}\n\n${url}\n\nLattice で生成 @Lattice_Node`;
    const xIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}`;
    try {
      const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
      if (isNative) {
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url: xIntentUrl });
      } else {
        window.open(xIntentUrl, "_blank");
      }
    } catch {
      window.open(xIntentUrl, "_blank");
    }
  };

  return (
    <button onClick={handleXPost} style={{ display: "flex", alignItems: "center", gap: 8, background: "#000", border: "1px solid var(--border)", color: "#fff", fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
      Xへ投稿
    </button>
  );
}

export function ReportButton({ feedItemId }: { feedItemId: string }) {
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reported, setReported] = useState(false);

  return (
    <>
      <button onClick={() => !reported && setShowReport(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "1px solid var(--border)", color: reported ? "var(--text-disabled)" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 10, cursor: reported ? "default" : "pointer", fontFamily: "inherit", opacity: reported ? 0.5 : 1 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
        {reported ? "通報済み" : "通報"}
      </button>
      {showReport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setShowReport(false)}>
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24, maxWidth: 360, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-display)", margin: "0 0 8px" }}>投稿を通報</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px" }}>この投稿の問題点を教えてください</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {["spam:スパム・宣伝", "inappropriate:不適切な内容", "harassment:嫌がらせ", "privacy:個人情報を含む", "other:その他"].map((opt) => {
                const [v, l] = opt.split(":");
                return (
                  <label key={v} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "var(--bg)", borderRadius: 10, cursor: "pointer", fontSize: 14, color: "var(--text-primary)", border: reason === v ? "1px solid var(--btn-bg)" : "1px solid transparent" }}>
                    <input type="radio" name="report-r" value={v} checked={reason === v} onChange={(e) => setReason(e.target.value)} style={{ accentColor: "var(--btn-bg)" }} />
                    {l}
                  </label>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setShowReport(false); setReason(""); }} style={{ flex: 1, padding: 12, borderRadius: 12, fontSize: 14, fontWeight: 600, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", cursor: "pointer", fontFamily: "inherit" }}>キャンセル</button>
              <button disabled={!reason || submitting} onClick={async () => {
                setSubmitting(true);
                try {
                  const res = await nativeFetch("/api/feed/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feedItemId, reason }) });
                  if (res.ok) { setReported(true); setShowReport(false); setReason(""); }
                } catch {} finally { setSubmitting(false); }
              }} style={{ flex: 1, padding: 12, borderRadius: 12, fontSize: 14, fontWeight: 600, border: "none", background: !reason ? "var(--border)" : "var(--accent)", color: "#fff", cursor: !reason ? "default" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.5 : 1 }}>
                {submitting ? "送信中..." : "通報する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

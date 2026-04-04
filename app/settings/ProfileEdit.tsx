"use client";
import { useState, useRef } from "react";

interface ProfileEditProps {
  oauthName: string;
  oauthImage: string;
  initialHandle: string | null;
  initialDisplayName: string;
  initialAvatarUrl: string | null;
  initialPublicId: string | null;
}

const PRESET_AVATARS = [
  { id: "avatar:wolf", emoji: "🐺", bg: "#1e2044" },
  { id: "avatar:cat", emoji: "🐱", bg: "#2a1e3a" },
  { id: "avatar:dog", emoji: "🐶", bg: "#1e2a1a" },
  { id: "avatar:fox", emoji: "🦊", bg: "#2a2010" },
  { id: "avatar:robot", emoji: "🤖", bg: "#1a2a2a" },
  { id: "avatar:alien", emoji: "👾", bg: "#2a1a2a" },
  { id: "avatar:rocket", emoji: "🚀", bg: "#1e2044" },
  { id: "avatar:star", emoji: "⭐", bg: "#2a2a10" },
  { id: "avatar:fire", emoji: "🔥", bg: "#2a1a10" },
  { id: "avatar:bolt", emoji: "⚡", bg: "#2a2a10" },
  { id: "avatar:gem", emoji: "💎", bg: "#1a1a2a" },
  { id: "avatar:globe", emoji: "🌏", bg: "#1a2a2a" },
];

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d")!;
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        ctx.drawImage(img, x, y, size, size, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getAvatarDisplay(avatarUrl: string | null, oauthImage: string, name: string): { type: "image" | "emoji" | "initial"; src?: string; emoji?: string; bg?: string; initial?: string } {
  if (avatarUrl && avatarUrl.startsWith("data:image")) return { type: "image", src: avatarUrl };
  if (avatarUrl && avatarUrl.startsWith("avatar:")) {
    const preset = PRESET_AVATARS.find(a => a.id === avatarUrl);
    if (preset) return { type: "emoji", emoji: preset.emoji, bg: preset.bg };
  }
  if (oauthImage) return { type: "image", src: oauthImage };
  return { type: "initial", initial: (name || "U")[0].toUpperCase(), bg: "var(--btn-bg)" };
}

export default function ProfileEdit({ oauthName, oauthImage, initialHandle, initialDisplayName, initialAvatarUrl, initialPublicId }: ProfileEditProps) {
  const [editing, setEditing] = useState(false);
  const [handle, setHandle] = useState(initialHandle || "");
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [publicId, setPublicId] = useState(initialPublicId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentAvatar = getAvatarDisplay(avatarUrl, oauthImage, displayName || oauthName);
  const shownName = displayName || oauthName || "ユーザー";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("画像ファイルを選択してください"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("5MB以下の画像を選択してください"); return; }
    try {
      const base64 = await resizeImage(file, 128);
      setAvatarUrl(base64);
      setError("");
    } catch { setError("画像の読み込みに失敗しました"); }
  };

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.trim() || null, displayName: displayName.trim(), avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "保存に失敗しました"); setSaving(false); return; }
      if (data.profile.publicId) setPublicId(data.profile.publicId);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setEditing(false); }, 1200);
    } catch { setError("保存に失敗しました"); } finally { setSaving(false); }
  };

  if (editing) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>プロフィール編集</p>
          <button onClick={() => { setEditing(false); setError(""); }} style={{ background: "none", border: "none", color: "var(--text-disabled)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>キャンセル</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          {currentAvatar.type === "image" ? (
            <img src={currentAvatar.src} alt="" width={56} height={56} style={{ borderRadius: "50%", border: "2px solid var(--btn-bg)", objectFit: "cover" }} />
          ) : currentAvatar.type === "emoji" ? (
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: currentAvatar.bg, border: "2px solid var(--btn-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{currentAvatar.emoji}</div>
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: currentAvatar.bg, border: "2px solid var(--btn-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 700 }}>{currentAvatar.initial}</div>
          )}
          <div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 6px" }}>アイコンを変更</p>
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--btn-bg)", background: "transparent", color: "var(--btn-bg)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              写真をアップロード
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
          </div>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-disabled)", marginBottom: 8 }}>またはプリセットから選択</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {oauthImage && (
            <button onClick={() => setAvatarUrl(null)} style={{ width: 40, height: 40, borderRadius: "50%", border: !avatarUrl ? "2px solid var(--btn-bg)" : "2px solid transparent", padding: 0, cursor: "pointer", overflow: "hidden", background: "none" }}>
              <img src={oauthImage} alt="" width={36} height={36} style={{ borderRadius: "50%" }} />
            </button>
          )}
          {PRESET_AVATARS.map(a => (
            <button key={a.id} onClick={() => setAvatarUrl(a.id)} style={{ width: 40, height: 40, borderRadius: "50%", border: avatarUrl === a.id ? "2px solid var(--btn-bg)" : "2px solid transparent", background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, padding: 0 }}>
              {a.emoji}
            </button>
          ))}
        </div>

        <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>表示名</label>
        <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder={oauthName || "表示名を入力"} maxLength={30} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 14 }} />

        <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>ハンドル名</label>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-disabled)", fontSize: 14 }}>@</span>
          <input value={handle} onChange={e => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} placeholder="username" maxLength={20} style={{ width: "100%", padding: "10px 12px 10px 28px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        </div>
        <p style={{ fontSize: 11, color: "var(--text-disabled)", margin: "-8px 0 14px", lineHeight: 1.4 }}>英数字とアンダースコア、3〜20文字</p>

        {error && <p style={{ fontSize: 12, color: "var(--accent)", margin: "0 0 10px" }}>{error}</p>}
        {success && <p style={{ fontSize: 12, color: "var(--success)", margin: "0 0 10px" }}>保存しました</p>}

        <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: saving ? "#1e2044" : "var(--btn-bg)", color: saving ? "var(--text-disabled)" : "#fff", fontSize: 14, fontWeight: 600, cursor: saving ? "default" : "pointer", fontFamily: "inherit" }}>
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>プロフィール</p>
        <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: "var(--btn-bg)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>編集</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        {currentAvatar.type === "image" ? (
          <img src={currentAvatar.src} alt="" width={52} height={52} style={{ borderRadius: "50%", border: "1px solid var(--border)", objectFit: "cover" }} />
        ) : currentAvatar.type === "emoji" ? (
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: currentAvatar.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{currentAvatar.emoji}</div>
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: currentAvatar.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700 }}>{currentAvatar.initial}</div>
        )}
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 2px" }}>{shownName}</p>
          {handle ? (
            <p style={{ fontSize: 13, color: "var(--btn-bg)", margin: 0 }}>@{handle}</p>
          ) : (
            <p style={{ fontSize: 12, color: "var(--text-disabled)", margin: 0 }}>ハンドル未設定</p>
          )}
        </div>
      </div>
      {publicId && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "var(--bg)" }}>
          <span style={{ fontSize: 12, color: "var(--text-disabled)" }}>ID</span>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "monospace", letterSpacing: "0.05em" }}>{publicId}</span>
        </div>
      )}
    </div>
  );
}

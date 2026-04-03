"use client";
import { useState } from "react";

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

function getAvatarDisplay(avatarUrl: string | null, oauthImage: string, name: string): { type: "image" | "emoji" | "initial"; src?: string; emoji?: string; bg?: string; initial?: string } {
  if (avatarUrl && avatarUrl.startsWith("avatar:")) {
    const preset = PRESET_AVATARS.find(a => a.id === avatarUrl);
    if (preset) return { type: "emoji", emoji: preset.emoji, bg: preset.bg };
  }
  if (oauthImage) return { type: "image", src: oauthImage };
  return { type: "initial", initial: (name || "U")[0].toUpperCase(), bg: "#6c71e8" };
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

  const currentAvatar = getAvatarDisplay(avatarUrl, oauthImage, displayName || oauthName);
  const shownName = displayName || oauthName || "ユーザー";

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: handle.trim() || null,
          displayName: displayName.trim(),
          avatarUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存に失敗しました");
        setSaving(false);
        return;
      }
      if (data.profile.publicId) setPublicId(data.profile.publicId);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setEditing(false); }, 1200);
    } catch {
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  // Edit view
  if (editing) {
    return (
      <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, padding: 20, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: "#6a7080", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>プロフィール編集</p>
          <button onClick={() => { setEditing(false); setError(""); }} style={{ background: "none", border: "none", color: "#4a5060", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>キャンセル</button>
        </div>

        {/* Avatar picker */}
        <p style={{ fontSize: 12, color: "#6a7080", marginBottom: 8 }}>アイコン</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {/* OAuth image option */}
          {oauthImage && (
            <button
              onClick={() => setAvatarUrl(null)}
              style={{
                width: 44, height: 44, borderRadius: "50%", border: !avatarUrl ? "2px solid #6c71e8" : "2px solid transparent",
                padding: 0, cursor: "pointer", overflow: "hidden", background: "none",
              }}
            >
              <img src={oauthImage} alt="" width={40} height={40} style={{ borderRadius: "50%" }} />
            </button>
          )}
          {/* Preset avatars */}
          {PRESET_AVATARS.map(a => (
            <button
              key={a.id}
              onClick={() => setAvatarUrl(a.id)}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                border: avatarUrl === a.id ? "2px solid #6c71e8" : "2px solid transparent",
                background: a.bg, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 20, padding: 0,
              }}
            >
              {a.emoji}
            </button>
          ))}
        </div>

        {/* Display name */}
        <label style={{ fontSize: 12, color: "#6a7080", display: "block", marginBottom: 6 }}>表示名</label>
        <input
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder={oauthName || "表示名を入力"}
          maxLength={30}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #2e3440", background: "#0e1117", color: "#e8eaf0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 14 }}
        />

        {/* Handle */}
        <label style={{ fontSize: 12, color: "#6a7080", display: "block", marginBottom: 6 }}>ハンドル名</label>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#4a5060", fontSize: 14 }}>@</span>
          <input
            value={handle}
            onChange={e => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
            placeholder="username"
            maxLength={20}
            style={{ width: "100%", padding: "10px 12px 10px 28px", borderRadius: 8, border: "1px solid #2e3440", background: "#0e1117", color: "#e8eaf0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <p style={{ fontSize: 11, color: "#4a5060", margin: "-8px 0 14px", lineHeight: 1.4 }}>英数字とアンダースコア、3〜20文字</p>

        {error && <p style={{ fontSize: 12, color: "#f87171", margin: "0 0 10px" }}>{error}</p>}
        {success && <p style={{ fontSize: 12, color: "#4ade80", margin: "0 0 10px" }}>保存しました</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%", padding: "12px", borderRadius: 8, border: "none",
            background: saving ? "#1e2044" : "#6c71e8", color: saving ? "#4a5060" : "#fff",
            fontSize: 14, fontWeight: 600, cursor: saving ? "default" : "pointer", fontFamily: "inherit",
          }}
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>
    );
  }

  // Display view
  return (
    <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, padding: 20, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: "#6a7080", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>プロフィール</p>
        <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: "#6c71e8", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>編集</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        {/* Avatar */}
        {currentAvatar.type === "image" ? (
          <img src={currentAvatar.src} alt="" width={52} height={52} style={{ borderRadius: "50%", border: "1px solid #2e3440" }} />
        ) : currentAvatar.type === "emoji" ? (
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: currentAvatar.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
            {currentAvatar.emoji}
          </div>
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: currentAvatar.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700 }}>
            {currentAvatar.initial}
          </div>
        )}
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#e8eaf0", margin: "0 0 2px" }}>{shownName}</p>
          {handle ? (
            <p style={{ fontSize: 13, color: "#6c71e8", margin: 0 }}>@{handle}</p>
          ) : (
            <p style={{ fontSize: 12, color: "#4a5060", margin: 0 }}>ハンドル未設定</p>
          )}
        </div>
      </div>

      {/* Public ID */}
      {publicId && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#0e1117" }}>
          <span style={{ fontSize: 12, color: "#4a5060" }}>ID</span>
          <span style={{ fontSize: 13, color: "#9096a8", fontFamily: "monospace", letterSpacing: "0.05em" }}>{publicId}</span>
        </div>
      )}
    </div>
  );
}

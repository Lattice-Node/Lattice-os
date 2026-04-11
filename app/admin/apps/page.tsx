"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";
import { APPS_REGISTRY } from "@/lib/apps-registry";

type Override = { appId: string; iconImageUrl: string | null; color1: string | null; color2: string | null; name: string | null };

function resizeIcon(file: File, maxSize: number): Promise<string> {
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
        resolve(canvas.toDataURL("image/png", 0.9));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminAppsPage() {
  const router = useRouter();
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    nativeFetch("/api/admin/app-overrides")
      .then((r) => {
        if (r.status === 403) { setIsAdmin(false); return null; }
        if (!r.ok) { setIsAdmin(false); return null; }
        setIsAdmin(true);
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        const map: Record<string, Override> = {};
        for (const o of d.overrides || []) map[o.appId] = o;
        setOverrides(map);
      })
      .catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === false) {
    router.replace("/home/");
    return null;
  }
  if (isAdmin === null) return <div style={{ padding: 20, color: "var(--text-secondary)" }}>読み込み中...</div>;

  const handleUpload = async (appId: string, file: File) => {
    if (!file.type.startsWith("image/")) { alert("画像ファイルを選択してください"); return; }
    if (file.size > 2 * 1024 * 1024) { alert("2MB以下の画像を選択してください"); return; }
    setUploading(appId);
    try {
      const imageData = await resizeIcon(file, 256);
      const res = await nativeFetch("/api/admin/app-overrides/upload-icon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId, imageData }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Upload failed");
      setOverrides((prev) => ({ ...prev, [appId]: { ...prev[appId], appId, iconImageUrl: imageData, color1: null, color2: null, name: null } }));
    } catch (e: any) {
      alert("アップロード失敗: " + (e?.message || ""));
    } finally {
      setUploading(null);
    }
  };

  const handleRemove = async (appId: string) => {
    if (!confirm("画像を削除しますか?")) return;
    const res = await nativeFetch(`/api/admin/app-overrides/${appId}/icon`, { method: "DELETE" });
    if (res.ok) setOverrides((prev) => ({ ...prev, [appId]: { ...prev[appId], iconImageUrl: null } }));
  };

  return (
    <main style={{ minHeight: "100%", paddingBottom: 20, background: "var(--bg)", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 0" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", padding: "8px 0", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          戻る
        </button>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>ADMIN</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-display)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>アプリアイコン管理</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px" }}>アップロードした画像は全ユーザーのアプリ画面に反映されます</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {APPS_REGISTRY.map((app) => {
            const ov = overrides[app.id];
            const img = ov?.iconImageUrl;
            return (
              <div key={app.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
                {/* Preview */}
                <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: img ? "transparent" : `linear-gradient(135deg, ${app.color1}, ${app.color2})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {img ? (
                    <img src={img} alt={app.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={app.icon} /></svg>
                  )}
                </div>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>{app.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-disabled)", fontFamily: "'Space Mono', monospace", margin: 0 }}>{app.id}</p>
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <label style={{ padding: "8px 14px", background: "var(--btn-bg)", color: "var(--btn-text)", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.5 : 1 }}>
                    {uploading === app.id ? "..." : "画像を選択"}
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(app.id, f); e.target.value = ""; }} disabled={uploading !== null} style={{ display: "none" }} />
                  </label>
                  {img && (
                    <button onClick={() => handleRemove(app.id)} style={{ padding: "8px 14px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>削除</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

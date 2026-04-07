"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Variable {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea";
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  prompt: string | null;
  trigger: string | null;
  triggerCron: string | null;
  variables: string | null;
}

interface CommunityAgent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  trigger: string;
  triggerCron: string;
  publicUseCount: number;
  runCount: number;
  user: { name: string; displayName: string; handle: string | null; avatarUrl: string | null };
}

const PRESET_AVATARS_MAP: Record<string, { emoji: string; bg: string }> = {
  "avatar:wolf": { emoji: "🐺", bg: "var(--surface)" }, "avatar:cat": { emoji: "🐱", bg: "#2a1e3a" },
  "avatar:dog": { emoji: "🐶", bg: "#1e2a1a" }, "avatar:fox": { emoji: "🦊", bg: "#2a2010" },
  "avatar:robot": { emoji: "🤖", bg: "#1a2a2a" }, "avatar:alien": { emoji: "👾", bg: "#2a1a2a" },
  "avatar:rocket": { emoji: "🚀", bg: "var(--surface)" }, "avatar:star": { emoji: "⭐", bg: "#2a2a10" },
  "avatar:fire": { emoji: "🔥", bg: "#2a1a10" }, "avatar:bolt": { emoji: "⚡", bg: "#2a2a10" },
  "avatar:gem": { emoji: "💎", bg: "#1a1a2a" }, "avatar:globe": { emoji: "🌏", bg: "#1a2a2a" },
};

function AuthorAvatar({ user, size = 20 }: { user: { name: string; displayName: string; handle: string | null; avatarUrl: string | null }; size?: number }) {
  const av = user.avatarUrl;
  if (av && av.startsWith("data:image")) return <img src={av} alt="" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  if (av && PRESET_AVATARS_MAP[av]) {
    const p = PRESET_AVATARS_MAP[av];
    return <div style={{ width: size, height: size, borderRadius: "50%", background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55, flexShrink: 0 }}>{p.emoji}</div>;
  }
  const initial = (user.displayName || user.name || "U")[0].toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--btn-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.45, fontWeight: 700, flexShrink: 0 }}>{initial}</div>;
}

function authorLabel(user: { name: string; displayName: string; handle: string | null }) {
  if (user.handle) return "@" + user.handle;
  return user.displayName || user.name || "匿名";
}

const CATEGORY_DESC: Record<string, string> = {
  "リサーチ": "情報収集・調査系",
  "営業": "営業・マーケティング系",
  "SNS": "SNS運用系",
  "生産性": "業務効率化系",
  "通知": "アラート・通知系",
  "法務": "契約・法務系",
};

const categories = ["すべて", "リサーチ", "営業", "SNS", "生産性", "通知"];

// Plan hierarchy for comparison
const PLAN_LEVELS: Record<string, number> = { free: 0, starter: 1, personal: 1, pro: 2, business: 3 };

function detectRequiredFeatures(text: string) {
  const lower = text.toLowerCase();
  return {
    needsToolUse: lower.includes("fetch_url") || lower.includes("send_gmail") || lower.includes("tool use"),
    needsGmail: lower.includes("gmail") || lower.includes("未読メール") || lower.includes("メール要約") || lower.includes("メール取得") || lower.includes("メールを取得"),
    needsDiscord: lower.includes("discord"),
    needsLine: lower.includes("line連携") || lower.includes("line通知") || lower.includes("line notify"),
  };
}

function getRequiredPlan(features: ReturnType<typeof detectRequiredFeatures>): string {
  if (features.needsLine) return "business";
  if (features.needsToolUse) return "pro";
  if (features.needsGmail || features.needsDiscord) return "starter";
  return "free";
}

function canAccess(userPlan: string, requiredPlan: string): boolean {
  return (PLAN_LEVELS[userPlan] || 0) >= (PLAN_LEVELS[requiredPlan] || 0);
}

const PLAN_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  starter: { label: "Starter+", color: "var(--btn-bg)", bg: "rgba(108,113,232,0.12)", border: "rgba(108,113,232,0.3)" },
  pro: { label: "Pro+", color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)" },
  business: { label: "Business+", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
};

function PlanBadge({ plan }: { plan: string }) {
  const badge = PLAN_BADGE[plan];
  if (!badge) return null;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: badge.color, background: badge.bg, padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>
      {badge.label}
    </span>
  );
}

export default function StoreList({ templates, isPaid, userPlan = "free", connectedProviders = [], communityAgents = [], isLoggedIn = true }: { templates: Template[]; isPaid: boolean; userPlan?: string; connectedProviders?: string[]; communityAgents?: CommunityAgent[]; isLoggedIn?: boolean }) {
  const [tab, setTab] = useState<"official" | "community">("official");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("すべて");
  const [selected, setSelected] = useState<Template | null>(null);
  const [adding, setAdding] = useState(false);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityAgent | null>(null);
  const [copying, setCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const router = useRouter();

  const filtered = templates.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "すべて" || t.category === category;
    return matchSearch && matchCat;
  });

  const filteredCommunity = communityAgents.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || (a.description || "").toLowerCase().includes(search.toLowerCase())
  );

  function getVariables(template: Template): Variable[] {
    try { return JSON.parse(template.variables || "[]"); } catch { return []; }
  }

  function buildPrompt(template: Template, values: Record<string, string>): string {
    let prompt = template.prompt || "";
    for (const [key, val] of Object.entries(values)) { prompt = prompt.replaceAll(`{{${key}}}`, val || ""); }
    return prompt;
  }

  async function handleAdd() {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (!selected || adding) return;
    setAdding(true);
    setError("");
    const vars = getVariables(selected);
    const missing = vars.filter(v => !varValues[v.key]?.trim());
    if (missing.length > 0) {
      setError("「" + missing[0].label + "」を入力してください");
      setAdding(false);
      return;
    }
    const prompt = buildPrompt(selected, varValues);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selected.name, description: selected.description || "", prompt, trigger: selected.trigger || "manual", triggerCron: selected.triggerCron || "", connections: "[]", outputType: "app", outputConfig: "{}" }),
      });
      if (res.status === 403) { setError("フリープランではエージェントは3体までです。アップグレードしてください。"); setAdding(false); return; }
      if (!res.ok) throw new Error("作成に失敗しました");
      const data = await res.json();
      setSuccess(true);
      setTimeout(() => router.push(`/agents/detail/?id=${data.agent.id}`), 800);
    } catch (e) { setError(e instanceof Error ? e.message : "エラーが発生しました"); setAdding(false); }
  }

  async function handleCopyCommunity() {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (!selectedCommunity || copying) return;
    setCopying(true);
    setError("");
    try {
      const res = await fetch("/api/store/community/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: selectedCommunity.id }),
      });
      if (res.status === 403) { const data = await res.json(); setError(data.error || "プラン制限"); setCopying(false); return; }
      if (!res.ok) throw new Error("コピーに失敗しました");
      const data = await res.json();
      setCopySuccess(true);
      setTimeout(() => router.push(`/agents/detail/?id=${data.agent.id}`), 800);
    } catch (e) { setError(e instanceof Error ? e.message : "エラーが発生しました"); setCopying(false); }
  }

  function handleSelect(template: Template) {
    setSelected(template); setError(""); setSuccess(false); setAdding(false);
    const vars = getVariables(template);
    const defaults: Record<string, string> = {};
    for (const v of vars) { defaults[v.key] = ""; }
    setVarValues(defaults);
  }

  // ========== Community Agent Detail ==========
  if (selectedCommunity) {
    const agentText = [selectedCommunity.name, selectedCommunity.description, selectedCommunity.prompt].join(" ");
    const features = detectRequiredFeatures(agentText);
    const requiredPlan = getRequiredPlan(features);
    const hasAccess = isLoggedIn ? canAccess(userPlan, requiredPlan) : false;
    const badge = PLAN_BADGE[requiredPlan];

    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 0 100px" }}>
        <button onClick={() => { setSelectedCommunity(null); setCopySuccess(false); setError(""); }} style={{ background: "none", border: "none", color: "var(--text-disabled)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "0 0 20px", display: "block" }}>{"← 戻る"}</button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: badge ? badge.bg : "rgba(74,222,128,0.10)", border: `1px solid ${badge ? badge.border : "rgba(74,222,128,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 18 18" fill="none" stroke={badge ? badge.color : "var(--success)"} strokeWidth="1.6"><circle cx="9" cy="6" r="3" /><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-display)", margin: 0, letterSpacing: "-0.02em" }}>{selectedCommunity.name}</h1>
              {requiredPlan !== "free" && <PlanBadge plan={requiredPlan} />}
            </div>
            <span style={{ fontSize: 11, color: "var(--success)", background: "rgba(74,222,128,0.10)", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>{"コミュニティ"}</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "var(--text-disabled)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>{"説明"}</p>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{selectedCommunity.description || "ユーザー作成エージェント"}</p>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid var(--surface-raised)" }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{"作者"}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AuthorAvatar user={selectedCommunity.user} size={22} />
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{authorLabel(selectedCommunity.user)}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid var(--surface-raised)" }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{"利用者数"}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--success)" }}>{selectedCommunity.publicUseCount}{"人"}</span>
          </div>
          {requiredPlan !== "free" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid var(--surface-raised)" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{"必要プラン"}</span>
              <PlanBadge plan={requiredPlan} />
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{"実行コスト"}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--success)" }}>{"2クレジット / 実行"}</span>
          </div>
        </div>

        {error && <p style={{ fontSize: 13, color: "var(--accent)", margin: "0 0 12px" }}>{error}</p>}

        {copySuccess ? (
          <div style={{ textAlign: "center", padding: "14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--success)" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--success)", margin: 0 }}>{"マイエージェントに追加しました"}</p>
          </div>
        ) : !isLoggedIn ? (
          <button onClick={() => router.push("/login")} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: "var(--btn-bg)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {"ログインして使う"}
          </button>
        ) : !hasAccess ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ padding: "16px", borderRadius: 10, background: badge?.bg || "rgba(168,85,247,0.06)", border: `1px solid ${badge?.border || "rgba(168,85,247,0.2)"}`, marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: badge?.color || "#a855f7", margin: "0 0 6px" }}>{PLAN_BADGE[requiredPlan]?.label || "Starter+"}{"以上のプランで利用できます"}</p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{"このエージェントには有料プランの機能が含まれています"}</p>
            </div>
            <a href="/settings" style={{ display: "block", padding: "14px", borderRadius: 10, background: badge?.color || "#a855f7", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>{"プランをアップグレード"}</a>
          </div>
        ) : (
          <button onClick={handleCopyCommunity} disabled={copying} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: copying ? "var(--surface)" : "var(--success)", color: copying ? "var(--text-disabled)" : "#0a1a0e", fontSize: 15, fontWeight: 600, cursor: copying ? "default" : "pointer", fontFamily: "inherit" }}>
            {copying ? "追加中..." : "マイエージェントにコピーする"}
          </button>
        )}
      </div>
    );
  }

  // ========== Template Detail ==========
  if (selected) {
    const vars = getVariables(selected);
    const tText = [selected.name, selected.description, selected.prompt].filter(Boolean).join(" ");
    const features = detectRequiredFeatures(tText);
    const requiredPlan = getRequiredPlan(features);
    const hasAccess = isLoggedIn ? canAccess(userPlan, requiredPlan) : false;
    const needsConnection = isLoggedIn && ((features.needsGmail && !connectedProviders.includes("gmail")) || (features.needsDiscord && !connectedProviders.includes("discord")));
    const isToolUse = features.needsToolUse || (selected.description || "").includes("Tool Use");
    const badge = PLAN_BADGE[requiredPlan];

    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 0 100px" }}>
        <button onClick={() => { setSelected(null); setSuccess(false); }} style={{ background: "none", border: "none", color: "var(--text-disabled)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "0 0 20px", display: "block" }}>{"← 戻る"}</button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: badge ? badge.bg : "rgba(108,113,232,0.12)", border: `1px solid ${badge ? badge.border : "rgba(108,113,232,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {isToolUse ? (
              <svg width="24" height="24" viewBox="0 0 18 18" fill="none" stroke={badge?.color || "#a855f7"} strokeWidth="1.6"><path d="M9 2v4l2 1" /><circle cx="9" cy="9" r="7" /><path d="M13 13l2 2" /></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 18 18" fill="none" stroke={badge?.color || "var(--btn-bg)"} strokeWidth="1.6"><rect x="2" y="3" width="14" height="12" rx="2" /><path d="M2 7h14M7 7v8" /></svg>
            )}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-display)", margin: 0, letterSpacing: "-0.02em" }}>{selected.name}</h1>
              {requiredPlan !== "free" && <PlanBadge plan={requiredPlan} />}
            </div>
            {selected.category && <span style={{ fontSize: 11, color: "var(--btn-bg)", background: "var(--surface)", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>{selected.category}</span>}
          </div>
        </div>

        <div style={{ background: isToolUse ? "rgba(168,85,247,0.06)" : "var(--surface)", border: `1px solid ${isToolUse ? "rgba(168,85,247,0.2)" : "var(--border)"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{isToolUse ? "⚡" : "📄"}</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: isToolUse ? "#a855f7" : "var(--text-secondary)", margin: "0 0 2px" }}>{isToolUse ? "AIが自分で判断して行動する" : "AIが検索して報告する"}</p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{isToolUse ? "Webページを読み込み・メール送信など、複数ステップを自律実行" : "Web検索の結果をもとにテキストを生成して報告"}</p>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "var(--text-disabled)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>{"説明"}</p>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{selected.description || "AIエージェントテンプレート"}</p>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid var(--surface-raised)" }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{"実行コスト"}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--success)" }}>{"2クレジット / 実行"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid var(--surface-raised)" }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{"カテゴリ"}</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{selected.category ? selected.category + "（" + (CATEGORY_DESC[selected.category] || "") + "）" : "一般"}</span>
          </div>
          {requiredPlan !== "free" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: vars.length > 0 ? "1px solid var(--surface-raised)" : "none" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{"必要プラン"}</span>
              <PlanBadge plan={requiredPlan} />
            </div>
          )}
          {selected.trigger === "schedule" && selected.triggerCron && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{"スケジュール"}</span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {(() => { const parts = (selected.triggerCron || "").split(" "); const h = parts[1] || "8"; const m = (parts[0] || "0").padStart(2, "0"); const dow = parts[4]; if (dow === "1") return "毎週月曜 " + h + ":" + m; return "毎日 " + h + ":" + m; })()}
              </span>
            </div>
          )}
        </div>

        {/* Variable inputs - only show for logged-in users */}
        {isLoggedIn && vars.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: "var(--text-disabled)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>{"設定項目"}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {vars.map((v) => (
                <div key={v.key}>
                  <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>{v.label}</label>
                  {v.type === "textarea" ? (
                    <textarea value={varValues[v.key] || ""} onChange={(e) => setVarValues({ ...varValues, [v.key]: e.target.value })} placeholder={v.placeholder} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                  ) : (
                    <input value={varValues[v.key] || ""} onChange={(e) => setVarValues({ ...varValues, [v.key]: e.target.value })} placeholder={v.placeholder} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guest: show variable count info */}
        {!isLoggedIn && vars.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 20px", marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{"📝 " + vars.length + "個のカスタマイズ項目があります（ログイン後に設定）"}</p>
          </div>
        )}

        {error && <p style={{ fontSize: 13, color: "var(--accent)", margin: "0 0 12px" }}>{error}</p>}

        {success ? (
          <div style={{ textAlign: "center", padding: "14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--success)" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--success)", margin: 0 }}>{"エージェントを作成しました"}</p>
          </div>
        ) : !isLoggedIn ? (
          <button onClick={() => router.push("/login")} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: "var(--btn-bg)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {"ログインして使う"}
          </button>
        ) : !hasAccess ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ padding: "16px", borderRadius: 10, background: badge?.bg || "rgba(168,85,247,0.06)", border: `1px solid ${badge?.border || "rgba(168,85,247,0.2)"}`, marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: badge?.color || "#a855f7", margin: "0 0 6px" }}>{PLAN_BADGE[requiredPlan]?.label || "Starter+"}{"以上のプランで利用できます"}</p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{"このエージェントには有料プランの機能が含まれています"}</p>
            </div>
            <a href="/settings" style={{ display: "block", padding: "14px", borderRadius: 10, background: badge?.color || "#a855f7", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>{"プランをアップグレード"}</a>
          </div>
        ) : needsConnection ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ padding: "16px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", margin: "0 0 6px" }}>{features.needsGmail ? "Gmail" : "Discord"}{"連携が必要です"}</p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{"設定画面からサービスを連携してください。"}</p>
            </div>
            <a href="/settings" style={{ display: "block", padding: "14px", borderRadius: 10, background: "var(--accent)", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>{"連携する"}</a>
          </div>
        ) : (
          <button onClick={handleAdd} disabled={adding} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: adding ? "var(--surface)" : badge?.color || "var(--btn-bg)", color: adding ? "var(--text-disabled)" : "#fff", fontSize: 15, fontWeight: 600, cursor: adding ? "default" : "pointer", fontFamily: "inherit" }}>
            {adding ? "作成中..." : "マイエージェントに追加する"}
          </button>
        )}
      </div>
    );
  }

  // ========== List View ==========
  return (
    <>
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => { setTab("official"); setSearch(""); }} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: tab === "official" ? "2px solid var(--btn-bg)" : "2px solid transparent", color: tab === "official" ? "var(--btn-bg)" : "var(--text-disabled)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>{"公式テンプレート"}</button>
        <button onClick={() => { setTab("community"); setSearch(""); }} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: tab === "community" ? "2px solid var(--success)" : "2px solid transparent", color: tab === "community" ? "var(--success)" : "var(--text-disabled)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
          {"みんなのエージェント"}
          {communityAgents.length > 0 && <span style={{ marginLeft: 6, fontSize: 10, background: "rgba(74,222,128,0.15)", color: "var(--success)", padding: "1px 6px", borderRadius: 10 }}>{communityAgents.length}</span>}
        </button>
      </div>

      <div className="search-bar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><circle cx="6.5" cy="6.5" r="5" /><path d="M10.5 10.5l4 4" /></svg>
        <input type="text" placeholder={tab === "official" ? "エージェントを検索..." : "みんなのエージェントを検索..."} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {tab === "official" ? (
        <>
          <div className="pills">
            {categories.map((cat) => (<button key={cat} className={"pill " + (category === cat ? "active" : "inactive")} onClick={() => setCategory(cat)}>{cat}</button>))}
          </div>
          <p className="section-label">{filtered.length}{"個のエージェント"}</p>
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "32px 14px" }}><p style={{ color: "var(--muted)", fontSize: "14px" }}>{"該当するエージェントが見つかりません"}</p></div>
          ) : (
            filtered.map((t, i) => {
              const tText = [t.name, t.description, t.prompt].filter(Boolean).join(" ");
              const tFeatures = detectRequiredFeatures(tText);
              const tRequired = getRequiredPlan(tFeatures);
              const tBadge = PLAN_BADGE[tRequired];
              const isToolUse = tFeatures.needsToolUse || (t.description || "").includes("Tool Use");
              return (
              <div key={t.id} className="store-card animate-in" style={{ animationDelay: i * 50 + "ms", cursor: "pointer", ...(tBadge ? { border: `1px solid ${tBadge.border}`, background: `linear-gradient(135deg, ${tBadge.bg}, transparent)` } : {}) }} onClick={() => handleSelect(t)}>
                <div className="store-card-top">
                  <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                      <p className="store-card-title" style={{ margin: 0 }}>{t.name}</p>
                      {tRequired !== "free" && <PlanBadge plan={tRequired} />}
                    </div>
                    <p className="store-card-desc">{t.description || "AIエージェントテンプレート"}</p>
                  </div>
                  <div style={{ background: tBadge?.bg || "rgba(108, 113, 232, 0.12)", padding: 7, borderRadius: 8, flexShrink: 0 }}>
                    {isToolUse ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={tBadge?.color || "#a855f7"} strokeWidth="1.6"><path d="M9 2v4l2 1" /><circle cx="9" cy="9" r="7" /><path d="M13 13l2 2" /></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={tBadge?.color || "var(--btn-bg)"} strokeWidth="1.6"><rect x="2" y="3" width="14" height="12" rx="2" /><path d="M2 7h14M7 7v8" /></svg>
                    )}
                  </div>
                </div>
                <div className="store-card-bottom">
                  <div className="store-card-stats">
                    <span className="store-card-stat" style={{ color: "var(--green)" }}>{"2クレジット / 回"}</span>
                    {t.category && <span className="store-card-stat" style={{ color: "var(--muted)" }}>{t.category}</span>}
                  </div>
                  <span style={{ fontSize: 12, color: tBadge?.color || "var(--text-disabled)" }}>{isToolUse ? "Tool Use ›" : "詳細 ›"}</span>
                </div>
              </div>
              );
            })
          )}
        </>
      ) : (
        <>
          <p className="section-label">{filteredCommunity.length}{"個のエージェント"}</p>
          {filteredCommunity.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "32px 14px" }}>
              <p style={{ color: "var(--muted)", fontSize: "14px", margin: "0 0 8px" }}>{"まだコミュニティエージェントがありません"}</p>
              <p style={{ color: "var(--text-disabled)", fontSize: 12, margin: 0 }}>{"マイエージェントから「公開する」でストアに出品できます"}</p>
            </div>
          ) : (
            filteredCommunity.map((a, i) => {
              const aText = [a.name, a.description, a.prompt].join(" ");
              const aFeatures = detectRequiredFeatures(aText);
              const aRequired = getRequiredPlan(aFeatures);
              const aBadge = PLAN_BADGE[aRequired];
              return (
              <div key={a.id} className="store-card animate-in" style={{ animationDelay: i * 50 + "ms", cursor: "pointer", border: `1px solid ${aBadge?.border || "rgba(74,222,128,0.2)"}`, background: `linear-gradient(135deg, ${aBadge?.bg || "rgba(74,222,128,0.04)"}, transparent)` }} onClick={() => { setSelectedCommunity(a); setError(""); setCopySuccess(false); setCopying(false); }}>
                <div className="store-card-top">
                  <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                      <p className="store-card-title" style={{ margin: 0 }}>{a.name}</p>
                      {aRequired !== "free" ? <PlanBadge plan={aRequired} /> : (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--success)", background: "rgba(74,222,128,0.12)", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap" }}>{"コミュニティ"}</span>
                      )}
                    </div>
                    <p className="store-card-desc">{a.description || "ユーザー作成エージェント"}</p>
                  </div>
                  <div style={{ background: aBadge?.bg || "rgba(74,222,128,0.10)", padding: 7, borderRadius: 8, flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={aBadge?.color || "var(--success)"} strokeWidth="1.6"><circle cx="9" cy="6" r="3" /><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
                  </div>
                </div>
                <div className="store-card-bottom">
                  <div className="store-card-stats">
                    <span className="store-card-stat" style={{ color: "var(--success)" }}>{a.publicUseCount}{"人が利用"}</span>
                    <span className="store-card-stat" style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}><AuthorAvatar user={a.user} size={14} />{authorLabel(a.user)}</span>
                  </div>
                  <span style={{ fontSize: 12, color: aBadge?.color || "var(--success)" }}>{"詳細 ›"}</span>
                </div>
              </div>
              );
            })
          )}
        </>
      )}
    </>
  );
}

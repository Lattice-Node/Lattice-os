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
  trigger: string;
  triggerCron: string;
  publicUseCount: number;
  runCount: number;
  user: { name: string };
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

function detectRequiredFeatures(template: Template) {
  const text = [template.name, template.description, template.prompt].filter(Boolean).join(" ").toLowerCase();
  return {
    needsToolUse: text.includes("fetch_url") || text.includes("send_gmail"),
    needsGmail: text.includes("gmail") || text.includes("未読メール") || text.includes("メール要約") || text.includes("メール取得") || text.includes("メールを取得"),
  };
}

export default function StoreList({ templates, isPaid, connectedProviders = [], communityAgents = [] }: { templates: Template[]; isPaid: boolean; connectedProviders?: string[]; communityAgents?: CommunityAgent[] }) {
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
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "すべて" || t.category === category;
    return matchSearch && matchCat;
  });

  const filteredCommunity = communityAgents.filter((a) =>
    !search ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.description || "").toLowerCase().includes(search.toLowerCase())
  );

  function getVariables(template: Template): Variable[] {
    try {
      return JSON.parse(template.variables || "[]");
    } catch {
      return [];
    }
  }

  function buildPrompt(template: Template, values: Record<string, string>): string {
    let prompt = template.prompt || "";
    for (const [key, val] of Object.entries(values)) {
      prompt = prompt.replaceAll(`{{${key}}}`, val || "");
    }
    return prompt;
  }

  async function handleAdd() {
    if (!selected || adding) return;
    setAdding(true);
    setError("");
    const vars = getVariables(selected);
    const missing = vars.filter(v => !varValues[v.key]?.trim());
    if (missing.length > 0) {
      setError(`「${missing[0].label}」を入力してください`);
      setAdding(false);
      return;
    }
    const prompt = buildPrompt(selected, varValues);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selected.name,
          description: selected.description || "",
          prompt,
          trigger: selected.trigger || "manual",
          triggerCron: selected.triggerCron || "",
          connections: "[]",
          outputType: "app",
          outputConfig: "{}",
        }),
      });
      if (res.status === 403) {
        setError("フリープランではエージェントは3体までです。アップグレードしてください。");
        setAdding(false);
        return;
      }
      if (!res.ok) throw new Error("作成に失敗しました");
      const data = await res.json();
      setSuccess(true);
      setTimeout(() => router.push(`/agents/${data.agent.id}`), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setAdding(false);
    }
  }

  async function handleCopyCommunity() {
    if (!selectedCommunity || copying) return;
    setCopying(true);
    setError("");
    try {
      const res = await fetch("/api/store/community/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: selectedCommunity.id }),
      });
      if (res.status === 403) {
        setError("フリープランではエージェントは3体までです。アップグレードしてください。");
        setCopying(false);
        return;
      }
      if (!res.ok) throw new Error("コピーに失敗しました");
      const data = await res.json();
      setCopySuccess(true);
      setTimeout(() => router.push(`/agents/${data.agent.id}`), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setCopying(false);
    }
  }

  function handleSelect(template: Template) {
    setSelected(template);
    setError("");
    setSuccess(false);
    setAdding(false);
    const vars = getVariables(template);
    const defaults: Record<string, string> = {};
    for (const v of vars) { defaults[v.key] = ""; }
    setVarValues(defaults);
  }

  // Community agent detail
  if (selectedCommunity) {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 0 100px" }}>
        <button
          onClick={() => { setSelectedCommunity(null); setCopySuccess(false); setError(""); }}
          style={{ background: "none", border: "none", color: "#4a5060", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "0 0 20px", display: "block" }}
        >
          ← 戻る
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 18 18" fill="none" stroke="#4ade80" strokeWidth="1.6">
              <circle cx="9" cy="6" r="3" />
              <path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f0f2f8", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              {selectedCommunity.name}
            </h1>
            <span style={{ fontSize: 11, color: "#4ade80", background: "rgba(74,222,128,0.10)", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>
              コミュニティ
            </span>
          </div>
        </div>

        <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>説明</p>
          <p style={{ fontSize: 14, color: "#9096a8", lineHeight: 1.7, margin: 0 }}>
            {selectedCommunity.description || "ユーザー作成エージェント"}
          </p>
        </div>

        <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #242830" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>作者</span>
            <span style={{ fontSize: 13, color: "#9096a8" }}>{selectedCommunity.user?.name || "匿名"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #242830" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>利用者数</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>{selectedCommunity.publicUseCount}人</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>実行コスト</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>2クレジット / 実行</span>
          </div>
        </div>

        {error && <p style={{ fontSize: 13, color: "#f87171", margin: "0 0 12px" }}>{error}</p>}

        {copySuccess ? (
          <div style={{ textAlign: "center", padding: "14px", borderRadius: 10, background: "#0f2a1a", border: "1px solid #1a4a2a" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#4ade80", margin: 0 }}>マイエージェントに追加しました</p>
          </div>
        ) : (
          <button
            onClick={handleCopyCommunity}
            disabled={copying}
            style={{
              width: "100%", padding: "14px", borderRadius: 10, border: "none",
              background: copying ? "#1e2044" : "#4ade80",
              color: copying ? "#4a5060" : "#0a1a0e",
              fontSize: 15, fontWeight: 600, cursor: copying ? "default" : "pointer", fontFamily: "inherit",
            }}
          >
            {copying ? "追加中..." : "マイエージェントにコピーする"}
          </button>
        )}
      </div>
    );
  }

  // Template detail view
  if (selected) {
    const vars = getVariables(selected);
    const features = detectRequiredFeatures(selected);
    const isToolUse = features.needsToolUse || (selected.description || "").includes("Tool Use") || (selected.prompt || "").includes("fetch_url") || (selected.prompt || "").includes("send_gmail");
    const isLocked = isToolUse && !isPaid;
    const needsGmailConnection = features.needsGmail && !connectedProviders.includes("gmail");

    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 0 100px" }}>
        <button
          onClick={() => { setSelected(null); setSuccess(false); }}
          style={{ background: "none", border: "none", color: "#4a5060", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "0 0 20px", display: "block" }}
        >
          ← 戻る
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: isToolUse ? "rgba(168,85,247,0.12)" : "rgba(108,113,232,0.12)", border: `1px solid ${isToolUse ? "rgba(168,85,247,0.3)" : "rgba(108,113,232,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {isToolUse ? (
              <svg width="24" height="24" viewBox="0 0 18 18" fill="none" stroke="#a855f7" strokeWidth="1.6"><path d="M9 2v4l2 1" /><circle cx="9" cy="9" r="7" /><path d="M13 13l2 2" /></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 18 18" fill="none" stroke="#6c71e8" strokeWidth="1.6"><rect x="2" y="3" width="14" height="12" rx="2" /><path d="M2 7h14M7 7v8" /></svg>
            )}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f0f2f8", margin: 0, letterSpacing: "-0.02em" }}>{selected.name}</h1>
              {isToolUse && <span style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", background: "rgba(168,85,247,0.15)", padding: "2px 7px", borderRadius: 4 }}>Tool Use</span>}
            </div>
            {selected.category && <span style={{ fontSize: 11, color: "#6c71e8", background: "#1e2044", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>{selected.category}</span>}
          </div>
        </div>

        <div style={{ background: isToolUse ? "rgba(168,85,247,0.06)" : "#1c2028", border: `1px solid ${isToolUse ? "rgba(168,85,247,0.2)" : "#2e3440"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{isToolUse ? "⚡" : "📄"}</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: isToolUse ? "#a855f7" : "#9096a8", margin: "0 0 2px" }}>{isToolUse ? "AIが自分で判断して行動する" : "AIが検索して報告する"}</p>
            <p style={{ fontSize: 11, color: "#6a7080", margin: 0 }}>{isToolUse ? "Webページを読み込み・メール送信など、複数ステップを自律実行" : "Web検索の結果をもとにテキストを生成して報告"}</p>
          </div>
        </div>

        <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>説明</p>
          <p style={{ fontSize: 14, color: "#9096a8", lineHeight: 1.7, margin: 0 }}>{selected.description || "AIエージェントテンプレート"}</p>
        </div>

        <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #242830" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>実行コスト</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>2クレジット / 実行</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: vars.length > 0 ? "1px solid #242830" : "none" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>カテゴリ</span>
            <span style={{ fontSize: 13, color: "#9096a8" }}>{selected.category ? `${selected.category}（${CATEGORY_DESC[selected.category] || ""}）` : "一般"}</span>
          </div>
          {selected.trigger === "schedule" && selected.triggerCron && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
              <span style={{ fontSize: 13, color: "#6a7080" }}>スケジュール</span>
              <span style={{ fontSize: 13, color: "#9096a8" }}>
                {(() => { const parts = (selected.triggerCron || "").split(" "); const h = parts[1] || "8"; const m = (parts[0] || "0").padStart(2, "0"); const dow = parts[4]; if (dow === "1") return `毎週月曜 ${h}:${m}`; return `毎日 ${h}:${m}`; })()}
              </span>
            </div>
          )}
        </div>

        {vars.length > 0 && (
          <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, padding: "18px 20px", marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>設定項目</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {vars.map((v) => (
                <div key={v.key}>
                  <label style={{ fontSize: 13, color: "#9096a8", display: "block", marginBottom: 6 }}>{v.label}</label>
                  {v.type === "textarea" ? (
                    <textarea value={varValues[v.key] || ""} onChange={(e) => setVarValues({ ...varValues, [v.key]: e.target.value })} placeholder={v.placeholder} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #2e3440", background: "#0e1117", color: "#e8eaf0", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                  ) : (
                    <input value={varValues[v.key] || ""} onChange={(e) => setVarValues({ ...varValues, [v.key]: e.target.value })} placeholder={v.placeholder} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #2e3440", background: "#0e1117", color: "#e8eaf0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p style={{ fontSize: 13, color: "#f87171", margin: "0 0 12px" }}>{error}</p>}

        {success ? (
          <div style={{ textAlign: "center", padding: "14px", borderRadius: 10, background: "#0f2a1a", border: "1px solid #1a4a2a" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#4ade80", margin: 0 }}>エージェントを作成しました</p>
          </div>
        ) : isLocked ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ padding: "16px", borderRadius: 10, background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)", marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#a855f7", margin: "0 0 6px" }}>Starter以上のプランで利用できます</p>
              <p style={{ fontSize: 12, color: "#6a7080", margin: 0 }}>Tool Useエージェントは、AIが自律的にWebを読んだりメールを送る高度な機能です</p>
            </div>
            <a href="/settings" style={{ display: "block", padding: "14px", borderRadius: 10, background: "#a855f7", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>プランをアップグレード</a>
          </div>
        ) : needsGmailConnection ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ padding: "16px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#f87171", margin: "0 0 6px" }}>Gmail連携が必要です</p>
              <p style={{ fontSize: 12, color: "#6a7080", margin: 0 }}>このエージェントはGmailからメールを取得します。設定画面からGmailを連携してください。</p>
            </div>
            <a href="/settings" style={{ display: "block", padding: "14px", borderRadius: 10, background: "#f87171", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>Gmailを連携する</a>
          </div>
        ) : (
          <button onClick={handleAdd} disabled={adding} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: adding ? "#1e2044" : isToolUse ? "#a855f7" : "#6c71e8", color: adding ? "#4a5060" : "#fff", fontSize: 15, fontWeight: 600, cursor: adding ? "default" : "pointer", fontFamily: "inherit" }}>
            {adding ? "作成中..." : "マイエージェントに追加する"}
          </button>
        )}
      </div>
    );
  }

  // List view
  return (
    <>
      {/* Top tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid #2e3440" }}>
        <button
          onClick={() => { setTab("official"); setSearch(""); }}
          style={{
            flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: tab === "official" ? "2px solid #6c71e8" : "2px solid transparent",
            color: tab === "official" ? "#6c71e8" : "#4a5060", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
          }}
        >
          公式テンプレート
        </button>
        <button
          onClick={() => { setTab("community"); setSearch(""); }}
          style={{
            flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: tab === "community" ? "2px solid #4ade80" : "2px solid transparent",
            color: tab === "community" ? "#4ade80" : "#4a5060", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
          }}
        >
          みんなのエージェント
          {communityAgents.length > 0 && (
            <span style={{ marginLeft: 6, fontSize: 10, background: "rgba(74,222,128,0.15)", color: "#4ade80", padding: "1px 6px", borderRadius: 10 }}>{communityAgents.length}</span>
          )}
        </button>
      </div>

      <div className="search-bar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9096a8" strokeWidth="1.8">
          <circle cx="6.5" cy="6.5" r="5" />
          <path d="M10.5 10.5l4 4" />
        </svg>
        <input
          type="text"
          placeholder={tab === "official" ? "エージェントを検索..." : "みんなのエージェントを検索..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {tab === "official" ? (
        <>
          <div className="pills">
            {categories.map((cat) => (
              <button key={cat} className={"pill " + (category === cat ? "active" : "inactive")} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
          <p className="section-label">{filtered.length}個のエージェント</p>
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "32px 14px" }}>
              <p style={{ color: "var(--muted)", fontSize: "14px" }}>該当するエージェントが見つかりません</p>
            </div>
          ) : (
            filtered.map((t, i) => {
              const tFeatures = detectRequiredFeatures(t);
              const isToolUse = tFeatures.needsToolUse || (t.description || "").includes("Tool Use") || (t.prompt || "").includes("fetch_url") || (t.prompt || "").includes("send_gmail");
              const needsGmail = tFeatures.needsGmail && !connectedProviders.includes("gmail");
              return (
              <div
                key={t.id}
                className="store-card animate-in"
                style={{ animationDelay: i * 50 + "ms", cursor: "pointer", ...(isToolUse ? { border: "1px solid rgba(168,85,247,0.4)", background: "linear-gradient(135deg, rgba(168,85,247,0.06), rgba(108,113,232,0.04))" } : {}) }}
                onClick={() => handleSelect(t)}
              >
                <div className="store-card-top">
                  <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                      <p className="store-card-title" style={{ margin: 0 }}>{t.name}</p>
                      {isToolUse && <span style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", background: "rgba(168,85,247,0.15)", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>Tool Use</span>}
                      {needsGmail && <span style={{ fontSize: 10, fontWeight: 700, color: "#f87171", background: "rgba(239,68,68,0.12)", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>Gmail必須</span>}
                    </div>
                    <p className="store-card-desc">{t.description || "AIエージェントテンプレート"}</p>
                  </div>
                  <div style={{ background: isToolUse ? "rgba(168,85,247,0.15)" : "rgba(108, 113, 232, 0.12)", padding: 7, borderRadius: 8, flexShrink: 0 }}>
                    {isToolUse ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a855f7" strokeWidth="1.6"><path d="M9 2v4l2 1" /><circle cx="9" cy="9" r="7" /><path d="M13 13l2 2" /></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#6c71e8" strokeWidth="1.6"><rect x="2" y="3" width="14" height="12" rx="2" /><path d="M2 7h14M7 7v8" /></svg>
                    )}
                  </div>
                </div>
                <div className="store-card-bottom">
                  <div className="store-card-stats">
                    <span className="store-card-stat" style={{ color: "var(--green)" }}>2クレジット / 回</span>
                    {t.category && <span className="store-card-stat" style={{ color: "var(--muted)" }}>{t.category}</span>}
                  </div>
                  <span style={{ fontSize: 12, color: isToolUse ? "#a855f7" : "#4a5060" }}>{isToolUse ? "Tool Use ›" : "詳細 ›"}</span>
                </div>
              </div>
              );
            })
          )}
        </>
      ) : (
        <>
          <p className="section-label">{filteredCommunity.length}個のエージェント</p>
          {filteredCommunity.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "32px 14px" }}>
              <p style={{ color: "var(--muted)", fontSize: "14px", margin: "0 0 8px" }}>まだコミュニティエージェントがありません</p>
              <p style={{ color: "#4a5060", fontSize: 12, margin: 0 }}>マイエージェントから「公開する」でストアに出品できます</p>
            </div>
          ) : (
            filteredCommunity.map((a, i) => (
              <div
                key={a.id}
                className="store-card animate-in"
                style={{ animationDelay: i * 50 + "ms", cursor: "pointer", border: "1px solid rgba(74,222,128,0.2)", background: "linear-gradient(135deg, rgba(74,222,128,0.04), rgba(108,113,232,0.02))" }}
                onClick={() => { setSelectedCommunity(a); setError(""); setCopySuccess(false); setCopying(false); }}
              >
                <div className="store-card-top">
                  <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <p className="store-card-title" style={{ margin: 0 }}>{a.name}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.12)", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap" }}>コミュニティ</span>
                    </div>
                    <p className="store-card-desc">{a.description || "ユーザー作成エージェント"}</p>
                  </div>
                  <div style={{ background: "rgba(74,222,128,0.10)", padding: 7, borderRadius: 8, flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#4ade80" strokeWidth="1.6">
                      <circle cx="9" cy="6" r="3" />
                      <path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                    </svg>
                  </div>
                </div>
                <div className="store-card-bottom">
                  <div className="store-card-stats">
                    <span className="store-card-stat" style={{ color: "#4ade80" }}>{a.publicUseCount}人が利用</span>
                    <span className="store-card-stat" style={{ color: "var(--muted)" }}>by {a.user?.name || "匿名"}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#4ade80" }}>詳細 ›</span>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </>
  );
}

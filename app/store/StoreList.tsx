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
  user: { name: string };
}

const CATEGORY_DESC: Record<string, string> = {
  "\u30EA\u30B5\u30FC\u30C1": "\u60C5\u5831\u53CE\u96C6\u30FB\u8ABF\u67FB\u7CFB",
  "\u55B6\u696D": "\u55B6\u696D\u30FB\u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0\u7CFB",
  "SNS": "SNS\u904B\u7528\u7CFB",
  "\u751F\u7523\u6027": "\u696D\u52D9\u52B9\u7387\u5316\u7CFB",
  "\u901A\u77E5": "\u30A2\u30E9\u30FC\u30C8\u30FB\u901A\u77E5\u7CFB",
  "\u6CD5\u52D9": "\u5951\u7D04\u30FB\u6CD5\u52D9\u7CFB",
};

const categories = ["\u3059\u3079\u3066", "\u30EA\u30B5\u30FC\u30C1", "\u55B6\u696D", "SNS", "\u751F\u7523\u6027", "\u901A\u77E5"];

// Plan hierarchy for comparison
const PLAN_LEVELS: Record<string, number> = { free: 0, starter: 1, personal: 1, pro: 2, business: 3 };

function detectRequiredFeatures(text: string) {
  const lower = text.toLowerCase();
  return {
    needsToolUse: lower.includes("fetch_url") || lower.includes("send_gmail") || lower.includes("tool use"),
    needsGmail: lower.includes("gmail") || lower.includes("\u672A\u8AAD\u30E1\u30FC\u30EB") || lower.includes("\u30E1\u30FC\u30EB\u8981\u7D04") || lower.includes("\u30E1\u30FC\u30EB\u53D6\u5F97") || lower.includes("\u30E1\u30FC\u30EB\u3092\u53D6\u5F97"),
    needsDiscord: lower.includes("discord"),
    needsLine: lower.includes("line\u9023\u643A") || lower.includes("line\u901A\u77E5") || lower.includes("line notify"),
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
  starter: { label: "Starter+", color: "#6c71e8", bg: "rgba(108,113,232,0.12)", border: "rgba(108,113,232,0.3)" },
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

export default function StoreList({ templates, isPaid, userPlan = "free", connectedProviders = [], communityAgents = [] }: { templates: Template[]; isPaid: boolean; userPlan?: string; connectedProviders?: string[]; communityAgents?: CommunityAgent[] }) {
  const [tab, setTab] = useState<"official" | "community">("official");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("\u3059\u3079\u3066");
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
    const matchCat = category === "\u3059\u3079\u3066" || t.category === category;
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
    if (!selected || adding) return;
    setAdding(true);
    setError("");
    const vars = getVariables(selected);
    const missing = vars.filter(v => !varValues[v.key]?.trim());
    if (missing.length > 0) {
      setError("\u300C" + missing[0].label + "\u300D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");
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
      if (res.status === 403) { setError("\u30D5\u30EA\u30FC\u30D7\u30E9\u30F3\u3067\u306F\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u306F3\u4F53\u307E\u3067\u3067\u3059\u3002\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u3057\u3066\u304F\u3060\u3055\u3044\u3002"); setAdding(false); return; }
      if (!res.ok) throw new Error("\u4F5C\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
      const data = await res.json();
      setSuccess(true);
      setTimeout(() => router.push(`/agents/${data.agent.id}`), 800);
    } catch (e) { setError(e instanceof Error ? e.message : "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F"); setAdding(false); }
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
      if (res.status === 403) { const data = await res.json(); setError(data.error || "\u30D7\u30E9\u30F3\u5236\u9650"); setCopying(false); return; }
      if (!res.ok) throw new Error("\u30B3\u30D4\u30FC\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
      const data = await res.json();
      setCopySuccess(true);
      setTimeout(() => router.push(`/agents/${data.agent.id}`), 800);
    } catch (e) { setError(e instanceof Error ? e.message : "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F"); setCopying(false); }
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
    const hasAccess = canAccess(userPlan, requiredPlan);
    const badge = PLAN_BADGE[requiredPlan];

    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 0 100px" }}>
        <button onClick={() => { setSelectedCommunity(null); setCopySuccess(false); setError(""); }} style={{ background: "none", border: "none", color: "#4a5060", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "0 0 20px", display: "block" }}>{"\u2190 \u623B\u308B"}</button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: badge ? badge.bg : "rgba(74,222,128,0.10)", border: `1px solid ${badge ? badge.border : "rgba(74,222,128,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 18 18" fill="none" stroke={badge ? badge.color : "#4ade80"} strokeWidth="1.6"><circle cx="9" cy="6" r="3" /><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f0f2f8", margin: 0, letterSpacing: "-0.02em" }}>{selectedCommunity.name}</h1>
              {requiredPlan !== "free" && <PlanBadge plan={requiredPlan} />}
            </div>
            <span style={{ fontSize: 11, color: "#4ade80", background: "rgba(74,222,128,0.10)", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>{"\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3"}</span>
          </div>
        </div>

        <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>{"\u8AAC\u660E"}</p>
          <p style={{ fontSize: 14, color: "#9096a8", lineHeight: 1.7, margin: 0 }}>{selectedCommunity.description || "\u30E6\u30FC\u30B6\u30FC\u4F5C\u6210\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8"}</p>
        </div>

        <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #242830" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>{"\u4F5C\u8005"}</span>
            <span style={{ fontSize: 13, color: "#9096a8" }}>{selectedCommunity.user?.name || "\u533F\u540D"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #242830" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>{"\u5229\u7528\u8005\u6570"}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>{selectedCommunity.publicUseCount}{"\u4EBA"}</span>
          </div>
          {requiredPlan !== "free" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #242830" }}>
              <span style={{ fontSize: 13, color: "#6a7080" }}>{"\u5FC5\u8981\u30D7\u30E9\u30F3"}</span>
              <PlanBadge plan={requiredPlan} />
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>{"\u5B9F\u884C\u30B3\u30B9\u30C8"}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>{"2\u30AF\u30EC\u30B8\u30C3\u30C8 / \u5B9F\u884C"}</span>
          </div>
        </div>

        {error && <p style={{ fontSize: 13, color: "#f87171", margin: "0 0 12px" }}>{error}</p>}

        {copySuccess ? (
          <div style={{ textAlign: "center", padding: "14px", borderRadius: 10, background: "#0f2a1a", border: "1px solid #1a4a2a" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#4ade80", margin: 0 }}>{"\u30DE\u30A4\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u306B\u8FFD\u52A0\u3057\u307E\u3057\u305F"}</p>
          </div>
        ) : !hasAccess ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ padding: "16px", borderRadius: 10, background: badge?.bg || "rgba(168,85,247,0.06)", border: `1px solid ${badge?.border || "rgba(168,85,247,0.2)"}`, marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: badge?.color || "#a855f7", margin: "0 0 6px" }}>{PLAN_BADGE[requiredPlan]?.label || "Starter+"}{"\u4EE5\u4E0A\u306E\u30D7\u30E9\u30F3\u3067\u5229\u7528\u3067\u304D\u307E\u3059"}</p>
              <p style={{ fontSize: 12, color: "#6a7080", margin: 0 }}>{"\u3053\u306E\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u306B\u306F\u6709\u6599\u30D7\u30E9\u30F3\u306E\u6A5F\u80FD\u304C\u542B\u307E\u308C\u3066\u3044\u307E\u3059"}</p>
            </div>
            <a href="/settings" style={{ display: "block", padding: "14px", borderRadius: 10, background: badge?.color || "#a855f7", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>{"\u30D7\u30E9\u30F3\u3092\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9"}</a>
          </div>
        ) : (
          <button onClick={handleCopyCommunity} disabled={copying} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: copying ? "#1e2044" : "#4ade80", color: copying ? "#4a5060" : "#0a1a0e", fontSize: 15, fontWeight: 600, cursor: copying ? "default" : "pointer", fontFamily: "inherit" }}>
            {copying ? "\u8FFD\u52A0\u4E2D..." : "\u30DE\u30A4\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u306B\u30B3\u30D4\u30FC\u3059\u308B"}
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
    const hasAccess = canAccess(userPlan, requiredPlan);
    const needsConnection = (features.needsGmail && !connectedProviders.includes("gmail")) || (features.needsDiscord && !connectedProviders.includes("discord"));
    const isToolUse = features.needsToolUse || (selected.description || "").includes("Tool Use");
    const badge = PLAN_BADGE[requiredPlan];

    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 0 100px" }}>
        <button onClick={() => { setSelected(null); setSuccess(false); }} style={{ background: "none", border: "none", color: "#4a5060", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "0 0 20px", display: "block" }}>{"\u2190 \u623B\u308B"}</button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: badge ? badge.bg : "rgba(108,113,232,0.12)", border: `1px solid ${badge ? badge.border : "rgba(108,113,232,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {isToolUse ? (
              <svg width="24" height="24" viewBox="0 0 18 18" fill="none" stroke={badge?.color || "#a855f7"} strokeWidth="1.6"><path d="M9 2v4l2 1" /><circle cx="9" cy="9" r="7" /><path d="M13 13l2 2" /></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 18 18" fill="none" stroke={badge?.color || "#6c71e8"} strokeWidth="1.6"><rect x="2" y="3" width="14" height="12" rx="2" /><path d="M2 7h14M7 7v8" /></svg>
            )}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f0f2f8", margin: 0, letterSpacing: "-0.02em" }}>{selected.name}</h1>
              {requiredPlan !== "free" && <PlanBadge plan={requiredPlan} />}
            </div>
            {selected.category && <span style={{ fontSize: 11, color: "#6c71e8", background: "#1e2044", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>{selected.category}</span>}
          </div>
        </div>

        <div style={{ background: isToolUse ? "rgba(168,85,247,0.06)" : "#1c2028", border: `1px solid ${isToolUse ? "rgba(168,85,247,0.2)" : "#2e3440"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{isToolUse ? "\u26A1" : "\uD83D\uDCC4"}</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: isToolUse ? "#a855f7" : "#9096a8", margin: "0 0 2px" }}>{isToolUse ? "AI\u304C\u81EA\u5206\u3067\u5224\u65AD\u3057\u3066\u884C\u52D5\u3059\u308B" : "AI\u304C\u691C\u7D22\u3057\u3066\u5831\u544A\u3059\u308B"}</p>
            <p style={{ fontSize: 11, color: "#6a7080", margin: 0 }}>{isToolUse ? "Web\u30DA\u30FC\u30B8\u3092\u8AAD\u307F\u8FBC\u307F\u30FB\u30E1\u30FC\u30EB\u9001\u4FE1\u306A\u3069\u3001\u8907\u6570\u30B9\u30C6\u30C3\u30D7\u3092\u81EA\u5F8B\u5B9F\u884C" : "Web\u691C\u7D22\u306E\u7D50\u679C\u3092\u3082\u3068\u306B\u30C6\u30AD\u30B9\u30C8\u3092\u751F\u6210\u3057\u3066\u5831\u544A"}</p>
          </div>
        </div>

        <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>{"\u8AAC\u660E"}</p>
          <p style={{ fontSize: 14, color: "#9096a8", lineHeight: 1.7, margin: 0 }}>{selected.description || "AI\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8"}</p>
        </div>

        <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #242830" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>{"\u5B9F\u884C\u30B3\u30B9\u30C8"}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>{"2\u30AF\u30EC\u30B8\u30C3\u30C8 / \u5B9F\u884C"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #242830" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>{"\u30AB\u30C6\u30B4\u30EA"}</span>
            <span style={{ fontSize: 13, color: "#9096a8" }}>{selected.category ? selected.category + "\uFF08" + (CATEGORY_DESC[selected.category] || "") + "\uFF09" : "\u4E00\u822C"}</span>
          </div>
          {requiredPlan !== "free" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: vars.length > 0 ? "1px solid #242830" : "none" }}>
              <span style={{ fontSize: 13, color: "#6a7080" }}>{"\u5FC5\u8981\u30D7\u30E9\u30F3"}</span>
              <PlanBadge plan={requiredPlan} />
            </div>
          )}
          {selected.trigger === "schedule" && selected.triggerCron && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
              <span style={{ fontSize: 13, color: "#6a7080" }}>{"\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB"}</span>
              <span style={{ fontSize: 13, color: "#9096a8" }}>
                {(() => { const parts = (selected.triggerCron || "").split(" "); const h = parts[1] || "8"; const m = (parts[0] || "0").padStart(2, "0"); const dow = parts[4]; if (dow === "1") return "\u6BCE\u9031\u6708\u66DC " + h + ":" + m; return "\u6BCE\u65E5 " + h + ":" + m; })()}
              </span>
            </div>
          )}
        </div>

        {vars.length > 0 && (
          <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, padding: "18px 20px", marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>{"\u8A2D\u5B9A\u9805\u76EE"}</p>
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
            <p style={{ fontSize: 15, fontWeight: 600, color: "#4ade80", margin: 0 }}>{"\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u3092\u4F5C\u6210\u3057\u307E\u3057\u305F"}</p>
          </div>
        ) : !hasAccess ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ padding: "16px", borderRadius: 10, background: badge?.bg || "rgba(168,85,247,0.06)", border: `1px solid ${badge?.border || "rgba(168,85,247,0.2)"}`, marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: badge?.color || "#a855f7", margin: "0 0 6px" }}>{PLAN_BADGE[requiredPlan]?.label || "Starter+"}{"\u4EE5\u4E0A\u306E\u30D7\u30E9\u30F3\u3067\u5229\u7528\u3067\u304D\u307E\u3059"}</p>
              <p style={{ fontSize: 12, color: "#6a7080", margin: 0 }}>{"\u3053\u306E\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u306B\u306F\u6709\u6599\u30D7\u30E9\u30F3\u306E\u6A5F\u80FD\u304C\u542B\u307E\u308C\u3066\u3044\u307E\u3059"}</p>
            </div>
            <a href="/settings" style={{ display: "block", padding: "14px", borderRadius: 10, background: badge?.color || "#a855f7", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>{"\u30D7\u30E9\u30F3\u3092\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9"}</a>
          </div>
        ) : needsConnection ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ padding: "16px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#f87171", margin: "0 0 6px" }}>{features.needsGmail ? "Gmail" : "Discord"}{"\u9023\u643A\u304C\u5FC5\u8981\u3067\u3059"}</p>
              <p style={{ fontSize: 12, color: "#6a7080", margin: 0 }}>{"\u8A2D\u5B9A\u753B\u9762\u304B\u3089\u30B5\u30FC\u30D3\u30B9\u3092\u9023\u643A\u3057\u3066\u304F\u3060\u3055\u3044\u3002"}</p>
            </div>
            <a href="/settings" style={{ display: "block", padding: "14px", borderRadius: 10, background: "#f87171", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>{"\u9023\u643A\u3059\u308B"}</a>
          </div>
        ) : (
          <button onClick={handleAdd} disabled={adding} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: adding ? "#1e2044" : badge?.color || "#6c71e8", color: adding ? "#4a5060" : "#fff", fontSize: 15, fontWeight: 600, cursor: adding ? "default" : "pointer", fontFamily: "inherit" }}>
            {adding ? "\u4F5C\u6210\u4E2D..." : "\u30DE\u30A4\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u306B\u8FFD\u52A0\u3059\u308B"}
          </button>
        )}
      </div>
    );
  }

  // ========== List View ==========
  return (
    <>
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid #2e3440" }}>
        <button onClick={() => { setTab("official"); setSearch(""); }} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: tab === "official" ? "2px solid #6c71e8" : "2px solid transparent", color: tab === "official" ? "#6c71e8" : "#4a5060", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>{"\u516C\u5F0F\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8"}</button>
        <button onClick={() => { setTab("community"); setSearch(""); }} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: tab === "community" ? "2px solid #4ade80" : "2px solid transparent", color: tab === "community" ? "#4ade80" : "#4a5060", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
          {"\u307F\u3093\u306A\u306E\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8"}
          {communityAgents.length > 0 && <span style={{ marginLeft: 6, fontSize: 10, background: "rgba(74,222,128,0.15)", color: "#4ade80", padding: "1px 6px", borderRadius: 10 }}>{communityAgents.length}</span>}
        </button>
      </div>

      <div className="search-bar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9096a8" strokeWidth="1.8"><circle cx="6.5" cy="6.5" r="5" /><path d="M10.5 10.5l4 4" /></svg>
        <input type="text" placeholder={tab === "official" ? "\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u3092\u691C\u7D22..." : "\u307F\u3093\u306A\u306E\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u3092\u691C\u7D22..."} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {tab === "official" ? (
        <>
          <div className="pills">
            {categories.map((cat) => (<button key={cat} className={"pill " + (category === cat ? "active" : "inactive")} onClick={() => setCategory(cat)}>{cat}</button>))}
          </div>
          <p className="section-label">{filtered.length}{"\u500B\u306E\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8"}</p>
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "32px 14px" }}><p style={{ color: "var(--muted)", fontSize: "14px" }}>{"\u8A72\u5F53\u3059\u308B\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093"}</p></div>
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
                    <p className="store-card-desc">{t.description || "AI\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8"}</p>
                  </div>
                  <div style={{ background: tBadge?.bg || "rgba(108, 113, 232, 0.12)", padding: 7, borderRadius: 8, flexShrink: 0 }}>
                    {isToolUse ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={tBadge?.color || "#a855f7"} strokeWidth="1.6"><path d="M9 2v4l2 1" /><circle cx="9" cy="9" r="7" /><path d="M13 13l2 2" /></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={tBadge?.color || "#6c71e8"} strokeWidth="1.6"><rect x="2" y="3" width="14" height="12" rx="2" /><path d="M2 7h14M7 7v8" /></svg>
                    )}
                  </div>
                </div>
                <div className="store-card-bottom">
                  <div className="store-card-stats">
                    <span className="store-card-stat" style={{ color: "var(--green)" }}>{"2\u30AF\u30EC\u30B8\u30C3\u30C8 / \u56DE"}</span>
                    {t.category && <span className="store-card-stat" style={{ color: "var(--muted)" }}>{t.category}</span>}
                  </div>
                  <span style={{ fontSize: 12, color: tBadge?.color || "#4a5060" }}>{isToolUse ? "Tool Use \u203A" : "\u8A73\u7D30 \u203A"}</span>
                </div>
              </div>
              );
            })
          )}
        </>
      ) : (
        <>
          <p className="section-label">{filteredCommunity.length}{"\u500B\u306E\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8"}</p>
          {filteredCommunity.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "32px 14px" }}>
              <p style={{ color: "var(--muted)", fontSize: "14px", margin: "0 0 8px" }}>{"\u307E\u3060\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u304C\u3042\u308A\u307E\u305B\u3093"}</p>
              <p style={{ color: "#4a5060", fontSize: 12, margin: 0 }}>{"\u30DE\u30A4\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u304B\u3089\u300C\u516C\u958B\u3059\u308B\u300D\u3067\u30B9\u30C8\u30A2\u306B\u51FA\u54C1\u3067\u304D\u307E\u3059"}</p>
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
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.12)", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap" }}>{"\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3"}</span>
                      )}
                    </div>
                    <p className="store-card-desc">{a.description || "\u30E6\u30FC\u30B6\u30FC\u4F5C\u6210\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8"}</p>
                  </div>
                  <div style={{ background: aBadge?.bg || "rgba(74,222,128,0.10)", padding: 7, borderRadius: 8, flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={aBadge?.color || "#4ade80"} strokeWidth="1.6"><circle cx="9" cy="6" r="3" /><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
                  </div>
                </div>
                <div className="store-card-bottom">
                  <div className="store-card-stats">
                    <span className="store-card-stat" style={{ color: "#4ade80" }}>{a.publicUseCount}{"\u4EBA\u304C\u5229\u7528"}</span>
                    <span className="store-card-stat" style={{ color: "var(--muted)" }}>{"by " + (a.user?.name || "\u533F\u540D")}</span>
                  </div>
                  <span style={{ fontSize: 12, color: aBadge?.color || "#4ade80" }}>{"\u8A73\u7D30 \u203A"}</span>
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

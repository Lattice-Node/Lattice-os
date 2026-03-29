"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ParsedAgent = {
  name: string;
  description: string;
  trigger: string;
  triggerCron: string;
  prompt: string;
  connections: { type: string; action: string; config: object }[];
  outputType?: string;
  outputConfig?: { discordWebhookUrl?: string; lineNotifyToken?: string };
};

const TEMPLATE_INPUTS: Record<string, string> = {
  "daily-ai-news": "毎朝8時にAI・テクノロジーの最新ニュースを3件まとめてアプリに届ける",
  "competitor-monitor": "毎朝8時に競合他社の動向をチェックして、変化があればアプリに通知する",
  "weekly-report": "毎週金曜17時に1週間の活動をまとめたレポートを自動で作成してアプリに届ける",
  "sns-trend": "毎朝7時に業界のトレンドをまとめて、投稿ネタとして整理してアプリに届ける",
  "price-alert": "1時間ごとに指定した商品の価格を監視して、目標価格になったらアプリに通知する",
  "inquiry-reply": "新しい問い合わせが来たら内容を分析して返信文の下書きをアプリに届ける",
  "contract-check": "契約書やPDFをアップロードしたら、リスク条項と注意点を洗い出してアプリに届ける",
};

const EXAMPLES = [
  "毎朝9時にGmailの未読メールを要約して通知する",
  "Xで自社名が言及されたら即座に通知する",
  "毎週月曜の朝、先週のタスクをまとめて届ける",
];

const TRIGGER_LABEL: Record<string, string> = {
  schedule: "スケジュール実行",
  manual: "手動実行",
  webhook: "Webhook受信時",
};

const CONNECTION_LABEL: Record<string, string> = {
  slack: "Slack",
  gmail: "Gmail",
  twitter: "X (Twitter)",
  notion: "Notion",
  email: "メール",
};

export default function NewAgentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsed, setParsed] = useState<ParsedAgent | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId && TEMPLATE_INPUTS[templateId]) {
      setInput(TEMPLATE_INPUTS[templateId]);
    }
  }, [searchParams]);

  async function handleParse() {
    if (!input.trim() || parsing) return;
    setParsing(true);
    setError("");
    setParsed(null);
    try {
      const res = await fetch("/api/agents/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "解析に失敗しました");
      setParsed(data.agent);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    if (!parsed || saving) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.name,
          description: parsed.description,
          prompt: parsed.prompt,
          trigger: parsed.trigger,
          triggerCron: parsed.triggerCron,
          connections: JSON.stringify(parsed.connections),
        outputType: parsed.outputType || "app",
        outputConfig: JSON.stringify(parsed.outputConfig || {}),
        }),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      const data = await res.json();
      router.push(`/agents/${data.agent.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setSaving(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#111318", color: "#e8eaf0", paddingTop: 56 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/agents" style={{ fontSize: 13, color: "#4a5060", textDecoration: "none" }}>← Agents</a>
          </div>
          <p style={{ fontSize: 12, color: "#4a5060", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>
            新規作成
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f0f2f8", margin: 0, letterSpacing: "-0.02em" }}>
            エージェントを作る
          </h1>
          <p style={{ color: "#6a7080", fontSize: 13, marginTop: 8 }}>
            やりたいことを日本語で書いてください。自動で設定します。
          </p>
        </div>

        <div style={{ border: "1px solid #2a2d3a", borderRadius: 10, backgroundColor: "#1a1d24", overflow: "hidden", marginBottom: 16 }}>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setParsed(null); }}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleParse(); }}
            placeholder="例：毎朝8時にXのトレンドを調べて、AIニュースの要約を届ける"
            rows={5}
            style={{
              width: "100%", background: "transparent", border: "none", outline: "none",
              color: "#e8eaf0", fontSize: 14, padding: "18px 20px", resize: "none",
              lineHeight: 1.7, boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
          <div style={{ borderTop: "1px solid #22252f", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#3a3d4a" }}>Cmd+Enter で解析</span>
            <button
              onClick={handleParse}
              disabled={!input.trim() || parsing}
              style={{
                backgroundColor: input.trim() && !parsing ? "#6c71e8" : "#1e2030",
                color: input.trim() && !parsing ? "#fff" : "#3a3d4a",
                border: "none", padding: "8px 18px", borderRadius: 6,
                fontSize: 13, fontWeight: 500,
                cursor: input.trim() && !parsing ? "pointer" : "default",
              }}
            >
              {parsing ? "解析中..." : "解析する"}
            </button>
          </div>
        </div>

        {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</p>}

        {!parsed && (
          <div style={{ marginBottom: 36 }}>
            <p style={{ fontSize: 11, color: "#3a3d4a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              使用例
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => { setInput(ex); setParsed(null); }}
                  style={{
                    background: "#1a1d24", border: "1px solid #2a2d3a", borderRadius: 8,
                    padding: "11px 14px", color: "#6a7080", fontSize: 13,
                    textAlign: "left", cursor: "pointer", fontFamily: "inherit", lineHeight: 1.5,
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {parsed && (
          <div style={{ border: "1px solid #2a2d3a", borderRadius: 10, backgroundColor: "#1a1d24", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #22252f", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#6c71e8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                解析完了 - 編集して保存
              </span>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <p style={{ fontSize: 11, color: "#6a7080", margin: "0 0 6px" }}>エージェント名</p>
                <input
                  value={parsed.name}
                  onChange={(e) => setParsed({ ...parsed, name: e.target.value })}
                  style={{ width: "100%", background: "#111318", border: "1px solid #2a2d35", borderRadius: 6, padding: "8px 12px", color: "#f0f2f8", fontSize: 14, fontWeight: 600, fontFamily: "inherit", boxSizing: "border-box" as const, outline: "none" }}
                />
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#6a7080", margin: "0 0 6px" }}>説明</p>
                <input
                  value={parsed.description}
                  onChange={(e) => setParsed({ ...parsed, description: e.target.value })}
                  style={{ width: "100%", background: "#111318", border: "1px solid #2a2d35", borderRadius: 6, padding: "8px 12px", color: "#9096a8", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" as const, outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: "#6a7080", margin: "0 0 6px" }}>トリガー</p>
                  <select
                    value={parsed.trigger}
                    onChange={(e) => setParsed({ ...parsed, trigger: e.target.value })}
                    style={{ width: "100%", background: "#111318", border: "1px solid #2a2d35", borderRadius: 6, padding: "8px 12px", color: "#9096a8", fontSize: 13, fontFamily: "inherit", outline: "none" }}
                  >
                    <option value="schedule">スケジュール実行</option>
                    <option value="manual">手動実行</option>
                  </select>
                </div>
                {parsed.trigger === "schedule" && (
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, color: "#6a7080", margin: "0 0 6px" }}>実行時刻（JST）</p>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <select
                        value={parsed.triggerCron ? parsed.triggerCron.split(" ")[1] : "8"}
                        onChange={(e) => {
                          const parts = (parsed.triggerCron || "0 8 * * *").split(" ");
                          parts[1] = e.target.value;
                          setParsed({ ...parsed, triggerCron: parts.join(" ") });
                        }}
                        style={{ flex: 1, background: "#111318", border: "1px solid #2a2d35", borderRadius: 6, padding: "8px 10px", color: "#9096a8", fontSize: 13, fontFamily: "inherit", outline: "none" }}
                      >
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={String(i)}>{String(i).padStart(2,"0")}時</option>
                        ))}
                      </select>
                      <select
                        value={parsed.triggerCron ? parsed.triggerCron.split(" ")[0] : "0"}
                        onChange={(e) => {
                          const parts = (parsed.triggerCron || "0 8 * * *").split(" ");
                          parts[0] = e.target.value;
                          setParsed({ ...parsed, triggerCron: parts.join(" ") });
                        }}
                        style={{ flex: 1, background: "#111318", border: "1px solid #2a2d35", borderRadius: 6, padding: "8px 10px", color: "#9096a8", fontSize: 13, fontFamily: "inherit", outline: "none" }}
                      >
                        {[0,15,30,45].map(m => (
                          <option key={m} value={String(m)}>{String(m).padStart(2,"0")}分</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#6a7080", margin: "0 0 6px" }}>実行プロンプト</p>
                <textarea
                  value={parsed.prompt}
                  onChange={(e) => setParsed({ ...parsed, prompt: e.target.value })}
                  rows={4}
                  style={{ width: "100%", background: "#111318", border: "1px solid #2a2d35", borderRadius: 6, padding: "8px 12px", color: "#9096a8", fontSize: 12, lineHeight: 1.65, fontFamily: "inherit", boxSizing: "border-box" as const, outline: "none", resize: "vertical" }}
                />
              </div>

            <div>
              <p style={{ fontSize: 11, color: "#6a7080", margin: "0 0 6px" }}>出力先</p>
              <select
                value={parsed.outputType || "app"}
                onChange={(e) => setParsed({ ...parsed, outputType: e.target.value })}
                style={{ width: "100%", background: "#111318", border: "1px solid #2a2d35", borderRadius: 6, padding: "8px 12px", color: "#9096a8", fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 8 }}
              >
                <option value="app">アプリ内のみ</option>
                <option value="discord">Discord</option>
                <option value="line">LINE Notify</option>
                <option value="app+discord">アプリ内 + Discord</option>
                <option value="app+line">アプリ内 + LINE</option>
              </select>
              {(parsed.outputType === "discord" || parsed.outputType === "app+discord") && (
                <input
                  value={parsed.outputConfig?.discordWebhookUrl || ""}
                  onChange={(e) => setParsed({ ...parsed, outputConfig: { ...parsed.outputConfig, discordWebhookUrl: e.target.value } })}
                  placeholder="Discord Webhook URL"
                  style={{ width: "100%", background: "#111318", border: "1px solid #2a2d35", borderRadius: 6, padding: "8px 12px", color: "#9096a8", fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" as const, outline: "none" }}
                />
              )}
              {(parsed.outputType === "line" || parsed.outputType === "app+line") && (
                <input
                  value={parsed.outputConfig?.lineNotifyToken || ""}
                  onChange={(e) => setParsed({ ...parsed, outputConfig: { ...parsed.outputConfig, lineNotifyToken: e.target.value } })}
                  placeholder="LINE Notify Token"
                  style={{ width: "100%", background: "#111318", border: "1px solid #2a2d35", borderRadius: 6, padding: "8px 12px", color: "#9096a8", fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" as const, outline: "none" }}
                />
              )}
            </div>
            </div>
            <div style={{ borderTop: "1px solid #22252f", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={() => setParsed(null)}
                style={{ background: "none", border: "none", color: "#4a5060", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
              >
                やり直す
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  backgroundColor: saving ? "#1e2030" : "#6c71e8",
                  color: saving ? "#3a3d4a" : "#fff",
                  border: "none", padding: "9px 22px", borderRadius: 6,
                  fontSize: 13, fontWeight: 600,
                  cursor: saving ? "default" : "pointer",
                }}
              >
                {saving ? "保存中..." : "このエージェントを作成する"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

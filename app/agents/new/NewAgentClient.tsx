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
                解析完了
              </span>
            </div>
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: 17, fontWeight: 600, color: "#f0f2f8", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
                {parsed.name}
              </p>
              <p style={{ fontSize: 13, color: "#6a7080", margin: "0 0 20px" }}>{parsed.description}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#4a5060" }}>トリガー</span>
                  <span style={{ fontSize: 13, color: "#9096a8" }}>
                    {TRIGGER_LABEL[parsed.trigger] || parsed.trigger}
                    {parsed.triggerCron && ` (${parsed.triggerCron})`}
                  </span>
                </div>
                {parsed.connections.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 12, color: "#4a5060" }}>連携サービス</span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {parsed.connections.map((c, i) => (
                        <span key={i} style={{ fontSize: 11, color: "#6c71e8", background: "#1e2044", padding: "3px 9px", borderRadius: 4, fontWeight: 500 }}>
                          {CONNECTION_LABEL[c.type] || c.type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ borderTop: "1px solid #22252f", paddingTop: 12 }}>
                  <p style={{ fontSize: 12, color: "#4a5060", margin: "0 0 6px" }}>実行プロンプト</p>
                  <p style={{ fontSize: 12, color: "#6a7080", lineHeight: 1.65, margin: 0 }}>{parsed.prompt}</p>
                </div>
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
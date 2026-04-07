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
  outputConfig?: { discordWebhookUrl?: string; lineNotifyToken?: string; gmailTo?: string };
  selectedOutput?: string;
};

const TEMPLATE_INPUTS: Record<string, string> = {
  "daily-ai-news": "毎朝8時にAIテクノロジーの最新ニュースを3件まとめてアプリに届ける",
  "competitor-monitor": "毎朝8時に競合他社の動向をチェックして、変化があればアプリに通知する",
  "weekly-report": "毎週金曜17時に1週間の活動をまとめたレポートを自動で作成してアプリに届ける",
  "sns-trend": "毎朝7時に業界のトレンドをまとめて、投稿ネタとして整理してアプリに届ける",
  "price-alert": "1時間ごとに指定した商品の価格を監視して、目標価格になったらアプリに通知する",
  "inquiry-reply": "新しい問い合わせが来たら内容を分析して返信文の下書きをアプリに届ける",
  "contract-check": "契約書やPDFをアップロードしたら、リスク条項と注意点を洗い出してアプリに届ける",
};

const EXAMPLES = [
  "毎朝9時にGmailの未読メールを要約して通知する",
  "毎日、競合サイトの更新をチェックして通知する",
  "毎朝8時にAI・テクノロジーの最新ニュースを届ける",
];

const TOOLUSE_EXAMPLES = [
  "https://example.com のページを読み込んで、内容を箇条書きで要約する",
  "3つのニュースサイトを比較して、共通のトレンドを分析する",
  "指定URLの記事を読んで、Gmailで自動配信する",
];

// Detect required features from agent text
function detectRequiredFeatures(text: string) {
  const lower = text.toLowerCase();
  return {
    needsToolUse: lower.includes("fetch_url") || lower.includes("send_gmail") || lower.includes("fetch url") || lower.includes("tool use"),
    needsGmail: lower.includes("gmail") || lower.includes("未読メール") || lower.includes("メール要約") || lower.includes("メール取得") || lower.includes("メールを取得"),
  };
}

export default function NewAgentClient({ isPaid = false, connectedProviders = [] }: { isPaid?: boolean; connectedProviders?: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsed, setParsed] = useState<ParsedAgent | null>(null);
  const [error, setError] = useState("");
  const [userConnections, setUserConnections] = useState<{id:string,provider:string,metadata:string}[]>([]);

  useEffect(() => {
    fetch("/api/connections").then(r => r.json()).then(d => setUserConnections(d.connections || [])).catch(() => {});
  }, []);

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

    // Check required features before saving
    const agentText = [parsed.name, parsed.description, parsed.prompt].join(" ");
    const features = detectRequiredFeatures(agentText);
    const hasGmail = connectedProviders.includes("gmail");

    if (features.needsToolUse && !isPaid) {
      setError("Tool Use機能はStarter以上のプランで利用できます。設定画面からプランをアップグレードしてください。");
      return;
    }

    if (features.needsGmail && !hasGmail) {
      setError("このエージェントにはGmail連携が必要です。設定画面からGmailを連携してください。");
      return;
    }

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
      if (res.status === 403) throw new Error("フリープランではエージェントは3体までです。アップグレードしてください。");
      if (!res.ok) throw new Error("保存に失敗しました");
      const data = await res.json();
      router.push(`/agents/detail/?id=${data.agent.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setSaving(false);
    }
  }

  return (
    <main className="create-page">
      <div className="create-container">
        <div className="create-header">
          <a href="/agents" className="create-back">← Agents</a>
          <p className="page-label">新規作成</p>
          <h1 className="page-title">エージェントを作る</h1>
          <p>やりたいことを日本語で書いてください。自動で設定します。</p>
        </div>

        <div className="create-input-card">
          <textarea
            className="create-textarea"
            value={input}
            onChange={(e) => { setInput(e.target.value); setParsed(null); }}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleParse(); }}
            placeholder="例：毎朝8時にXのトレンドを調べて、AIニュースの要約を届ける"
            rows={5}
          />
          <div className="create-input-footer">
            <span className="create-input-hint">Cmd+Enter で解析</span>
            <button
              className="create-parse-btn"
              onClick={handleParse}
              disabled={!input.trim() || parsing}
            >
              {parsing ? "解析中..." : "解析する"}
            </button>
          </div>
        </div>

        {error && <p className="create-error">{error}</p>}

        {!parsed && (
          <div className="create-examples">
            <p className="create-examples-label">使用例</p>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                className="create-example-btn"
                onClick={() => { setInput(ex); setParsed(null); }}
              >
                {ex}
              </button>
            ))}
            <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#a855f7" strokeWidth="1.8">
                  <path d="M9 2v4l2 1" />
                  <circle cx="9" cy="9" r="7" />
                  <path d="M13 13l2 2" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#a855f7" }}>Tool Use（有料プラン）</span>
              </div>
              <p style={{ fontSize: 12, color: "#9096a8", margin: "0 0 10px", lineHeight: 1.5 }}>
                AIがWebページを読み込み、メールを送るなど、自律的にアクション実行します
              </p>
              {TOOLUSE_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  className="create-example-btn"
                  style={{ borderColor: "rgba(168,85,247,0.2)", marginBottom: 6 }}
                  onClick={() => { setInput(ex); setParsed(null); }}
                >
                  <span style={{ color: "#a855f7", marginRight: 6, fontSize: 11 }}>⚡</span>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {parsed && (
          <div className="create-result-card">
            <div className="create-result-header">
              <span className="create-result-badge">解析完了 - 編集して保存</span>
            </div>
            <div className="create-result-body">
              <div>
                <p className="create-field-label">エージェント名</p>
                <input
                  className="create-input name"
                  value={parsed.name}
                  onChange={(e) => setParsed({ ...parsed, name: e.target.value })}
                />
              </div>
              <div>
                <p className="create-field-label">説明</p>
                <input
                  className="create-input desc"
                  value={parsed.description}
                  onChange={(e) => setParsed({ ...parsed, description: e.target.value })}
                />
              </div>
              <div className="create-row">
                <div>
                  <p className="create-field-label">トリガー</p>
                  <select
                    className="create-select"
                    value={parsed.trigger}
                    onChange={(e) => setParsed({ ...parsed, trigger: e.target.value })}
                  >
                    <option value="schedule">スケジュール実行</option>
                    <option value="manual">手動実行</option>
                  </select>
                </div>
                {parsed.trigger === "schedule" && (
                  <div>
                    <p className="create-field-label">実行時刻（JST）</p>
                    <div className="create-time-row">
                      <select
                        className="create-select"
                        value={parsed.triggerCron ? parsed.triggerCron.split(" ")[1] : "8"}
                        onChange={(e) => {
                          const parts = (parsed.triggerCron || "0 8 * * *").split(" ");
                          parts[1] = e.target.value;
                          setParsed({ ...parsed, triggerCron: parts.join(" ") });
                        }}
                      >
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={String(i)}>{String(i).padStart(2,"0")}時</option>
                        ))}
                      </select>
                      <select
                        className="create-select"
                        value={parsed.triggerCron ? parsed.triggerCron.split(" ")[0] : "0"}
                        onChange={(e) => {
                          const parts = (parsed.triggerCron || "0 8 * * *").split(" ");
                          parts[0] = e.target.value;
                          setParsed({ ...parsed, triggerCron: parts.join(" ") });
                        }}
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
                <p className="create-field-label">実行プロンプト</p>
                <textarea
                  className="create-prompt-textarea"
                  value={parsed.prompt}
                  onChange={(e) => setParsed({ ...parsed, prompt: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <p className="create-field-label">出力先</p>
                <select
                  className="create-select"
                  value={parsed.selectedOutput || "app"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith("gmail:")) {
                      setParsed({ ...parsed, outputType: "gmail", outputConfig: {}, selectedOutput: val });
                    } else if (val.startsWith("discord:")) {
                      const conn = userConnections.find(c => c.id === val.replace("discord:", ""));
                      const meta = conn ? JSON.parse(conn.metadata || "{}") : {};
                      setParsed({ ...parsed, outputType: "discord", outputConfig: { discordWebhookUrl: meta.webhookUrl || "" }, selectedOutput: val });
                    } else {
                      setParsed({ ...parsed, outputType: val, outputConfig: {}, selectedOutput: val });
                    }
                  }}
                >
                  <option value="app">アプリ内のみ</option>
                  {userConnections.filter(c => c.provider === "gmail").map(c => {
                    const meta = JSON.parse(c.metadata || "{}");
                    return <option key={c.id} value={`gmail:${c.id}`}>Gmail - {meta.email || ""}</option>;
                  })}
                  {userConnections.filter(c => c.provider === "discord").map(c => {
                    const meta = JSON.parse(c.metadata || "{}");
                    return <option key={c.id} value={`discord:${c.id}`}>Discord - {meta.guildName || "サーバー"}</option>;
                  })}
                </select>
                {parsed.outputType === "gmail" && (
                  <div className="create-gmail-to">
                    <input
                      className="create-input desc"
                      value={(parsed.outputConfig as Record<string,string>)?.gmailTo || ""}
                      onChange={(e) => setParsed({ ...parsed, outputConfig: { ...parsed.outputConfig, gmailTo: e.target.value } })}
                      placeholder="送信先メールアドレス"
                    />
                  </div>
                )}
                {userConnections.length === 0 && (
                  <p className="create-hint">設定画面からサービスを連携すると、出力先として選べます</p>
                )}
              </div>
            </div>
            <div className="create-result-footer">
              <button className="create-reset-btn" onClick={() => setParsed(null)}>
                やり直す
              </button>
              <button
                className="create-save-btn"
                onClick={handleSave}
                disabled={saving}
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

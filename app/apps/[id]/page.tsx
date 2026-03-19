"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { parseFile } from "@/lib/fileParser";

type Field = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  options: string;
  required: boolean;
};

type Agent = {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  agentType: string;
  webhookUrl: string;
  fields: string;
  authorName: string;
  price: number;
};

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:15px;font-weight:700;margin:12px 0 4px;color:#e8e9ef">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:700;margin:16px 0 6px;color:#e8e9ef">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:800;margin:16px 0 8px;color:#e8e9ef">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code style="background:#1a1e2e;color:#81C784;padding:1px 6px;border-radius:4px;font-size:12px">$1</code>')
    .replace(/^- (.+)$/gm, '<li style="margin-bottom:4px">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul style="padding-left:18px;margin-bottom:10px">$&</ul>')
    .replace(/\n\n/g, '</p><p style="margin-bottom:10px">')
    .replace(/^(?!<[h|u|p|s])(.+)$/gm, '<p style="margin-bottom:10px">$1</p>');
}

export default function AppPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [frequency, setFrequency] = useState("weekly");
  const [scheduleEmail, setScheduleEmail] = useState("");
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAgent(data.agent);
        try {
          const f = JSON.parse(data.agent.fields || "[]");
          setFields(f);
          const initial: Record<string, string> = {};
          f.forEach((field: Field) => { initial[field.id] = ""; });
          setValues(initial);
        } catch { setFields([]); }
        setLoading(false);
      });

    if (session?.user?.email) {
      setScheduleEmail(session.user.email);
    }
  }, [id, session]);

  const handleFileChange = async (fieldId: string, file: File | null) => {
    if (!file) return;
    setFileNames((prev) => ({ ...prev, [fieldId]: file.name }));
    setStatus("📄 ファイルを読み込み中...");
    try {
      const text = await parseFile(file);
      setValues((prev) => ({ ...prev, [fieldId]: text }));
      setStatus(null);
    } catch {
      setStatus("❌ ファイルの読み込みに失敗しました");
    }
  };

  const handleSchedule = async () => {
    if (!session) { signIn("github"); return; }
    if (!scheduleEmail) { setStatus("❌ メールアドレスを入力してください"); return; }

    setScheduleLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agent?.id,
          frequency,
          inputValues: values,
          userEmail: scheduleEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScheduleSuccess(true);
        setShowSchedule(false);
      } else {
        setStatus("❌ " + data.error);
      }
    } catch {
      setStatus("❌ 定期実行の設定に失敗しました");
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleRun = async () => {
    if (!agent || running) return;
    if (!session) { signIn("github"); return; }

    const missingFields = fields.filter((f) => f.required && !values[f.id]);
    if (missingFields.length > 0) {
      setStatus(`❌ 必須項目を入力してください: ${missingFields.map((f) => f.label).join(", ")}`);
      return;
    }

    if (agent.price > 0) {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, agentName: agent.name, price: agent.price }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
    }

    setRunning(true);
    setDone(false);
    setOutput("");
    setStatus(null);

    if (agent.agentType === "webhook") {
      try {
        setStatus("⚡ 処理中...");
        const res = await fetch(agent.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: values, agentId: agent.id }),
        });
        const data = await res.json();
        setOutput(data.text || data.result || JSON.stringify(data, null, 2));
        setStatus(null);
        setDone(true);
      } catch (err) {
        setStatus("❌ Webhookエラー: " + String(err));
      } finally {
        setRunning(false);
      }
      return;
    }

    const fieldSummary = fields.map((f) => {
      const val = values[f.id];
      if (f.type === "file" && val) return `${f.label}（ファイル内容）:\n${val.slice(0, 8000)}`;
      return `${f.label}: ${val}`;
    }).join("\n\n");

    const task = `以下の情報をもとに処理してください:\n\n${fieldSummary}`;

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, agentPrompt: agent.prompt, agentName: agent.name, task }),
      });

      if (!res.ok || !res.body) { setStatus("❌ 実行エラー"); setRunning(false); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const chunk of lines) {
          const line = chunk.replace(/^data: /, "").trim();
          if (!line) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === "status") setStatus(data.message);
            else if (data.type === "token") { setOutput((prev) => prev + data.content); setStatus(null); }
            else if (data.type === "done") { setDone(true); setRunning(false); }
            else if (data.type === "error") { setStatus("❌ " + data.message); setRunning(false); }
          } catch { }
        }
      }
    } catch (err) {
      setStatus("❌ エラー: " + String(err));
      setRunning(false);
    }
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#020817", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5068" }}>読み込み中...</div>;
  if (!agent) return <div style={{ minHeight: "100vh", background: "#020817", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5068" }}>Agentが見つかりません</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#020817", color: "#e8e9ef", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <nav style={{ borderBottom: "1px solid #1e2030", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#e8e9ef" }}>
          <span style={{ fontSize: 18, color: "#4d9fff" }}>◈</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Lattice</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/marketplace" style={{ fontSize: 13, color: "#6a7090", textDecoration: "none" }}>Marketplace</Link>
          {session ? (
            <img src={session.user?.image ?? ""} style={{ width: 28, height: 28, borderRadius: "50%" }} alt="avatar" />
          ) : (
            <button onClick={() => signIn("github")} style={{ background: "#4d9fff", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>ログイン</button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        {/* AGENT HEADER */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 56, height: 56, background: "#1a1e2e", border: "1px solid #2a3050", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🤖</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#4d9fff", marginBottom: 4 }}>{agent.category}</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>{agent.name}</h1>
            </div>
            <div style={{ marginLeft: "auto" }}>
              {agent.price === 0 ? (
                <span style={{ background: "#1a2e1a", color: "#4caf50", fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 100 }}>無料</span>
              ) : (
                <span style={{ background: "#1a1e2e", color: "#4d9fff", fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 100 }}>${agent.price} / 回</span>
              )}
            </div>
          </div>
          <p style={{ fontSize: 15, color: "#6a7090", lineHeight: 1.7, margin: 0 }}>{agent.description}</p>
          <p style={{ fontSize: 12, color: "#3a3d52", marginTop: 8 }}>by {agent.authorName}</p>
        </div>

        {/* SUCCESS MESSAGE */}
        {scheduleSuccess && (
          <div style={{ background: "#1a2e1a", border: "1px solid #4caf5044", borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, color: "#4caf50", fontSize: 14 }}>定期実行を設定しました</div>
              <div style={{ fontSize: 13, color: "#6a7090", marginTop: 2 }}>結果は{scheduleEmail}にメールで送信されます</div>
            </div>
          </div>
        )}

        {/* INPUT FORM */}
        <div style={{ background: "#0f1017", border: "1px solid #1e2030", borderRadius: 16, padding: "28px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#4a5068", marginBottom: 20 }}>情報を入力</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {fields.map((field) => (
              <div key={field.id}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8cad8", marginBottom: 6 }}>
                  {field.label}
                  {field.required && <span style={{ color: "#ff6b6b", marginLeft: 4 }}>*</span>}
                </label>
                {field.type === "file" ? (
                  <div
                    onClick={() => fileRefs.current[field.id]?.click()}
                    style={{ background: "#151722", border: "2px dashed #1e2030", borderRadius: 8, padding: "24px", textAlign: "center", cursor: "pointer" }}
                  >
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,.pdf,.txt"
                      ref={(el) => { fileRefs.current[field.id] = el; }}
                      onChange={(e) => handleFileChange(field.id, e.target.files?.[0] ?? null)}
                      style={{ display: "none" }}
                    />
                    {fileNames[field.id] ? (
                      <div>
                        <div style={{ fontSize: 20, marginBottom: 6 }}>📄</div>
                        <div style={{ fontSize: 13, color: "#4d9fff", fontWeight: 600 }}>{fileNames[field.id]}</div>
                        <div style={{ fontSize: 11, color: "#4a5068", marginTop: 4 }}>クリックして変更</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>📁</div>
                        <div style={{ fontSize: 13, color: "#6a7090" }}>クリックしてファイルを選択</div>
                        <div style={{ fontSize: 11, color: "#4a5068", marginTop: 4 }}>Excel・CSV・PDF・TXTに対応</div>
                      </div>
                    )}
                  </div>
                ) : field.type === "textarea" ? (
                  <textarea
                    placeholder={field.placeholder}
                    value={values[field.id] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    rows={4}
                    style={{ width: "100%", background: "#151722", border: "1px solid #1e2030", borderRadius: 8, padding: "10px 14px", color: "#e8e9ef", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }}
                  />
                ) : field.type === "select" ? (
                  <select
                    value={values[field.id] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    style={{ width: "100%", background: "#151722", border: "1px solid #1e2030", borderRadius: 8, padding: "10px 14px", color: "#e8e9ef", fontSize: 14, outline: "none" }}
                  >
                    <option value="">選択してください</option>
                    {field.options.split(",").map((opt) => (
                      <option key={opt.trim()} value={opt.trim()} style={{ background: "#020817" }}>{opt.trim()}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={values[field.id] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    style={{ width: "100%", background: "#151722", border: "1px solid #1e2030", borderRadius: 8, padding: "10px 14px", color: "#e8e9ef", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* BUTTONS */}
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button
              onClick={handleRun}
              disabled={running}
              style={{
                flex: 1, background: running ? "#1e2030" : "#4d9fff",
                color: "#fff", border: "none", borderRadius: 10, padding: "14px",
                fontSize: 15, fontWeight: 700, cursor: running ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {running ? (
                <><span style={{ width: 14, height: 14, border: "2px solid #ffffff44", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />処理中...</>
              ) : !session ? "🔑 ログインして実行" : agent.price > 0 ? `💳 $${agent.price} で実行` : "▶ 今すぐ実行"}
            </button>

            <button
              onClick={() => setShowSchedule(!showSchedule)}
              style={{
                background: showSchedule ? "#1a2e1a" : "#0f1017",
                color: showSchedule ? "#4caf50" : "#6a7090",
                border: `1px solid ${showSchedule ? "#4caf5044" : "#1e2030"}`,
                borderRadius: 10, padding: "14px 18px",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              🔁 定期実行
            </button>
          </div>
        </div>

        {/* SCHEDULE PANEL */}
        {showSchedule && (
          <div style={{ background: "#0f1017", border: "1px solid #1e2a1a", borderRadius: 16, padding: "24px", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#4caf50", marginBottom: 16 }}>🔁 定期実行を設定</div>
            <p style={{ fontSize: 13, color: "#6a7090", marginBottom: 20, lineHeight: 1.6 }}>
              設定した頻度で自動実行して、結果をメールでお届けします。
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8cad8", marginBottom: 8 }}>実行頻度</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { value: "daily", label: "毎日" },
                  { value: "weekly", label: "毎週" },
                  { value: "monthly", label: "毎月" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFrequency(f.value)}
                    style={{
                      padding: "10px",
                      borderRadius: 8,
                      border: `1px solid ${frequency === f.value ? "#4caf50" : "#1e2030"}`,
                      background: frequency === f.value ? "#1a2e1a" : "transparent",
                      color: frequency === f.value ? "#4caf50" : "#6a7090",
                      fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8cad8", marginBottom: 8 }}>結果の送信先メール</label>
              <input
                type="email"
                value={scheduleEmail}
                onChange={(e) => setScheduleEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ width: "100%", background: "#151722", border: "1px solid #1e2030", borderRadius: 8, padding: "10px 14px", color: "#e8e9ef", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <button
              onClick={handleSchedule}
              disabled={scheduleLoading}
              style={{
                width: "100%", background: "#4caf50", color: "#fff",
                border: "none", borderRadius: 10, padding: "12px",
                fontSize: 14, fontWeight: 700, cursor: scheduleLoading ? "not-allowed" : "pointer",
                opacity: scheduleLoading ? 0.6 : 1,
              }}
            >
              {scheduleLoading ? "設定中..." : "定期実行を開始する"}
            </button>
          </div>
        )}

        {/* OUTPUT */}
        {(status || output) && (
          <div style={{ background: "#0f1017", border: "1px solid #1e2030", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #1e2030", background: "#0c0d14", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4a5068" }}>
                {running ? "⚡ 処理中..." : done ? "✅ 完了" : "出力"}
              </span>
              {output && <button onClick={() => navigator.clipboard.writeText(output)} style={{ background: "none", border: "1px solid #1e2030", color: "#4a5068", borderRadius: 6, fontSize: 11, padding: "4px 10px", cursor: "pointer" }}>コピー</button>}
            </div>
            {status && <div style={{ padding: "10px 20px", fontSize: 13, color: "#4d9fff", borderBottom: "1px solid #1e2030", background: "#0d1220" }}>{status}</div>}
            {output && <div style={{ padding: "20px", fontSize: 14, lineHeight: 1.8, color: "#c8cad8", maxHeight: 600, overflowY: "auto" }} dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />}
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/marketplace" style={{ fontSize: 13, color: "#4a5068", textDecoration: "none" }}>← Marketplaceに戻る</Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

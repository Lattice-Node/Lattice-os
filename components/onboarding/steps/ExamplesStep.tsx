"use client";

const examples = [
  { icon: "\u{1F4F0}", title: "\u30CB\u30E5\u30FC\u30B9\u8981\u7D04", desc: "\u6BCE\u671D\u3001\u95A2\u5FC3\u5206\u91CE\u306E\u30CB\u30E5\u30FC\u30B9\u3092AI\u304C\u8981\u7D04\u3057\u3066\u5C4A\u3051\u307E\u3059" },
  { icon: "\u{1F4CA}", title: "\u30C7\u30FC\u30BF\u76E3\u8996", desc: "SNS\u3084Web\u30B5\u30A4\u30C8\u306E\u5909\u5316\u3092\u691C\u77E5\u3057\u3066\u901A\u77E5\u3057\u307E\u3059" },
  { icon: "\u270D\uFE0F", title: "\u30B3\u30F3\u30C6\u30F3\u30C4\u751F\u6210", desc: "\u30D6\u30ED\u30B0\u4E0B\u66F8\u304D\u3084SNS\u6295\u7A3F\u3092\u81EA\u52D5\u3067\u4F5C\u6210\u3057\u307E\u3059" },
];

export default function ExamplesStep() {
  return (
    <div style={{ padding: "0 8px" }}>
      <h2 style={{
        fontSize: 22,
        fontWeight: 700,
        color: "var(--text-display)",
        margin: "0 0 8px",
        textAlign: "center",
      }}>
        こんなことができます
      </h2>
      <p style={{
        fontSize: 13,
        color: "var(--text-secondary)",
        textAlign: "center",
        margin: "0 0 24px",
      }}>
        AIエージェントの活用例
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {examples.map((ex) => (
          <div
            key={ex.title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <span style={{ fontSize: 28, flexShrink: 0 }}>{ex.icon}</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>
                {ex.title}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                {ex.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

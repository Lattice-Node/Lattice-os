"use client";

const INTEREST_OPTIONS = [
  "ニュース", "テクノロジー", "ビジネス", "マーケティング",
  "デザイン", "プログラミング", "ライティング", "データ分析",
  "SNS運用", "教育", "ヘルスケア", "ファイナンス",
];

interface InterestsStepProps {
  selected: string[];
  onToggle: (interest: string) => void;
}

export default function InterestsStep({ selected, onToggle }: InterestsStepProps) {
  return (
    <div style={{ padding: "0 8px" }}>
      <h2 style={{
        fontSize: 22,
        fontWeight: 700,
        color: "var(--text-display)",
        margin: "0 0 8px",
        textAlign: "center",
      }}>
        興味のあるジャンルを選択
      </h2>
      <p style={{
        fontSize: 13,
        color: "var(--text-secondary)",
        textAlign: "center",
        margin: "0 0 24px",
      }}>
        あなたに合ったエージェントをおすすめします（複数選択可）
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {INTEREST_OPTIONS.map((item) => {
          const active = selected.includes(item);
          return (
            <button
              key={item}
              onClick={() => onToggle(item)}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: active ? "1.5px solid var(--accent)" : "1px solid var(--border-visible)",
                background: active ? "var(--accent)" : "var(--surface)",
                color: active ? "#fff" : "var(--text-primary)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

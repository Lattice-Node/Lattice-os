type DailyAiNewsBuildOptions = {
  now?: Date;
};

function formatJstDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function isDailyAiNewsAgent(input: {
  name?: string | null;
  description?: string | null;
  prompt?: string | null;
}) {
  const text = [input.name, input.description, input.prompt]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("aiニュース") ||
    text.includes("ai news") ||
    text.includes("毎朝") ||
    text.includes("daily ai")
  );
}

export function buildDailyAiNewsSystemPrompt() {
  return [
    "あなたはLattice上で動作するニュース要約エージェントです。",
    "目的は、忙しいユーザーが1分で重要なAI動向を把握できる日本語レポートを作ることです。",
    "重要度の低い話題、宣伝色の強い話題、重複話題は削ってください。",
    "事実と推測を分け、誇張を避け、曖昧な表現を減らしてください。",
    "同じテーマの記事が複数ある場合は1件に統合してください。",
    "出力はMarkdownのみで返し、前置き・言い訳・補足会話は不要です。",
    "必ず指定フォーマットを守ってください。",
  ].join("\n");
}

export function buildDailyAiNewsUserPrompt(options: DailyAiNewsBuildOptions = {}) {
  const now = options.now ?? new Date();
  const nowJst = formatJstDate(now);

  return [
    `現在時刻(JST): ${nowJst}`,
    "",
    "過去24〜48時間を優先して、重要なAIニュースを3〜5件選定してください。",
    "対象は、基盤モデル、主要AI企業、AIプロダクト、AI規制、研究・発表、大型提携、資金調達、障害・事故などです。",
    "ただし以下は除外または優先度を大きく下げてください。",
    "- 重要度の低い小規模アップデート",
    "- 単なる宣伝投稿",
    "- 同一話題の焼き直し",
    "",
    "重要度は次の観点で判断してください。",
    "1. 市場や開発者への影響が大きいか",
    "2. 一般ユーザーにも波及しそうか",
    "3. 主要企業・主要モデルに関係するか",
    "4. 今後の競争環境や実務に影響するか",
    "",
    "出力フォーマットは厳守してください。",
    "",
    "# 今日のAIニュース要約",
    "",
    "## 1. ニュースタイトル",
    "- 要点: 2〜3文で要約",
    "- 影響: 1〜2文で実務・市場・ユーザー影響",
    "- 出典: 媒体名を2件まで",
    "",
    "## 2. ニュースタイトル",
    "- 要点: 2〜3文で要約",
    "- 影響: 1〜2文で実務・市場・ユーザー影響",
    "- 出典: 媒体名を2件まで",
    "",
    "## 3. ニュースタイトル",
    "- 要点: 2〜3文で要約",
    "- 影響: 1〜2文で実務・市場・ユーザー影響",
    "- 出典: 媒体名を2件まで",
    "",
    "## 総括",
    "- 今日注目すべき流れを2〜4文でまとめる",
    "",
    "注意:",
    "- 日本語で書く",
    "- 見出しの番号を維持する",
    "- URLは直接書かない",
    "- 断定できないことは断定しない",
    "- 余計な前置きは書かない",
  ].join("\n");
}

export function extractTextFromClaudeResponse(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((block) => {
      if (!block || typeof block !== "object") return "";
      const typed = block as { type?: string; text?: string };
      if (typed.type === "text" && typeof typed.text === "string") {
        return typed.text;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function normalizeDailyAiNewsOutput(raw: string, now: Date = new Date()) {
  const text = raw.trim();

  if (!text) {
    return [
      "# 今日のAIニュース要約",
      "",
      "## 1. 情報取得失敗",
      "- 要点: ニュース要約の生成結果が空でした。",
      "- 影響: 再実行またはログ確認が必要です。",
      "- 出典: なし",
      "",
      "## 総括",
      "- 正常な要約を生成できませんでした。",
      "",
      "---",
      `生成時刻: ${formatJstDate(now)}`,
    ].join("\n");
  }

  const hasTitle = text.includes("# 今日のAIニュース要約");
  const hasSummary = text.includes("## 総括");

  let normalized = text;

  if (!hasTitle) {
    normalized = `# 今日のAIニュース要約\n\n${normalized}`;
  }

  if (!hasSummary) {
    normalized += "\n\n## 総括\n- 主要ニュースは上記の通りです。";
  }

  normalized = normalized.replace(/\n{3,}/g, "\n\n").trim();

  return `${normalized}\n\n---\n生成時刻: ${formatJstDate(now)}`;
}

export function buildDailyAiNewsFallback(errorMessage?: string) {
  return [
    "# 今日のAIニュース要約",
    "",
    "## 1. 取得エラー",
    `- 要点: AIニュース要約の生成に失敗しました。${errorMessage ? ` エラー: ${errorMessage}` : ""}`,
    "- 影響: 直近情報を取得できていないため、再実行または設定確認が必要です。",
    "- 出典: なし",
    "",
    "## 総括",
    "- 本回は正常なニュース要約を生成できませんでした。",
  ].join("\n");
}
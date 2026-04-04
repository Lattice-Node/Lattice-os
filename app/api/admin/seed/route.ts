import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const NEW_TEMPLATES = [
  {
    name: "電車遅延・運行情報チェック",
    description: "通勤路線の遅延・運休情報を毎朝チェックして通知します",
    prompt: "{{路線名}}の今日の運行状況・遅延情報を検索してください。遅延があれば原因と復旧見込みを、正常なら「通常運行」と報告してください。振替輸送の情報があればそれも含めてください。日本語で簡潔に出力してください。",
    trigger: "schedule",
    triggerCron: "0 7 * * 1-5",
    category: "生活",
    variables: JSON.stringify([
      { key: "路線名", label: "チェックしたい路線", placeholder: "JR山手線、東京メトロ丸ノ内線", type: "text" },
    ]),
  },
  {
    name: "花粉・PM2.5情報",
    description: "花粉飛散量とPM2.5濃度を毎朝お届けします（春シーズン必須）",
    prompt: "{{地域}}の今日の花粉飛散量（スギ・ヒノキ）とPM2.5濃度を検索し、外出時の注意点をまとめてください。「非常に多い」「多い」「少ない」などのレベルと、マスクの必要性、洗濯物を外に干せるかも教えてください。日本語で出力してください。",
    trigger: "schedule",
    triggerCron: "0 7 * * *",
    category: "生活",
    variables: JSON.stringify([
      { key: "地域", label: "地域", placeholder: "東京", type: "text" },
    ]),
  },
  {
    name: "為替レート通知（USD/JPY）",
    description: "ドル円の最新レートと前日比を毎朝通知します",
    prompt: "現在の米ドル/円（USD/JPY）の為替レートを検索してください。現在のレート、前日比（円高/円安どちらか）、今週の最高値と最安値、簡単な市場コメントを日本語でまとめてください。{{追加通貨}}のレートも含めてください。",
    trigger: "schedule",
    triggerCron: "0 8 * * 1-5",
    category: "ビジネス",
    variables: JSON.stringify([
      { key: "追加通貨", label: "追加で知りたい通貨（任意）", placeholder: "EUR/JPY、GBP/JPY", type: "text" },
    ]),
  },
  {
    name: "日経平均・株式市場レポート",
    description: "日経平均株価と主要指標を毎日レポートします",
    prompt: "本日の日経平均株価、TOPIX、マザーズ指数の最新値と前日比を検索してください。市場全体の動向（上昇・下落の要因）と、注目された銘柄やセクターがあれば簡潔にまとめてください。{{注目銘柄}}の株価も確認してください。日本語で出力してください。",
    trigger: "schedule",
    triggerCron: "30 15 * * 1-5",
    category: "ビジネス",
    variables: JSON.stringify([
      { key: "注目銘柄", label: "注目したい銘柄（任意）", placeholder: "トヨタ、ソニー、任天堂", type: "text" },
    ]),
  },
  {
    name: "Xトレンドまとめ（日本）",
    description: "日本のXトレンドを毎朝まとめて話題のキャッチアップに",
    prompt: "日本のX（旧Twitter）で今トレンドになっている話題を検索し、上位{{件数}}個をまとめてください。各トピックについて、なぜ話題になっているかを1〜2行で説明してください。エンタメ、政治、テクノロジーなどジャンルも付けてください。日本語で出力してください。",
    trigger: "schedule",
    triggerCron: "0 8 * * *",
    category: "SNS",
    variables: JSON.stringify([
      { key: "件数", label: "トレンド件数", placeholder: "10", type: "text" },
    ]),
  },
  {
    name: "テックブログ巡回（Zenn/Qiita）",
    description: "Zenn・Qiitaのトレンド記事を毎日チェックしてまとめます",
    prompt: "ZennとQiitaで今日トレンドになっている技術記事を検索し、{{分野}}に関連するものを{{件数}}つピックアップしてください。各記事のタイトル、要点、なぜ読むべきかを2行で説明してください。日本語で出力してください。",
    trigger: "schedule",
    triggerCron: "0 12 * * *",
    category: "リサーチ",
    variables: JSON.stringify([
      { key: "分野", label: "興味のある分野", placeholder: "フロントエンド、AI、インフラ", type: "text" },
      { key: "件数", label: "記事の件数", placeholder: "5", type: "text" },
    ]),
  },
  {
    name: "英語ニュース翻訳・要約",
    description: "海外の英語ニュースを日本語に翻訳して要約します",
    prompt: "{{分野}}に関する最新の英語ニュースを海外メディア（TechCrunch、The Verge、Reuters等）から検索し、重要なもの{{件数}}つを選んで日本語で要約してください。元の記事のソース名も記載してください。",
    trigger: "schedule",
    triggerCron: "0 9 * * *",
    category: "リサーチ",
    variables: JSON.stringify([
      { key: "分野", label: "対象分野", placeholder: "AI・テクノロジー", type: "text" },
      { key: "件数", label: "記事数", placeholder: "5", type: "text" },
    ]),
  },
  {
    name: "今日の献立提案",
    description: "冷蔵庫の食材や気分に合わせて今日の献立を提案します",
    prompt: "以下の条件で今日の夕食の献立を提案してください。\\n\\n条件：\\n- 食材: {{食材}}\\n- 人数: {{人数}}人分\\n- 調理時間: {{調理時間}}分以内\\n\\nメインディッシュ1品、副菜1〜2品、汁物1品を提案し、それぞれ簡単な作り方（3ステップ以内）を含めてください。日本語で出力してください。",
    trigger: "manual",
    triggerCron: "",
    category: "生活",
    variables: JSON.stringify([
      { key: "食材", label: "ある食材", placeholder: "鶏もも肉、じゃがいも、にんじん、玉ねぎ", type: "textarea" },
      { key: "人数", label: "人数", placeholder: "2", type: "text" },
      { key: "調理時間", label: "調理時間（分）", placeholder: "30", type: "text" },
    ]),
  },
  {
    name: "YouTube動画要約",
    description: "YouTube動画の内容をAIが要約します（URL指定）",
    prompt: "以下のYouTube動画の内容を検索・要約してください。\\n\\nURL: {{URL}}\\n\\n動画のタイトル、主要なポイント（箇条書き5つ以内）、全体のまとめ（3行以内）を日本語で出力してください。",
    trigger: "manual",
    triggerCron: "",
    category: "生産性",
    variables: JSON.stringify([
      { key: "URL", label: "YouTube動画のURL", placeholder: "https://www.youtube.com/watch?v=...", type: "text" },
    ]),
  },
  {
    name: "議事録自動生成",
    description: "会議のメモから構造化された議事録を生成します",
    prompt: "以下の会議メモから正式な議事録を作成してください。\\n\\n会議名: {{会議名}}\\n日時: {{日時}}\\n参加者: {{参加者}}\\n\\nメモ:\\n{{メモ内容}}\\n\\n以下の形式で出力してください：\\n1. 議題\\n2. 決定事項\\n3. アクションアイテム（担当者・期限付き）\\n4. 次回予定",
    trigger: "manual",
    triggerCron: "",
    category: "ビジネス",
    variables: JSON.stringify([
      { key: "会議名", label: "会議名", placeholder: "週次定例", type: "text" },
      { key: "日時", label: "日時", placeholder: "2025年4月3日 14:00", type: "text" },
      { key: "参加者", label: "参加者", placeholder: "田中、鈴木、佐藤", type: "text" },
      { key: "メモ内容", label: "会議メモ（箇条書きでOK）", placeholder: "・新機能の進捗確認\n・来月のリリース日程\n・バグ対応の優先度", type: "textarea" },
    ]),
  },
  {
    name: "Amazonセール・特価チェック",
    description: "Amazonのタイムセールや特価情報を毎日チェックします",
    prompt: "Amazon.co.jpで現在開催中のタイムセール、特価情報を検索してください。{{カテゴリ}}カテゴリの中からおすすめの商品を{{件数}}個ピックアップし、商品名・通常価格・セール価格・割引率をまとめてください。日本語で出力してください。",
    trigger: "schedule",
    triggerCron: "0 10 * * *",
    category: "生活",
    variables: JSON.stringify([
      { key: "カテゴリ", label: "興味のあるカテゴリ", placeholder: "ガジェット、家電、食品", type: "text" },
      { key: "件数", label: "商品数", placeholder: "5", type: "text" },
    ]),
  },
  {
    name: "英単語・英語表現デイリー",
    description: "毎日5つの英単語・表現をビジネス例文つきで届けます",
    prompt: "{{レベル}}レベルのビジネス英語で使える英単語・表現を{{件数}}つ選んで、以下の形式で教えてください。\\n\\n各単語について:\\n1. 英単語/表現\\n2. 発音のカタカナ表記\\n3. 意味（日本語）\\n4. ビジネスでの例文（英語+日本語訳）\\n\\n今日のテーマ: {{テーマ}}",
    trigger: "schedule",
    triggerCron: "0 7 * * 1-5",
    category: "学習",
    variables: JSON.stringify([
      { key: "レベル", label: "レベル", placeholder: "中級", type: "text" },
      { key: "件数", label: "単語数", placeholder: "5", type: "text" },
      { key: "テーマ", label: "テーマ（任意）", placeholder: "会議、メール、プレゼン", type: "text" },
    ]),
  },
  {
    name: "今日は何の日・雑学",
    description: "今日の記念日・歴史的出来事・雑学を毎朝お届けします",
    prompt: "今日（現在の日付）は何の日かを検索し、以下をまとめてください。\\n\\n1. 今日の記念日・祝日（日本の記念日優先）\\n2. 歴史上の今日の出来事（2〜3個）\\n3. 今日が誕生日の有名人（2〜3人）\\n4. 朝のひとこと（今日にちなんだポジティブなメッセージ）\\n\\n日本語で親しみやすいトーンで出力してください。",
    trigger: "schedule",
    triggerCron: "0 7 * * *",
    category: "生活",
    variables: JSON.stringify([]),
  },
  {
    name: "副業・ビジネスアイデア生成",
    description: "あなたのスキルや興味に基づいた副業アイデアを提案します",
    prompt: "以下の条件に基づいて、副業・サイドビジネスのアイデアを{{件数}}個提案してください。\\n\\nスキル: {{スキル}}\\n使える時間: 週{{時間}}時間\\n初期投資: {{予算}}\\n興味のある分野: {{分野}}\\n\\n各アイデアについて、概要・始め方（3ステップ）・想定月収・難易度を記載してください。日本語で出力してください。",
    trigger: "manual",
    triggerCron: "",
    category: "ビジネス",
    variables: JSON.stringify([
      { key: "スキル", label: "あなたのスキル", placeholder: "プログラミング、ライティング、デザイン", type: "textarea" },
      { key: "時間", label: "週に使える時間", placeholder: "10", type: "text" },
      { key: "予算", label: "初期投資の予算", placeholder: "5万円以内", type: "text" },
      { key: "分野", label: "興味のある分野", placeholder: "AI、Web制作、コンテンツ", type: "text" },
      { key: "件数", label: "アイデアの数", placeholder: "5", type: "text" },
    ]),
  },
  {
    name: "スポーツ結果・ハイライト",
    description: "応援しているチームの試合結果とハイライトを毎朝報告",
    prompt: "{{チーム名}}の最新の試合結果を検索してください。スコア、主要なプレー・得点者、チームの現在の順位・成績を報告してください。今後の試合予定（次の2試合）も含めてください。日本語で出力してください。",
    trigger: "schedule",
    triggerCron: "0 8 * * *",
    category: "生活",
    variables: JSON.stringify([
      { key: "チーム名", label: "応援しているチーム", placeholder: "大谷翔平（ドジャース）、三笘薫（ブライトン）", type: "text" },
    ]),
  },
];

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
  if (user?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const existingNames = (await prisma.agentTemplate.findMany({ select: { name: true } })).map(t => t.name);
  const toAdd = NEW_TEMPLATES.filter(t => !existingNames.includes(t.name));

  if (toAdd.length === 0) return NextResponse.json({ message: "All templates already exist", added: 0 });

  await prisma.agentTemplate.createMany({ data: toAdd });

  return NextResponse.json({ message: `Added ${toAdd.length} new templates`, added: toAdd.length, names: toAdd.map(t => t.name) });
}

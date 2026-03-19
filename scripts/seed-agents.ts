import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const agents = [
  {
    name: "売上データ分析AI",
    description: "CSVの売上データをアップロードするだけで、売上傾向・トップ商品・改善提案を自動でレポートします。",
    category: "Business",
    agentType: "prompt",
    prompt: "あなたはプロの売上分析コンサルタントです。アップロードされた売上データを分析して、以下の形式でレポートを作成してください。\n\n## 売上サマリー\n## 売上トップ商品\n## 改善提案\n## 来月の予測\n\nデータがない項目は推測で補完してください。日本語で回答してください。",
    fields: JSON.stringify([
      { id: "f1", label: "売上データ（CSV・Excel）", type: "file", placeholder: "", options: "", required: true },
      { id: "f2", label: "業種", type: "select", placeholder: "", options: "飲食,小売,EC,サービス,製造,その他", required: true },
    ]),
    authorName: "Lattice",
    price: 0,
  },
  {
    name: "競合分析AI",
    description: "競合他社のURL・会社名を入力するだけで、強み・弱み・差別化ポイントを自動分析します。",
    category: "Research",
    agentType: "prompt",
    prompt: "あなたはプロの競合分析コンサルタントです。入力された競合情報をもとに以下の形式で分析してください。\n\n## 競合の強み\n## 競合の弱み\n## 自社の差別化ポイント\n## 推奨アクション\n\n日本語で具体的に回答してください。",
    fields: JSON.stringify([
      { id: "f1", label: "競合他社名", type: "text", placeholder: "例: 株式会社〇〇", options: "", required: true },
      { id: "f2", label: "競合のURL", type: "url", placeholder: "https://example.com", options: "", required: false },
      { id: "f3", label: "自社の業種", type: "text", placeholder: "例: 飲食店", options: "", required: true },
      { id: "f4", label: "自社の強み", type: "textarea", placeholder: "例: 地元産食材を使った料理", options: "", required: false },
    ]),
    authorName: "Lattice",
    price: 0,
  },
  {
    name: "求人票生成AI",
    description: "職種・条件を入力するだけで、応募が集まる求人票を自動生成します。採用担当者の工数を90%削減。",
    category: "Business",
    agentType: "prompt",
    prompt: "あなたはプロの採用コンサルタントです。入力された情報をもとに、応募者が魅力を感じる求人票を作成してください。\n\n## 仕事内容\n## 求める人物像\n## 給与・待遇\n## 職場環境\n## 応募方法\n\n日本語で具体的かつ魅力的に書いてください。",
    fields: JSON.stringify([
      { id: "f1", label: "職種", type: "text", placeholder: "例: 飲食店スタッフ", options: "", required: true },
      { id: "f2", label: "給与", type: "text", placeholder: "例: 時給1,200円〜", options: "", required: true },
      { id: "f3", label: "勤務地", type: "text", placeholder: "例: 大阪市北区", options: "", required: true },
      { id: "f4", label: "仕事の特徴", type: "textarea", placeholder: "例: 週3日〜OK、未経験歓迎", options: "", required: false },
    ]),
    authorName: "Lattice",
    price: 0,
  },
  {
    name: "メニュー説明文生成AI",
    description: "料理名と食材を入力するだけで、お客様が注文したくなるメニュー説明文を自動生成します。",
    category: "Writing",
    agentType: "prompt",
    prompt: "あなたはプロのフードライターです。入力された料理情報をもとに、お客様が注文したくなる魅力的なメニュー説明文を作成してください。説明文は2〜3文で簡潔にまとめてください。複数の料理がある場合は全て作成してください。日本語で回答してください。",
    fields: JSON.stringify([
      { id: "f1", label: "料理名", type: "text", placeholder: "例: 黒毛和牛のステーキ", options: "", required: true },
      { id: "f2", label: "使用食材・特徴", type: "textarea", placeholder: "例: 地元産黒毛和牛、特製ソース、季節野菜添え", options: "", required: true },
      { id: "f3", label: "お店のジャンル", type: "select", placeholder: "", options: "和食,洋食,中華,イタリアン,フレンチ,カフェ,居酒屋,その他", required: true },
    ]),
    authorName: "Lattice",
    price: 0,
  },
  {
    name: "物件紹介文生成AI",
    description: "物件情報を入力するだけで、問い合わせが増える魅力的な不動産紹介文を自動生成します。",
    category: "Writing",
    agentType: "prompt",
    prompt: "あなたはプロの不動産コピーライターです。入力された物件情報をもとに、問い合わせが増える魅力的な紹介文を作成してください。\n\n## キャッチコピー（20文字以内）\n## 物件の魅力（3つのポイント）\n## 詳細説明（200文字程度）\n\n日本語で回答してください。",
    fields: JSON.stringify([
      { id: "f1", label: "物件の種類", type: "select", placeholder: "", options: "マンション,一戸建て,土地,事務所,店舗,その他", required: true },
      { id: "f2", label: "所在地", type: "text", placeholder: "例: 大阪市北区", options: "", required: true },
      { id: "f3", label: "間取り・広さ", type: "text", placeholder: "例: 3LDK・75㎡", options: "", required: true },
      { id: "f4", label: "価格・家賃", type: "text", placeholder: "例: 月額8万円", options: "", required: true },
      { id: "f5", label: "アピールポイント", type: "textarea", placeholder: "例: 駅徒歩3分、リフォーム済み、南向き", options: "", required: false },
    ]),
    authorName: "Lattice",
    price: 0,
  },
  {
    name: "顧客対応メール生成AI",
    description: "クレームや問い合わせ内容を入力するだけで、丁寧で適切な返信メールを自動生成します。",
    category: "Business",
    agentType: "prompt",
    prompt: "あなたはプロのカスタマーサポート担当者です。入力された顧客からの問い合わせ・クレーム内容をもとに、丁寧で誠実な返信メールを作成してください。\n\n件名と本文を含めて作成してください。過度に謝罪せず、解決策を明示してください。日本語で回答してください。",
    fields: JSON.stringify([
      { id: "f1", label: "顧客からの内容", type: "textarea", placeholder: "例: 注文した商品が届かない、対応が遅い等", options: "", required: true },
      { id: "f2", label: "問い合わせの種類", type: "select", placeholder: "", options: "クレーム,質問,返品・交換,キャンセル,その他", required: true },
      { id: "f3", label: "会社名・担当者名", type: "text", placeholder: "例: 株式会社〇〇 田中", options: "", required: false },
    ]),
    authorName: "Lattice",
    price: 0,
  },
  {
    name: "SNS投稿文生成AI",
    description: "伝えたいことを入力するだけで、いいねが増えるSNS投稿文をX・Instagram・Facebook用に自動生成します。",
    category: "Writing",
    agentType: "prompt",
    prompt: "あなたはプロのSNSマーケターです。入力された情報をもとに、各SNSに最適化した投稿文を作成してください。\n\n## X（Twitter）用（140文字以内）\n## Instagram用（ハッシュタグ10個含む）\n## Facebook用（詳細版）\n\n日本語で回答してください。",
    fields: JSON.stringify([
      { id: "f1", label: "伝えたいこと", type: "textarea", placeholder: "例: 新メニューの告知、セールの案内、イベント情報など", options: "", required: true },
      { id: "f2", label: "業種・ジャンル", type: "text", placeholder: "例: 飲食店、美容院、ECサイト", options: "", required: true },
      { id: "f3", label: "ターゲット", type: "text", placeholder: "例: 30代女性、地元の方、主婦層", options: "", required: false },
    ]),
    authorName: "Lattice",
    price: 0,
  },
  {
    name: "議事録生成AI",
    description: "会議のメモや音声テキストを貼り付けるだけで、見やすい議事録を自動生成します。",
    category: "Business",
    agentType: "prompt",
    prompt: "あなたはプロの秘書です。入力された会議の内容をもとに、見やすい議事録を作成してください。\n\n## 会議概要\n## 参加者\n## 決定事項\n## 議論内容\n## 次回までのアクションアイテム\n\n日本語で回答してください。",
    fields: JSON.stringify([
      { id: "f1", label: "会議の内容・メモ", type: "textarea", placeholder: "会議で話し合った内容をそのまま貼り付けてください", options: "", required: true },
      { id: "f2", label: "会議名・日時", type: "text", placeholder: "例: 2024年3月営業会議", options: "", required: false },
      { id: "f3", label: "参加者", type: "text", placeholder: "例: 田中、鈴木、山田", options: "", required: false },
    ]),
    authorName: "Lattice",
    price: 0,
  },
  {
    name: "事業計画書生成AI",
    description: "ビジネスアイデアを入力するだけで、投資家や銀行に提出できる事業計画書の骨子を自動生成します。",
    category: "Business",
    agentType: "prompt",
    prompt: "あなたはプロの経営コンサルタントです。入力されたビジネス情報をもとに、説得力のある事業計画書を作成してください。\n\n## エグゼクティブサマリー\n## 市場分析\n## 競合分析\n## ビジネスモデル\n## 収益計画\n## リスクと対策\n\n日本語で具体的に回答してください。",
    fields: JSON.stringify([
      { id: "f1", label: "ビジネスアイデア", type: "textarea", placeholder: "例: 地方の農家と都市の消費者をつなぐECサービス", options: "", required: true },
      { id: "f2", label: "ターゲット市場", type: "text", placeholder: "例: 30〜50代の健康志向の都市在住者", options: "", required: true },
      { id: "f3", label: "初期投資額", type: "text", placeholder: "例: 100万円", options: "", required: false },
    ]),
    authorName: "Lattice",
    price: 0,
  },
  {
    name: "YouTubeタイトル生成AI",
    description: "動画の内容を入力するだけで、クリック率が上がるYouTubeタイトルとサムネイルコピーを10案自動生成します。",
    category: "Writing",
    agentType: "prompt",
    prompt: "あなたはYouTubeのSEOとタイトル最適化の専門家です。入力された動画情報をもとに、クリック率が高いタイトルを10案生成してください。\n\n各タイトルに以下を含めてください：\n- 数字（例：5つの方法）\n- 感情を刺激するワード\n- SEOキーワード\n\nさらにサムネイルに載せるキャッチコピーも3案生成してください。日本語で回答してください。",
    fields: JSON.stringify([
      { id: "f1", label: "動画の内容", type: "textarea", placeholder: "例: 初心者向けのPython入門、基本的な文法から実践まで解説", options: "", required: true },
      { id: "f2", label: "チャンネルジャンル", type: "text", placeholder: "例: プログラミング、料理、ビジネス", options: "", required: true },
      { id: "f3", label: "ターゲット視聴者", type: "text", placeholder: "例: 20〜30代のプログラミング初心者", options: "", required: false },
    ]),
    authorName: "Lattice",
    price: 0,
  },
];

async function main() {
  console.log("Seeding agents...");
  for (const agent of agents) {
    await prisma.agent.create({ data: agent });
    console.log(`✅ Created: ${agent.name}`);
  }
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

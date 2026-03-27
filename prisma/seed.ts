import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const templates = [
    {
      name: "毎朝AIニュース要約",
      description: "生成AI・LLM関連の最新ニュースを毎朝収集し、重要なものを5つ厳選して要約します",
      prompt: "今日の生成AI・LLM・AIエージェント関連の最新ニュースを検索し、最も重要な5つを選んで、それぞれ3行で要約してください。日本語で出力してください。",
      trigger: "schedule",
      category: "リサーチ",
      connections: "[]",
    },
    {
      name: "毎週AIツール新着まとめ",
      description: "今週リリースされた新しいAIツール・サービスをまとめて週1回お届けします",
      prompt: "今週新しくリリースまたは大幅アップデートされたAIツール・サービスを調査し、最大10個をリストアップしてください。各ツールについて、名前・概要・何ができるかを2行で説明してください。日本語で出力してください。",
      trigger: "schedule",
      category: "リサーチ",
      connections: "[]",
    },
    {
      name: "気になるサイト更新通知",
      description: "指定したURLのWebページに変更があったら即座に通知します",
      prompt: "指定されたURLのWebページの内容を取得し、前回の内容と比較してください。変更があった場合は、変更箇所の要約を日本語で報告してください。変更がない場合は「変更なし」とだけ報告してください。",
      trigger: "schedule",
      category: "通知",
      connections: "[]",
    },
    {
      name: "毎日の天気予報通知",
      description: "指定した地域の天気予報を毎朝わかりやすくお届けします",
      prompt: "日本の指定された地域の今日の天気予報を取得し、天気・最高気温・最低気温・降水確率・傘が必要かどうかを簡潔にまとめてください。日本語でフレンドリーなトーンで出力してください。",
      trigger: "schedule",
      category: "通知",
      connections: "[]",
    },
    {
      name: "SNSトレンド要約",
      description: "X(Twitter)の今日のトレンドトピックをAIが分析・要約してお届けします",
      prompt: "X(Twitter)の日本のトレンドトピック上位10個を調査し、それぞれなぜトレンドになっているかを1-2行で説明してください。ビジネスに関連するトレンドがあれば特に詳しく解説してください。日本語で出力してください。",
      trigger: "schedule",
      category: "SNS",
      connections: "[]",
    },
  ];

  for (const t of templates) {
    const exists = await prisma.agentTemplate.findFirst({
      where: { name: t.name },
    });
    if (!exists) {
      await prisma.agentTemplate.create({ data: t });
      console.log("Created: " + t.name);
    } else {
      console.log("Already exists: " + t.name);
    }
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
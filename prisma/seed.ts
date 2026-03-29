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
      name: "競合サイト更新チェック",
      description: "指定したWebサイトの最新情報を定期的にチェックして変更点をお届けします",
      prompt: "指定されたWebサイトの最新の更新内容を検索し、新しい記事・製品・お知らせなどの変更点を日本語で3つ以内にまとめてください。",
      trigger: "schedule",
      category: "営業",
      connections: "[]",
    },
    {
      name: "毎日の天気予報",
      description: "指定した地域の天気予報を毎朝わかりやすくお届けします",
      prompt: "日本の主要都市（東京）の今日の天気予報を検索し、天気・最高気温・最低気温・降水確率・傘が必要かどうかを簡潔にまとめてください。日本語でフレンドリーなトーンで出力してください。",
      trigger: "schedule",
      category: "生産性",
      connections: "[]",
    },
    {
      name: "業界ニュースまとめ",
      description: "指定した業界の最新ニュースを毎日収集して要約します",
      prompt: "日本のIT・テクノロジー業界の今日の最新ニュースを検索し、ビジネスに影響がありそうな重要なニュースを5つ選んで、それぞれ2行で要約してください。日本語で出力してください。",
      trigger: "schedule",
      category: "リサーチ",
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

  // Gmail/SNS関連の使えないテンプレートを削除
  const removeNames = ["気になるサイト更新通知", "毎日の天気予報通知", "SNSトレンド要約", "Gmail未読メール要約"];
  for (const name of removeNames) {
    await prisma.agentTemplate.deleteMany({ where: { name } });
    console.log("Removed if existed: " + name);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
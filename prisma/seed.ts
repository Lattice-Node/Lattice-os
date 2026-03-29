import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.agentTemplate.deleteMany({});
  console.log("Cleared old templates");

  const templates = [
    {
      name: "毎朝AIニュース要約",
      description: "生成AI・LLM関連の最新ニュースを毎朝収集し、重要なものを厳選して要約します",
      prompt: "今日の生成AI・LLM・AIエージェント関連の最新ニュースを検索し、最も重要な{{件数}}つを選んで、それぞれ3行で要約してください。日本語で出力してください。",
      trigger: "schedule",
      triggerCron: "0 8 * * *",
      category: "リサーチ",
      variables: JSON.stringify([
        { key: "件数", label: "ニュースの件数", placeholder: "5", type: "text" },
      ]),
    },
    {
      name: "競合サイト更新チェック",
      description: "指定したWebサイトの最新情報を定期的にチェックして変更点をお届けします",
      prompt: "以下のWebサイトの最新の更新内容を検索し、新しい記事・製品・お知らせなどの変更点を日本語で3つ以内にまとめてください。\n\n対象サイト:\n{{対象サイトURL}}",
      trigger: "schedule",
      triggerCron: "0 8 * * *",
      category: "営業",
      variables: JSON.stringify([
        { key: "対象サイトURL", label: "チェックしたいサイトURL（改行で複数可）", placeholder: "https://example.com", type: "textarea" },
      ]),
    },
    {
      name: "毎週AIツール新着まとめ",
      description: "今週リリースされた新しいAIツール・サービスをまとめて週1回お届けします",
      prompt: "今週新しくリリースまたは大幅アップデートされたAIツール・サービスを調査し、最大{{件数}}個をリストアップしてください。各ツールについて、名前・概要・何ができるかを2行で説明してください。日本語で出力してください。",
      trigger: "schedule",
      triggerCron: "0 9 * * 1",
      category: "リサーチ",
      variables: JSON.stringify([
        { key: "件数", label: "ツールの件数", placeholder: "10", type: "text" },
      ]),
    },
    {
      name: "毎日の天気予報",
      description: "指定した地域の天気予報を毎朝わかりやすくお届けします",
      prompt: "{{地域}}の今日の天気予報を検索し、天気・最高気温・最低気温・降水確率・傘が必要かどうかを簡潔にまとめてください。日本語でフレンドリーなトーンで出力してください。",
      trigger: "schedule",
      triggerCron: "0 7 * * *",
      category: "生産性",
      variables: JSON.stringify([
        { key: "地域", label: "天気を知りたい地域", placeholder: "東京", type: "text" },
      ]),
    },
    {
      name: "業界ニュースまとめ",
      description: "指定した業界の最新ニュースを毎日収集して要約します",
      prompt: "{{業界}}業界の今日の最新ニュースを検索し、ビジネスに影響がありそうな重要なニュースを{{件数}}つ選んで、それぞれ2行で要約してください。日本語で出力してください。",
      trigger: "schedule",
      triggerCron: "0 8 * * *",
      category: "リサーチ",
      variables: JSON.stringify([
        { key: "業界", label: "対象の業界", placeholder: "IT・テクノロジー", type: "text" },
        { key: "件数", label: "ニュースの件数", placeholder: "5", type: "text" },
      ]),
    },
    {
      name: "SNSトレンド収集",
      description: "指定したジャンルのSNSトレンドを毎朝まとめて、投稿ネタとして整理します",
      prompt: "{{ジャンル}}に関するX（Twitter）やSNSでのトレンド・話題を検索し、今注目されているトピックを{{件数}}つ選んで、それぞれ投稿ネタとして使えるように簡潔にまとめてください。日本語で出力してください。",
      trigger: "schedule",
      triggerCron: "0 7 * * *",
      category: "SNS",
      variables: JSON.stringify([
        { key: "ジャンル", label: "対象のジャンル", placeholder: "AI・テクノロジー", type: "text" },
        { key: "件数", label: "トピックの件数", placeholder: "5", type: "text" },
      ]),
    },
    {
      name: "価格変動アラート",
      description: "指定した商品の価格を監視して、変動があれば通知します",
      prompt: "以下の商品の現在の価格を検索してください。前回と比較して変動があれば報告してください。\n\n商品: {{商品名}}\n目標価格: {{目標価格}}円以下\n\n現在の価格、目標との差額、購入すべきかの判断を日本語で簡潔に出力してください。",
      trigger: "schedule",
      triggerCron: "0 12 * * *",
      category: "通知",
      variables: JSON.stringify([
        { key: "商品名", label: "監視したい商品名", placeholder: "iPhone 16 Pro 256GB", type: "text" },
        { key: "目標価格", label: "目標価格（円）", placeholder: "150000", type: "text" },
      ]),
    },
    {
      name: "メール要約アシスタント",
      description: "Gmailの未読メールを取得して、重要なものを要約します",
      prompt: "取得したGmailの未読メールの中から重要なものを{{件数}}件選び、それぞれ差出人・件名・要約（2行以内）を日本語でまとめてください。緊急度が高いものは先に表示してください。",
      trigger: "schedule",
      triggerCron: "0 9 * * *",
      category: "生産性",
      variables: JSON.stringify([
        { key: "件数", label: "要約する件数", placeholder: "5", type: "text" },
      ]),
    },
  ];

  for (const t of templates) {
    await prisma.agentTemplate.create({ data: t });
    console.log("Created: " + t.name);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

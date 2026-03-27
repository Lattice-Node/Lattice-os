import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const prompt = [
  "過去24〜48時間の生成AI・LLM・AIエージェント関連ニュースを優先して収集してください。",
  "重要度が高い話題を3〜5件だけ選び、日本語で要約してください。",
  "対象は、主要AI企業、基盤モデル、プロダクト発表、AI規制、研究発表、大型提携、資金調達、障害や事故です。",
  "重要度の低い小規模アップデート、宣伝色の強い投稿、同一話題の重複は避けてください。",
  "",
  "出力形式は必ず次のMarkdownにしてください。",
  "",
  "# 今日のAIニュース要約",
  "",
  "## 1. ニュースタイトル",
  "- 要点: 2〜3文で要約",
  "- 影響: 1〜2文で市場・実務・ユーザー影響を説明",
  "- 出典: 媒体名を2件まで",
  "",
  "## 2. ニュースタイトル",
  "- 要点: 2〜3文で要約",
  "- 影響: 1〜2文で市場・実務・ユーザー影響を説明",
  "- 出典: 媒体名を2件まで",
  "",
  "## 3. ニュースタイトル",
  "- 要点: 2〜3文で要約",
  "- 影響: 1〜2文で市場・実務・ユーザー影響を説明",
  "- 出典: 媒体名を2件まで",
  "",
  "## 総括",
  "- 今日注目すべき流れを2〜4文でまとめる",
  "",
  "条件:",
  "- 誇張しない",
  "- 推測を断定しない",
  "- URLは直接書かない",
  "- 前置きや挨拶は不要",
].join("\n");

async function main() {
  const agentWhere = {
    OR: [
      { name: { contains: "AIニュース" } },
      { name: { contains: "AI News" } },
      { description: { contains: "AIニュース" } },
      { prompt: { contains: "AIニュース" } },
    ],
  };

  const templateWhere = {
    OR: [
      { name: { contains: "AIニュース" } },
      { name: { contains: "AI News" } },
      { description: { contains: "AIニュース" } },
      { prompt: { contains: "AIニュース" } },
    ],
  };

  const updatedAgents = await prisma.userAgent.updateMany({
    where: agentWhere,
    data: {
      prompt,
      outputType: "app",
    },
  });

  const updatedTemplates = await prisma.agentTemplate.updateMany({
    where: templateWhere,
    data: {
      prompt,
    },
  });

  console.log(
    JSON.stringify(
      {
        updatedUserAgents: updatedAgents.count,
        updatedTemplates: updatedTemplates.count,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from "@prisma/client";
import { extractTitle } from "../lib/feed/extract-title";
import { extractPreview } from "../lib/feed/extract-preview";

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.publicFeedItem.findMany({
    where: { previewText: "" },
    select: { id: true, resultText: true, agentName: true },
  });

  console.log(`Backfilling ${items.length} items...`);

  for (const item of items) {
    await prisma.publicFeedItem.update({
      where: { id: item.id },
      data: {
        title: extractTitle(item.resultText, item.agentName),
        previewText: extractPreview(item.resultText),
      },
    });
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

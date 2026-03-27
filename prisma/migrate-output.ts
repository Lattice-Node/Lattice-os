import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.userAgent.updateMany({
    data: { outputType: "app" },
  });
  console.log("Updated " + result.count + " agents to outputType: app");
}
main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
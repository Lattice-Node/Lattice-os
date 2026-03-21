import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agents = await prisma.agent.findMany({
    select: { id: true, createdAt: true },
  });

  const agentPages = agents.map((agent) => ({
    url: `https://lattice-protocol.com/apps/${agent.id}`,
    lastModified: agent.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: "https://lattice-protocol.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: "https://lattice-protocol.com/marketplace",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://lattice-protocol.com/publish",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...agentPages,
  ];
}
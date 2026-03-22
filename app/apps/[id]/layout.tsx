import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const agent = await prisma.agent.findUnique({ where: { id } });
  if (!agent) return { title: "Lattice" };

  return {
    title: `${agent.name} | Lattice - AIプロンプトマーケット`,
    description: agent.description,
    openGraph: {
      title: `${agent.name} | Lattice`,
      description: agent.description,
      url: `https://lattice-protocol.com/apps/${agent.id}`,
      siteName: "Lattice",
      locale: "ja_JP",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${agent.name} | Lattice`,
      description: agent.description,
      site: "@Lattice_Node",
    },
  };
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
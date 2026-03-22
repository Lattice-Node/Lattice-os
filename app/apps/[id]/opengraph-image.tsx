import { prisma } from "@/lib/prisma";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };

export default async function Image({ params }: { params: { id: string } }) {
  const agent = await prisma.agent.findUnique({ where: { id: params.id } });
  if (!agent) return new ImageResponse(<div>Not found</div>);

  return new ImageResponse(
    <div style={{ width: 1200, height: 630, background: "#080b14", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px" }}>
      <div style={{ fontSize: 20, color: "#3b82f6", marginBottom: 24 }}>{agent.category}</div>
      <div style={{ fontSize: 56, fontWeight: 900, color: "#ffffff", marginBottom: 24, lineHeight: 1.1 }}>{agent.name}</div>
      <div style={{ fontSize: 24, color: "#8b92a9", marginBottom: 48 }}>{agent.description}</div>
      <div style={{ fontSize: 20, color: "#4a5068" }}>lattice-protocol.com</div>
    </div>
  );
}
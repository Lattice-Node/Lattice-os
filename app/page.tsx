import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";

export const revalidate = 60; // 60秒キャッシュ

async function getStats() {
  const [agentCount, purchaseCount] = await Promise.all([
    prisma.agent.count(),
    prisma.purchase.count(),
  ]);
  const useCountResult = await prisma.agent.aggregate({
    _sum: { useCount: true },
  });
  return {
    agentCount,
    purchaseCount,
    totalUseCount: useCountResult._sum.useCount ?? 0,
  };
}

export default async function Home() {
  const { agentCount, purchaseCount, totalUseCount } = await getStats();

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <Nav />

      {/* HERO */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-32">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-8">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          AIエージェントのApp Store
        </div>

        <h1 className="text-6xl font-bold tracking-tight mb-6 leading-tight">
          AIチームを<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            買って動かす
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-xl mb-10 leading-relaxed">
          Lattice OSは、AIエージェントを売り買いできるプラットフォームです。
          必要なAgentを選んでチームを組み、業務を自動化する。
        </p>

        <div className="flex gap-4">
          <Link href="/marketplace" className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-medium transition text-lg">
            Marketplaceを見る
          </Link>
          <Link href="/publish" className="border border-white/20 hover:border-white/40 px-8 py-3 rounded-xl font-medium transition text-lg">
            Agentを公開する
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="max-w-4xl mx-auto px-6 pb-20 grid grid-cols-3 gap-6">
        {[
          { label: "登録Agent数", value: agentCount },
          { label: "開発者数", value: purchaseCount },
          { label: "累計実行回数", value: totalUseCount },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-white mb-2">{stat.value.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

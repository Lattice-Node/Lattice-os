import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Nav from '@/components/Nav'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Lattice Work - AI副業を始めるなら、ここから。',
  description: '副業を始めたいなら、Lattice Work。AIが全部教えてくれる。無料で始められる。怪しい副業講座・高額商材は不要。AIプロンプト・手順・テンプレート完備。',
  keywords: ['AI副業', '副業 始め方', 'ChatGPT 副業', 'AI 稼ぐ', '副業 初心者', 'プロンプト 副業'],
}

const WORK_CATEGORIES = [
  {
    id: 'writing',
    icon: '✍️',
    title: 'AIライティング副業',
    desc: 'ブログ記事・LP・SNS投稿をAIで高速作成。クラウドワークスで案件を受注する。',
    income: '月3〜15万円',
    difficulty: '★☆☆',
    time: '今日から',
    color: '#81C784',
  },
  {
    id: 'consulting',
    icon: '💼',
    title: 'AI活用コンサル',
    desc: '中小企業にAI活用を教える。ChatGPTの使い方を教えるだけで報酬が発生する。',
    income: '月5〜30万円',
    difficulty: '★★☆',
    time: '1週間で',
    color: '#CE93D8',
  },
  {
    id: 'image',
    icon: '🎨',
    title: 'AI画像生成副業',
    desc: 'AIで画像を生成してSNS素材・アイコン・バナーとして販売する。',
    income: '月2〜10万円',
    difficulty: '★☆☆',
    time: '今日から',
    color: '#4FC3F7',
  },
  {
    id: 'translation',
    icon: '🌐',
    title: 'AI翻訳・ローカライズ',
    desc: 'AIで翻訳してから人間が校正。単純翻訳より高単価で受注できる。',
    income: '月3〜12万円',
    difficulty: '★☆☆',
    time: '今日から',
    color: '#FFD54F',
  },
  {
    id: 'prompt',
    icon: '⚡',
    title: 'プロンプト販売',
    desc: '自分が作ったプロンプトをLatticeで販売。収益の80%があなたに入る。',
    income: '月1〜50万円',
    difficulty: '★★☆',
    time: '今すぐ',
    color: '#FF8A65',
  },
  {
    id: 'data',
    icon: '📊',
    title: 'AIデータ分析',
    desc: 'ExcelデータをAIで分析してレポート作成。企業から高単価で受注できる。',
    income: '月5〜20万円',
    difficulty: '★★★',
    time: '2週間で',
    color: '#4DB6AC',
  },
]

const STEPS = [
  { num: '01', title: '稼ぎ方を選ぶ', desc: '自分に合った副業スタイルを選ぶ。全部無料で試せる。' },
  { num: '02', title: 'プロンプトを使う', desc: 'Latticeのプロンプトマーケットから必要なプロンプトを入手。' },
  { num: '03', title: 'AIに実行させる', desc: 'Latticeの比較ツールで最適なAIを選んで実行。' },
  { num: '04', title: '稼ぐ', desc: 'クラウドソーシングやSNSで案件を受注。最初の1円を稼ぐ。' },
]

export default async function WorkPage() {
  const featuredPrompts = await prisma.agent.findMany({
    where: {
      price: { gt: 0 },
      category: { in: ['Writing', 'Business', 'Research'] },
    },
    orderBy: { useCount: 'desc' },
    take: 6,
    select: { id: true, name: true, description: true, category: true, price: true, useCount: true },
  })

  return (
    <main style={{ minHeight: '100vh', background: '#080b14', color: '#e8eaf0', fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <style>{`
        .work-card { transition: border-color 0.15s, transform 0.15s; }
        .work-card:hover { border-color: #3b82f655 !important; transform: translateY(-2px); }
        .prompt-card { transition: border-color 0.15s; }
        .prompt-card:hover { border-color: #3b82f655 !important; }
      `}</style>
      <Nav />

      {/* HERO */}
      <section style={{ position: 'relative', textAlign: 'center', padding: '96px 24px 80px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, background: 'radial-gradient(ellipse, #2563eb1a 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#34d39914', border: '1px solid #34d39930', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#34d399', marginBottom: 28, fontWeight: 600, letterSpacing: '0.04em' }}>
          Lattice Work
        </div>

        <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20 }}>
          副業を始めたいなら、<br />
          <span style={{ color: '#3b82f6' }}>Lattice Work。</span>
        </h1>

        <p style={{ fontSize: 'clamp(15px, 2vw, 20px)', color: '#8b92a9', maxWidth: 540, margin: '0 auto 16px', lineHeight: 1.75 }}>
          AIが全部教えてくれる。無料で始められる。
        </p>

        <p style={{ fontSize: 14, color: '#4a5068', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.75 }}>
          高額な副業講座も怪しい情報商材も不要。<br />
          AIプロンプト・手順・テンプレート、全部ここにある。
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="#categories" style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700, display: 'inline-block' }}>
            副業を選ぶ →
          </Link>
          <Link href="/marketplace" style={{ background: 'transparent', color: '#e8eaf0', textDecoration: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700, border: '1px solid #2a2f42', display: 'inline-block' }}>
            プロンプトを見る
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 56, color: '#8b92a9', fontSize: 14, flexWrap: 'wrap' }}>
          <div><span style={{ color: '#34d399', fontWeight: 800, fontSize: 20 }}>無料</span> で始められる</div>
          <div style={{ borderLeft: '1px solid #2a2f42' }} />
          <div><span style={{ color: '#34d399', fontWeight: 800, fontSize: 20 }}>安全</span> な環境</div>
          <div style={{ borderLeft: '1px solid #2a2f42' }} />
          <div><span style={{ color: '#34d399', fontWeight: 800, fontSize: 20 }}>AI</span> が全サポート</div>
        </div>
      </section>

      {/* 3ステップ */}
      <section style={{ background: '#0d1120', borderTop: '1px solid #1c2136', borderBottom: '1px solid #1c2136', padding: '64px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 48, letterSpacing: '-0.02em' }}>4ステップで最初の収益へ</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {STEPS.map(step => (
              <div key={step.num} style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', letterSpacing: '0.1em', marginBottom: 12 }}>{step.num}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: '#8b92a9', lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 副業カテゴリ */}
      <section id="categories" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>あなたに合った副業を選ぶ</h2>
          <p style={{ color: '#8b92a9', fontSize: 14 }}>全部AIでサポート。今日から始められるものも多数。</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {WORK_CATEGORIES.map(cat => (
            <div key={cat.id} className="work-card" style={{ background: '#0d1120', border: '1px solid #1c2136', borderRadius: 14, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, background: cat.color + '18', border: `1px solid ${cat.color}30`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {cat.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{cat.title}</h3>
                  <p style={{ fontSize: 12, color: '#8b92a9', lineHeight: 1.6 }}>{cat.desc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, borderTop: '1px solid #1c2136', paddingTop: 14 }}>
                <div>
                  <span style={{ color: '#4a5068' }}>想定収益 </span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>{cat.income}</span>
                </div>
                <div>
                  <span style={{ color: '#4a5068' }}>難易度 </span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>{cat.difficulty}</span>
                </div>
                <div>
                  <span style={{ color: '#4a5068' }}>開始 </span>
                  <span style={{ color: '#e8eaf0', fontWeight: 700 }}>{cat.time}</span>
                </div>
              </div>
              <Link href="/marketplace" style={{ display: 'block', marginTop: 14, textAlign: 'center', background: '#1c2136', color: '#8b92a9', textDecoration: 'none', padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                関連プロンプトを見る →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* おすすめプロンプト */}
      {featuredPrompts.length > 0 && (
        <section style={{ background: '#0d1120', borderTop: '1px solid #1c2136', borderBottom: '1px solid #1c2136', padding: '64px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>副業に使えるプロンプト</h2>
                <p style={{ color: '#8b92a9', fontSize: 13 }}>すぐに使えるプロが作ったプロンプト</p>
              </div>
              <Link href="/marketplace" style={{ color: '#3b82f6', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                すべて見る →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {featuredPrompts.map(agent => (
                <Link key={agent.id} href={`/apps/${agent.id}`} style={{ textDecoration: 'none' }}>
                  <div className="prompt-card" style={{ background: '#080b14', border: '1px solid #1c2136', borderRadius: 12, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#e8eaf0', flex: 1, marginRight: 12 }}>{agent.name}</p>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#3b82f6', flexShrink: 0 }}>¥{agent.price}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{agent.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#34d39914', border: '1px solid #34d39930', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#34d399', marginBottom: 20, fontWeight: 600 }}>
          完全無料でスタート
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12 }}>
          副業の第一歩を、今日踏み出す。
        </h2>
        <p style={{ color: '#8b92a9', fontSize: 14, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
          高額講座も情報商材も不要。<br />AIと一緒に、今すぐ始めよう。
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/marketplace" style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700, display: 'inline-block' }}>
            プロンプトを探す →
          </Link>
          <Link href="/compare" style={{ background: 'transparent', color: '#e8eaf0', textDecoration: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700, border: '1px solid #2a2f42', display: 'inline-block' }}>
            AI比較ツールを使う
          </Link>
        </div>
      </section>
    </main>
  )
}
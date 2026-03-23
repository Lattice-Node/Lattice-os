import { prisma } from '@/lib/prisma'
import Nav from '@/components/Nav'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'AIニュース | Lattice - 最新AI情報まとめ',
  description: 'OpenAI・Anthropic・Google・TechCrunchなど主要メディアのAI最新ニュースをまとめて確認できます。',
}

const SOURCE_COLORS: Record<string, string> = {
  'OpenAI': '#10a37f',
  'Anthropic': '#d97706',
  'Google AI Blog': '#4285f4',
  'TechCrunch AI': '#ff6b35',
}

export default async function NewsPage() {
  const articles = await prisma.newsArticle.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 50,
  })

  return (
    <main style={{ minHeight: '100vh', background: '#080b14', color: '#e8eaf0', fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <style>{`.news-card { transition: border-color 0.15s; } .news-card:hover { border-color: #3b82f655 !important; }`}</style>
      <Nav />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#3b82f614', border: '1px solid #3b82f630', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#60a5fa', marginBottom: 16, fontWeight: 600, letterSpacing: '0.04em' }}>
            AI NEWS
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>AIニュース</h1>
          <p style={{ color: '#8b92a9', fontSize: 14 }}>OpenAI・Anthropic・Google・TechCrunchなど主要メディアの最新情報</p>
        </div>

        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#4a5068' }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>ニュースを取得中です</p>
            <p style={{ fontSize: 13 }}>しばらくしてから再度アクセスしてください</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {articles.map(article => {
              const color = SOURCE_COLORS[article.source] ?? '#8b92a9'
              return (
                <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <div className="news-card" style={{ background: '#0d1120', border: '1px solid #1c2136', borderRadius: 12, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: color + '18', color: color, border: `1px solid ${color}30` }}>
                        {article.source}
                      </span>
                      <span style={{ fontSize: 11, color: '#4a5068' }}>
                        {new Date(article.publishedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#e8eaf0', marginBottom: 6, lineHeight: 1.5 }}>{article.title}</p>
                    {article.description && (
                      <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{article.description}</p>
                    )}
                  </div>
                </a>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: 48, padding: '24px', background: '#0d1120', border: '1px solid #1c2136', borderRadius: 12, textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>AIツールをもっと活用したい？</p>
          <p style={{ fontSize: 13, color: '#8b92a9', marginBottom: 16 }}>プロンプトマーケットでAIの精度を上げよう</p>
          <Link href="/marketplace" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
            プロンプトを見る
          </Link>
        </div>
      </div>
    </main>
  )
}
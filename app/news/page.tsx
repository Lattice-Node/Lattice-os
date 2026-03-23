import { prisma } from '@/lib/prisma'
import Nav from '@/components/Nav'
import Link from 'next/link'
import type { Metadata } from 'next'
import NewsClient from './NewsClient'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'AIニュース | Lattice - 最新AI情報まとめ',
  description: 'OpenAI・Anthropic・Google・ITmediaなど国内外の主要メディアのAI最新ニュースをまとめて確認できます。',
}

export default async function NewsPage() {
  const [jaArticles, enArticles] = await Promise.all([
    prisma.newsArticle.findMany({
      where: { lang: 'ja' },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    }),
    prisma.newsArticle.findMany({
      where: { lang: 'en' },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    }),
  ])

  return (
    <main style={{ minHeight: '100vh', background: '#080b14', color: '#e8eaf0', fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#3b82f614', border: '1px solid #3b82f630', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#60a5fa', marginBottom: 16, fontWeight: 600, letterSpacing: '0.04em' }}>
            AI NEWS
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>AIニュース</h1>
          <p style={{ color: '#8b92a9', fontSize: 14 }}>国内外の主要メディアからAI最新情報をまとめて配信</p>
        </div>
        <NewsClient jaArticles={jaArticles} enArticles={enArticles} />
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
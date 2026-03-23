'use client'
import { useState } from 'react'

type Article = {
  id: string
  title: string
  url: string
  source: string
  description: string
  publishedAt: Date
}

const SOURCE_COLORS: Record<string, string> = {
  'OpenAI': '#10a37f',
  'Anthropic': '#d97706',
  'Google AI Blog': '#4285f4',
  'TechCrunch AI': '#ff6b35',
  'ITmedia AI': '#e60012',
  'Gigazine': '#ff6600',
  'ASCII.jp': '#0066cc',
}

export default function NewsClient({
  jaArticles,
  enArticles,
}: {
  jaArticles: Article[]
  enArticles: Article[]
}) {
  const [lang, setLang] = useState<'ja' | 'en'>('ja')
  const articles = lang === 'ja' ? jaArticles : enArticles

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setLang('ja')}
          style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            background: lang === 'ja' ? '#2563eb' : '#0d1120',
            color: lang === 'ja' ? '#fff' : '#8b92a9',
          }}
        >
          日本語
        </button>
        <button
          onClick={() => setLang('en')}
          style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            background: lang === 'en' ? '#2563eb' : '#0d1120',
            color: lang === 'en' ? '#fff' : '#8b92a9',
          }}
        >
          English
        </button>
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
                <div style={{ background: '#0d1120', border: '1px solid #1c2136', borderRadius: 12, padding: '20px 24px', transition: 'border-color 0.15s' }}>
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
    </div>
  )
}
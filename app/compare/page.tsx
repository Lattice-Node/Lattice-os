'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'

const EXAMPLES = [
  '日本のGDPを3行で説明して',
  'Pythonでフィボナッチ数列を書いて',
  '最強のビジネスアイデアを1つ教えて',
  '宇宙の始まりを子供に説明して',
  '2026年のAIトレンドを予測して',
]

type Results = {
  gpt: string
  gemini: string
  grok: string
}

const MODELS = [
  { key: 'gpt', label: 'ChatGPT', sub: 'GPT-4o', color: '#10a37f', icon: '🤖' },
  { key: 'gemini', label: 'Gemini', sub: '1.5 Pro', color: '#4285f4', icon: '✨' },
  { key: 'grok', label: 'Grok', sub: 'grok-2', color: '#e7e9ea', icon: '𝕏' },
] as const

export default function ComparePage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Results | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function handleCompare() {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setResults(null)
    setElapsed(null)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'エラーが発生しました'); return }
      setResults(data.results)
      setElapsed(data.elapsed)
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  function handleShare() {
    const text = `「${prompt}」をAI3社で比較してみた👇\nChatGPT vs Gemini vs Grok\n\nLatticeで無料比較 →\nhttps://lattice-os.vercel.app/compare\n\n#Lattice #AI比較 #ChatGPT #Gemini #Grok`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <main style={{ minHeight: '100vh', background: '#080b14', color: '#e8eaf0', fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#a78bfa14', border: '1px solid #a78bfa30', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#a78bfa', marginBottom: 20, fontWeight: 600, letterSpacing: '0.04em' }}>
            ⚡ AI比較ツール
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 12 }}>
            ChatGPT vs Gemini vs Grok
          </h1>
          <p style={{ color: '#8b92a9', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
            同じ質問を3つのAIに同時に投げて、回答を比較する。無料・登録不要。
          </p>
        </div>

        {/* 入力 */}
        <div style={{ maxWidth: 720, margin: '0 auto 48px' }}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleCompare() }}
            placeholder="質問を入力してください（例：最強のビジネスアイデアを教えて）"
            rows={3}
            style={{ width: '100%', background: '#0d1120', border: '1px solid #1c2136', borderRadius: 12, padding: '16px 18px', color: '#e8eaf0', fontSize: 15, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
          />

          {/* 例文 */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, marginBottom: 16 }}>
            {EXAMPLES.map(ex => (
              <button key={ex} onClick={() => setPrompt(ex)}
                style={{ fontSize: 12, padding: '5px 12px', borderRadius: 99, border: '1px solid #1c2136', background: 'transparent', color: '#8b92a9', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {ex}
              </button>
            ))}
          </div>

          <button onClick={handleCompare} disabled={loading || !prompt.trim()}
            style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: loading ? '#1c2136' : '#7c3aed', color: loading ? '#4a5068' : '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ 3つのAIに聞いています...' : '⚡ 3つのAIに同時に聞く'}
          </button>

          {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>

        {/* 結果 */}
        {results && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, maxWidth: 720, margin: '0 auto 24px' }}>
              <p style={{ color: '#8b92a9', fontSize: 13 }}>
                ⏱ {elapsed ? `${(elapsed / 1000).toFixed(1)}秒で取得` : ''}
              </p>
              <button onClick={handleShare}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #1c2136', background: 'transparent', color: '#e8eaf0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                𝕏 結果をシェア
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
              {MODELS.map(model => (
                <div key={model.key} style={{ background: '#0d1120', border: `1px solid ${model.color}30`, borderRadius: 14, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: model.color + '18', border: `1px solid ${model.color}40`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {model.icon}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: '#e8eaf0', margin: 0 }}>{model.label}</p>
                      <p style={{ fontSize: 11, color: '#4a5068', margin: 0 }}>{model.sub}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4a5068' }}>
                      {results[model.key].length}文字
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: '#c8cad4', lineHeight: 1.8, whiteSpace: 'pre-wrap', borderTop: '1px solid #1c2136', paddingTop: 16 }}>
                    {results[model.key]}
                  </div>
                </div>
              ))}
            </div>

            {/* プロンプトマーケットへの誘導 */}
            <div style={{ maxWidth: 720, margin: '48px auto 0', background: '#0d1120', border: '1px solid #2563eb30', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>💡 AIをもっと使いこなしたい？</p>
              <p style={{ fontSize: 13, color: '#8b92a9', marginBottom: 16 }}>プロが作った高品質なプロンプトをLatticeで入手しよう</p>
              <a href="/marketplace" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                プロンプトマーケットを見る →
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
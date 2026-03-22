'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'

const EXAMPLES = [
  '日本のGDPを3行で説明して',
  'Pythonでフィボナッチ数列を書いて',
  '最強のビジネスアイデアを1つ教えて',
  '宇宙の始まりを子供に説明して',
  '2026年のAIトレンドを予測して',
]

type Results = { gpt: string; gemini: string; claude: string }
type Agent = { id: string; name: string; description: string; category: string; price: number }

const MODELS: { key: keyof Results; label: string; sub: string; color: string; icon: string }[] = [
  { key: 'gpt', label: 'ChatGPT', sub: 'GPT-4o mini', color: '#10a37f', icon: '🤖' },
  { key: 'gemini', label: 'Gemini', sub: '2.5 Flash', color: '#4285f4', icon: '✨' },
  { key: 'claude', label: 'Claude', sub: 'Haiku', color: '#d97706', icon: '🔶' },
]

const CATEGORY_COLORS: Record<string, string> = {
  Research: '#4FC3F7', Writing: '#81C784', Code: '#FF8A65',
  Business: '#CE93D8', Medical: '#F06292', Legal: '#FFD54F',
  Finance: '#4DB6AC', Custom: '#FF8A65', default: '#90A4AE',
}

export default function ComparePage() {
  const [userInput, setUserInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Results | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [agents, setAgents] = useState<Agent[]>([])
  const [showPrompts, setShowPrompts] = useState(false)
  const [boosted, setBoosted] = useState(false)

  useEffect(() => {
    fetch('/api/compare/prompts')
      .then(r => r.json())
      .then(d => setAgents(d.agents ?? []))
      .catch(() => {})
  }, [])

  async function handleCompare() {
    if (!userInput.trim()) return
    setLoading(true)
    setError('')
    setResults(null)
    setElapsed(null)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userInput,
          agentId: selectedAgent?.id ?? null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'エラーが発生しました'); return }
      if (!data.results) { setError('結果が取得できませんでした'); return }
      setResults(data.results)
      setElapsed(data.elapsed)
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  function handleShare() {
    const text = `「${userInput}」をAI3社で比較してみた👇\nChatGPT vs Gemini vs Claude\n\nLatticeで無料比較 →\nhttps://www.lattice-protocol.com/compare\n\n#Lattice #AI比較 #ChatGPT #Gemini #Claude`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  function applyAgent(agent: Agent) {
    setSelectedAgent(agent)
    setShowPrompts(false)
    setBoosted(true)
    setTimeout(() => setBoosted(false), 2000)
  }

  function clearAgent() {
    setSelectedAgent(null)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#080b14', color: '#e8eaf0', fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <style>{`
        @keyframes boostIn {
          0% { transform: scale(0.95); opacity: 0; }
          60% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .prompt-row:hover { background: #111827 !important; }
      `}</style>
      <Nav />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#a78bfa14', border: '1px solid #a78bfa30', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#a78bfa', marginBottom: 20, fontWeight: 600, letterSpacing: '0.04em' }}>
            ⚡ AI比較ツール
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 12 }}>
            ChatGPT vs Gemini vs Claude
          </h1>
          <p style={{ color: '#8b92a9', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
            同じ質問を3つのAIに同時に投げて、回答を比較する。無料・登録不要。
          </p>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto 48px' }}>

          {/* ヒントテキスト */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '10px 14px', background: '#0d1120', border: '1px solid #1c2136', borderRadius: 8 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span style={{ fontSize: 13, color: '#8b92a9' }}>
              プロンプトを使用することで、よりAIの精度を高めることができます
            </span>
          </div>

          {/* プロンプト適用ボタン */}
          <div style={{ marginBottom: 12 }}>
            <button
              onClick={() => setShowPrompts(p => !p)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: selectedAgent ? '1px solid #a78bfa60' : '1px solid #a78bfa30',
                background: selectedAgent ? '#1a1040' : '#a78bfa08',
                color: '#a78bfa', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 18 }}>📦</span>
              <span style={{ flex: 1, textAlign: 'left' }}>
                {selectedAgent ? `「${selectedAgent.name}」を適用中` : 'プロンプトマーケットから適用'}
              </span>
              {selectedAgent && (
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99,
                  background: '#7c3aed', color: '#fff', letterSpacing: '0.05em',
                  animation: boosted ? 'pulse 0.5s ease 3' : 'none',
                }}>BOOST</span>
              )}
              <span style={{ fontSize: 12, color: '#6b7280' }}>{showPrompts ? '▲' : '▼'}</span>
            </button>

            {showPrompts && (
              <div style={{ background: '#0d1120', border: '1px solid #1c2136', borderRadius: 12, marginTop: 8, maxHeight: 320, overflowY: 'auto' }}>
                {agents.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#4a5068', fontSize: 13 }}>
                    プロンプトが見つかりません
                    <a href="/marketplace" style={{ color: '#a78bfa', marginLeft: 8, textDecoration: 'none' }}>マーケットへ →</a>
                  </div>
                ) : (
                  agents.map(agent => {
                    const color = CATEGORY_COLORS[agent.category] ?? CATEGORY_COLORS.default
                    const isSelected = selectedAgent?.id === agent.id
                    return (
                      <div key={agent.id}
                        className="prompt-row"
                        onClick={() => applyAgent(agent)}
                        style={{
                          padding: '14px 18px', borderBottom: '1px solid #1c2136',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                          background: isSelected ? '#1a1040' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#c4b5fd' : '#e8eaf0', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</p>
                          <p style={{ fontSize: 11, color: '#4a5068', margin: 0 }}>{agent.category} · {agent.price === 0 ? '無料' : `¥${agent.price}`}</p>
                          <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.description}</p>
                        </div>
                        <span style={{ fontSize: 12, color: isSelected ? '#a78bfa' : '#4a5068', flexShrink: 0, fontWeight: isSelected ? 700 : 400 }}>
                          {isSelected ? '✓ 適用中' : '適用 →'}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* 適用中バナー */}
          {selectedAgent && (
            <div style={{
              marginBottom: 12, padding: '12px 16px',
              background: 'linear-gradient(135deg, #1a1040 0%, #0f1a30 100%)',
              border: '1px solid #7c3aed50',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              animation: boosted ? 'boostIn 0.4s ease' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#7c3aed20', border: '1px solid #7c3aed40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  ⚡
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>AI BOOST 有効</p>
                  <p style={{ fontSize: 13, color: '#e8eaf0', margin: 0 }}>{selectedAgent.name}</p>
                </div>
              </div>
              <button onClick={clearAgent} style={{ background: 'none', border: '1px solid #2a2040', borderRadius: 6, color: '#6b7280', cursor: 'pointer', fontSize: 12, padding: '4px 10px' }}>解除</button>
            </div>
          )}

          <textarea
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder={selectedAgent ? `「${selectedAgent.name}」のプロンプトで強化して比較します。質問を入力してください。` : '質問を入力してください（例：最強のビジネスアイデアを教えて）'}
            rows={4}
            style={{
              width: '100%',
              background: selectedAgent ? '#0d1120' : '#0d1120',
              border: selectedAgent ? '1px solid #7c3aed40' : '1px solid #1c2136',
              borderRadius: 12, padding: '16px 18px', color: '#e8eaf0',
              fontSize: 15, outline: 'none', resize: 'none',
              boxSizing: 'border-box', lineHeight: 1.6,
              transition: 'border-color 0.2s',
            }}
          />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10, marginBottom: 16 }}>
            {EXAMPLES.map(ex => (
              <button key={ex} onClick={() => setUserInput(ex)}
                style={{ fontSize: 12, padding: '5px 12px', borderRadius: 99, border: '1px solid #1c2136', background: 'transparent', color: '#8b92a9', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {ex}
              </button>
            ))}
          </div>

          <button onClick={handleCompare} disabled={loading || !userInput.trim()}
            style={{
              width: '100%', padding: '14px', borderRadius: 10, border: 'none',
              background: loading ? '#1c2136' : selectedAgent ? '#7c3aed' : '#7c3aed',
              color: loading ? '#4a5068' : '#fff', fontSize: 16, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
            {loading ? '⏳ 3つのAIに聞いています...' : selectedAgent ? `⚡ 「${selectedAgent.name}」で強化して比較する` : '⚡ 3つのAIに同時に聞く'}
          </button>
          {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>

        {results && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 720, margin: '0 auto 24px' }}>
              <p style={{ color: '#8b92a9', fontSize: 13 }}>
                ⏱ {elapsed ? `${(elapsed / 1000).toFixed(1)}秒で取得` : ''}
                {selectedAgent && <span style={{ color: '#a78bfa', marginLeft: 8 }}>· ⚡ {selectedAgent.name} 適用</span>}
              </p>
              <button onClick={handleShare}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #1c2136', background: 'transparent', color: '#e8eaf0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                𝕏 結果をシェア
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
              {MODELS.map(model => {
                const text = results[model.key] ?? ''
                return (
                  <div key={model.key} style={{ background: '#0d1120', border: `1px solid ${model.color}30`, borderRadius: 14, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, background: model.color + '18', border: `1px solid ${model.color}40`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {model.icon}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 15, color: '#e8eaf0', margin: 0 }}>{model.label}</p>
                        <p style={{ fontSize: 11, color: '#4a5068', margin: 0 }}>{model.sub}</p>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4a5068' }}>{text.length}文字</div>
                    </div>
                    <div style={{ fontSize: 14, color: '#c8cad4', lineHeight: 1.8, whiteSpace: 'pre-wrap', borderTop: '1px solid #1c2136', paddingTop: 16 }}>
                      {text}
                    </div>
                  </div>
                )
              })}
            </div>

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
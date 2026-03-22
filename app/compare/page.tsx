'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'

const EXAMPLES = [
  '譌･譛ｬ縺ｮGDP繧・陦後〒隱ｬ譏弱＠縺ｦ',
  'Python縺ｧ繝輔ぅ繝懊リ繝・メ謨ｰ蛻励ｒ譖ｸ縺・※',
  '譛蠑ｷ縺ｮ繝薙ず繝阪せ繧｢繧､繝・い繧・縺､謨吶∴縺ｦ',
  '螳・ｮ吶・蟋九∪繧翫ｒ蟄蝉ｾ帙↓隱ｬ譏弱＠縺ｦ',
  '2026蟷ｴ縺ｮAI繝医Ξ繝ｳ繝峨ｒ莠域ｸｬ縺励※',
]

type Results = { gpt: string; gemini: string; claude: string }
type Agent = { id: string; name: string; description: string; category: string; price: number }

const MODELS: { key: keyof Results; label: string; sub: string; color: string; icon: string }[] = [
  { key: 'gpt', label: 'ChatGPT', sub: 'GPT-4o mini', color: '#10a37f', icon: '､・ },
  { key: 'gemini', label: 'Gemini', sub: '2.5 Flash', color: '#4285f4', icon: '笨ｨ' },
  { key: 'claude', label: 'Claude', sub: 'Haiku', color: '#d97706', icon: '噺' },
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
      if (!res.ok) { setError(data.error ?? '繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆'); return }
      if (!data.results) { setError('邨先棡縺悟叙蠕励〒縺阪∪縺帙ｓ縺ｧ縺励◆'); return }
      setResults(data.results)
      setElapsed(data.elapsed)
    } catch {
      setError('騾壻ｿ｡繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆')
    } finally {
      setLoading(false)
    }
  }

  function handleShare() {
    const text = `縲・{userInput}縲阪ｒAI3遉ｾ縺ｧ豈碑ｼ・＠縺ｦ縺ｿ縺溟汨ⅨnChatGPT vs Gemini vs Claude\n\nLattice縺ｧ辟｡譁呎ｯ碑ｼ・竊箪nhttps://www.lattice-protocol.com/compare\n\n#Lattice #AI豈碑ｼ・#ChatGPT #Gemini #Claude`
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
            笞｡ AI豈碑ｼ・ヤ繝ｼ繝ｫ
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 12 }}>
            ChatGPT vs Gemini vs Claude
          </h1>
          <p style={{ color: '#8b92a9', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
            蜷後§雉ｪ蝠上ｒ3縺､縺ｮAI縺ｫ蜷梧凾縺ｫ謚輔￡縺ｦ縲∝屓遲斐ｒ豈碑ｼ・☆繧九ら┌譁吶・逋ｻ骭ｲ荳崎ｦ√・          </p>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto 48px' }}>

          {/* 繝偵Φ繝医ユ繧ｭ繧ｹ繝・*/}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '10px 14px', background: '#0d1120', border: '1px solid #1c2136', borderRadius: 8 }}>
            <span style={{ fontSize: 16 }}>庁</span>
            <span style={{ fontSize: 13, color: '#8b92a9' }}>
              繝励Ο繝ｳ繝励ヨ繧剃ｽｿ逕ｨ縺吶ｋ縺薙→縺ｧ縲√ｈ繧晦I縺ｮ邊ｾ蠎ｦ繧帝ｫ倥ａ繧九％縺ｨ縺後〒縺阪∪縺・            </span>
          </div>

          {/* 繝励Ο繝ｳ繝励ヨ驕ｩ逕ｨ繝懊ち繝ｳ */}
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
              <span style={{ fontSize: 18 }}>逃</span>
              <span style={{ flex: 1, textAlign: 'left' }}>
                {selectedAgent ? `縲・{selectedAgent.name}縲阪ｒ驕ｩ逕ｨ荳ｭ` : '繝励Ο繝ｳ繝励ヨ繝槭・繧ｱ繝・ヨ縺九ｉ驕ｩ逕ｨ'}
              </span>
              {selectedAgent && (
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99,
                  background: '#7c3aed', color: '#fff', letterSpacing: '0.05em',
                  animation: boosted ? 'pulse 0.5s ease 3' : 'none',
                }}>BOOST</span>
              )}
              <span style={{ fontSize: 12, color: '#6b7280' }}>{showPrompts ? '笆ｲ' : '笆ｼ'}</span>
            </button>

            {showPrompts && (
              <div style={{ background: '#0d1120', border: '1px solid #1c2136', borderRadius: 12, marginTop: 8, maxHeight: 320, overflowY: 'auto' }}>
                {agents.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#4a5068', fontSize: 13 }}>
                    繝励Ο繝ｳ繝励ヨ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ
                    <a href="/marketplace" style={{ color: '#a78bfa', marginLeft: 8, textDecoration: 'none' }}>繝槭・繧ｱ繝・ヨ縺ｸ 竊・/a>
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
                          <p style={{ fontSize: 11, color: '#4a5068', margin: 0 }}>{agent.category} ﾂｷ {agent.price === 0 ? '辟｡譁・ : `ﾂ･${agent.price}`}</p>
                          <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.description}</p>
                        </div>
                        <span style={{ fontSize: 12, color: isSelected ? '#a78bfa' : '#4a5068', flexShrink: 0, fontWeight: isSelected ? 700 : 400 }}>
                          {isSelected ? '笨・驕ｩ逕ｨ荳ｭ' : '驕ｩ逕ｨ 竊・}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* 驕ｩ逕ｨ荳ｭ繝舌リ繝ｼ */}
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
                  笞｡
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>AI BOOST 譛牙柑</p>
                  <p style={{ fontSize: 13, color: '#e8eaf0', margin: 0 }}>{selectedAgent.name}</p>
                </div>
              </div>
              <button onClick={clearAgent} style={{ background: 'none', border: '1px solid #2a2040', borderRadius: 6, color: '#6b7280', cursor: 'pointer', fontSize: 12, padding: '4px 10px' }}>隗｣髯､</button>
            </div>
          )}

          <textarea
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder={selectedAgent ? `縲・{selectedAgent.name}縲阪・繝励Ο繝ｳ繝励ヨ縺ｧ蠑ｷ蛹悶＠縺ｦ豈碑ｼ・＠縺ｾ縺吶りｳｪ蝠上ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞縲Ａ : '雉ｪ蝠上ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞・井ｾ具ｼ壽怙蠑ｷ縺ｮ繝薙ず繝阪せ繧｢繧､繝・い繧呈蕗縺医※・・}
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
            {loading ? '竢ｳ 3縺､縺ｮAI縺ｫ閨槭＞縺ｦ縺・∪縺・..' : selectedAgent ? `笞｡ 縲・{selectedAgent.name}縲阪〒蠑ｷ蛹悶＠縺ｦ豈碑ｼ・☆繧義 : '笞｡ 3縺､縺ｮAI縺ｫ蜷梧凾縺ｫ閨槭￥'}
          </button>
          {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>

        {results && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 720, margin: '0 auto 24px' }}>
              <p style={{ color: '#8b92a9', fontSize: 13 }}>
                竢ｱ {elapsed ? `${(elapsed / 1000).toFixed(1)}遘偵〒蜿門ｾ輿 : ''}
                {selectedAgent && <span style={{ color: '#a78bfa', marginLeft: 8 }}>ﾂｷ 笞｡ {selectedAgent.name} 驕ｩ逕ｨ</span>}
              </p>
              <button onClick={handleShare}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #1c2136', background: 'transparent', color: '#e8eaf0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                撫 邨先棡繧偵す繧ｧ繧｢
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
                      <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4a5068' }}>{text.length}譁・ｭ・/div>
                    </div>
                    <div style={{ fontSize: 14, color: '#c8cad4', lineHeight: 1.8, whiteSpace: 'pre-wrap', borderTop: '1px solid #1c2136', paddingTop: 16 }}>
                      {text}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ maxWidth: 720, margin: '48px auto 0', background: '#0d1120', border: '1px solid #2563eb30', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>庁 AI繧偵ｂ縺｣縺ｨ菴ｿ縺・％縺ｪ縺励◆縺・ｼ・/p>
              <p style={{ fontSize: 13, color: '#8b92a9', marginBottom: 16 }}>繝励Ο縺御ｽ懊▲縺滄ｫ伜刀雉ｪ縺ｪ繝励Ο繝ｳ繝励ヨ繧鱈attice縺ｧ蜈･謇九＠繧医≧</p>
              <a href="/marketplace" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                繝励Ο繝ｳ繝励ヨ繝槭・繧ｱ繝・ヨ繧定ｦ九ｋ 竊・              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
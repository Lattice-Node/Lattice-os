import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#080b14',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景グロー */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* ロゴ */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(37,99,235,0.2)',
            border: '1px solid rgba(37,99,235,0.4)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}>◆</div>
          <span style={{
            fontSize: '32px',
            fontWeight: '900',
            color: '#e8eaf0',
            letterSpacing: '-0.02em',
          }}>Lattice</span>
        </div>

        {/* メインコピー */}
        <div style={{
          fontSize: '64px',
          fontWeight: '900',
          color: '#e8eaf0',
          letterSpacing: '-0.04em',
          lineHeight: '1.1',
          textAlign: 'center',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <span>AIを使うなら、</span>
          <span style={{ color: '#3b82f6' }}>全部ここで。</span>
        </div>

        {/* サブコピー */}
        <div style={{
          fontSize: '22px',
          color: '#8b92a9',
          marginBottom: '48px',
          textAlign: 'center',
        }}>
          比較・プロンプト・ツール・情報 — 日本のAI情報基地
        </div>

        {/* 3社バッジ */}
        <div style={{
          display: 'flex',
          gap: '16px',
        }}>
          {[
            { label: 'ChatGPT', color: '#10a37f', icon: '🤖' },
            { label: 'Gemini', color: '#4285f4', icon: '✨' },
            { label: 'Claude', color: '#d97706', icon: '🔶' },
          ].map((m) => (
            <div key={m.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: `rgba(${m.color === '#10a37f' ? '16,163,127' : m.color === '#4285f4' ? '66,133,244' : '217,119,6'},0.1)`,
              border: `1px solid ${m.color}40`,
              borderRadius: '99px',
              padding: '10px 20px',
              fontSize: '18px',
              color: '#e8eaf0',
              fontWeight: '600',
            }}>
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          right: '48px',
          fontSize: '16px',
          color: '#4a5068',
        }}>
          lattice-protocol.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
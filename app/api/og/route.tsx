import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
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
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '300px',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.2) 0%, transparent 70%)',
          display: 'flex',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'rgba(37,99,235,0.2)',
            border: '1px solid rgba(37,99,235,0.5)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', color: '#3b82f6',
          }}>◆</div>
          <span style={{ fontSize: '36px', fontWeight: '900', color: '#e8eaf0', letterSpacing: '-0.02em' }}>Lattice</span>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          fontSize: '68px', fontWeight: '900', color: '#e8eaf0',
          letterSpacing: '-0.04em', lineHeight: '1.1', textAlign: 'center', marginBottom: '20px',
        }}>
          <span>AIを使うなら、</span>
          <span style={{ color: '#3b82f6' }}>全部ここで。</span>
        </div>

        <div style={{ fontSize: '22px', color: '#8b92a9', marginBottom: '48px', textAlign: 'center', display: 'flex' }}>
          比較・プロンプト・ツール・情報 — 日本のAI情報基地
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,163,127,0.1)', border: '1px solid rgba(16,163,127,0.3)', borderRadius: '99px', padding: '10px 20px', fontSize: '18px', color: '#e8eaf0', fontWeight: '600' }}>
            🤖 ChatGPT
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.3)', borderRadius: '99px', padding: '10px 20px', fontSize: '18px', color: '#e8eaf0', fontWeight: '600' }}>
            ✨ Gemini
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: '99px', padding: '10px 20px', fontSize: '18px', color: '#e8eaf0', fontWeight: '600' }}>
            🔶 Claude
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '32px', right: '48px', fontSize: '16px', color: '#4a5068', display: 'flex' }}>
          lattice-protocol.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
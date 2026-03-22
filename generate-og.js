const { createCanvas } = require('canvas')
const fs = require('fs')

const canvas = createCanvas(1200, 630)
const ctx = canvas.getContext('2d')

// 背景
ctx.fillStyle = '#080b14'
ctx.fillRect(0, 0, 1200, 630)

// グロー
const gradient = ctx.createRadialGradient(600, 200, 0, 600, 200, 400)
gradient.addColorStop(0, 'rgba(37,99,235,0.15)')
gradient.addColorStop(1, 'transparent')
ctx.fillStyle = gradient
ctx.fillRect(0, 0, 1200, 630)

// Latticeロゴテキスト
ctx.fillStyle = '#3b82f6'
ctx.font = 'bold 36px sans-serif'
ctx.textAlign = 'center'
ctx.fillText('◆ Lattice', 600, 180)

// メインコピー
ctx.fillStyle = '#e8eaf0'
ctx.font = 'bold 72px sans-serif'
ctx.fillText('AIを使うなら、', 600, 290)
ctx.fillStyle = '#3b82f6'
ctx.fillText('全部ここで。', 600, 375)

// サブコピー
ctx.fillStyle = '#8b92a9'
ctx.font = '24px sans-serif'
ctx.fillText('比較・プロンプト・ツール・情報 — 日本のAI情報基地', 600, 440)

// バッジ背景
const badges = [
  { label: '🤖 ChatGPT', x: 320, color: 'rgba(16,163,127,0.2)', border: '#10a37f' },
  { label: '✨ Gemini', x: 600, color: 'rgba(66,133,244,0.2)', border: '#4285f4' },
  { label: '🔶 Claude', x: 880, color: 'rgba(217,119,6,0.2)', border: '#d97706' },
]
badges.forEach(b => {
  ctx.fillStyle = b.color
  ctx.strokeStyle = b.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(b.x - 100, 490, 200, 50, 25)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#e8eaf0'
  ctx.font = 'bold 20px sans-serif'
  ctx.fillText(b.label, b.x, 522)
})

// URL
ctx.fillStyle = '#4a5068'
ctx.font = '16px sans-serif'
ctx.textAlign = 'right'
ctx.fillText('lattice-protocol.com', 1160, 600)

// 保存
const buffer = canvas.toBuffer('image/png')
fs.writeFileSync('./public/og.png', buffer)
console.log('og.png generated!')
const sharp = require('sharp')
const fs = require('fs')

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1d3a7a" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#080b14" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2563eb" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#080b14" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="#080b14"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <ellipse cx="600" cy="250" rx="600" ry="300" fill="url(#glow2)"/>

  <!-- grid dots -->
  <g fill="#1a2035" opacity="0.8">
    <circle cx="80" cy="80" r="2"/><circle cx="240" cy="80" r="2"/><circle cx="400" cy="80" r="2"/><circle cx="560" cy="80" r="2"/><circle cx="720" cy="80" r="2"/><circle cx="880" cy="80" r="2"/><circle cx="1040" cy="80" r="2"/><circle cx="1120" cy="80" r="2"/>
    <circle cx="80" cy="200" r="2"/><circle cx="240" cy="200" r="2"/><circle cx="400" cy="200" r="2"/><circle cx="560" cy="200" r="2"/><circle cx="720" cy="200" r="2"/><circle cx="880" cy="200" r="2"/><circle cx="1040" cy="200" r="2"/><circle cx="1120" cy="200" r="2"/>
    <circle cx="80" cy="400" r="2"/><circle cx="240" cy="400" r="2"/><circle cx="400" cy="400" r="2"/><circle cx="560" cy="400" r="2"/><circle cx="720" cy="400" r="2"/><circle cx="880" cy="400" r="2"/><circle cx="1040" cy="400" r="2"/><circle cx="1120" cy="400" r="2"/>
    <circle cx="80" cy="540" r="2"/><circle cx="240" cy="540" r="2"/><circle cx="400" cy="540" r="2"/><circle cx="560" cy="540" r="2"/><circle cx="720" cy="540" r="2"/><circle cx="880" cy="540" r="2"/><circle cx="1040" cy="540" r="2"/><circle cx="1120" cy="540" r="2"/>
  </g>

  <!-- 左右の装飾ライン -->
  <line x1="60" y1="60" x2="60" y2="570" stroke="#1c2a4a" stroke-width="1"/>
  <line x1="1140" y1="60" x2="1140" y2="570" stroke="#1c2a4a" stroke-width="1"/>
  <line x1="60" y1="60" x2="260" y2="60" stroke="#1c2a4a" stroke-width="1"/>
  <line x1="940" y1="60" x2="1140" y2="60" stroke="#1c2a4a" stroke-width="1"/>
  <line x1="60" y1="570" x2="260" y2="570" stroke="#1c2a4a" stroke-width="1"/>
  <line x1="940" y1="570" x2="1140" y2="570" stroke="#1c2a4a" stroke-width="1"/>

  <!-- コーナードット -->
  <circle cx="60" cy="60" r="4" fill="#2563eb" opacity="0.8"/>
  <circle cx="1140" cy="60" r="4" fill="#2563eb" opacity="0.8"/>
  <circle cx="60" cy="570" r="4" fill="#2563eb" opacity="0.8"/>
  <circle cx="1140" cy="570" r="4" fill="#2563eb" opacity="0.8"/>

  <!-- ロゴエリア -->
  <rect x="546" y="100" width="44" height="44" rx="10" fill="#1a2d5a" stroke="#3b82f6" stroke-width="1.5" stroke-opacity="0.6"/>
  <text x="568" y="128" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="22" font-weight="900" fill="#3b82f6">◆</text>
  <text x="602" y="132" font-family="Arial Black, sans-serif" font-size="28" font-weight="900" fill="#e8eaf0" letter-spacing="-0.5">Lattice</text>

  <!-- AI OS バッジ -->
  <rect x="502" y="158" width="196" height="26" rx="13" fill="#0f1a30" stroke="#2563eb" stroke-width="1" stroke-opacity="0.4"/>
  <text x="600" y="176" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#60a5fa" letter-spacing="2">AI  INFORMATION  BASE</text>

  <!-- メインコピー -->
  <text x="600" y="278" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="86" font-weight="900" fill="#e8eaf0" letter-spacing="-3">AIを使うなら、</text>
  <text x="600" y="375" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="86" font-weight="900" fill="#3b82f6" letter-spacing="-3">全部ここで。</text>

  <!-- サブコピー -->
  <text x="600" y="425" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#6b7280" letter-spacing="0.5">比較・プロンプト・ツール・情報</text>

  <!-- 区切り線 -->
  <line x1="160" y1="452" x2="1040" y2="452" stroke="#1c2a4a" stroke-width="1"/>

  <!-- 3社バッジ -->
  <rect x="160" y="467" width="240" height="56" rx="28" fill="#0d1e12" stroke="#10a37f" stroke-width="1" stroke-opacity="0.5"/>
  <circle cx="198" cy="495" r="12" fill="#10a37f" opacity="0.2"/>
  <text x="232" y="501" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="#e8eaf0">ChatGPT</text>

  <rect x="480" y="467" width="240" height="56" rx="28" fill="#0d1525" stroke="#4285f4" stroke-width="1" stroke-opacity="0.5"/>
  <circle cx="518" cy="495" r="12" fill="#4285f4" opacity="0.2"/>
  <text x="552" y="501" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="#e8eaf0">Gemini</text>

  <rect x="800" y="467" width="240" height="56" rx="28" fill="#1e1408" stroke="#d97706" stroke-width="1" stroke-opacity="0.5"/>
  <circle cx="838" cy="495" r="12" fill="#d97706" opacity="0.2"/>
  <text x="872" y="501" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="#e8eaf0">Claude</text>

  <!-- vs -->
  <text x="452" y="501" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#374151">vs</text>
  <text x="772" y="501" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#374151">vs</text>

  <!-- URL -->
  <text x="1080" y="590" text-anchor="end" font-family="Arial, sans-serif" font-size="15" fill="#374151">lattice-protocol.com</text>
</svg>`

sharp(Buffer.from(svg))
  .png()
  .toFile('./public/og.png', (err, info) => {
    if (err) {
      console.error('Error:', err)
    } else {
      console.log('og.png generated!', info)
    }
  })
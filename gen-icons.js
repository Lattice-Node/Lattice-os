const sharp = require('sharp');
const path = require('path');
const dir = 'public/android-icons';

const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="92" fill="#111318"/><rect x="120" y="120" width="117" height="117" rx="18" fill="#6c71e8"/><rect x="275" y="120" width="117" height="117" rx="18" fill="#6c71e8" opacity="0.65"/><rect x="120" y="275" width="117" height="117" rx="18" fill="#6c71e8" opacity="0.65"/><rect x="275" y="275" width="117" height="117" rx="18" fill="#6c71e8" opacity="0.30"/></svg>`);

const feat = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500"><rect width="1024" height="500" fill="#111318"/><rect x="80" y="176" width="88" height="88" rx="14" fill="#6c71e8"/><rect x="180" y="176" width="88" height="88" rx="14" fill="#6c71e8" opacity="0.65"/><rect x="80" y="276" width="88" height="88" rx="14" fill="#6c71e8" opacity="0.65"/><rect x="180" y="276" width="88" height="88" rx="14" fill="#6c71e8" opacity="0.30"/><text x="320" y="260" font-family="sans-serif" font-size="52" font-weight="700" fill="#ffffff">Lattice</text><text x="320" y="310" font-family="sans-serif" font-size="22" fill="#6a7080">AI Agent App Store</text></svg>`);

Promise.all([
  sharp(svg).resize(512, 512).png().toFile(path.join(dir, 'icon-512.png')),
  sharp(feat).resize(1024, 500).png().toFile(path.join(dir, 'feature-graphic.png'))
]).then(() => console.log('done')).catch(e => console.error(e));
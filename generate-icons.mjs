import sharp from 'sharp'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#6366f1"/>
  <circle cx="256" cy="220" r="120" fill="rgba(255,255,255,0.15)"/>
  <text x="256" y="290" font-size="200" text-anchor="middle" font-family="system-ui,Arial">💰</text>
</svg>`

const buf = Buffer.from(svg)

await sharp(buf).resize(192, 192).png().toFile('public/icons/icon-192.png')
console.log('icon-192.png ✓')

await sharp(buf).resize(512, 512).png().toFile('public/icons/icon-512.png')
console.log('icon-512.png ✓')

await sharp(buf).resize(180, 180).png().toFile('public/apple-touch-icon.png')
console.log('apple-touch-icon.png ✓')

await sharp(buf).resize(32, 32).png().toFile('public/favicon.ico')
console.log('favicon.ico ✓')

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const output = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4/representative/01.png');
const source = path.join(root, 'public/coupang/images/aqua-lotion/versions/v1/representative/01.png');
const rejectedDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4/rejected');
await fs.mkdir(rejectedDir, { recursive: true });

const ts = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
await fs.copyFile(output, path.join(rejectedDir, `01-before-v1-style-fresh-icon-${ts}.png`));

const W = 1254;
const H = 1254;

// V4 current image already has the correct product. This overlay removes the small
// lower-left badge and adds a V1-style fresh-product icon at upper-left.
const overlay = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0b3b4a" flood-opacity="0.12"/>
    </filter>
    <linearGradient id="ring" x1="55" y1="55" x2="300" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#78c842"/>
      <stop offset="0.50" stop-color="#77c95d"/>
      <stop offset="1" stop-color="#2c91ea"/>
    </linearGradient>
  </defs>

  <!-- erase V1's original smaller icon, then redraw a clearer/larger V1-style icon -->
  <rect x="0" y="0" width="405" height="395" fill="#ffffff"/>

  <!-- V1-like circular fresh icon -->
  <g transform="translate(66 66)" filter="url(#softShadow)">
    <circle cx="142" cy="142" r="128" fill="#ffffff"/>
    <circle cx="142" cy="142" r="123" fill="none" stroke="url(#ring)" stroke-width="7"/>

    <!-- simple fresh leaf inspired by V1 icon; kept above text so it does not cover copy -->
    <path d="M112 62 C134 30 184 31 212 48 C190 56 174 74 165 96 C156 116 137 126 116 121 C97 117 86 104 86 89 C97 84 106 74 112 62 Z" fill="#63bd3e"/>
    <path d="M91 88 C120 92 143 108 159 132" fill="none" stroke="#46a934" stroke-width="8" stroke-linecap="round"/>

    <text x="142" y="169" text-anchor="middle" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, Arial, sans-serif" font-size="44" font-weight="900" fill="#52b33b" letter-spacing="-1.1">신선 제품</text>
    <text x="142" y="213" text-anchor="middle" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, Arial, sans-serif" font-size="31" font-weight="900" fill="#2588d8" letter-spacing="-0.6">제조 6개월 이내</text>
  </g>
</svg>`;

await sharp(source)
  .resize(W, H, { fit: 'cover' })
  .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
  .png({ compressionLevel: 9 })
  .toFile(output + '.tmp');

await fs.rename(output + '.tmp', output);

const meta = await sharp(output).metadata();
console.log(JSON.stringify({ output, source, width: meta.width, height: meta.height, archivedPrevious: path.join(rejectedDir, `01-before-v1-style-fresh-icon-${ts}.png`) }, null, 2));

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const srcDir = path.join(root, 'public/coupang-detail/9218811640');
const stockDir = path.join(root, 'public/coupang/images/aqua-lotion/assets/stock');
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/renewal-2026-05-25-v7');
const cutsDir = path.join(outDir, 'cuts');
const bundlesDir = path.join(outDir, 'bundles');
const previewDir = path.join(outDir, 'preview');

const W = 780;
const H = 1360;

const colors = {
  ink: '#0d332d',
  deep: '#062a27',
  body: '#244b45',
  muted: '#6f7f7b',
  blue: '#0d81b5',
  blueDeep: '#076986',
  sky: '#dff4fb',
  mint: '#dff3ea',
  mintDeep: '#2f735e',
  cream: '#fff6df',
  warm: '#f6e0b9',
  white: '#ffffff',
  line: '#cdded9',
  gold: '#d8b45f',
  warn: '#bd473f',
  blush: '#fff1ef',
  green: '#1d6d51',
};

await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(cutsDir, { recursive: true });
await fs.mkdir(bundlesDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const original = {};
for (let i = 1; i <= 15; i += 1) {
  const file = path.join(srcDir, `${String(i).padStart(2, '0')}.png`);
  const buf = await fs.readFile(file);
  original[i] = {
    uri: `data:image/png;base64,${buf.toString('base64')}`,
    width: 780,
    height: 1360,
  };
}

const stocks = {
  hand: await readRaster(path.join(stockDir, 'pexels-hand-pump-lotion-5563659.jpg')),
  water: await readRaster(path.join(stockDir, 'unsplash-water-droplets-9w5T19x1Y74.jpg')),
  product: await readRaster(path.join(root, 'public/brand/raw-photos/aqua-lotion-bottle.jpg')),
};

async function readRaster(file) {
  const [buf, meta] = await Promise.all([fs.readFile(file), sharp(file).metadata()]);
  return {
    uri: `data:image/${meta.format === 'png' ? 'png' : 'jpeg'};base64,${buf.toString('base64')}`,
    width: meta.width,
    height: meta.height,
    file,
  };
}

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function widthOf(text, size) {
  let units = 0;
  for (const ch of String(text)) {
    if (ch === ' ') units += 0.34;
    else if (/[0-9A-Za-z]/.test(ch)) units += 0.58;
    else if (/[.,:/·~%()#&+\-]/.test(ch)) units += 0.36;
    else units += 0.94;
  }
  return units * size;
}

function wrap(text, maxWidth, size) {
  const lines = [];
  for (const part of String(text).split('\n')) {
    const words = [...part];
    let line = '';
    for (const ch of words) {
      const next = line + ch;
      if (line && widthOf(next, size) > maxWidth) {
        lines.push(line);
        line = ch;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

class Svg {
  constructor(bg = colors.white) {
    this.parts = [];
    this.defs = [
      `<filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#042722" flood-opacity="0.24"/></filter>`,
      `<filter id="smallShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#042722" flood-opacity="0.18"/></filter>`,
      `<filter id="textGlow" x="-10%" y="-30%" width="120%" height="170%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#ffffff" flood-opacity="0.76"/></filter>`,
      `<filter id="blurBg" x="-8%" y="-8%" width="116%" height="116%"><feGaussianBlur stdDeviation="9"/></filter>`,
      `<linearGradient id="blueWash" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e7fbff"/><stop offset="0.52" stop-color="#ffffff"/><stop offset="1" stop-color="#c8edf6"/></linearGradient>`,
      `<linearGradient id="greenWash" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#effbf4"/><stop offset="0.55" stop-color="#ffffff"/><stop offset="1" stop-color="#d7f0df"/></linearGradient>`,
      `<linearGradient id="warmWash" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff7e6"/><stop offset="0.55" stop-color="#ffffff"/><stop offset="1" stop-color="#f6dcab"/></linearGradient>`,
    ];
    this.clipId = 0;
    this.rect(0, 0, W, H, bg);
  }

  add(raw) {
    this.parts.push(raw);
  }

  rect(x, y, w, h, fill, opts = {}) {
    const r = opts.r ?? 0;
    const stroke = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}"` : '';
    const opacity = opts.opacity == null ? '' : ` opacity="${opts.opacity}"`;
    const filter = opts.filter ? ` filter="url(#${opts.filter})"` : '';
    this.add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke}${opacity}${filter}/>`);
  }

  circle(cx, cy, r, fill, opts = {}) {
    const stroke = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}"` : '';
    const opacity = opts.opacity == null ? '' : ` opacity="${opts.opacity}"`;
    const filter = opts.filter ? ` filter="url(#${opts.filter})"` : '';
    this.add(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${stroke}${opacity}${filter}/>`);
  }

  ellipse(cx, cy, rx, ry, fill, opts = {}) {
    const opacity = opts.opacity == null ? '' : ` opacity="${opts.opacity}"`;
    const transform = opts.rotate ? ` transform="rotate(${opts.rotate} ${cx} ${cy})"` : '';
    const filter = opts.filter ? ` filter="url(#${opts.filter})"` : '';
    const stroke = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}"` : '';
    this.add(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${stroke}${opacity}${filter}${transform}/>`);
  }

  path(d, fill, opts = {}) {
    const opacity = opts.opacity == null ? '' : ` opacity="${opts.opacity}"`;
    const stroke = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}"` : '';
    const filter = opts.filter ? ` filter="url(#${opts.filter})"` : '';
    this.add(`<path d="${d}" fill="${fill}"${stroke}${opacity}${filter}/>`);
  }

  line(x1, y1, x2, y2, stroke, sw = 1, opacity = 1) {
    this.add(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`);
  }

  text(text, x, y, w, size, weight, color, opts = {}) {
    const lines = wrap(text, w, size);
    const family = 'Apple SD Gothic Neo, Noto Sans CJK KR, AppleGothic, Arial, sans-serif';
    const anchor = opts.align === 'center' ? 'middle' : opts.align === 'right' ? 'end' : 'start';
    const tx = opts.align === 'center' ? x + w / 2 : opts.align === 'right' ? x + w : x;
    const lh = opts.lh ?? 1.2;
    const letter = opts.letter == null ? '' : ` letter-spacing="${opts.letter}"`;
    const filter = opts.glow ? ' filter="url(#textGlow)"' : '';
    const opacity = opts.opacity == null ? '' : ` opacity="${opts.opacity}"`;
    if (opts.shadow) {
      this.add(`<text x="${tx + 2}" y="${y + 4}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="#001f1e" text-anchor="${anchor}" opacity="0.2"${letter}>`);
      lines.forEach((line, i) => {
        this.add(`<tspan x="${tx + 2}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`);
      });
      this.add('</text>');
    }
    this.add(`<text x="${tx}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}"${letter}${filter}${opacity}>`);
    lines.forEach((line, i) => {
      this.add(`<tspan x="${tx}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`);
    });
    this.add('</text>');
  }

  image(img, x, y, w, h, opts = {}) {
    const id = `clip${this.clipId++}`;
    const r = opts.r ?? 0;
    const opacity = opts.opacity == null ? '' : ` opacity="${opts.opacity}"`;
    const filter = opts.filter ? ` filter="url(#${opts.filter})"` : '';
    this.defs.push(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>`);
    this.add(`<image href="${img.uri}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${opts.fit ? 'xMidYMid meet' : 'xMidYMid slice'}" clip-path="url(#${id})"${opacity}${filter}/>`);
    if (opts.stroke) this.rect(x, y, w, h, 'none', { r, stroke: opts.stroke, sw: opts.sw ?? 1 });
  }

  crop(img, x, y, w, h, sx, sy, sw, sh, opts = {}) {
    const id = `clip${this.clipId++}`;
    const r = opts.r ?? 0;
    const scale = Math.max(w / sw, h / sh);
    const ix = x - sx * scale;
    const iy = y - sy * scale;
    const iw = img.width * scale;
    const ih = img.height * scale;
    const opacity = opts.opacity == null ? '' : ` opacity="${opts.opacity}"`;
    const filter = opts.filter ? ` filter="url(#${opts.filter})"` : '';
    this.defs.push(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>`);
    this.add(`<image href="${img.uri}" x="${ix}" y="${iy}" width="${iw}" height="${ih}" preserveAspectRatio="none" clip-path="url(#${id})"${opacity}${filter}/>`);
    if (opts.stroke) this.rect(x, y, w, h, 'none', { r, stroke: opts.stroke, sw: opts.sw ?? 1 });
  }

  cropSoft(img, x, y, w, h, sx, sy, sw, sh, opts = {}) {
    const clipId = `clip${this.clipId++}`;
    const maskId = `mask${this.clipId++}`;
    const gradId = `fade${this.clipId++}`;
    const scale = Math.max(w / sw, h / sh);
    const ix = x - sx * scale;
    const iy = y - sy * scale;
    const iw = img.width * scale;
    const ih = img.height * scale;
    const opacity = opts.opacity == null ? '' : ` opacity="${opts.opacity}"`;
    const filter = opts.filter ? ` filter="url(#${opts.filter})"` : '';
    this.defs.push(`<clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`);
    this.defs.push(`<radialGradient id="${gradId}" cx="50%" cy="52%" r="72%"><stop offset="64%" stop-color="white"/><stop offset="100%" stop-color="black"/></radialGradient>`);
    this.defs.push(`<mask id="${maskId}" maskUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${h}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${gradId})"/></mask>`);
    this.add(`<image href="${img.uri}" x="${ix}" y="${iy}" width="${iw}" height="${ih}" preserveAspectRatio="none" clip-path="url(#${clipId})" mask="url(#${maskId})"${opacity}${filter}/>`);
  }

  pill(text, x, y, fill, color, opts = {}) {
    const size = opts.size ?? 18;
    const px = opts.px ?? 16;
    const py = opts.py ?? 9;
    const w = Math.ceil(widthOf(text, size) + px * 2);
    const h = Math.ceil(size + py * 2);
    this.rect(x, y, w, h, fill, {
      r: opts.r ?? 999,
      stroke: opts.stroke,
      sw: opts.sw ?? 1,
      opacity: opts.opacity,
      filter: opts.filter,
    });
    this.text(text, x + px, y + py + size * 0.78, w - px * 2, size, opts.weight ?? 800, color, { align: 'center', lh: 1 });
    return { w, h };
  }

  svg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>${this.defs.join('\n')}</defs>
${this.parts.join('\n')}
</svg>`;
  }
}

function originalImg(n) {
  return original[n];
}

function wash(s, top = '#ffffffd9', bottom = '#ffffff') {
  s.rect(0, 0, W, 520, top);
  s.rect(0, 820, W, 540, bottom, { opacity: 0.94 });
}

function verticalShade(s, opacity = 0.72) {
  s.rect(0, 0, W, H, '#ffffff', { opacity });
  s.rect(0, 0, W, 420, '#e5f9ff', { opacity: 0.54 });
  s.rect(0, 1010, W, 350, '#062a27', { opacity: 0.12 });
}

function sectionLabel(s, text, dark = true) {
  s.pill(text, 46, 46, dark ? '#073a35e8' : '#ffffffe6', dark ? colors.white : colors.deep, {
    size: 14,
    px: 13,
    py: 7,
    r: 8,
    filter: 'smallShadow',
  });
}

function heroText(s, title, sub, opts = {}) {
  const x = opts.x ?? 46;
  const y = opts.y ?? 154;
  const w = opts.w ?? 650;
  const color = opts.color ?? colors.ink;
  s.text(title, x, y, w, opts.size ?? 58, 900, color, { shadow: opts.shadow, glow: opts.glow, lh: opts.lh ?? 1.08 });
  if (sub) s.text(sub, x + 2, y + (opts.subY ?? 156), w, opts.subSize ?? 24, 800, opts.subColor ?? colors.body, { lh: 1.35, glow: opts.glow });
}

function waterDrops(s, seed = 1, opts = {}) {
  let value = seed;
  const rand = () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
  const count = opts.count ?? 18;
  for (let i = 0; i < count; i += 1) {
    const x = (opts.x ?? 0) + rand() * (opts.w ?? W);
    const y = (opts.y ?? 0) + rand() * (opts.h ?? H);
    const r = (opts.min ?? 10) + rand() * (opts.max ?? 34);
    s.circle(x, y, r, '#ffffff', { opacity: 0.28 + rand() * 0.28, stroke: '#ffffff', sw: 1 });
    s.circle(x - r * 0.24, y - r * 0.24, r * 0.22, '#ffffff', { opacity: 0.62 });
  }
}

function productScene(s, x, y, w, h, opts = {}) {
  s.ellipse(x + w * 0.52, y + h * 0.88, w * 0.34, h * 0.08, '#062a27', { opacity: 0.16, filter: 'blurBg' });
  s.cropSoft(stocks.product, x, y, w, h, 215, 18, 520, 930, { opacity: opts.opacity ?? 1 });
}

function productMini(s, x, y, w, h, opts = {}) {
  s.cropSoft(stocks.product, x, y, w, h, 215, 18, 520, 930, { opacity: opts.opacity ?? 0.96, filter: opts.filter });
}

function glassStrip(s, x, y, w, h, title, body, opts = {}) {
  s.rect(x, y, w, h, opts.fill ?? '#ffffffe8', { r: opts.r ?? 22, stroke: opts.stroke ?? '#ffffff', sw: 1, filter: opts.filter });
  s.text(title, x + 22, y + 48, w - 44, opts.titleSize ?? 24, 900, opts.color ?? colors.ink, { align: opts.align });
  if (body) s.text(body, x + 22, y + 88, w - 44, opts.bodySize ?? 17, 800, opts.bodyColor ?? colors.body, { lh: 1.32, align: opts.align });
}

function sceneFooter(s, text, tone = 'dark') {
  const fill = tone === 'warn' ? '#5f1d1be8' : '#073a35e8';
  s.rect(40, 1200, 700, 96, fill, { r: 22, filter: 'smallShadow' });
  s.text(text, 70, 1258, 640, 22, 900, colors.white, { align: 'center', lh: 1.2 });
}

function sourceNote(s, text = '상기 내용은 원료적 특성에 한함') {
  s.text(text, 58, 1308, 664, 15, 700, colors.muted, { align: 'center' });
}

function drawHero() {
  const s = new Svg('#eaf9fc');
  s.crop(stocks.water, 0, 0, W, H, 2100, 500, 2100, 3650, { opacity: 0.5, filter: 'blurBg' });
  s.rect(0, 0, W, H, '#e8fbff', { opacity: 0.52 });
  s.circle(620, 500, 340, '#ffffff', { opacity: 0.44 });
  s.circle(140, 1020, 320, '#ffffff', { opacity: 0.26 });
  waterDrops(s, 4, { count: 22, x: 280, y: 200, w: 470, h: 820, min: 8, max: 32 });
  sectionLabel(s, 'HYALURONIC ACID AQUA LOTION');
  s.text('Yourskin+', 46, 142, 420, 29, 900, colors.ink, { letter: 0.8, glow: true });
  heroText(
    s,
    '크림은 무겁고\n토너는 부족할 때',
    '끈적임 없이 산뜻한 데일리 수분 로션',
    { y: 246, w: 610, size: 58, subY: 148, glow: true },
  );
  s.pill('#수분충전', 48, 500, '#ffffffde', colors.blueDeep, { stroke: '#bfeaf4', size: 18, filter: 'smallShadow' });
  s.pill('#피부진정', 184, 500, '#ffffffde', colors.blueDeep, { stroke: '#bfeaf4', size: 18, filter: 'smallShadow' });
  s.pill('#약산성', 320, 500, '#ffffffde', colors.blueDeep, { stroke: '#bfeaf4', size: 18, filter: 'smallShadow' });
  s.pill('#무향', 48, 558, '#ffffffde', colors.blueDeep, { stroke: '#bfeaf4', size: 18, filter: 'smallShadow' });
  productScene(s, 392, 286, 300, 620, { opacity: 0.98 });
  s.rect(46, 982, 330, 138, '#fffffff0', { r: 24, filter: 'smallShadow' });
  s.text('현재 판매 기준', 74, 1034, 274, 18, 900, colors.blueDeep, { align: 'center' });
  s.text('10,300원', 74, 1090, 274, 42, 900, colors.ink, { align: 'center' });
  s.rect(402, 982, 330, 138, '#073a35e8', { r: 24, filter: 'smallShadow' });
  s.text('제조 6개월 이내\n신선 제품 보장', 430, 1048, 274, 26, 900, colors.white, { align: 'center', lh: 1.18 });
  sceneFooter(s, '8중 히알루론산 · 병풀추출물 · 해양심층수 · Fresh Bud No.6');
  return s;
}

function drawUseMoment() {
  const s = new Svg('url(#blueWash)');
  s.crop(stocks.hand, 0, 0, W, H, 360, 1200, 2600, 4530, { opacity: 0.54, filter: 'blurBg' });
  s.rect(0, 0, W, H, '#dff7ff', { opacity: 0.54 });
  s.rect(0, 0, W, 500, '#ffffff', { opacity: 0.64 });
  s.rect(0, 870, W, 490, '#dff7ff', { opacity: 0.5 });
  sectionLabel(s, 'DAILY HYDRATION ROUTINE');
  heroText(
    s,
    '바르는 순간을\n상상하게 하는 보습감',
    '손등에 덜어 얼굴과 건조한 부위에 가볍게 펴 바르는 로션 루틴',
    { y: 154, size: 54, w: 640, subY: 150, glow: true },
  );
  productScene(s, 440, 575, 260, 500, { opacity: 0.96 });
  s.pill('300ml 대용량', 54, 680, '#ffffffea', colors.deep, { stroke: '#ffffff', filter: 'smallShadow' });
  s.pill('무향', 54, 736, '#ffffffea', colors.deep, { stroke: '#ffffff', filter: 'smallShadow' });
  s.pill('약산성 케어', 54, 792, '#ffffffea', colors.deep, { stroke: '#ffffff', filter: 'smallShadow' });
  sceneFooter(s, '속건조가 느껴질 때, 산뜻하게 수분감을 더하는 데일리 로션');
  return s;
}

function drawReasons() {
  const s = new Svg('url(#greenWash)');
  s.image(stocks.water, 0, 0, W, H, { opacity: 0.22, filter: 'blurBg' });
  productScene(s, 330, 150, 390, 470, { opacity: 0.85 });
  sectionLabel(s, '8 REASONS');
  heroText(s, '구매 전 확인할\n8가지 근거', '원본의 핵심 정보를 한 장의 광고 컷처럼 압축했습니다.', { y: 164, w: 440, size: 54, subY: 142 });
  const items = [
    '8중 히알루론산',
    '병풀·해양심층수',
    'AHA·PHA',
    'Fresh Bud No.6',
    '발효추출물',
    '식물오일 블렌딩',
    '저자극·EWG·pH',
    '신선 제조',
  ];
  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 58 + col * 344;
    const y = 660 + row * 112;
    s.rect(x, y, 318, 82, '#ffffffe8', { r: 22, filter: 'smallShadow' });
    s.text(String(i + 1).padStart(2, '0'), x + 22, y + 50, 48, 22, 900, colors.blueDeep);
    s.text(item, x + 74, y + 51, 220, 21, 900, colors.ink);
  });
  sceneFooter(s, '성분 · 테스트 · 제조 기준까지 상세 페이지에서 순서대로 확인');
  return s;
}

function drawHyaluronic() {
  const s = new Svg('url(#blueWash)');
  s.crop(stocks.water, 0, 0, W, H, 3050, 630, 1750, 3050, { opacity: 0.58 });
  s.rect(0, 0, W, H, '#eaffff', { opacity: 0.42 });
  s.crop(originalImg(4), 388, 102, 350, 630, 265, 224, 350, 770, { r: 38, opacity: 0.78, filter: 'softShadow' });
  sectionLabel(s, '8 LAYER HYALURONIC ACID');
  heroText(
    s,
    '8중 히알루론산\n레이어 보습',
    '고·중·저분자 히알루론산 조합으로 수분감을 겹겹이 더하는 컨셉',
    { y: 170, w: 460, size: 52, subY: 136, glow: true },
  );
  [
    ['고분자', '피부 표면에 촉촉한 보습감'],
    ['중분자', '이어지는 수분 레이어'],
    ['저분자', '가볍고 산뜻한 마무리'],
  ].forEach((v, i) => {
    glassStrip(s, 54 + i * 232, 808, 206, 178, v[0], v[1], { align: 'center', fill: '#ffffffe6', titleSize: 25, bodySize: 16 });
  });
  s.rect(54, 1054, 672, 116, '#ffffffde', { r: 24, filter: 'smallShadow' });
  s.text('소듐하이알루로네이트 2,050ppm 외 7종 히알루론산 원료 함유', 88, 1118, 604, 22, 900, colors.blueDeep, { align: 'center' });
  sourceNote(s);
  return s;
}

function drawCentellaSeaAha() {
  const s = new Svg('url(#warmWash)');
  s.image(originalImg(5), 0, 0, W, H, { opacity: 0.36, filter: 'blurBg' });
  s.rect(0, 0, W, H, '#fff9ea', { opacity: 0.56 });
  sectionLabel(s, 'MOISTURE · COMFORT · SKIN TEXTURE');
  heroText(
    s,
    '수분·편안함·피부결을\n역할별로 보여줍니다',
    '성분명을 나열하기보다 구매자가 기대하는 사용감을 먼저 보이게 구성했습니다.',
    { y: 154, size: 48, w: 650, subY: 132 },
  );
  [
    ['병풀추출물', '편안한 사용감', 76, 474, '#e0f4e9'],
    ['해양심층수', '촉촉한 수분감', 286, 620, '#dff4fb'],
    ['AHA·PHA', '피부결 케어', 496, 474, '#fff3d3'],
  ].forEach(([title, body, x, y, fill], i) => {
    s.circle(x + 90, y + 92, 106, fill, { filter: 'softShadow' });
    s.text(title, x, y + 88, 180, 25, 900, colors.ink, { align: 'center' });
    s.text(body, x, y + 130, 180, 18, 900, i === 1 ? colors.blueDeep : colors.mintDeep, { align: 'center' });
  });
  s.crop(originalImg(5), 88, 790, 604, 272, 52, 572, 660, 440, { r: 36, opacity: 0.96, filter: 'smallShadow' });
  sceneFooter(s, '건조함이 느껴지는 피부에 수분감과 편안한 사용감을 더하는 루틴');
  sourceNote(s);
  return s;
}

function drawFreshBud() {
  const s = new Svg('url(#greenWash)');
  s.crop(originalImg(6), 0, 0, W, H, 0, 350, 780, 840, { opacity: 0.45, filter: 'blurBg' });
  s.rect(0, 0, W, H, '#effbf4', { opacity: 0.48 });
  s.crop(originalImg(6), 450, 98, 250, 360, 72, 520, 640, 610, { r: 30, opacity: 0.98, filter: 'softShadow' });
  sectionLabel(s, 'FRESH BUD No.6');
  heroText(
    s,
    '새싹 유래\n특허 원료 조성물',
    '민감한 피부 루틴을 고려한 Fresh Bud No.6 원료 스토리',
    { y: 172, w: 440, size: 54, subY: 142 },
  );
  ['브로콜리', '알팔파', '양배추', '밀싹', '청경채 계열', '무순 계열'].forEach((v, i) => {
    const angle = (i / 6) * Math.PI * 2;
    const x = 390 + Math.cos(angle) * 210;
    const y = 730 + Math.sin(angle) * 145;
    s.pill(v, x - 68, y - 22, '#ffffffe6', colors.ink, { size: 16, px: 15, py: 9, filter: 'smallShadow' });
  });
  glassStrip(
    s,
    66,
    984,
    648,
    136,
    '피부 진정 효과를 가지는 혼합 새싹 추출물을 함유한 화장료 조성물',
    '상기 문구는 원본 특허 표시 문구 기준입니다.',
    { align: 'center', fill: '#ffffffe8', titleSize: 22, bodySize: 16 },
  );
  sourceNote(s);
  return s;
}

function drawFermentOil() {
  const s = new Svg('url(#warmWash)');
  s.image(originalImg(7), 0, 0, W, H, { opacity: 0.36, filter: 'blurBg' });
  s.rect(0, 0, W, H, '#fff7e4', { opacity: 0.4 });
  sectionLabel(s, 'FERMENT + PLANT OIL');
  heroText(
    s,
    '발효 성분과\n식물오일을 한 번에',
    '피부 컨디션 케어 원료와 식물오일 보습 보호감을 나눠 보여줍니다.',
    { y: 160, w: 620, size: 52, subY: 142 },
  );
  s.ellipse(210, 650, 170, 250, '#dff3ea', { rotate: -12, opacity: 0.94, filter: 'softShadow' });
  s.ellipse(570, 650, 170, 250, '#ffe9b7', { rotate: 12, opacity: 0.94, filter: 'softShadow' });
  s.text('발효 추출물 3종', 100, 606, 220, 29, 900, colors.green, { align: 'center' });
  s.text('효모/겨우살이\n효모/띠뿌리\n락토바실러스/콩', 100, 680, 220, 22, 800, colors.body, { align: 'center', lh: 1.45 });
  s.text('식물오일 3종', 460, 606, 220, 29, 900, colors.blueDeep, { align: 'center' });
  s.text('마카다미아씨\n해바라기씨\n로즈힙열매', 460, 680, 220, 22, 800, colors.body, { align: 'center', lh: 1.45 });
  s.crop(originalImg(7), 244, 930, 292, 200, 88, 554, 610, 560, { r: 26, opacity: 0.98, filter: 'smallShadow' });
  sceneFooter(s, '보습감은 가볍게, 마무리는 산뜻하게 설계한 데일리 로션');
  sourceNote(s);
  return s;
}

function drawLowIrritation() {
  const s = new Svg('#f4fbff');
  s.image(originalImg(8), 0, 0, W, H, { opacity: 0.28, filter: 'blurBg' });
  s.rect(0, 0, W, H, '#f4fbff', { opacity: 0.62 });
  sectionLabel(s, 'SKIN IRRITATION TEST');
  heroText(
    s,
    '피부 저자극 테스트\n완료 근거',
    '숫자와 기관을 먼저 보여 구매 전 불안을 줄이는 신뢰 컷',
    { y: 154, w: 620, size: 50, subY: 132 },
  );
  s.rect(76, 436, 300, 300, '#fffffff2', { r: 42, filter: 'softShadow' });
  s.text('자극지수', 106, 532, 240, 25, 900, colors.blueDeep, { align: 'center' });
  s.text('0.00', 106, 650, 240, 86, 900, colors.ink, { align: 'center' });
  s.text('비(무)자극 제품 인증', 106, 704, 240, 21, 900, colors.body, { align: 'center' });
  s.crop(originalImg(8), 430, 420, 258, 360, 390, 498, 330, 455, { r: 26, opacity: 0.96, filter: 'softShadow' });
  [
    ['시험번호', 'KDRI-2026-0265'],
    ['시험기관', '대한피부과학연구소'],
    ['대상/기간', '32명 · 2025.11.24~11.27'],
  ].forEach((v, i) => {
    glassStrip(s, 70, 848 + i * 86, 640, 62, v[0], v[1], { titleSize: 18, bodySize: 18, fill: i % 2 ? '#ffffffef' : '#e4f7ffef' });
  });
  s.text('※ 모든 피부에 동일한 반응을 보장하는 의미가 아니며, 개인차가 있을 수 있습니다.', 58, 1305, 664, 15, 700, colors.muted, { align: 'center' });
  return s;
}

function drawEwg() {
  const s = new Svg('url(#greenWash)');
  s.image(originalImg(9), 0, 0, W, H, { opacity: 0.34, filter: 'blurBg' });
  s.rect(0, 0, W, H, '#ffffff', { opacity: 0.58 });
  s.crop(originalImg(9), 494, 88, 178, 260, 73, 498, 604, 590, { r: 28, opacity: 0.98, filter: 'softShadow' });
  sectionLabel(s, 'EWG GREEN + FRAGRANCE FREE');
  heroText(
    s,
    '전성분 EWG 그린 등급\n그리고 무향 설계',
    '향료와 에센셜오일을 더하지 않고, 원료 고유의 향만 남깁니다.',
    { y: 160, w: 560, size: 46, subY: 126 },
  );
  [
    ['EWG 그린 등급', '원료 안전성 정보를 1~10등급으로 분류하는 기준'],
    ['Fragrance Free', '향료 무첨가'],
    ['Essential Oil Free', '에센셜오일 무첨가'],
  ].forEach((v, i) => {
    glassStrip(s, 60 + i * 226, 640, 206, 230, v[0], v[1], { align: 'center', fill: i === 0 ? '#e3f5e8ee' : '#e5f7ffee', titleSize: 22, bodySize: 17 });
  });
  sceneFooter(s, '민감한 향 사용을 줄이고 싶은 분까지 고려한 데일리 보습 루틴');
  sourceNote(s, '상세 문구는 실제 라벨과 최종 대조 후 사용합니다.');
  return s;
}

function drawMildPh() {
  const s = new Svg('url(#blueWash)');
  s.image(originalImg(10), 0, 0, W, H, { opacity: 0.32, filter: 'blurBg' });
  s.rect(0, 0, W, H, '#e8f9f8', { opacity: 0.48 });
  productMini(s, 556, 76, 140, 226, { opacity: 0.88, filter: 'softShadow' });
  sectionLabel(s, 'MILD pH BALANCE');
  heroText(
    s,
    '피부 밸런스를 고려한\n약산성 pH 설계',
    '데일리 로션 단계에 맞춘 pH 5.0~6.5 약산성 루틴',
    { y: 154, w: 570, size: 50, subY: 130 },
  );
  s.rect(74, 486, 632, 290, '#fffffff2', { r: 38, filter: 'softShadow' });
  s.text('pH 5.0 ~ 6.5', 96, 615, 588, 66, 900, colors.blueDeep, { align: 'center' });
  s.rect(128, 674, 524, 34, '#e7ecf7', { r: 17 });
  s.rect(308, 674, 176, 34, '#c8efe3', { r: 17 });
  s.text('산성', 128, 744, 90, 16, 800, colors.muted);
  s.text('약산성', 318, 746, 156, 18, 900, colors.ink, { align: 'center' });
  s.text('알칼리성', 562, 744, 90, 16, 800, colors.muted, { align: 'right' });
  ['피부 유사 pH', '유수분 밸런스', '아침·저녁 순한 루틴'].forEach((v, i) => {
    s.pill(v, 86 + i * 214, 880, '#ffffffee', colors.ink, { size: 17, stroke: '#d2e7e1', filter: 'smallShadow' });
  });
  sceneFooter(s, '건조함이 느껴지는 피부를 위한 산뜻한 수분 보습 단계');
  return s;
}

function drawFreshManufacture() {
  const s = new Svg('url(#greenWash)');
  s.image(originalImg(11), 0, 0, W, H, { opacity: 0.28, filter: 'blurBg' });
  s.rect(0, 0, W, H, '#f1faee', { opacity: 0.54 });
  s.crop(originalImg(11), 456, 104, 250, 370, 82, 626, 610, 610, { r: 30, opacity: 0.96, filter: 'softShadow' });
  sectionLabel(s, 'FRESH MANUFACTURE');
  heroText(
    s,
    '제조일자를 보여주는\n신선함의 기준',
    '사용기한만 보는 것이 아니라 제조번호와 제조일자를 함께 확인합니다.',
    { y: 160, w: 580, size: 50, subY: 136 },
  );
  s.rect(66, 532, 300, 270, '#fffffff0', { r: 30, filter: 'softShadow' });
  s.text('유어스킨플러스', 96, 604, 240, 25, 900, colors.green, { align: 'center' });
  s.text('제조번호와\n제조일자를 표기', 96, 690, 240, 30, 900, colors.ink, { align: 'center' });
  s.rect(414, 532, 300, 270, '#fffffff0', { r: 30, filter: 'softShadow' });
  s.text('일부 타사 제품', 444, 604, 240, 25, 900, colors.muted, { align: 'center' });
  s.text('제조번호와\n사용기한만 표기', 444, 690, 240, 30, 900, colors.ink, { align: 'center' });
  s.rect(58, 914, 664, 160, '#073a35e8', { r: 28, filter: 'smallShadow' });
  s.text('제조일로부터 6개월 이내 제품만 출고', 92, 994, 596, 31, 900, colors.white, { align: 'center' });
  s.text('오래된 재고와 사용기한 임박 제품에 대한 불안을 줄이는 핵심 메시지', 92, 1038, 596, 18, 800, '#dff4ec', { align: 'center' });
  return s;
}

function drawHowToUse() {
  const s = new Svg('url(#warmWash)');
  s.crop(stocks.hand, 0, 0, W, H, 1020, 1920, 2300, 4000, { opacity: 0.64, filter: 'blurBg' });
  s.rect(0, 0, W, H, '#fff8ea', { opacity: 0.4 });
  s.crop(originalImg(12), 430, 766, 290, 300, 410, 610, 300, 420, { r: 30, opacity: 0.96, filter: 'softShadow' });
  sectionLabel(s, 'HOW TO USE');
  heroText(
    s,
    '얼굴과 건조한 부위에\n가볍게 덧바르는 로션',
    '펌프 방향만 확인하면 매일 쓰기 쉬운 대용량 수분 로션',
    { y: 160, w: 620, size: 48, subY: 132, glow: true },
  );
  glassStrip(s, 58, 520, 640, 102, 'STEP 1', '적당량을 덜어 얼굴에 골고루 펴 바른 후 두드리듯 흡수시켜 주세요.', { fill: '#fffffff0', titleSize: 22, bodySize: 20 });
  glassStrip(s, 58, 652, 640, 102, 'STEP 2', '건조함이 느껴지는 부위에는 한 번 더 덧발라 보습감을 보완합니다.', { fill: '#fffffff0', titleSize: 22, bodySize: 20 });
  s.rect(58, 860, 158, 94, '#ffffffee', { r: 22, filter: 'smallShadow' });
  s.text('OPEN', 80, 918, 114, 31, 900, colors.blueDeep, { align: 'center' });
  s.rect(238, 860, 158, 94, '#fff1efee', { r: 22, filter: 'smallShadow' });
  s.text('STOP', 260, 918, 114, 31, 900, colors.warn, { align: 'center' });
  sceneFooter(s, 'STOP 상태에서는 펌프가 눌리지 않습니다. OPEN 방향으로 돌려 사용하세요.');
  return s;
}

function drawEcoDirect() {
  const s = new Svg('#f7fbf6');
  s.image(originalImg(13), 0, 0, W, H, { opacity: 0.32, filter: 'blurBg' });
  s.rect(0, 0, W, H, '#f9fbf5', { opacity: 0.58 });
  s.crop(originalImg(13), 454, 116, 242, 330, 70, 560, 640, 580, { r: 30, opacity: 0.96, filter: 'softShadow' });
  sectionLabel(s, 'ECO PACKAGE + DIRECT MAKER');
  heroText(
    s,
    '불필요한 포장은 줄이고\n제조사가 직접 판매',
    '친환경 포장과 직접 제조·직접 판매 메시지를 후반 신뢰 파트로 유지했습니다.',
    { y: 154, w: 610, size: 48, subY: 132 },
  );
  [
    ['단상자 축소', '불필요한 개별 단상자 사용을 줄입니다.'],
    ['수축필름 제거', '과한 포장보다 필요한 보호를 우선합니다.'],
    ['완충재 절감', '배송 보호에 필요한 범위만 사용합니다.'],
  ].forEach((v, i) => {
    glassStrip(s, 58 + i * 226, 610, 206, 230, v[0], v[1], { align: 'center', fill: i === 1 ? '#e3f5ffee' : '#e2f4e9ee', titleSize: 22, bodySize: 17 });
  });
  s.rect(54, 940, 672, 146, '#073a35e8', { r: 28, filter: 'smallShadow' });
  s.text('제조사가 직접 만들어 직접 판매합니다', 90, 1018, 600, 30, 900, colors.white, { align: 'center' });
  s.text('패키지와 광고비를 줄이고 중간마진 부담을 낮춘 가격 구조', 90, 1060, 600, 18, 800, '#dff4ec', { align: 'center' });
  s.text('화장품제조업자 및 책임판매업자: (주)유어스킨 / 인천시 서구 염곡로 89', 58, 1268, 664, 17, 800, colors.body, { align: 'center' });
  return s;
}

function drawNotice() {
  const s = new Svg('#fbfbf7');
  s.image(originalImg(14), 0, 0, W, H, { opacity: 0.24, filter: 'blurBg' });
  s.rect(0, 0, W, H, '#fffdf7', { opacity: 0.68 });
  sectionLabel(s, 'PRODUCT NOTICE');
  heroText(
    s,
    '제품 고시정보는\n읽기 쉬운 표로',
    '필수 정보를 빠뜨리지 않고, 구매자가 확인하기 쉽게 정리합니다.',
    { y: 154, w: 560, size: 50, subY: 134 },
  );
  const rows = [
    ['제품명', '유어스킨플러스 히알루론산 아쿠아 로션'],
    ['용량', '300ml / 10.14 fl. oz'],
    ['주요 사양', '모든 피부 타입'],
    ['사용기한', '제조일로부터 24개월 / 개봉 후 12개월'],
    ['제조업자·책임판매업자', '(주)유어스킨'],
    ['제조국', '대한민국'],
  ];
  s.rect(54, 438, 672, 490, '#fffffff2', { r: 28, filter: 'softShadow' });
  rows.forEach((v, i) => {
    const y = 480 + i * 68;
    s.line(88, y + 40, 690, y + 40, colors.line, 1, 0.7);
    s.text(v[0], 88, y + 24, 180, 16, 900, colors.blueDeep);
    s.text(v[1], 278, y + 24, 390, 16, 800, colors.ink);
  });
  s.rect(54, 990, 672, 142, '#ffffffee', { r: 24, filter: 'smallShadow' });
  s.text('사용 시 주의사항', 88, 1048, 604, 23, 900, colors.ink);
  s.text('이상 증상 시 전문의 상담 / 상처 부위 사용 자제 / 어린이 손이 닿지 않는 곳 보관 / 직사광선 피하기', 88, 1094, 604, 18, 800, colors.body);
  s.text('상담: 032-682-6533 / 10:00~17:00', 58, 1266, 664, 17, 800, colors.muted, { align: 'center' });
  return s;
}

function drawOfficialSeller() {
  const s = new Svg('#fff1ef');
  s.image(originalImg(15), 0, 0, W, H, { opacity: 0.26, filter: 'blurBg' });
  s.rect(0, 0, W, H, '#fff1ef', { opacity: 0.54 });
  sectionLabel(s, 'OFFICIAL SELLER NOTICE');
  heroText(
    s,
    '무단 리셀러 유통 제품\n구매 전 확인하세요',
    '정상 보관·정품 여부·상담 범위 확인을 위해 공식 판매자명을 확인해 주세요.',
    { y: 154, w: 630, size: 48, subY: 134 },
  );
  s.circle(610, 272, 110, '#ffffffdb', { filter: 'softShadow' });
  s.text('공식\n판매자', 548, 250, 124, 28, 900, colors.warn, { align: 'center', lh: 1.1 });
  [
    ['판매자 확인', '공식 판매자명이 ‘(주)유어스킨’인지 확인하세요.'],
    ['비정상 유통 위험', '보관 상태와 사용기한 확인이 어려울 수 있습니다.'],
    ['가격 역전 가능성', '무단 리셀러 제품은 공식 가격보다 높을 수 있습니다.'],
    ['상담·보상 제한', '비정상 유통 제품은 상담이 제한될 수 있습니다.'],
  ].forEach((v, i) => {
    const x = 58 + (i % 2) * 346;
    const y = 520 + Math.floor(i / 2) * 218;
    glassStrip(s, x, y, 318, 170, v[0], v[1], { fill: '#fffffff0', titleSize: 24, bodySize: 18 });
  });
  s.rect(54, 1006, 672, 156, '#5f1d1be8', { r: 28, filter: 'smallShadow' });
  s.text('공식 판매처에서 제조일자를 확인하고 구매하세요', 90, 1080, 600, 28, 900, colors.white, { align: 'center' });
  s.text('히알루론산 아쿠아 로션 300ml / 데일리 수분 보습 루틴', 90, 1122, 600, 18, 800, '#ffe2dc', { align: 'center' });
  return s;
}

const cuts = [
  ['01-ad-hero-water-product.jpg', '제품 후킹 광고 컷', drawHero],
  ['02-ad-use-moment.jpg', '사람 사용 장면 광고 컷', drawUseMoment],
  ['03-ad-eight-reasons.jpg', '8가지 근거 광고 컷', drawReasons],
  ['04-ad-hyaluronic-water.jpg', '8중 히알루론산 광고 컷', drawHyaluronic],
  ['05-ad-centella-sea-aha.jpg', '병풀·해양심층수·AHA/PHA 광고 컷', drawCentellaSeaAha],
  ['06-ad-fresh-bud.jpg', 'Fresh Bud No.6 광고 컷', drawFreshBud],
  ['07-ad-ferment-oil.jpg', '발효·식물오일 광고 컷', drawFermentOil],
  ['08-ad-low-irritation-test.jpg', '저자극 테스트 광고 컷', drawLowIrritation],
  ['09-ad-ewg-fragrance-free.jpg', 'EWG·무향 광고 컷', drawEwg],
  ['10-ad-mild-ph.jpg', '약산성 pH 광고 컷', drawMildPh],
  ['11-ad-fresh-manufacture.jpg', '신선 제조 광고 컷', drawFreshManufacture],
  ['12-ad-how-to-use.jpg', '사용법 광고 컷', drawHowToUse],
  ['13-ad-eco-direct.jpg', '친환경 포장·직접 제조 광고 컷', drawEcoDirect],
  ['14-ad-product-notice.jpg', '고시정보 안내 컷', drawNotice],
  ['15-ad-official-seller.jpg', '공식 판매처 안내 컷', drawOfficialSeller],
];

const cutFiles = [];
for (let i = 0; i < cuts.length; i += 1) {
  const [name, , draw] = cuts[i];
  const file = path.join(cutsDir, `${String(i + 1).padStart(2, '0')}-${name}`);
  const svg = draw().svg();
  await sharp(Buffer.from(svg))
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(file);
  cutFiles.push(file);
}

const bundles = [
  ['01-hero-use-reasons', [0, 1, 2]],
  ['02-ingredients-story', [3, 4, 5]],
  ['03-ingredients-trust', [6, 7, 8]],
  ['04-ph-fresh-use', [9, 10, 11]],
  ['05-brand-notice', [12, 13, 14]],
];

const bundleFiles = [];
for (const [name, indexes] of bundles) {
  const images = await Promise.all(indexes.map((idx) => sharp(cutFiles[idx]).toBuffer()));
  const file = path.join(bundlesDir, `detail-v7-${name}.jpg`);
  await sharp({
    create: {
      width: W,
      height: H * indexes.length,
      channels: 3,
      background: '#ffffff',
    },
  })
    .composite(images.map((input, i) => ({ input, left: 0, top: i * H })))
    .jpeg({ quality: 94, mozjpeg: true })
    .toFile(file);
  bundleFiles.push(file);
}

const fullInputs = await Promise.all(cutFiles.map((file) => sharp(file).toBuffer()));
const fullStackFile = path.join(outDir, 'detail-v7-full-stack.jpg');
await sharp({
  create: {
    width: W,
    height: H * cutFiles.length,
    channels: 3,
    background: '#ffffff',
  },
})
  .composite(fullInputs.map((input, i) => ({ input, left: 0, top: i * H })))
  .jpeg({ quality: 93, mozjpeg: true })
  .toFile(fullStackFile);

const thumbBuffers = await Promise.all(
  cutFiles.map((file) =>
    sharp(file).resize({ width: 240 }).jpeg({ quality: 88, mozjpeg: true }).toBuffer(),
  ),
);
const contactW = 240 * 5;
const contactH = 420 * 3;
const contactSheet = path.join(previewDir, 'v7-contact-sheet.jpg');
await sharp({
  create: {
    width: contactW,
    height: contactH,
    channels: 3,
    background: '#eef4f2',
  },
})
  .composite(
    thumbBuffers.map((input, i) => ({
      input,
      left: (i % 5) * 240,
      top: Math.floor(i / 5) * 420,
    })),
  )
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(contactSheet);

await fs.writeFile(
  path.join(outDir, 'view-all.html'),
  `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>아쿠아 로션 상세페이지 V7 광고컷</title>
  <style>
    body { margin: 0; background: #e9f1ef; color: #143730; font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; }
    main { max-width: 980px; margin: 0 auto; padding: 28px 18px 48px; }
    h1 { margin: 0 0 10px; font-size: 24px; }
    p { margin: 0 0 18px; color: #48615b; }
    a { color: #076986; font-weight: 800; }
    .links { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 24px; }
    .links a { background: #fff; padding: 10px 12px; border-radius: 8px; text-decoration: none; }
    .stack { display: block; width: min(780px, 100%); margin: 0 auto; box-shadow: 0 24px 80px rgba(5, 38, 34, 0.18); }
    .sheet { display: block; width: 100%; margin: 28px 0; border-radius: 10px; }
  </style>
</head>
<body>
<main>
  <h1>아쿠아 로션 상세페이지 V7 광고컷</h1>
  <p>15개 컷을 한 번에 이어 본 미리보기입니다.</p>
  <div class="links">
    <a href="./detail-v7-full-stack.jpg">전체 이어보기 JPG</a>
    <a href="./preview/v7-contact-sheet.jpg">연락시트</a>
    <a href="./cuts/">컷별 이미지 폴더</a>
    <a href="./bundles/">3컷 묶음 폴더</a>
  </div>
  <img class="sheet" src="./preview/v7-contact-sheet.jpg" alt="V7 contact sheet">
  <img class="stack" src="./detail-v7-full-stack.jpg" alt="V7 full stack">
</main>
</body>
</html>
`,
);

const manifest = {
  createdAt: new Date().toISOString(),
  designDirection:
    '광고 컷처럼 보이도록 원본 상품/성분/인증 요소와 무료 스톡 사용 장면·물방울 배경을 크게 사용하고 텍스트 박스 비중을 줄인 V7.',
  size: { width: W, height: H },
  cuts: cutFiles.map((file, i) => ({
    index: i + 1,
    title: cuts[i][1],
    file,
  })),
  bundles: bundleFiles.map((file) => ({ file, width: W, height: H * 3 })),
  fullStack: fullStackFile,
  preview: contactSheet,
  viewAll: path.join(outDir, 'view-all.html'),
  sourceAssets: [
    {
      name: 'Pexels lotion hand use scene',
      file: stocks.hand.file,
      source: 'https://www.pexels.com/photo/faceless-female-cosmetologist-applying-lotion-on-hand-5563659/',
      licensePage: 'https://www.pexels.com/license/',
    },
    {
      name: 'Unsplash water droplets texture',
      file: stocks.water.file,
      source: 'https://unsplash.com/photos/clear-glass-bottle-with-water-droplets-9w5T19x1Y74',
      licensePage: 'https://unsplash.com/license/',
    },
  ],
};

await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log(JSON.stringify(manifest, null, 2));

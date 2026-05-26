import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const productDir = path.join(root, 'public/coupang-detail/9218811640');
const generatedHero = path.join(root, 'public/coupang/images/aqua-lotion/generated/aqua-lotion-fresh-water-hero-v1.png');
const driveAssetDir = path.join(root, 'public/coupang/images/aqua-lotion/assets/drive');
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/renewal-2026-05-25-v8-fresh-set');
const cutsDir = path.join(outDir, 'cuts');
const previewDir = path.join(outDir, 'preview');

const W = 780;
const H = 1360;

const c = {
  ink: '#103a35',
  deep: '#062b28',
  body: '#315f59',
  muted: '#708783',
  blue: '#087faa',
  blueDeep: '#005f86',
  mint: '#e8f8f4',
  mint2: '#d7f2eb',
  sky: '#e8f9ff',
  white: '#ffffff',
  line: '#c9e5df',
  leaf: '#3f8268',
  warn: '#a04738',
};

await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(cutsDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

async function readRaster(file) {
  const [buf, meta] = await Promise.all([fs.readFile(file), sharp(file).metadata()]);
  return {
    uri: `data:image/${meta.format === 'png' ? 'png' : 'jpeg'};base64,${buf.toString('base64')}`,
    width: meta.width,
    height: meta.height,
  };
}

async function readTrimmedRaster(file) {
  const { data, info } = await sharp(file)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
    .png()
    .toBuffer({ resolveWithObject: true });
  return {
    uri: `data:image/png;base64,${data.toString('base64')}`,
    width: info.width,
    height: info.height,
  };
}

const generated = await readRaster(generatedHero);
const driveMain = await readTrimmedRaster(path.join(driveAssetDir, 'aqua-lotion-transparent-main.png'));
const drivePackshot = await readRaster(path.join(driveAssetDir, 'aqua-lotion-packshot.png'));
const driveLab = await readRaster(path.join(driveAssetDir, 'aqua-lotion-lab-scene.png'));
const driveWater = await readRaster(path.join(driveAssetDir, 'aqua-lotion-water-scene.png'));
const driveCloseup = await readRaster(path.join(driveAssetDir, 'aqua-lotion-pump-closeup.png'));
const original = {};
for (let i = 1; i <= 15; i += 1) {
  original[i] = await readRaster(path.join(productDir, `${String(i).padStart(2, '0')}.png`));
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
    let line = '';
    const tokens = part.split(/(\s+)/).filter(Boolean);
    for (const token of tokens) {
      const next = line + token;
      if (line && widthOf(next, size) > maxWidth) {
        lines.push(line);
        line = token.trimStart();
      } else if (!line && widthOf(token, size) > maxWidth) {
        let chunk = '';
        for (const ch of [...token]) {
          const candidate = chunk + ch;
          if (chunk && widthOf(candidate, size) > maxWidth) {
            lines.push(chunk);
            chunk = ch;
          } else {
            chunk = candidate;
          }
        }
        line = chunk;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

class Svg {
  constructor(bg = c.white) {
    this.parts = [];
    this.clipId = 0;
    this.defs = [
      '<filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#062b28" flood-opacity="0.22"/></filter>',
      '<filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#062b28" flood-opacity="0.16"/></filter>',
      '<filter id="glow" x="-10%" y="-30%" width="120%" height="170%"><feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#ffffff" flood-opacity="0.76"/></filter>',
      '<filter id="photoBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="18"/></filter>',
      '<linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="0.62" stop-color="#ffffff" stop-opacity="0.34"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>',
      '<linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#062b28" stop-opacity="0"/><stop offset="1" stop-color="#062b28" stop-opacity="0.64"/></linearGradient>',
      '<linearGradient id="aquaWash" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f9ff"/><stop offset="0.55" stop-color="#ffffff"/><stop offset="1" stop-color="#d8f3ee"/></linearGradient>',
      '<linearGradient id="photoTitleVeil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.96"/><stop offset="0.72" stop-color="#ffffff" stop-opacity="0.82"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>',
      '<linearGradient id="photoBottomVeil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="0.28" stop-color="#eefbf8" stop-opacity="0.78"/><stop offset="1" stop-color="#e5f8f5" stop-opacity="0.98"/></linearGradient>',
    ];
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

  line(x1, y1, x2, y2, stroke, sw = 1, opacity = 1) {
    this.add(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`);
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

  text(text, x, y, w, size, weight, color, opts = {}) {
    const lines = wrap(text, w, size);
    const family = 'Apple SD Gothic Neo, Noto Sans CJK KR, AppleGothic, Arial, sans-serif';
    const anchor = opts.align === 'center' ? 'middle' : opts.align === 'right' ? 'end' : 'start';
    const tx = opts.align === 'center' ? x + w / 2 : opts.align === 'right' ? x + w : x;
    const lh = opts.lh ?? 1.2;
    const letter = opts.letter == null ? '' : ` letter-spacing="${opts.letter}"`;
    const filter = opts.glow ? ' filter="url(#glow)"' : '';
    const opacity = opts.opacity == null ? '' : ` opacity="${opts.opacity}"`;
    this.add(`<text x="${tx}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}"${letter}${filter}${opacity}>`);
    lines.forEach((line, i) => {
      this.add(`<tspan x="${tx}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`);
    });
    this.add('</text>');
  }

  pill(text, x, y, fill, color, opts = {}) {
    const size = opts.size ?? 18;
    const px = opts.px ?? 18;
    const py = opts.py ?? 9;
    const w = Math.ceil(widthOf(text, size) + px * 2);
    const h = Math.ceil(size + py * 2);
    this.rect(x, y, w, h, fill, { r: opts.r ?? 999, stroke: opts.stroke, sw: opts.sw ?? 1, opacity: opts.opacity });
    this.text(text, x + px, y + py + size * 0.78, w - px * 2, size, opts.weight ?? 900, color, { align: 'center', lh: 1 });
    return { w, h };
  }

  card(x, y, w, h, fill = c.white, opts = {}) {
    this.rect(x, y, w, h, fill, { r: opts.r ?? 18, stroke: opts.stroke ?? c.line, sw: opts.sw ?? 1, opacity: opts.opacity, filter: opts.filter });
  }

  svg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>${this.defs.join('\n')}</defs>
${this.parts.join('\n')}
</svg>`;
  }
}

function productBottle(s, x, y, w, h, opts = {}) {
  s.crop(original[1], x, y, w, h, 268, 430, 250, 560, { r: opts.r ?? 30, stroke: opts.stroke ?? '#b9e2ec', filter: opts.filter });
}

function driveProduct(s, x, y, w, h, opts = {}) {
  s.image(driveMain, x, y, w, h, { fit: true, opacity: opts.opacity, filter: opts.filter });
}

function baseAqua() {
  const s = new Svg('url(#aquaWash)');
  s.image(generated, 0, 0, W, H, { opacity: 0.34 });
  s.rect(0, 0, W, H, '#ffffff', { opacity: 0.54 });
  return s;
}

function header(s, kicker, title, body, opts = {}) {
  s.pill(kicker, 54, opts.y ?? 58, c.deep, c.white, { r: 8, size: 14, px: 14, py: 8 });
  s.text(title, 54, (opts.y ?? 58) + 116, opts.w ?? 610, opts.size ?? 52, 900, c.ink);
  if (body) s.text(body, 54, (opts.y ?? 58) + (opts.bodyY ?? 252), opts.bodyW ?? 620, opts.bodySize ?? 22, 800, c.body);
}

function drawHero() {
  const s = new Svg('#f7fdff');
  s.image(driveWater, -210, -220, 1200, 1200, { opacity: 0.24, filter: 'photoBlur' });
  s.image(driveWater, 0, 330, W, W, { opacity: 1 });
  s.rect(0, 0, W, 540, 'url(#photoTitleVeil)');
  s.rect(0, 850, W, 510, 'url(#photoBottomVeil)');
  s.line(54, 74, 726, 74, c.line, 1, 0.7);
  s.pill('AQUA LOTION 300ml', 54, 116, c.deep, c.white, { r: 8, size: 15, px: 15, py: 8 });
  s.text('히알루론산\n아쿠아 로션', 54, 246, 620, 62, 900, c.ink, { lh: 1.04 });
  s.text('제조일자와 사용기한을 함께 확인하는 산뜻한 데일리 보습 루틴', 58, 438, 520, 23, 850, c.body, { lh: 1.48 });
  s.card(54, 1016, 672, 104, '#ffffffe6', { r: 22, filter: 'softShadow' });
  s.text('제품 하단 또는 고시정보에서 제조일자와 사용기한을 확인하세요.', 86, 1078, 608, 23, 900, c.ink, { align: 'center' });
  s.card(54, 1160, 672, 108, '#f3fffcf0', { r: 22, stroke: c.line, filter: 'softShadow' });
  const features = [
    ['300ml', '넉넉한 데일리 용량'],
    ['보습 성분', '히알루론산 보습 컨셉'],
    ['산뜻함', '부담 적은 사용감'],
  ];
  features.forEach((item, i) => {
    const x = 84 + i * 214;
    if (i > 0) s.line(x - 24, 1188, x - 24, 1240, c.line, 1, 1);
    s.text(item[0], x, 1198, 170, 23, 950, c.blueDeep, { align: 'center' });
    s.text(item[1], x, 1237, 170, 16, 850, c.body, { align: 'center' });
  });
  s.text('제조 이력 확인까지 생각한 데일리 아쿠아 보습 로션', 74, 1312, 632, 20, 900, c.body, { align: 'center' });
  return s;
}

function drawFreshProof() {
  const s = baseAqua();
  s.image(driveLab, 0, 540, W, 780, { opacity: 0.18 });
  s.rect(0, 540, W, 820, '#ffffff', { opacity: 0.58 });
  header(s, 'DATE CHECK', '제조일자를 보여주는\n확인의 기준', '사용기한만 보는 것이 아니라 제조번호와 제조일자를 함께 확인합니다.', { size: 50, bodyY: 246, bodyW: 650 });
  s.card(54, 400, 320, 330, '#fffffff2', { r: 24, filter: 'softShadow' });
  s.text('유어스킨플러스', 84, 466, 260, 27, 900, c.leaf, { align: 'center' });
  s.text('제조번호와\n제조일자를 표기', 90, 558, 248, 31, 900, c.ink, { align: 'center' });
  s.text('예: A2507191\n제조 2025.07.19', 90, 675, 248, 22, 800, c.body, { align: 'center' });
  s.card(406, 400, 320, 330, '#fffffff2', { r: 24, filter: 'softShadow' });
  s.text('사용기한 확인', 436, 466, 260, 27, 900, c.muted, { align: 'center' });
  s.text('제조번호와\n사용기한을\n함께 확인', 442, 540, 248, 28, 900, c.ink, { align: 'center' });
  s.text('예: A39\n2026.03.29까지', 442, 675, 248, 22, 800, c.body, { align: 'center' });
  s.card(54, 820, 672, 180, '#e8f8f4f2', { r: 24, stroke: c.line, filter: 'softShadow' });
  s.text('제조일자와 사용기한 확인 안내', 86, 900, 608, 31, 900, c.ink, { align: 'center' });
  s.text('수령 후 직접 확인할 수 있는 정보 중심으로 안내합니다.', 86, 950, 608, 19, 800, c.body, { align: 'center' });
  s.card(90, 1090, 600, 112, '#ffffffe8', { r: 18 });
  s.text('수령 후 제품 하단 또는 고시정보에서 제조일자와 사용기한을 확인하세요.', 124, 1155, 532, 22, 900, c.ink, { align: 'center' });
  return s;
}

function drawHyaluronic() {
  const s = baseAqua();
  s.image(driveWater, 0, 0, W, 1360, { opacity: 0.12 });
  s.rect(0, 0, W, H, '#ffffff', { opacity: 0.48 });
  header(s, 'AQUA MOISTURE', '히알루론산\n수분감 레이어', '히알루론산 보습 성분을 담은 산뜻한 수분감 레이어 컨셉입니다.', { size: 52, bodyY: 252, bodyW: 360, bodySize: 20 });
  driveProduct(s, 478, 154, 210, 450);
  const items = [
    ['보습 성분 컨셉', '히알루론산 보습 성분'],
    ['수분감 레이어', '가볍게 겹쳐지는 보습 루틴'],
    ['가벼운 사용감', '산뜻한 데일리 보습 로션'],
  ];
  items.forEach((item, i) => {
    const y = 650 + i * 142;
    s.card(54, y, 672, 104, '#fffffff0', { r: 18, filter: 'softShadow' });
    s.circle(100, y + 52, 24, i === 0 ? c.sky : c.mint2, { stroke: c.line });
    s.text(String(i + 1).padStart(2, '0'), 88, y + 60, 24, 16, 900, c.blueDeep, { align: 'center' });
    s.text(item[0], 140, y + 44, 540, 21, 900, c.ink);
    s.text(item[1], 140, y + 78, 540, 17, 800, c.body);
  });
  s.card(54, 1125, 672, 118, '#e8f8f4f2', { r: 22, stroke: c.line, filter: 'softShadow' });
  s.text('수분감과 보습감을 더하는 데일리 아쿠아 로션', 92, 1190, 596, 25, 900, c.ink, { align: 'center' });
  return s;
}

function drawDailyUse() {
  const s = baseAqua();
  header(s, 'DAILY ROUTINE', '아침·저녁\n가볍게 펴 바르는 루틴', '토너 다음 단계부터 샤워 후 건조 부위까지, 300ml 용량으로 넉넉하게 사용합니다.', { size: 50, bodyY: 250 });
  const steps = [
    ['STEP 1', '토너 후 얼굴에 얇게 펴 바르기'],
    ['STEP 2', '샤워 후 건조한 팔·다리·목에 추가 사용'],
    ['STEP 3', '제조일자와 사용기한 확인 후 데일리 루틴'],
  ];
  steps.forEach((step, i) => {
    const y = 420 + i * 148;
    s.card(54, y, 672, 110, '#fffffff0', { r: 20, filter: 'softShadow' });
    s.text(step[0], 86, y + 62, 116, 22, 900, c.blueDeep);
    s.text(step[1], 206, y + 62, 470, 22, 850, c.ink);
  });
  s.image(driveCloseup, 54, 872, 672, 278, { r: 26, stroke: c.line });
  s.card(54, 1190, 672, 112, '#e8f8f4f2', { r: 22, stroke: c.line, filter: 'softShadow' });
  s.text('끈적임 부담을 줄인 산뜻한 수분 보습 루틴', 90, 1255, 600, 27, 900, c.ink, { align: 'center' });
  return s;
}

function drawProductInfo() {
  const s = new Svg('#fbfdfc');
  s.rect(0, 0, W, H, 'url(#aquaWash)');
  header(s, 'PRODUCT NOTICE', '구매 전 확인하는\n기본 상품 정보', '제품 고시정보와 제조일자 확인 기준을 한 화면에 정리했습니다.', { size: 50, bodyY: 246, bodyW: 650 });
  const rows = [
    ['제품명', '유어스킨플러스 히알루론산 아쿠아 로션'],
    ['용량', '300ml / 10.14 fl. oz'],
    ['주요 사양', '모든 피부 타입'],
    ['사용기한', '제조일로부터 24개월 / 개봉 후 12개월'],
    ['제조업자·책임판매업자', '(주)유어스킨'],
    ['제조국', '대한민국'],
    ['기능성화장품', '해당 없음'],
  ];
  rows.forEach((row, i) => {
    const y = 410 + i * 82;
    s.rect(54, y, 192, 82, i % 2 ? '#e9f7f2' : '#dff2ec', { stroke: c.line });
    s.rect(246, y, 480, 82, '#ffffff', { stroke: c.line });
    s.text(row[0], 76, y + 50, 150, 19, 900, c.ink);
    s.text(row[1], 270, y + 50, 430, 20, 800, c.body);
  });
  s.card(54, 1024, 672, 180, '#e8f8f4f2', { r: 22, stroke: c.line, filter: 'softShadow' });
  s.text('안내 문구 기준', 90, 1082, 600, 22, 900, c.blueDeep, { align: 'center' });
  s.text('효능을 단정하지 않고 보습감, 사용감, 용량, 제조 이력 확인 중심으로 안내합니다.', 94, 1132, 592, 22, 850, c.ink, { align: 'center' });
  return s;
}

const cuts = [
  ['01-main-fresh-hero.jpg', '대표 이미지 후보', drawHero],
  ['02-fresh-manufacture-proof.jpg', '제조일자 확인 근거', drawFreshProof],
  ['03-hyaluronic-aqua-moisture.jpg', '히알루론산 보습 컨셉', drawHyaluronic],
  ['04-daily-use-routine.jpg', '사용 루틴', drawDailyUse],
  ['05-product-notice-and-claim-check.jpg', '상품 정보와 표현 검수', drawProductInfo],
];

const manifest = [];
for (const [file, title, draw] of cuts) {
  const svg = draw().svg();
  const out = path.join(cutsDir, file);
  await sharp(Buffer.from(svg)).jpeg({ quality: 95, mozjpeg: true }).toFile(out);
  manifest.push({
    file,
    title,
    path: `/coupang/images/aqua-lotion/renewal-2026-05-25-v8-fresh-set/cuts/${file}`,
    width: W,
    height: H,
  });
}

const previewPlaceholder = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="previewBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dff7f2"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#previewBg)"/>
  <rect x="54" y="420" width="672" height="420" rx="28" fill="#ffffff" stroke="#c9e5df"/>
  <text x="390" y="540" text-anchor="middle" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, Arial, sans-serif" font-size="48" font-weight="900" fill="#103a35">Yourskin+</text>
  <text x="390" y="620" text-anchor="middle" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, Arial, sans-serif" font-size="28" font-weight="800" fill="#087faa">AQUA LOTION DETAIL SET</text>
  <text x="390" y="710" text-anchor="middle" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, Arial, sans-serif" font-size="24" font-weight="800" fill="#315f59">Drive 제품 이미지 기반 상세 컷 5종</text>
</svg>`);

const contact = await sharp({
  create: {
    width: W * 2,
    height: H * 3,
    channels: 3,
    background: '#f4fbfa',
  },
})
  .composite(
    await Promise.all(
      manifest.map(async (item, i) => ({
        input: await sharp(path.join(cutsDir, item.file)).resize(W, H).toBuffer(),
        left: (i % 2) * W,
        top: Math.floor(i / 2) * H,
      }))
    ).then((items) => [
      ...items,
      {
        input: previewPlaceholder,
        left: W,
        top: H * 2,
      },
    ])
  )
  .jpeg({ quality: 92, mozjpeg: true })
  .toBuffer();

await fs.writeFile(path.join(previewDir, 'v8-fresh-contact-sheet.jpg'), contact);
await fs.writeFile(
  path.join(outDir, 'manifest.json'),
  JSON.stringify(
    {
      product: '유어스킨플러스 히알루론산 아쿠아 로션',
      generatedAt: new Date().toISOString(),
      sourceAssets: [
        '/coupang/images/aqua-lotion/assets/drive/aqua-lotion-packshot.png',
        '/coupang/images/aqua-lotion/assets/drive/aqua-lotion-lab-scene.png',
        '/coupang/images/aqua-lotion/assets/drive/aqua-lotion-water-scene.png',
        '/coupang/images/aqua-lotion/assets/drive/aqua-lotion-pump-closeup.png',
        '/coupang/images/aqua-lotion/assets/drive/aqua-lotion-transparent-main.png',
      ],
      backgroundTexture: '/coupang/images/aqua-lotion/generated/aqua-lotion-fresh-water-hero-v1.png',
      cuts: manifest,
      preview: '/coupang/images/aqua-lotion/renewal-2026-05-25-v8-fresh-set/preview/v8-fresh-contact-sheet.jpg',
    },
    null,
    2
  )
);

console.log(JSON.stringify({ outDir, cuts: manifest, preview: path.join(previewDir, 'v8-fresh-contact-sheet.jpg') }, null, 2));

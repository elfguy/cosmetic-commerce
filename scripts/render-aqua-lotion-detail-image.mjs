import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const sourceDir = path.join(root, 'public/coupang-detail/9218811640');
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/renewal-2026-05-24-v5');
const outFile = path.join(outDir, '05-aqua-lotion-full-detail-v5.png');

const W = 780;
const colors = {
  ink: '#16352f',
  body: '#435f59',
  muted: '#71817c',
  blue: '#1779b9',
  sky: '#e7f5fb',
  sky2: '#d9f1f7',
  mint: '#e5f5ee',
  leaf: '#4f845d',
  cream: '#fff8e7',
  white: '#ffffff',
  line: '#d5e5df',
  warn: '#a84638',
  dark: '#153730',
};

await fs.mkdir(outDir, { recursive: true });

const imageCache = new Map();
async function dataUri(file) {
  const full = path.join(root, file);
  if (!imageCache.has(full)) {
    const buf = await fs.readFile(full);
    const ext = path.extname(full).toLowerCase().replace('.', '') || 'png';
    imageCache.set(full, `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${buf.toString('base64')}`);
  }
  return imageCache.get(full);
}

const src = {};
for (let i = 1; i <= 15; i += 1) {
  src[i] = await dataUri(`public/coupang-detail/9218811640/${String(i).padStart(2, '0')}.png`);
}

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function widthOf(text, size) {
  let units = 0;
  for (const ch of text) {
    if (ch === ' ') units += 0.33;
    else if (/[0-9A-Za-z]/.test(ch)) units += 0.58;
    else if (/[.,:/·~%()#-]/.test(ch)) units += 0.36;
    else units += 0.94;
  }
  return units * size;
}

function wrapText(text, maxWidth, size) {
  const manual = String(text).split('\n');
  const lines = [];
  for (const part of manual) {
    const words = part.split(/(\s+)/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const next = line + word;
      if (line && widthOf(next, size) > maxWidth) {
        lines.push(line.trimEnd());
        line = word.trimStart();
      } else {
        line = next;
      }
    }
    if (line.trim()) lines.push(line.trim());
  }
  return lines;
}

class Svg {
  constructor() {
    this.y = 0;
    this.parts = [];
    this.defs = [];
    this.clipId = 0;
  }

  add(raw) {
    this.parts.push(raw);
  }

  section(h, bg, draw) {
    const y = this.y;
    this.add(`<rect x="0" y="${y}" width="${W}" height="${h}" fill="${bg}"/>`);
    draw(y, h);
    this.y += h;
  }

  rect(x, y, w, h, fill, opts = {}) {
    const r = opts.r ?? 0;
    const stroke = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}"` : '';
    const opacity = opts.opacity == null ? '' : ` opacity="${opts.opacity}"`;
    this.add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke}${opacity}/>`);
  }

  circle(cx, cy, r, fill, opts = {}) {
    const stroke = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}"` : '';
    const opacity = opts.opacity == null ? '' : ` opacity="${opts.opacity}"`;
    this.add(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${stroke}${opacity}/>`);
  }

  line(x1, y1, x2, y2, stroke, sw = 1, opacity = 1) {
    this.add(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`);
  }

  text(text, x, y, w, size, weight, color, opts = {}) {
    const lines = wrapText(text, w, size);
    const lh = opts.lh ?? 1.28;
    const anchor = opts.align === 'center' ? 'middle' : opts.align === 'right' ? 'end' : 'start';
    const tx = opts.align === 'center' ? x + w / 2 : opts.align === 'right' ? x + w : x;
    const family = 'Apple SD Gothic Neo, Noto Sans CJK KR, AppleGothic, Arial, sans-serif';
    const letter = opts.letter == null ? '' : ` letter-spacing="${opts.letter}"`;
    this.add(`<text x="${tx}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}"${letter}>`);
    lines.forEach((line, i) => {
      const dy = i === 0 ? 0 : size * lh;
      this.add(`<tspan x="${tx}" dy="${i === 0 ? 0 : dy}">${esc(line)}</tspan>`);
    });
    this.add('</text>');
    return lines.length * size * lh;
  }

  pill(text, x, y, fill, color, opts = {}) {
    const size = opts.size ?? 19;
    const padX = opts.px ?? 18;
    const padY = opts.py ?? 10;
    const w = Math.ceil(widthOf(text, size) + padX * 2);
    const h = size + padY * 2;
    this.rect(x, y, w, h, fill, { r: opts.r ?? 18, stroke: opts.stroke });
    this.text(text, x + padX, y + padY + size * 0.78, w - padX * 2, size, opts.weight ?? 800, color, { align: 'center', lh: 1 });
    return { w, h };
  }

  card(x, y, w, h, fill = colors.white, opts = {}) {
    this.rect(x, y, w, h, fill, { r: opts.r ?? 26, stroke: opts.stroke ?? colors.line, sw: opts.sw ?? 1 });
  }

  image(uri, x, y, w, h, opts = {}) {
    const id = `clip${this.clipId++}`;
    const r = opts.r ?? 0;
    if (r) {
      this.defs.push(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>`);
      this.add(`<image href="${uri}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${opts.fit ? 'xMidYMid meet' : 'xMidYMid slice'}" clip-path="url(#${id})"/>`);
      if (opts.stroke) this.rect(x, y, w, h, 'none', { r, stroke: opts.stroke, sw: opts.sw ?? 1 });
    } else {
      this.add(`<image href="${uri}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${opts.fit ? 'xMidYMid meet' : 'xMidYMid slice'}"/>`);
    }
  }

  crop(uri, x, y, w, h, sx, sy, sw, sh, opts = {}) {
    const id = `clip${this.clipId++}`;
    const scale = Math.max(w / sw, h / sh);
    const ix = x - sx * scale;
    const iy = y - sy * scale;
    const iw = 780 * scale;
    const ih = 1360 * scale;
    this.defs.push(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${opts.r ?? 0}"/></clipPath>`);
    this.add(`<image href="${uri}" x="${ix}" y="${iy}" width="${iw}" height="${ih}" preserveAspectRatio="none" clip-path="url(#${id})"/>`);
    if (opts.stroke) this.rect(x, y, w, h, 'none', { r: opts.r ?? 0, stroke: opts.stroke, sw: opts.sw ?? 1 });
  }
}

const s = new Svg();

function topLabel(y, text, x = 54) {
  s.pill(text, x, y, colors.dark, colors.white, { size: 14, px: 13, py: 7, r: 6 });
}

function bullet(x, y, text, color = colors.blue) {
  s.circle(x + 10, y - 6, 10, color);
  s.text('✓', x + 3, y - 1, 14, 15, 900, colors.white);
  s.text(text, x + 32, y, 560, 23, 800, colors.ink);
}

function smallCard(x, y, w, h, title, body, fill = colors.white) {
  s.card(x, y, w, h, fill);
  s.text(title, x + 22, y + 38, w - 44, 25, 900, colors.ink);
  s.text(body, x + 22, y + 82, w - 44, 18, 600, colors.body);
}

s.section(1360, 'url(#heroGrad)', (y) => {
  s.defs.push(`<linearGradient id="heroGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#effaff"/><stop offset="54%" stop-color="#d9f3fb"/><stop offset="100%" stop-color="#eef8f1"/></linearGradient>`);
  s.circle(150, y + 240, 210, colors.white, { opacity: 0.42 });
  s.circle(690, y + 560, 250, '#b8e7f5', { opacity: 0.42 });
  s.circle(135, y + 1035, 170, '#ffffff', { opacity: 0.35 });
  topLabel(y + 70, 'AQUA LOTION 300ml');
  s.text('Yourskin+', 54, y + 156, 290, 30, 900, colors.ink, { letter: 1.2 });
  s.text('크림은 무겁고\n토너는 부족할 때', 54, y + 250, 405, 46, 900, colors.ink);
  s.text('끈적임 없이 산뜻하게, 수분·진정·보호를 한 번에 챙기는 데일리 아쿠아 로션', 56, y + 405, 295, 23, 700, colors.body);
  s.crop(src[1], 390, y + 235, 300, 690, 260, 360, 280, 690, { r: 34, stroke: '#b7dce8' });
  s.rect(360, y + 890, 300, 70, '#ffffffcc', { r: 18 });
  s.text('제조 6개월 이내 신선 제품 보장', 382, y + 935, 260, 22, 900, colors.leaf, { align: 'center' });
  const tags = ['#수분충전', '#피부진정', '#약산성', '#무향'];
  tags.forEach((tag, i) => {
    const px = i % 2 === 0 ? 56 : 185;
    const py = y + 548 + Math.floor(i / 2) * 54;
    s.pill(tag, px, py, colors.white, colors.blue, { size: 18, px: 16, py: 10, r: 18, stroke: '#cce7ee' });
  });
  s.card(56, y + 720, 300, 175, colors.white);
  s.text('현재 판매 기준', 82, y + 765, 246, 20, 900, colors.blue, { align: 'center' });
  s.text('10,300원', 82, y + 825, 246, 40, 900, colors.ink, { align: 'center' });
  s.text('정상가 19,000원 · 46% 할인', 82, y + 870, 246, 18, 700, colors.muted, { align: 'center' });
  s.rect(0, y + 1160, W, 200, colors.dark);
  s.text('Hyaluronic Acid Aqua Lotion', 54, y + 1230, 500, 30, 900, colors.white);
  s.text('8중 히알루론산 · 병풀추출물 · 해양심층수 · Fresh Bud No.6', 54, y + 1275, 630, 20, 700, '#d8eee8');
});

s.section(1120, colors.white, (y) => {
  topLabel(y + 64, 'ORIGINAL 02 재구성');
  s.text('이런 피부 루틴에\n잘 맞습니다', 54, y + 155, 520, 54, 900, colors.ink);
  s.text('원본의 추천 대상을 줄이지 않고, 구매자가 바로 읽을 수 있는 체크리스트로 정리했습니다.', 54, y + 292, 455, 23, 700, colors.body);
  s.crop(src[1], 590, y + 74, 110, 220, 270, 500, 250, 520, { r: 20, stroke: colors.line });
  const checks = [
    '속건조가 느껴져 보습 단계를 보완하고 싶은 분',
    '수분과 유분을 함께 챙기는 로션을 찾는 분',
    '끈적임보다 산뜻하고 촉촉한 사용감을 선호하는 분',
    '거칠어진 피부결을 부드럽게 정돈하고 싶은 분',
    '가족이 함께 쓰기 좋은 대용량 로션이 필요한 분',
  ];
  let by = y + 430;
  checks.forEach((c, i) => {
    s.card(54, by, 672, 96, i % 2 ? colors.white : colors.sky, { r: 22 });
    s.circle(94, by + 48, 22, i % 2 ? colors.mint : colors.white, { stroke: colors.line });
    s.text(String(i + 1).padStart(2, '0'), 81, by + 57, 26, 18, 900, colors.blue, { align: 'center' });
    s.text(c, 134, by + 58, 540, 24, 800, colors.ink);
    by += 112;
  });
});

s.section(1390, colors.mint, (y) => {
  topLabel(y + 64, 'ORIGINAL 03 목차화');
  s.text('구매 전에 확인할\n8가지 근거', 54, y + 150, 520, 54, 900, colors.ink);
  s.text('아래 상세 컷에서 하나씩 설명되는 핵심 메시지입니다.', 54, y + 285, 560, 23, 700, colors.body);
  const reasons = [
    ['01', '8중 히알루론산', '수분감을 겹겹이 더하는 레이어 보습 컨셉'],
    ['02', '병풀·해양심층수', '편안함과 촉촉함을 고려한 자연 유래 원료'],
    ['03', 'AHA·PHA', '거칠어진 피부결을 부드럽게 정돈'],
    ['04', 'Fresh Bud No.6', '새싹 유래 특허 원료 조성물'],
    ['05', '발효추출물', '피부 컨디션 케어를 위한 발효 성분'],
    ['06', '식물오일 블렌딩', '마카다미아·해바라기·로즈힙 오일'],
    ['07', '저자극·EWG·pH', '시험 결과, 그린 등급, 약산성 설계'],
    ['08', '신선 제조', '제조일자 표기와 6개월 이내 출고'],
  ];
  reasons.forEach((r, i) => {
    const x = 54 + (i % 2) * 344;
    const yy = y + 405 + Math.floor(i / 2) * 215;
    s.card(x, yy, 320, 178, colors.white, { r: 24 });
    s.pill(r[0], x + 22, yy + 22, colors.sky, colors.blue, { size: 16, px: 12, py: 7, r: 12 });
    s.text(r[1], x + 22, yy + 78, 276, 25, 900, colors.ink);
    s.text(r[2], x + 22, yy + 118, 276, 17, 600, colors.body);
  });
});

s.section(1260, colors.white, (y) => {
  topLabel(y + 64, 'ORIGINAL 04');
  s.text('8중 히알루론산\n레이어 보습', 54, y + 150, 460, 54, 900, colors.ink);
  s.text('고·중·저분자 히알루론산 조합으로 겉부터 속까지 수분감을 겹겹이 더하는 컨셉을 보여줍니다.', 54, y + 285, 575, 23, 700, colors.body);
  s.crop(src[4], 460, y + 385, 245, 560, 260, 250, 300, 730, { r: 34, stroke: colors.line });
  const levels = [
    ['고분자', '피부 표면에 수분 보호막 같은 보습감'],
    ['중분자', '촉촉함이 이어지는 수분 레이어'],
    ['저분자', '가볍게 스며드는 듯한 산뜻한 마무리'],
  ];
  levels.forEach((v, i) => smallCard(54, y + 430 + i * 170, 360, 138, v[0], v[1], i === 1 ? colors.sky : colors.cream));
  s.text('소듐하이알루로네이트 2,050ppm 외 7종 히알루론산 원료 함유', 54, y + 1010, 640, 24, 900, colors.blue, { align: 'center' });
  s.text('상기 내용은 원료적 특성에 한함', 54, y + 1070, 640, 17, 700, colors.muted, { align: 'center' });
});

s.section(1260, colors.cream, (y) => {
  topLabel(y + 64, 'ORIGINAL 05');
  s.text('수분·편안함·피부결을\n역할별로 정리', 54, y + 150, 610, 52, 900, colors.ink);
  s.text('성분명을 나열하기보다 구매자가 기대하는 사용감으로 다시 묶었습니다.', 54, y + 285, 575, 23, 700, colors.body);
  s.crop(src[5], 560, y + 72, 140, 220, 80, 580, 600, 550, { r: 20, stroke: colors.line });
  smallCard(54, y + 410, 208, 260, '병풀추출물', '민감해지기 쉬운 피부를 편안하게 케어하는 원료로 소개합니다.', colors.white);
  smallCard(286, y + 410, 208, 260, '해양심층수', '건조함이 느껴지는 피부에 수분감을 더하는 원료로 배치합니다.', colors.white);
  smallCard(518, y + 410, 208, 260, 'AHA·PHA', '시트릭애씨드와 글루코락톤으로 피부결 케어를 설명합니다.', colors.white);
  s.card(54, y + 760, 672, 230, colors.white);
  bullet(92, y + 835, '수분은 더 촉촉하게');
  bullet(92, y + 900, '피부는 더 편안하게', colors.leaf);
  bullet(92, y + 965, '피부결은 더 매끄럽게', colors.blue);
  s.text('상기 내용은 원료적 특성에 한함', 54, y + 1095, 672, 17, 700, colors.muted, { align: 'center' });
});

s.section(1180, '#edf6ff', (y) => {
  topLabel(y + 64, 'ORIGINAL 06');
  s.text('Fresh Bud No.6', 54, y + 155, 560, 56, 900, colors.ink);
  s.text('민감한 피부를 위해 설계된 새싹 유래 특허 원료 조성물', 54, y + 235, 590, 26, 900, colors.blue);
  s.crop(src[6], 520, y + 70, 160, 240, 70, 540, 630, 590, { r: 20, stroke: '#bfd7ea' });
  const sprouts = ['브로콜리', '알팔파', '양배추', '밀싹', '청경채 계열', '무순 계열'];
  sprouts.forEach((v, i) => {
    const x = 54 + (i % 3) * 224;
    const yy = y + 410 + Math.floor(i / 3) * 140;
    s.card(x, yy, 200, 104, colors.white, { r: 22, stroke: '#cbddeb' });
    s.text(v, x + 20, yy + 63, 160, 23, 900, colors.ink, { align: 'center' });
  });
  s.card(54, y + 735, 672, 230, colors.white, { stroke: '#cbddeb' });
  s.text('특허 표시 문구', 90, y + 795, 600, 26, 900, colors.ink, { align: 'center' });
  s.text('피부 진정 효과를 가지는 혼합 새싹 추출물을 함유한 화장료 조성물', 108, y + 865, 560, 23, 800, colors.body, { align: 'center' });
  s.text('상기 내용은 원료적 특성에 한함', 54, y + 1045, 672, 17, 700, colors.muted, { align: 'center' });
});

s.section(1170, colors.white, (y) => {
  topLabel(y + 64, 'ORIGINAL 07');
  s.text('발효 성분과 식물오일을\n한 번에 이해되게', 54, y + 150, 620, 52, 900, colors.ink);
  s.text('피부 컨디션 케어와 보습 보호감으로 나눠 원본 정보를 유지했습니다.', 54, y + 285, 590, 23, 700, colors.body);
  s.crop(src[7], 580, y + 70, 120, 185, 120, 560, 560, 580, { r: 18, stroke: colors.line });
  s.card(54, y + 420, 320, 430, colors.mint);
  s.text('발효가 만든 컨디션', 80, y + 485, 270, 30, 900, colors.leaf);
  ['효모/겨우살이발효추출물', '효모/띠뿌리발효추출물', '락토바실러스/콩발효추출물'].forEach((v, i) => {
    s.rect(82, y + 555 + i * 66, 250, 46, colors.white, { r: 12 });
    s.text(v, 100, y + 585 + i * 66, 214, 17, 800, colors.ink, { align: 'center' });
  });
  s.card(406, y + 420, 320, 430, colors.cream);
  s.text('식물오일 보습 보호감', 432, y + 485, 270, 30, 900, colors.blue);
  ['마카다미아씨오일', '해바라기씨오일', '로즈힙열매오일'].forEach((v, i) => {
    s.rect(434, y + 555 + i * 66, 250, 46, colors.white, { r: 12 });
    s.text(v, 452, y + 585 + i * 66, 214, 17, 800, colors.ink, { align: 'center' });
  });
  s.text('상기 내용은 원료적 특성에 한함', 54, y + 995, 672, 17, 700, colors.muted, { align: 'center' });
});

s.section(1180, '#f5fbff', (y) => {
  topLabel(y + 64, 'ORIGINAL 08');
  s.text('피부 저자극 테스트\n완료 근거', 54, y + 150, 510, 52, 900, colors.ink);
  s.text('시험 정보를 숫자와 기관 중심으로 정리해 구매 불안을 줄입니다.', 54, y + 285, 590, 23, 700, colors.body);
  s.crop(src[8], 455, y + 360, 245, 330, 390, 500, 330, 450, { r: 20, stroke: '#bfd7ea' });
  s.card(54, y + 390, 330, 300, colors.white, { stroke: '#bfd7ea' });
  s.text('자극지수', 90, y + 455, 260, 28, 900, colors.blue, { align: 'center' });
  s.text('0.00', 90, y + 555, 260, 78, 900, colors.ink, { align: 'center' });
  s.text('비(무)자극 제품 인증', 90, y + 620, 260, 25, 900, colors.body, { align: 'center' });
  const facts = [
    ['시험번호', 'KDRI-2026-0265'],
    ['시험명', '피부자극평가시험'],
    ['시험기관', '대한피부과학연구소'],
    ['시험대상', '32명'],
    ['시험기간', '2025.11.24~2025.11.27'],
  ];
  facts.forEach((v, i) => {
    s.card(54, y + 760 + i * 70, 672, 54, i % 2 ? colors.white : colors.sky);
    s.text(v[0], 80, y + 795 + i * 70, 150, 18, 900, colors.blue);
    s.text(v[1], 230, y + 795 + i * 70, 460, 18, 800, colors.ink);
  });
  s.text('※ 모든 피부에 동일한 반응을 보장하는 의미가 아니며, 개인차가 있을 수 있습니다.', 54, y + 1120, 672, 16, 700, colors.muted, { align: 'center' });
});

s.section(1240, colors.white, (y) => {
  topLabel(y + 64, 'ORIGINAL 09-10');
  s.text('EWG 그린 등급과\n약산성 pH 설계', 54, y + 150, 560, 52, 900, colors.ink);
  s.text('원본의 신뢰 근거를 한 화면에서 확인할 수 있게 묶었습니다.', 54, y + 285, 590, 23, 700, colors.body);
  smallCard(54, y + 410, 320, 260, '전성분 EWG 그린', '원료 안전성 정보를 1~10등급으로 분류하는 EWG 기준에서 그린 등급 메시지를 강조합니다.', colors.mint);
  smallCard(406, y + 410, 320, 260, 'Fragrance Free', '향료와 에센셜오일을 더하지 않고 원료 고유의 자연스러운 향만 남기는 무향 설계입니다.', '#edf6ff');
  s.card(54, y + 750, 672, 250, colors.white);
  s.text('pH 5.0 ~ 6.5', 90, y + 835, 600, 56, 900, colors.blue, { align: 'center' });
  s.rect(112, y + 895, 556, 36, '#e9effb', { r: 18 });
  s.rect(298, y + 895, 184, 36, colors.mint, { r: 18 });
  s.text('산성', 112, y + 965, 120, 18, 800, colors.muted);
  s.text('약산성', 310, y + 965, 160, 20, 900, colors.ink, { align: 'center' });
  s.text('알칼리성', 548, y + 965, 120, 18, 800, colors.muted, { align: 'right' });
  s.text('피부와 유사한 약산성 루틴으로 아침·저녁 부담 없이 쓰는 보습 단계', 54, y + 1110, 672, 22, 800, colors.body, { align: 'center' });
});

s.section(1230, '#f0f7ed', (y) => {
  topLabel(y + 64, 'ORIGINAL 11');
  s.text('제조일자를 보여주는\n신선함의 기준', 54, y + 150, 560, 52, 900, colors.ink);
  s.text('사용기한만 보는 것이 아니라 제조번호와 제조일자를 함께 확인할 수 있다는 점을 별도 컷으로 유지했습니다.', 54, y + 285, 600, 23, 700, colors.body);
  s.crop(src[11], 545, y + 72, 155, 230, 90, 640, 600, 620, { r: 18, stroke: colors.line });
  s.card(54, y + 430, 320, 335, colors.white);
  s.text('유어스킨플러스', 80, y + 490, 268, 28, 900, colors.leaf, { align: 'center' });
  s.text('제조번호와\n제조일자를 표기', 88, y + 570, 250, 32, 900, colors.ink, { align: 'center' });
  s.text('예: A2507191\n제조 2025.07.19', 88, y + 680, 250, 23, 800, colors.body, { align: 'center' });
  s.card(406, y + 430, 320, 335, colors.white);
  s.text('일부 타사 제품', 432, y + 490, 268, 28, 900, colors.muted, { align: 'center' });
  s.text('제조번호와\n사용기한만 표기', 440, y + 570, 250, 32, 900, colors.ink, { align: 'center' });
  s.text('예: A39\n2026.03.29까지', 440, y + 680, 250, 23, 800, colors.body, { align: 'center' });
  s.rect(54, y + 840, 672, 150, colors.dark, { r: 26 });
  s.text('제조일로부터 6개월 이내 제품만 출고', 90, y + 910, 600, 32, 900, colors.white, { align: 'center' });
  s.text('오래된 재고와 사용기한 임박 제품에 대한 불안을 줄이는 핵심 메시지입니다.', 90, y + 955, 600, 20, 700, '#d9ece5', { align: 'center' });
});

s.section(1080, colors.cream, (y) => {
  topLabel(y + 64, 'ORIGINAL 12');
  s.text('사용법과 펌프 오픈을\n한 컷에서 확인', 54, y + 150, 560, 52, 900, colors.ink);
  s.text('사용법은 짧게, 펌프가 눌리지 않을 때 확인할 OPEN/STOP 안내는 크게 배치했습니다.', 54, y + 285, 600, 23, 700, colors.body);
  s.crop(src[12], 560, y + 72, 140, 220, 90, 530, 590, 620, { r: 18, stroke: colors.line });
  s.card(54, y + 410, 672, 96, colors.white);
  s.text('STEP 1', 84, y + 470, 120, 23, 900, colors.blue);
  s.text('적당량을 덜어 얼굴에 골고루 펴 바른 후 두드리듯 흡수시켜 줍니다.', 210, y + 470, 470, 22, 800, colors.ink);
  s.card(54, y + 530, 672, 96, colors.white);
  s.text('STEP 2', 84, y + 590, 120, 23, 900, colors.blue);
  s.text('건조함이 느껴지는 부위에는 한 번 더 덧발라 보습감을 보완합니다.', 210, y + 590, 470, 22, 800, colors.ink);
  s.card(54, y + 700, 320, 185, colors.white);
  s.text('OPEN', 100, y + 785, 230, 42, 900, colors.blue, { align: 'center' });
  s.text('사용 전 OPEN 방향으로 돌려주세요', 92, y + 835, 244, 18, 800, colors.body, { align: 'center' });
  s.card(406, y + 700, 320, 185, '#fff1ec');
  s.text('STOP', 452, y + 785, 230, 42, 900, colors.warn, { align: 'center' });
  s.text('STOP 상태에서는 펌프가 눌리지 않습니다', 444, y + 835, 244, 18, 800, colors.body, { align: 'center' });
});

s.section(1160, colors.white, (y) => {
  topLabel(y + 64, 'ORIGINAL 13');
  s.text('불필요한 포장은 줄이고\n제조사가 직접 판매', 54, y + 150, 620, 52, 900, colors.ink);
  s.text('친환경 포장과 직접 제조·직접 판매 메시지를 후반 신뢰 파트로 유지했습니다.', 54, y + 285, 600, 23, 700, colors.body);
  smallCard(54, y + 410, 208, 240, '단상자 축소', '불필요한 개별 단상자 사용을 줄입니다.', colors.mint);
  smallCard(286, y + 410, 208, 240, '수축필름 제거', '과한 포장보다 필요한 보호를 우선합니다.', colors.sky);
  smallCard(518, y + 410, 208, 240, '완충재 절감', '배송 보호에 필요한 범위만 사용합니다.', colors.mint);
  s.rect(54, y + 730, 672, 150, colors.dark, { r: 26 });
  s.text('제조사가 직접 만들어 직접 판매합니다', 90, y + 800, 600, 31, 900, colors.white, { align: 'center' });
  s.text('패키지와 광고비를 줄이고 중간마진 부담을 낮춘 가격 구조', 90, y + 846, 600, 20, 700, '#d9ece5', { align: 'center' });
  s.text('화장품제조업자 및 책임판매업자: (주)유어스킨 / 인천시 서구 염곡로 89', 54, y + 1010, 672, 20, 800, colors.body, { align: 'center' });
});

s.section(1480, '#fbfbf7', (y) => {
  topLabel(y + 64, 'ORIGINAL 14');
  s.text('제품 고시정보는\n읽기 쉬운 표로', 54, y + 150, 470, 52, 900, colors.ink);
  s.text('필수 정보를 빠뜨리지 않고, 구매자가 확인하기 쉽게 한 컷으로 정리합니다.', 54, y + 285, 590, 23, 700, colors.body);
  const rows = [
    ['제품명', '유어스킨플러스 히알루론산 아쿠아 로션'],
    ['용량', '300ml / 10.14 fl. oz'],
    ['주요 사양', '모든 피부 타입'],
    ['사용기한', '제조일로부터 24개월 / 개봉 후 12개월'],
    ['제조업자·책임판매업자', '(주)유어스킨'],
    ['제조국', '대한민국'],
    ['상담', '032-682-6533 / 10:00~17:00'],
  ];
  rows.forEach((v, i) => {
    const yy = y + 410 + i * 78;
    s.rect(54, yy, 672, 58, i % 2 ? colors.white : colors.mint, { r: 12, stroke: colors.line });
    s.text(v[0], 76, yy + 37, 190, 17, 900, colors.blue);
    s.text(v[1], 272, yy + 37, 420, 17, 800, colors.ink);
  });
  s.card(54, y + 1010, 672, 235, colors.white);
  s.text('사용 시 주의사항', 84, y + 1070, 610, 25, 900, colors.ink);
  s.text('이상 증상 시 전문의 상담 / 상처 부위 사용 자제 / 어린이 손이 닿지 않는 곳 보관 / 직사광선 피하기', 84, y + 1120, 610, 20, 700, colors.body);
  s.text('품질보증: 본 제품에 이상이 있을 경우 소비자분쟁해결기준에 의해 보상 받을 수 있습니다.', 84, y + 1195, 610, 18, 700, colors.muted);
  s.text('전성분은 별도 원본 라벨 대조 후 최종 업로드 권장', 54, y + 1360, 672, 17, 800, colors.muted, { align: 'center' });
});

s.section(1280, colors.white, (y) => {
  topLabel(y + 64, 'ORIGINAL 14 세부');
  s.text('전성분과 성분 축을\n한 번 더 확인', 54, y + 150, 550, 52, 900, colors.ink);
  s.text('원본 전성분은 축소하지 않고 유지하되, 핵심 성분 축을 함께 보여 읽는 부담을 낮췄습니다.', 54, y + 285, 610, 23, 700, colors.body);
  s.card(54, y + 410, 672, 520, '#fbfbf7');
  s.text('전성분', 84, y + 465, 610, 25, 900, colors.ink);
  s.text('정제수, 글리세린, 카프릴릭/카프릭트라이글리세라이드, 프로판다이올, 글리세릴스테아레이트에스이, 다이프로필렌글라이콜, 마카다미아씨오일, 해바라기씨오일, 하이드록시아세토페논, 솔비탄스테아레이트, 카보머, 카프릴릴글라이콜, 세테아릴알코올, 시어버터, 소듐하이알루로네이트(2,050ppm), 알지닌, 해수, 부틸렌글라이콜, 로즈힙열매오일, 1,2-헥산다이올, 토코페롤, 병풀추출물, 효모/겨우살이발효추출물, 효모/띠뿌리발효추출물, 락토바실러스/콩발효추출물, 다이포타슘글리시리제이트, 밀싹추출물, 브로콜리추출물, 양배추추출물, 자주개자리추출물, 하이드록시프로필트라이모늄하이알루로네이트, 무씨추출물, 유채추출물, 소듐아세틸레이티드하이알루로네이트(0.5ppm), 하이드롤라이즈드하이알루로닉애씨드(0.5ppm), 하이알루로닉애씨드(0.125ppm), 소듐하이알루로네이트크로스폴리머(0.05ppm), 하이드롤라이즈드소듐하이알루로네이트(0.05ppm), 포타슘하이알루로네이트(0.01ppm)', 84, y + 525, 610, 17, 600, colors.body);
  const tags = ['8중 히알루론산', '병풀추출물', '해양심층수', 'AHA·PHA', '발효추출물 3종', '식물오일 3종', 'Fresh Bud No.6', '무향'];
  let tx = 84;
  let ty = y + 980;
  tags.forEach((tag) => {
    const p = s.pill(tag, tx, ty, tx % 2 ? colors.mint : colors.sky, colors.ink, { size: 16, px: 14, py: 8, r: 14 });
    tx += p.w + 10;
    if (tx > 620) {
      tx = 84;
      ty += 48;
    }
  });
  s.text('※ 전성분은 원본 OCR 기준이며, 최종 제작 전 실제 용기 라벨과 한 번 더 대조합니다.', 54, y + 1190, 672, 16, 700, colors.muted, { align: 'center' });
});

s.section(1160, '#fff1ec', (y) => {
  topLabel(y + 64, 'ORIGINAL 15');
  s.text('무단 리셀러 유통 제품\n구매 전 확인하세요', 54, y + 150, 610, 52, 900, colors.ink);
  s.text('고객 보호와 상담·보상 범위를 안내하는 중요한 정보라 마지막에 강하게 유지했습니다.', 54, y + 285, 600, 23, 700, colors.body);
  smallCard(54, y + 410, 320, 205, '판매자 확인', '공식 판매자명이 ‘(주)유어스킨’인지 확인하세요.', colors.white);
  smallCard(406, y + 410, 320, 205, '비정상 유통 위험', '보관 상태와 사용기한, 정품 여부 확인이 어려울 수 있습니다.', colors.white);
  smallCard(54, y + 655, 320, 205, '가격 역전 가능성', '무단 리셀러 제품은 공식 가격보다 높게 판매될 수 있습니다.', colors.white);
  smallCard(406, y + 655, 320, 205, '상담·보상 제한', '비정상 유통 제품은 교환·환불·상담이 제한될 수 있습니다.', colors.white);
  s.rect(54, y + 920, 672, 190, colors.dark, { r: 26 });
  s.text('공식 판매처에서 제조일자를 확인하고\n구매하세요', 90, y + 990, 600, 27, 900, colors.white, { align: 'center' });
  s.text('히알루론산 아쿠아 로션 300ml / 데일리 수분 보습 루틴', 90, y + 1078, 600, 20, 700, '#d9ece5', { align: 'center' });
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${s.y}" viewBox="0 0 ${W} ${s.y}">
  <defs>${s.defs.join('\n')}</defs>
  ${s.parts.join('\n')}
</svg>`;

await fs.writeFile(path.join(outDir, '05-aqua-lotion-full-detail-v5.svg'), svg);
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outFile);

const cropSpecs = [
  ['preview-top.png', 0, 0, 780, 1800],
  ['preview-middle.png', 0, Math.floor(s.y / 2) - 900, 780, 1800],
  ['preview-bottom.png', 0, s.y - 1800, 780, 1800],
];
for (const [name, left, top, width, height] of cropSpecs) {
  await sharp(outFile).extract({ left, top: Math.max(0, top), width, height }).toFile(path.join(outDir, name));
}

console.log(JSON.stringify({ outFile, width: W, height: s.y, previews: cropSpecs.map(([name]) => path.join(outDir, name)) }, null, 2));

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const srcDir = path.join(root, 'public/coupang-detail/9218811640');
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/renewal-2026-05-25-v6');
const cutsDir = path.join(outDir, 'cuts');
const bundlesDir = path.join(outDir, 'bundles');
const previewDir = path.join(outDir, 'preview');

const W = 780;
const H = 1360;

const colors = {
  ink: '#143730',
  body: '#405d56',
  muted: '#71827d',
  blue: '#1479b8',
  blue2: '#dff3fb',
  mint: '#e8f6f1',
  mint2: '#d9f1e8',
  cream: '#fff7e4',
  blush: '#fff0eb',
  white: '#ffffff',
  line: '#d6e4df',
  leaf: '#4c835e',
  gold: '#ead28a',
  warn: '#a34838',
  dark: '#123c34',
  paper: '#fbfcfb',
};

await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(cutsDir, { recursive: true });
await fs.mkdir(bundlesDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const src = {};
for (let i = 1; i <= 15; i += 1) {
  const file = path.join(srcDir, `${String(i).padStart(2, '0')}.png`);
  const buf = await fs.readFile(file);
  src[i] = `data:image/png;base64,${buf.toString('base64')}`;
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
    else if (/[.,:/·~%()#&+-]/.test(ch)) units += 0.36;
    else units += 0.94;
  }
  return units * size;
}

function wrap(text, maxWidth, size) {
  const lines = [];
  for (const part of String(text).split('\n')) {
    const chars = [...part];
    let line = '';
    for (const ch of chars) {
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
    this.defs = [];
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
    this.add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke}${opacity}/>`);
  }

  circle(cx, cy, r, fill, opts = {}) {
    const stroke = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}"` : '';
    const opacity = opts.opacity == null ? '' : ` opacity="${opts.opacity}"`;
    this.add(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${stroke}${opacity}/>`);
  }

  text(text, x, y, w, size, weight, color, opts = {}) {
    const lines = wrap(text, w, size);
    const family = 'Apple SD Gothic Neo, Noto Sans CJK KR, AppleGothic, Arial, sans-serif';
    const anchor = opts.align === 'center' ? 'middle' : opts.align === 'right' ? 'end' : 'start';
    const tx = opts.align === 'center' ? x + w / 2 : opts.align === 'right' ? x + w : x;
    const lh = opts.lh ?? 1.24;
    const letter = opts.letter == null ? '' : ` letter-spacing="${opts.letter}"`;
    this.add(`<text x="${tx}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}"${letter}>`);
    lines.forEach((line, i) => {
      this.add(`<tspan x="${tx}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`);
    });
    this.add('</text>');
  }

  pill(text, x, y, fill, color, opts = {}) {
    const size = opts.size ?? 17;
    const px = opts.px ?? 15;
    const py = opts.py ?? 8;
    const w = Math.ceil(widthOf(text, size) + px * 2);
    const h = Math.ceil(size + py * 2);
    this.rect(x, y, w, h, fill, { r: opts.r ?? 999, stroke: opts.stroke, sw: opts.sw ?? 1 });
    this.text(text, x + px, y + py + size * 0.78, w - px * 2, size, opts.weight ?? 800, color, { align: 'center', lh: 1 });
    return { w, h };
  }

  card(x, y, w, h, fill = colors.white, opts = {}) {
    this.rect(x, y, w, h, fill, { r: opts.r ?? 28, stroke: opts.stroke ?? colors.line, sw: opts.sw ?? 1 });
  }

  image(uri, x, y, w, h, opts = {}) {
    const id = `clip${this.clipId++}`;
    const r = opts.r ?? 0;
    this.defs.push(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>`);
    this.add(`<image href="${uri}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${opts.fit ? 'xMidYMid meet' : 'xMidYMid slice'}" clip-path="url(#${id})"/>`);
    if (opts.stroke) this.rect(x, y, w, h, 'none', { r, stroke: opts.stroke, sw: opts.sw ?? 1 });
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

  line(x1, y1, x2, y2, stroke, sw = 1, opacity = 1) {
    this.add(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`);
  }

  svg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>${this.defs.join('\n')}</defs>
${this.parts.join('\n')}
</svg>`;
  }
}

function label(s, text, y = 62) {
  s.pill(text, 54, y, colors.dark, colors.white, { size: 14, px: 12, py: 7, r: 7 });
}

function footnote(s, text) {
  s.text(text, 54, 1278, 672, 16, 700, colors.muted, { align: 'center' });
}

function productBottle(s, x, y, w, h) {
  s.crop(src[1], x, y, w, h, 268, 430, 250, 560, { r: 28, stroke: '#b8deeb' });
}

function checkItem(s, y, no, text) {
  s.card(54, y, 672, 88, no % 2 ? colors.white : colors.blue2, { r: 20 });
  s.circle(94, y + 44, 22, no % 2 ? colors.mint : colors.white, { stroke: colors.line });
  s.text(String(no).padStart(2, '0'), 82, y + 52, 24, 17, 900, colors.blue, { align: 'center' });
  s.text(text, 132, y + 53, 550, 23, 800, colors.ink);
}

const cuts = [
  {
    file: '01-hero-hook.jpg',
    title: '첫 후킹',
    draw() {
      const s = new Svg('#e9f8fd');
      s.circle(120, 220, 250, colors.white, { opacity: 0.48 });
      s.circle(705, 540, 230, '#c7eef7', { opacity: 0.58 });
      s.circle(160, 1000, 170, colors.white, { opacity: 0.5 });
      label(s, 'AQUA LOTION 300ml');
      s.text('Yourskin+', 54, 160, 320, 31, 900, colors.ink, { letter: 1 });
      s.text('크림은 무겁고\n토너는 부족할 때', 54, 260, 390, 47, 900, colors.ink);
      s.text('끈적임 없이 산뜻하게,\n수분·진정·보호를 한 번에\n챙기는 데일리 아쿠아 로션', 56, 410, 330, 24, 800, colors.body);
      productBottle(s, 410, 245, 280, 650);
      [['#수분충전', 56, 585], ['#피부진정', 190, 585], ['#약산성', 56, 640], ['#무향', 190, 640]].forEach(([t, x, y]) => {
        s.pill(t, x, y, colors.white, colors.blue, { size: 18, stroke: '#c9e5ee' });
      });
      s.card(56, 755, 300, 172, colors.white, { r: 24 });
      s.text('현재 판매 기준', 82, 804, 246, 20, 900, colors.blue, { align: 'center' });
      s.text('10,300원', 82, 866, 246, 42, 900, colors.ink, { align: 'center' });
      s.text('정상가 19,000원 · 46% 할인', 82, 910, 246, 18, 700, colors.muted, { align: 'center' });
      s.rect(350, 875, 330, 74, '#ffffffe8', { r: 20 });
      s.text('제조 6개월 이내 신선 제품 보장', 374, 922, 282, 23, 900, colors.leaf, { align: 'center' });
      s.rect(0, 1155, W, 205, colors.dark);
      s.text('Hyaluronic Acid Aqua Lotion', 54, 1232, 560, 31, 900, colors.white);
      s.text('8중 히알루론산 · 병풀추출물 · 해양심층수 · Fresh Bud No.6', 54, 1280, 650, 20, 700, '#d9eee7');
      return s;
    },
  },
  {
    file: '02-recommend-checklist.jpg',
    title: '추천 대상',
    draw() {
      const s = new Svg(colors.white);
      label(s, 'ORIGINAL 02 재구성');
      s.text('이런 피부 루틴에\n잘 맞습니다', 54, 160, 500, 54, 900, colors.ink);
      s.text('원본의 추천 대상을 줄이지 않고,\n구매자가 바로 읽을 수 있는 체크리스트로 정리했습니다.', 54, 300, 510, 23, 800, colors.body);
      productBottle(s, 590, 80, 110, 220);
      [
        '속건조가 느껴져 보습 단계를 보완하고 싶은 분',
        '수분과 유분을 함께 챙기는 로션을 찾는 분',
        '끈적임보다 산뜻하고 촉촉한 사용감을 선호하는 분',
        '거칠어진 피부결을 부드럽게 정돈하고 싶은 분',
        '가족이 함께 쓰기 좋은 대용량 로션이 필요한 분',
      ].forEach((text, i) => checkItem(s, 445 + i * 112, i + 1, text));
      s.card(54, 1060, 672, 150, colors.mint, { r: 24 });
      s.text('300ml 대용량 · 무향 · 약산성 케어', 90, 1126, 600, 30, 900, colors.ink, { align: 'center' });
      s.text('아침·저녁 데일리 보습 루틴으로 쓰기 좋은 펌프형 로션', 90, 1170, 600, 20, 700, colors.body, { align: 'center' });
      return s;
    },
  },
  {
    file: '03-eight-reasons.jpg',
    title: '8가지 근거',
    draw() {
      const s = new Svg(colors.mint);
      label(s, 'ORIGINAL 03 목차화');
      s.text('구매 전 확인할\n8가지 근거', 54, 160, 520, 54, 900, colors.ink);
      s.text('아래 상세 컷에서 하나씩 설명되는 핵심 메시지입니다.', 54, 300, 560, 23, 800, colors.body);
      const reasons = [
        ['01', '8중 히알루론산', '수분감을 겹겹이 더하는 보습 컨셉'],
        ['02', '병풀·해양심층수', '편안함과 촉촉함을 고려한 원료'],
        ['03', 'AHA·PHA', '거칠어진 피부결을 부드럽게 정돈'],
        ['04', 'Fresh Bud No.6', '새싹 유래 특허 원료 조성물'],
        ['05', '발효추출물', '피부 컨디션 케어 원료'],
        ['06', '식물오일 블렌딩', '마카다미아·해바라기·로즈힙 오일'],
        ['07', '저자극·EWG·pH', '시험 결과, 그린 등급, 약산성 설계'],
        ['08', '신선 제조', '제조일자 표기와 6개월 이내 출고'],
      ];
      reasons.forEach((r, i) => {
        const x = 54 + (i % 2) * 344;
        const y = 410 + Math.floor(i / 2) * 205;
        s.card(x, y, 320, 168, colors.white, { r: 22 });
        s.pill(r[0], x + 22, y + 20, colors.blue2, colors.blue, { size: 15, px: 10, py: 6, r: 10 });
        s.text(r[1], x + 22, y + 76, 276, 23, 900, colors.ink);
        s.text(r[2], x + 22, y + 116, 276, 16, 700, colors.body);
      });
      return s;
    },
  },
  {
    file: '04-hyaluronic-layer.jpg',
    title: '8중 히알루론산',
    draw() {
      const s = new Svg(colors.white);
      label(s, 'ORIGINAL 04');
      s.text('8중 히알루론산\n레이어 보습', 54, 160, 470, 54, 900, colors.ink);
      s.text('고·중·저분자 히알루론산 조합으로\n수분감을 겹겹이 더하는 컨셉을 보여줍니다.', 54, 300, 560, 23, 800, colors.body);
      s.crop(src[4], 466, 390, 240, 548, 260, 250, 300, 730, { r: 30, stroke: colors.line });
      [
        ['고분자', '피부 표면에 수분 보호막 같은 보습감'],
        ['중분자', '촉촉함이 이어지는 수분 레이어'],
        ['저분자', '가볍게 스며드는 듯한 산뜻한 마무리'],
      ].forEach((v, i) => {
        s.card(54, 435 + i * 170, 360, 136, i === 1 ? colors.blue2 : colors.cream, { r: 22 });
        s.text(v[0], 82, 488 + i * 170, 300, 27, 900, colors.ink);
        s.text(v[1], 82, 525 + i * 170, 300, 18, 700, colors.body);
      });
      s.card(54, 1010, 672, 120, colors.mint, { r: 24 });
      s.text('소듐하이알루로네이트 2,050ppm 외 7종 히알루론산 원료 함유', 92, 1078, 596, 23, 900, colors.blue, { align: 'center' });
      footnote(s, '상기 내용은 원료적 특성에 한함');
      return s;
    },
  },
  {
    file: '05-nature-blend.jpg',
    title: '병풀·해양심층수·AHA/PHA',
    draw() {
      const s = new Svg(colors.cream);
      label(s, 'ORIGINAL 05');
      s.text('수분·편안함·피부결을\n역할별로 정리', 54, 160, 610, 51, 900, colors.ink);
      s.text('성분명을 나열하기보다\n구매자가 기대하는 사용감으로 다시 묶었습니다.', 54, 300, 570, 23, 800, colors.body);
      s.crop(src[5], 570, 82, 126, 205, 90, 580, 590, 550, { r: 18, stroke: colors.line });
      [
        ['병풀추출물', '민감해지기 쉬운 피부를 편안하게 케어하는 원료로 소개합니다.'],
        ['해양심층수', '건조함이 느껴지는 피부에 수분감을 더하는 원료로 배치합니다.'],
        ['AHA·PHA', '시트릭애씨드와 글루코락톤으로 피부결 케어를 설명합니다.'],
      ].forEach((v, i) => {
        const x = 54 + i * 232;
        s.card(x, 420, 208, 260, colors.white, { r: 22 });
        s.text(v[0], x + 22, 474, 164, 24, 900, colors.ink, { align: 'center' });
        s.text(v[1], x + 22, 540, 164, 17, 700, colors.body, { align: 'center' });
      });
      s.card(54, 770, 672, 250, colors.white, { r: 24 });
      [
        ['수분감', '건조해 보이는 피부에 촉촉함'],
        ['편안함', '자극받은 듯한 피부를 위한 루틴'],
        ['피부결', '거칠어 보이는 결을 부드럽게'],
      ].forEach((v, i) => {
        s.text(v[0], 94 + i * 216, 872, 160, 25, 900, i === 1 ? colors.leaf : colors.blue, { align: 'center' });
        s.text(v[1], 94 + i * 216, 920, 160, 16, 700, colors.body, { align: 'center' });
      });
      footnote(s, '상기 내용은 원료적 특성에 한함');
      return s;
    },
  },
  {
    file: '06-fresh-bud.jpg',
    title: 'Fresh Bud No.6',
    draw() {
      const s = new Svg('#edf6ff');
      label(s, 'ORIGINAL 06');
      s.text('Fresh Bud No.6', 54, 170, 560, 56, 900, colors.ink);
      s.text('민감한 피부를 위해 설계된\n새싹 유래 특허 원료 조성물', 54, 255, 570, 27, 900, colors.blue);
      s.crop(src[6], 530, 82, 150, 230, 80, 540, 620, 580, { r: 18, stroke: '#bfd7ea' });
      ['브로콜리', '알팔파', '양배추', '밀싹', '청경채 계열', '무순 계열'].forEach((v, i) => {
        const x = 54 + (i % 3) * 224;
        const y = 440 + Math.floor(i / 3) * 140;
        s.card(x, y, 200, 102, colors.white, { r: 22, stroke: '#cbddeb' });
        s.text(v, x + 20, y + 63, 160, 22, 900, colors.ink, { align: 'center' });
      });
      s.card(54, 765, 672, 240, colors.white, { r: 24, stroke: '#cbddeb' });
      s.text('특허 표시 문구', 90, 835, 600, 26, 900, colors.ink, { align: 'center' });
      s.text('피부 진정 효과를 가지는 혼합 새싹 추출물을 함유한 화장료 조성물', 110, 910, 560, 23, 800, colors.body, { align: 'center' });
      footnote(s, '상기 내용은 원료적 특성에 한함');
      return s;
    },
  },
  {
    file: '07-ferment-oil.jpg',
    title: '발효추출물과 식물오일',
    draw() {
      const s = new Svg(colors.white);
      label(s, 'ORIGINAL 07');
      s.text('발효 성분과 식물오일을\n한 번에 이해되게', 54, 160, 620, 50, 900, colors.ink);
      s.text('피부 컨디션 케어와 보습 보호감으로 나눠\n원본 정보를 유지했습니다.', 54, 300, 590, 23, 800, colors.body);
      s.crop(src[7], 586, 84, 112, 180, 120, 560, 560, 580, { r: 18, stroke: colors.line });
      const left = [54, 430, 320, 430];
      const right = [406, 430, 320, 430];
      s.card(...left, colors.mint);
      s.text('발효가 만든 컨디션', 82, 500, 264, 29, 900, colors.leaf);
      ['효모/겨우살이발효추출물', '효모/띠뿌리발효추출물', '락토바실러스/콩발효추출물'].forEach((v, i) => {
        s.rect(82, 575 + i * 66, 250, 46, colors.white, { r: 12 });
        s.text(v, 98, 606 + i * 66, 218, 16, 800, colors.ink, { align: 'center' });
      });
      s.card(...right, colors.cream);
      s.text('식물오일 보습 보호감', 434, 500, 264, 29, 900, colors.blue);
      ['마카다미아씨오일', '해바라기씨오일', '로즈힙열매오일'].forEach((v, i) => {
        s.rect(434, 575 + i * 66, 250, 46, colors.white, { r: 12 });
        s.text(v, 450, 606 + i * 66, 218, 16, 800, colors.ink, { align: 'center' });
      });
      footnote(s, '상기 내용은 원료적 특성에 한함');
      return s;
    },
  },
  {
    file: '08-low-irritation-test.jpg',
    title: '저자극 테스트',
    draw() {
      const s = new Svg('#f4fbff');
      label(s, 'ORIGINAL 08');
      s.text('피부 저자극 테스트\n완료 근거', 54, 160, 510, 52, 900, colors.ink);
      s.text('시험 정보를 숫자와 기관 중심으로 정리해\n구매 불안을 줄입니다.', 54, 300, 590, 23, 800, colors.body);
      s.card(54, 420, 330, 300, colors.white, { r: 26, stroke: '#bfd7ea' });
      s.text('자극지수', 90, 490, 260, 28, 900, colors.blue, { align: 'center' });
      s.text('0.00', 90, 590, 260, 78, 900, colors.ink, { align: 'center' });
      s.text('비(무)자극 제품 인증', 90, 655, 260, 24, 900, colors.body, { align: 'center' });
      s.crop(src[8], 454, 420, 246, 330, 390, 500, 330, 450, { r: 20, stroke: '#bfd7ea' });
      [
        ['시험번호', 'KDRI-2026-0265'],
        ['시험명', '피부자극평가시험'],
        ['시험기관', '대한피부과학연구소'],
        ['시험대상', '32명'],
        ['시험기간', '2025.11.24~2025.11.27'],
      ].forEach((v, i) => {
        s.card(54, 810 + i * 70, 672, 54, i % 2 ? colors.white : colors.blue2, { r: 18 });
        s.text(v[0], 80, 845 + i * 70, 150, 18, 900, colors.blue);
        s.text(v[1], 230, 845 + i * 70, 460, 18, 800, colors.ink);
      });
      footnote(s, '※ 모든 피부에 동일한 반응을 보장하는 의미가 아니며, 개인차가 있을 수 있습니다.');
      return s;
    },
  },
  {
    file: '09-ewg-fragrance-free.jpg',
    title: 'EWG 그린과 무향',
    draw() {
      const s = new Svg(colors.white);
      label(s, 'ORIGINAL 09');
      s.text('전성분 EWG 그린 등급\n그리고 무향 설계', 54, 160, 610, 48, 900, colors.ink);
      s.text('원본의 EWG 설명은 길어도 구매자가 확인해야 하는 기준입니다.', 54, 300, 590, 23, 800, colors.body);
      s.crop(src[9], 585, 80, 115, 190, 100, 560, 580, 560, { r: 16, stroke: colors.line });
      s.card(54, 420, 320, 270, colors.mint);
      s.text('EWG 그린 등급', 84, 485, 260, 30, 900, colors.ink, { align: 'center' });
      s.text('EWG는 원료 안전성 정보를 1~10등급으로 분류하는 기준입니다.', 84, 565, 260, 20, 700, colors.body, { align: 'center' });
      s.card(406, 420, 320, 270, colors.blue2);
      s.text('Fragrance Free', 436, 485, 260, 30, 900, colors.ink, { align: 'center' });
      s.text('향료와 에센셜오일을 더하지 않고 원료 고유의 향만 남깁니다.', 436, 565, 260, 20, 700, colors.body, { align: 'center' });
      s.rect(54, 780, 672, 150, colors.dark, { r: 24 });
      ['전성분 그린 등급', '향료 무첨가', '에센셜오일 무첨가'].forEach((v, i) => {
        s.pill(v, 100 + i * 196, 835, colors.white, colors.dark, { size: 16, px: 12, py: 8 });
      });
      footnote(s, '상세 문구는 실제 원료/라벨 기준과 최종 대조 후 사용합니다.');
      return s;
    },
  },
  {
    file: '10-mild-ph.jpg',
    title: '약산성 pH',
    draw() {
      const s = new Svg(colors.mint);
      label(s, 'ORIGINAL 10');
      s.text('피부 밸런스를 고려한\n약산성 pH 설계', 54, 160, 560, 51, 900, colors.ink);
      s.text('원본의 pH 5.0~6.5 정보를 크게 보여주고,\n데일리 루틴 메시지로 연결합니다.', 54, 300, 580, 23, 800, colors.body);
      productBottle(s, 580, 85, 115, 210);
      s.card(54, 430, 672, 270, colors.white, { r: 28 });
      s.text('pH 5.0 ~ 6.5', 90, 540, 600, 58, 900, colors.blue, { align: 'center' });
      s.rect(112, 600, 556, 36, '#e9effb', { r: 18 });
      s.rect(300, 600, 180, 36, colors.mint2, { r: 18 });
      s.text('산성', 112, 675, 120, 18, 800, colors.muted);
      s.text('약산성', 310, 675, 160, 20, 900, colors.ink, { align: 'center' });
      s.text('알칼리성', 548, 675, 120, 18, 800, colors.muted, { align: 'right' });
      [
        ['피부 유사 pH', '데일리 로션 단계에 맞춘 약산성 설계'],
        ['밸런스 케어', '유수분 밸런스 루틴에 맞춘 사용감'],
        ['순한 루틴', '아침·저녁 부담 없이 바르는 보습 단계'],
      ].forEach((v, i) => {
        s.card(54 + i * 232, 805, 208, 180, colors.white, { r: 22 });
        s.text(v[0], 74 + i * 232, 860, 168, 22, 900, colors.ink, { align: 'center' });
        s.text(v[1], 74 + i * 232, 920, 168, 16, 700, colors.body, { align: 'center' });
      });
      return s;
    },
  },
  {
    file: '11-fresh-manufacture.jpg',
    title: '제조일자',
    draw() {
      const s = new Svg('#f1f8ee');
      label(s, 'ORIGINAL 11');
      s.text('제조일자를 보여주는\n신선함의 기준', 54, 160, 560, 51, 900, colors.ink);
      s.text('사용기한만 보는 것이 아니라 제조번호와 제조일자를 함께 확인합니다.', 54, 300, 600, 23, 800, colors.body);
      s.crop(src[11], 548, 76, 150, 230, 90, 640, 600, 620, { r: 18, stroke: colors.line });
      s.card(54, 440, 320, 335, colors.white);
      s.text('유어스킨플러스', 84, 505, 260, 27, 900, colors.leaf, { align: 'center' });
      s.text('제조번호와\n제조일자를 표기', 90, 585, 248, 32, 900, colors.ink, { align: 'center' });
      s.text('예: A2507191\n제조 2025.07.19', 90, 700, 248, 22, 800, colors.body, { align: 'center' });
      s.card(406, 440, 320, 335, colors.white);
      s.text('일부 타사 제품', 436, 505, 260, 27, 900, colors.muted, { align: 'center' });
      s.text('제조번호와\n사용기한만 표기', 442, 585, 248, 32, 900, colors.ink, { align: 'center' });
      s.text('예: A39\n2026.03.29까지', 442, 700, 248, 22, 800, colors.body, { align: 'center' });
      s.rect(54, 875, 672, 165, colors.dark, { r: 26 });
      s.text('제조일로부터 6개월 이내 제품만 출고', 90, 945, 600, 31, 900, colors.white, { align: 'center' });
      s.text('오래된 재고와 사용기한 임박 제품에 대한 불안을 줄이는 핵심 메시지입니다.', 90, 990, 600, 19, 700, '#d9ece5', { align: 'center' });
      return s;
    },
  },
  {
    file: '12-how-to-use.jpg',
    title: '사용법',
    draw() {
      const s = new Svg(colors.cream);
      label(s, 'ORIGINAL 12');
      s.text('사용법과 펌프 오픈을\n한 컷에서 확인', 54, 160, 560, 51, 900, colors.ink);
      s.text('사용법은 짧게, 펌프가 눌리지 않을 때 확인할 OPEN/STOP 안내는 크게 배치합니다.', 54, 300, 560, 23, 800, colors.body);
      productBottle(s, 585, 80, 110, 205);
      [
        ['STEP 1', '적당량을 덜어 얼굴에 골고루 펴 바른 후 두드리듯 흡수시켜 줍니다.'],
        ['STEP 2', '건조함이 느껴지는 부위에는 한 번 더 덧발라 보습감을 보완합니다.'],
      ].forEach((v, i) => {
        s.card(54, 430 + i * 126, 672, 96, colors.white);
        s.text(v[0], 84, 490 + i * 126, 120, 23, 900, colors.blue);
        s.text(v[1], 210, 490 + i * 126, 470, 22, 800, colors.ink);
      });
      s.card(54, 760, 320, 190, colors.white);
      s.text('OPEN', 100, 846, 230, 42, 900, colors.blue, { align: 'center' });
      s.text('사용 전 OPEN 방향으로 돌려주세요', 92, 898, 244, 18, 800, colors.body, { align: 'center' });
      s.card(406, 760, 320, 190, colors.blush);
      s.text('STOP', 452, 846, 230, 42, 900, colors.warn, { align: 'center' });
      s.text('STOP 상태에서는 펌프가 눌리지 않습니다', 444, 898, 244, 18, 800, colors.body, { align: 'center' });
      return s;
    },
  },
  {
    file: '13-eco-direct-manufacture.jpg',
    title: '포장과 직접 제조',
    draw() {
      const s = new Svg(colors.white);
      label(s, 'ORIGINAL 13');
      s.text('불필요한 포장은 줄이고\n제조사가 직접 판매', 54, 160, 620, 50, 900, colors.ink);
      s.text('친환경 포장과 직접 제조·직접 판매 메시지를 후반 신뢰 파트로 유지했습니다.', 54, 300, 600, 23, 800, colors.body);
      [
        ['단상자 축소', '불필요한 개별 단상자 사용을 줄입니다.'],
        ['수축필름 제거', '과한 포장보다 필요한 보호를 우선합니다.'],
        ['완충재 절감', '배송 보호에 필요한 범위만 사용합니다.'],
      ].forEach((v, i) => {
        s.card(54 + i * 232, 430, 208, 240, i === 1 ? colors.blue2 : colors.mint);
        s.text(v[0], 76 + i * 232, 500, 164, 23, 900, colors.ink, { align: 'center' });
        s.text(v[1], 76 + i * 232, 570, 164, 17, 700, colors.body, { align: 'center' });
      });
      s.rect(54, 760, 672, 160, colors.dark, { r: 26 });
      s.text('제조사가 직접 만들어 직접 판매합니다', 90, 832, 600, 31, 900, colors.white, { align: 'center' });
      s.text('패키지와 광고비를 줄이고 중간마진 부담을 낮춘 가격 구조', 90, 878, 600, 20, 700, '#d9ece5', { align: 'center' });
      s.card(54, 1035, 672, 120, colors.paper, { r: 22 });
      s.text('화장품제조업자 및 책임판매업자: (주)유어스킨 / 인천시 서구 염곡로 89', 90, 1105, 600, 20, 800, colors.body, { align: 'center' });
      return s;
    },
  },
  {
    file: '14-product-notice.jpg',
    title: '고시정보와 전성분',
    draw() {
      const s = new Svg('#fbfbf7');
      label(s, 'ORIGINAL 14');
      s.text('제품 고시정보는\n읽기 쉬운 표로', 54, 160, 470, 51, 900, colors.ink);
      s.text('필수 정보를 빠뜨리지 않고, 구매자가 확인하기 쉽게 정리합니다.', 54, 300, 590, 23, 800, colors.body);
      const rows = [
        ['제품명', '유어스킨플러스 히알루론산 아쿠아 로션'],
        ['용량', '300ml / 10.14 fl. oz'],
        ['주요 사양', '모든 피부 타입'],
        ['사용기한', '제조일로부터 24개월 / 개봉 후 12개월'],
        ['제조업자·책임판매업자', '(주)유어스킨'],
        ['제조국', '대한민국'],
      ];
      rows.forEach((v, i) => {
        const y = 420 + i * 68;
        s.rect(54, y, 672, 52, i % 2 ? colors.white : colors.mint, { r: 12, stroke: colors.line });
        s.text(v[0], 76, y + 34, 190, 16, 900, colors.blue);
        s.text(v[1], 270, y + 34, 425, 16, 800, colors.ink);
      });
      s.card(54, 865, 672, 210, colors.white);
      s.text('사용 시 주의사항', 84, 925, 610, 25, 900, colors.ink);
      s.text('이상 증상 시 전문의 상담 / 상처 부위 사용 자제 / 어린이 손이 닿지 않는 곳 보관 / 직사광선 피하기', 84, 978, 610, 19, 700, colors.body);
      s.text('상담: 032-682-6533 / 10:00~17:00', 84, 1040, 610, 18, 800, colors.muted);
      s.text('전성분은 실제 용기 라벨과 최종 대조 후 업로드합니다.', 54, 1245, 672, 17, 800, colors.muted, { align: 'center' });
      return s;
    },
  },
  {
    file: '15-official-seller-warning.jpg',
    title: '공식 판매처 확인',
    draw() {
      const s = new Svg(colors.blush);
      label(s, 'ORIGINAL 15');
      s.text('무단 리셀러 유통 제품\n구매 전 확인하세요', 54, 160, 610, 51, 900, colors.ink);
      s.text('고객 보호와 상담·보상 범위를 안내하는 중요한 정보라 마지막에 유지했습니다.', 54, 300, 600, 23, 800, colors.body);
      [
        ['판매자 확인', '공식 판매자명이 ‘(주)유어스킨’인지 확인하세요.'],
        ['비정상 유통 위험', '보관 상태와 사용기한, 정품 여부 확인이 어려울 수 있습니다.'],
        ['가격 역전 가능성', '무단 리셀러 제품은 공식 가격보다 높게 판매될 수 있습니다.'],
        ['상담·보상 제한', '비정상 유통 제품은 교환·환불·상담이 제한될 수 있습니다.'],
      ].forEach((v, i) => {
        const x = 54 + (i % 2) * 352;
        const y = 430 + Math.floor(i / 2) * 245;
        s.card(x, y, 320, 205, colors.white);
        s.text(v[0], x + 24, y + 58, 272, 25, 900, colors.ink);
        s.text(v[1], x + 24, y + 112, 272, 18, 700, colors.body);
      });
      s.rect(54, 960, 672, 190, colors.dark, { r: 26 });
      s.text('공식 판매처에서 제조일자를 확인하고\n구매하세요', 90, 1032, 600, 28, 900, colors.white, { align: 'center' });
      s.text('히알루론산 아쿠아 로션 300ml / 데일리 수분 보습 루틴', 90, 1123, 600, 20, 700, '#d9ece5', { align: 'center' });
      return s;
    },
  },
];

const cutFiles = [];
for (let i = 0; i < cuts.length; i += 1) {
  const cut = cuts[i];
  const index = String(i + 1).padStart(2, '0');
  const file = path.join(cutsDir, `${index}-${cut.file}`);
  const svg = cut.draw().svg();
  await sharp(Buffer.from(svg))
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(file);
  cutFiles.push(file);
}

const bundles = [
  ['01-hook', [0, 1, 2]],
  ['02-ingredients-a', [3, 4, 5]],
  ['03-ingredients-trust', [6, 7, 8]],
  ['04-ph-fresh-use', [9, 10, 11]],
  ['05-brand-notice', [12, 13, 14]],
];

const bundleFiles = [];
for (const [name, indexes] of bundles) {
  const images = await Promise.all(indexes.map((idx) => sharp(cutFiles[idx]).toBuffer()));
  const file = path.join(bundlesDir, `detail-v6-${name}.jpg`);
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

const thumbBuffers = await Promise.all(
  cutFiles.map((file) =>
    sharp(file).resize({ width: 240 }).jpeg({ quality: 88, mozjpeg: true }).toBuffer(),
  ),
);
const contactW = 240 * 5;
const contactH = 420 * 3;
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
  .toFile(path.join(previewDir, 'v6-contact-sheet.jpg'));

const manifest = {
  createdAt: new Date().toISOString(),
  size: { width: W, height: H },
  cuts: cutFiles.map((file, i) => ({
    index: i + 1,
    title: cuts[i].title,
    file,
  })),
  bundles: bundleFiles.map((file) => ({ file, width: W, height: H * 3 })),
  preview: path.join(previewDir, 'v6-contact-sheet.jpg'),
};
await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log(JSON.stringify(manifest, null, 2));

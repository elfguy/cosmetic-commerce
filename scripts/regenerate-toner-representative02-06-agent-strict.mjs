import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const base = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const repDir = path.join(base, 'representative');
const rawDir = path.join(base, 'agent-representative-raw');
const promptDir = path.join(base, 'agent-representative-prompts');
const rejectedDir = path.join(base, 'rejected');
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(promptDir, { recursive: true });
await fs.mkdir(rejectedDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, '');
const backupDir = path.join(rejectedDir, `representative02-06-before-product-tone-fix-${stamp}`);
await fs.mkdir(backupDir, { recursive: true });
for (const n of ['02','03','04','05','06']) {
  const p = path.join(repDir, `${n}.png`);
  if (existsSync(p)) await fs.copyFile(p, path.join(backupDir, `${n}.png`));
}

const identityRefs = [
  path.join(repDir, '01.png'),
  path.join(root, 'public/coupang/images/hyaluronic-acid-toner/product/01.png'),
  path.join(root, 'public/coupang/images/hyaluronic-acid-toner/product/02.png'),
].filter(p => existsSync(p));

const slots = [
  {
    n: '02',
    title: '매일 쓰는 산뜻 수분 토너',
    subtitle: '끈적임 없이 가볍게, 세안 후 촉촉한 첫 루틴',
    chips: ['산뜻한 사용감', '피부결 정돈', '500ml 대용량'],
    layout: '제품은 오른쪽 45~55% 영역에 01번과 같은 크기/질감으로, 왼쪽에는 간결한 큰 문구와 작은 아이콘 칩 3개.',
  },
  {
    n: '03',
    title: '500ml 넉넉한 수분 루틴',
    subtitle: '아침저녁 부담 없이 쓰는 대용량 데일리 토너',
    chips: ['500ml', '데일리', '넉넉한 용량'],
    layout: '제품은 오른쪽 중앙에 크게, 왼쪽에는 500ml 숫자 강조. 01번처럼 흰 배경과 작은 민트/아쿠아 포인트만 사용.',
  },
  {
    n: '04',
    title: '세안 후 첫 수분',
    subtitle: '건조해지기 전, 가장 먼저 채우는 토너 케어',
    chips: ['첫 단계 수분', '산뜻한 시작', '피부결 정돈'],
    layout: '제품은 오른쪽 중앙, 왼쪽에는 세안 후 첫 수분 메시지. 물결은 아주 연하게, 병과 배경이 01번처럼 깨끗해야 함.',
  },
  {
    n: '05',
    title: '하나로 4가지 토너 케어',
    subtitle: '닦토·흡토·스킨팩·레이어링까지 데일리 활용',
    chips: ['닦토', '흡토', '스킨팩', '레이어링'],
    layout: '제품은 오른쪽 크게, 왼쪽에는 4가지 활용을 아이콘/칩으로 정리. 과한 배경 금지, 01번의 클린 화이트 톤.',
  },
  {
    n: '06',
    title: '수분 레이어링',
    subtitle: '겹겹이 가볍게 쌓는 촉촉한 토너 루틴',
    chips: ['흡수감', '물방울 레이어', '데일리 보습'],
    layout: '제품은 오른쪽 45~55% 영역, 왼쪽에는 수분 레이어링 큰 문구. 투명 물방울/아쿠아 원형 포인트만 은은하게.',
  },
];

function promptFor(slot) {
  return `쿠팡 대표/메인 이미지용 정사각형 광고 이미지 1장을 만들어주세요.\n\n[가장 중요한 목표]\n업로드한 대표 01 이미지와 원본 제품 사진의 제품병이 기준입니다. 02~06번 제품이 01번과 다른 상품처럼 보여서 다시 만드는 작업입니다.\n제품병은 반드시 01번과 같은 유어스킨플러스 히알루론산 토너 500ml로 보여야 합니다.\n\n[제품 동일성 하드 조건]\n- 흰색 원통형 500ml 투명/반투명 토너 병\n- 짧고 넓은 흰색 원통형 캡\n- 둥근 어깨, 투명한 목/상단, 맑은 토너 내용물과 자연스러운 유리/플라스틱 반사\n- 라벨: YOURSKIN+ 로고, 검정 wordmark + 초록 plus, K 위 초록 잎\n- 큰 검정 문구: HYALURONIC ACID TONER\n- 하단: HYDRATING FORMULA / 500ml / 16.9 fl.oz\n- 라벨 중간 아래의 옅은 파란 물결 그래픽\n- 제품은 01번의 병 모양/라벨/캡/액체 높이/전체 인상이 유지되어야 합니다.\n\n[절대 금지]\n- 새 제품 디자인, 다른 토너, 가짜 병, 가짜 박스, 패키지 박스, AQUA LOTION, AQUA MOISTURE, CREAM, SERUM, 300ml, 200ml, 다른 브랜드명\n- 병 라벨을 심하게 바꾸거나 제품명을 줄이는 것\n- 제품이 01번보다 너무 회색/불투명/플라스틱처럼 보이는 것\n- 이전 02~06처럼 캠페인 톤이 제각각 달라지는 것\n- 과한 물 배경, 과한 식물, 복잡한 정보 카드\n\n[톤앤매너]\n대표 01과 같은 깨끗한 흰색/오프화이트 배경, 밝고 고급스러운 제품 썸네일 톤.\n민트/아쿠아 포인트는 아주 약하게만.\n폰트는 깔끔한 한국어 산세리프.\n광고 문구는 읽기 쉽게 크고 간결하게.\n\n[이번 슬롯: 대표 ${slot.n}]\n제목: ${slot.title}\n서브문장: ${slot.subtitle}\n칩/포인트: ${slot.chips.join(' / ')}\n레이아웃: ${slot.layout}\n\n[출력]\n정사각형 1:1 이미지. 최종 이미지는 쿠팡 대표 이미지로 사용할 수 있어야 합니다.\n텍스트와 제품이 안전 여백 안에 들어오게 해주세요.`;
}

function fileIdsFromText(text) { return [...String(text || '').matchAll(/file_[0-9a-fA-F]+/g)].map(m => m[0]); }
function candidateIds(src) {
  const ids = new Set(fileIdsFromText(src));
  try { const u = new URL(src); const id = u.searchParams.get('id'); for (const x of fileIdsFromText(id || '')) ids.add(x); if (id?.startsWith('file_')) ids.add(id); } catch {}
  return [...ids];
}
function hasKnownId(src, known) { return candidateIds(src).some(id => known.has(id)); }
function primaryId(src) { return candidateIds(src).find(id => id.startsWith('file_')) || src; }
async function state(page) {
  return page.evaluate(() => ({
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    imgs: Array.from(document.images).map(img => ({ alt: img.alt || '', src: img.currentSrc || img.src || '', w: img.naturalWidth, h: img.naturalHeight }))
      .filter(x => x.src.includes('backend-api/estuary/content')),
  }));
}
async function ensureWorkspace(ctx) {
  const page = await ctx.newPage();
  await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3500);
  console.log('workspace', { url: page.url(), title: await page.title() });
  const create = page.getByText('이미지 만들기', { exact: true }).first();
  if (await create.count()) { await create.click({ timeout: 15000 }).catch(e => console.log('create click fail', e.message)); await page.waitForTimeout(1500); }
  await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
  return page;
}
async function makeContactSheet() {
  const cell = 260, top = 34, gap = 16, cols = 3, rows = 2;
  const width = cols * cell + (cols + 1) * gap;
  const height = rows * (cell + top) + (rows + 1) * gap;
  const composites = [];
  for (let i = 1; i <= 6; i++) {
    const n = String(i).padStart(2, '0');
    const imgPath = path.join(repDir, `${n}.png`);
    const meta = await sharp(imgPath).metadata();
    const x = gap + ((i - 1) % cols) * (cell + gap);
    const y = gap + Math.floor((i - 1) / cols) * (cell + top + gap);
    const labelSvg = Buffer.from(`<svg width="${cell}" height="${top}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f7f8fa"/><text x="0" y="23" font-family="Arial, sans-serif" font-size="20" fill="#111827">${n} ${meta.width}x${meta.height}</text></svg>`);
    const thumb = await sharp(imgPath).resize(cell, cell, { fit: 'cover', position: 'center' }).jpeg({ quality: 92 }).toBuffer();
    composites.push({ input: labelSvg, left: x, top: y });
    composites.push({ input: thumb, left: x, top: y + top });
  }
  const out = path.join(base, 'v1-representative-contact.jpg');
  await sharp({ create: { width, height, channels: 3, background: '#f7f8fa' } })
    .composite(composites)
    .jpeg({ quality: 92 })
    .toFile(out);
  return out;
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const results = [];
for (const slot of slots) {
  const page = await ensureWorkspace(ctx);
  const before = await state(page);
  const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));
  const prompt = promptFor(slot);
  const oldSlot = path.join(backupDir, `${slot.n}.png`);
  const refs = [...identityRefs, oldSlot].filter(p => existsSync(p));
  await fs.writeFile(path.join(promptDir, `${slot.n}-representative-product-tone-agent-prompt.txt`), prompt);
  await fs.writeFile(path.join(promptDir, `${slot.n}-representative-product-tone-agent-refs.json`), JSON.stringify({ refs, backupDir }, null, 2));
  console.log('start slot', slot.n, refs);
  await page.setInputFiles('input[type="file"]', refs);
  await page.waitForTimeout(10000);
  for (const text of ['확인', '완료']) {
    const btn = page.getByRole('button', { name: text }).first();
    if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
  }
  await page.locator('#prompt-textarea').last().click();
  await page.keyboard.insertText(prompt);
  await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
  await page.waitForTimeout(8000);
  const chatUrl = page.url();
  await fs.writeFile(path.join(promptDir, `${slot.n}-representative-product-tone-agent-chat-url.txt`), chatUrl + '\n');
  console.log('submitted', slot.n, chatUrl);
  let saved = null;
  for (let i = 1; i <= 120; i++) {
    await page.waitForTimeout(8000);
    const s = await state(page);
    const candidates = [];
    const seen = new Set();
    for (const img of s.imgs) {
      if (img.w < 800 || img.h < 800) continue;
      if (hasKnownId(img.src, beforeIds)) continue;
      if (refs.some(r => img.alt === path.basename(r))) continue;
      const id = primaryId(img.src); if (seen.has(id)) continue; seen.add(id);
      candidates.push({ ...img, id });
    }
    console.log('poll', slot.n, i, 'busy', s.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
    if (candidates.length && !s.busy) {
      const gen = candidates.filter(c => c.alt.includes('생성된 이미지'));
      const img = (gen.length ? gen : candidates).at(-1);
      const b64 = await page.evaluate(async (src) => {
        const r = await fetch(src, { credentials: 'include' });
        if (!r.ok) throw new Error('fetch ' + r.status);
        const ab = await r.arrayBuffer();
        const bytes = new Uint8Array(ab); let s = '';
        for (let j = 0; j < bytes.length; j += 0x8000) s += String.fromCharCode(...bytes.subarray(j, j + 0x8000));
        return btoa(s);
      }, img.src);
      const buf = Buffer.from(b64, 'base64');
      const raw = path.join(rawDir, `${slot.n}-representative-product-tone-agent.png`);
      const final = path.join(repDir, `${slot.n}.png`);
      await fs.writeFile(raw, buf);
      await sharp(buf).resize(1000, 1000, { fit: 'cover', position: 'center' }).png({ compressionLevel: 9 }).toFile(final);
      const meta = await sharp(final).metadata();
      saved = { slot: slot.n, chatUrl, id: img.id, natural: `${img.w}x${img.h}`, bytes: buf.length, raw, final, finalSize: `${meta.width}x${meta.height}`, refs, backupDir, alt: img.alt, rule: 'direct ChatGPT Images output; normalized only; no local compositing/text patch' };
      await fs.writeFile(path.join(promptDir, `${slot.n}-representative-product-tone-agent-result.json`), JSON.stringify(saved, null, 2));
      console.log('saved', JSON.stringify(saved));
      break;
    }
  }
  await page.close().catch(() => {});
  if (!saved) throw new Error('no generated image for slot ' + slot.n);
  results.push(saved);
}
const sheet = await makeContactSheet();
const summary = { backupDir, contactSheet: sheet, count: results.length, results };
await fs.writeFile(path.join(promptDir, `02-06-representative-product-tone-agent-summary-${stamp}.json`), JSON.stringify(summary, null, 2));
console.log('contactSheet', sheet);
console.log('running build');
execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
console.log('DONE', JSON.stringify({ backupDir, contactSheet: sheet, count: results.length }, null, 2));

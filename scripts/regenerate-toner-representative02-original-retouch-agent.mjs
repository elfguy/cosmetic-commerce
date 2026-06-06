import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

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
const current = path.join(repDir, '02.png');
const backup = path.join(rejectedDir, `02-before-original-retouch-${stamp}.png`);
if (existsSync(current)) await fs.copyFile(current, backup);

const refs = [
  path.join(root, 'public/coupang/images/hyaluronic-acid-toner/product/01.png'),
  path.join(root, 'public/coupang/images/hyaluronic-acid-toner/product/02.png'),
  path.join(repDir, '01.png'),
].filter(p => existsSync(p));

const prompt = `쿠팡 대표 이미지 02번을 정사각형 1장으로 만들어주세요.\n\n[가장 중요한 지시]\n첨부한 원본 상품이미지는 단순 참고 이미지가 아닙니다.\n첨부한 원본 상품이미지를 실제 제품 레이어/실물 기준으로 사용하세요.\n\n원본 상품을 광고 이미지에 자연스럽게 리터치하는 정도는 괜찮습니다.\n밝기, 콘트라스트, 반사, 그림자, 색감, 제품 크기와 위치는 광고 이미지에 맞게 조정해도 됩니다.\n\n하지만 제품을 새로 그리거나 비슷한 병으로 재해석하면 안 됩니다.\n병 모양, 흰색 캡, 병 어깨, 투명한 목/상단, 라벨 위치와 비율, 물결 그래픽, 내용물 투명도, 용량 표기는 원본 상품 정체성을 유지해야 합니다.\n\nYOURSKIN+ / HYALURONIC ACID TONER / HYDRATING FORMULA / 500ml / 16.9 fl.oz가 원본과 같은 상품으로 보여야 합니다.\n\n이미지 퀄리티보다 상품 동일성이 우선입니다.\n구매자가 대표 01번 및 원본 상품사진과 같은 제품이라고 즉시 인식해야 합니다.\n\n[절대 금지]\n- 새 병 디자인 생성 금지\n- 비슷한 병을 새로 그리는 것 금지\n- 라벨만 비슷한 다른 병 금지\n- 캡 모양/병 어깨/라벨 비율/물결 그래픽 변경 금지\n- AQUA LOTION, 300ml, CREAM, SERUM, 다른 브랜드명 금지\n- 박스/패키지 추가 금지\n\n[02번 광고 구성]\n큰 제목: 매일 쓰는 산뜻 수분 토너\n서브: 끈적임 없이 가볍게, 세안 후 촉촉한 첫 루틴\n작은 포인트 칩: 산뜻한 사용감 / 피부결 정돈 / 500ml 대용량\n\n[레이아웃]\n- 원본 상품병은 오른쪽에 배치하되 너무 크거나 잘리지 않게 합니다.\n- 왼쪽에는 제목/서브/칩을 간결하게 배치합니다.\n- 배경은 01번 대표이미지처럼 흰색/오프화이트 기반, 아주 약한 민트/아쿠아 물결 포인트만 사용합니다.\n- 제품병은 원본 상품이미지를 자연스럽게 리터치해 광고 이미지에 합성한 것처럼 보여야 합니다.\n- 병 자체를 다시 그린 느낌이면 실패입니다.`;

await fs.writeFile(path.join(promptDir, '02-original-product-retouch-agent-prompt.txt'), prompt);
await fs.writeFile(path.join(promptDir, '02-original-product-retouch-agent-refs.json'), JSON.stringify({ refs, backup }, null, 2));

function fileIdsFromText(text) { return [...String(text || '').matchAll(/file_[0-9a-fA-F]+/g)].map(m => m[0]); }
function candidateIds(src) {
  const ids = new Set(fileIdsFromText(src));
  try {
    const u = new URL(src);
    const id = u.searchParams.get('id');
    for (const x of fileIdsFromText(id || '')) ids.add(x);
    if (id?.startsWith('file_')) ids.add(id);
  } catch {}
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

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
console.log('goto images');
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3500);
console.log('workspace', { url: page.url(), title: await page.title() });
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(e => console.log('create click fail', e.message)); await page.waitForTimeout(1500); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await state(page);
const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));
console.log('upload refs', refs);
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
await fs.writeFile(path.join(promptDir, '02-original-product-retouch-agent-chat-url.txt'), chatUrl + '\n');
console.log('submitted', chatUrl);
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
  console.log('poll 02 retouch', i, 'busy', s.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
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
    const raw = path.join(rawDir, '02-original-product-retouch-agent.png');
    const final = path.join(repDir, '02.png');
    await fs.writeFile(raw, buf);
    await sharp(buf).resize(1000, 1000, { fit: 'cover', position: 'center' }).png({ compressionLevel: 9 }).toFile(final);
    const meta = await sharp(final).metadata();
    const result = { chatUrl, id: img.id, natural: `${img.w}x${img.h}`, bytes: buf.length, raw, final, finalSize: `${meta.width}x${meta.height}`, refs, backup, alt: img.alt, rule: 'direct ChatGPT Images output; original product image instructed as actual product; normalized only; no local compositing/text patch' };
    await fs.writeFile(path.join(promptDir, '02-original-product-retouch-agent-result.json'), JSON.stringify(result, null, 2));
    console.log('saved', JSON.stringify(result));
    await page.close().catch(() => {});
    process.exit(0);
  }
}
throw new Error('no generated image');

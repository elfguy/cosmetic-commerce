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
const backup = path.join(rejectedDir, `02-before-product-preserve-proof-${stamp}.png`);
if (existsSync(current)) await fs.copyFile(current, backup);

const refs = [
  path.join(repDir, '01.png'),
  path.join(root, 'public/coupang/images/hyaluronic-acid-toner/product/01.png'),
  path.join(root, 'public/coupang/images/hyaluronic-acid-toner/product/02.png'),
  current,
].filter(p => existsSync(p));

const prompt = `쿠팡 대표/메인 이미지용 정사각형 이미지 1장을 만들어주세요.\n\n이번 작업은 새 제품 디자인을 만드는 것이 아니라, 업로드한 01번 메인 이미지의 실제 제품병을 그대로 유지하면서 02번 대표 이미지를 다시 만드는 것입니다.\n\n[가장 중요한 제품 보존 조건 — 반드시 지켜주세요]\n- 업로드한 대표 01 이미지의 제품병을 같은 실물 상품으로 보이게 유지해야 합니다.\n- 새 병을 디자인하거나 다른 병을 그리면 실패입니다.\n- 병 실루엣, 캡 높이/두께, 병 어깨 라인, 투명한 목/상단, 라벨 비율, 물결 그래픽 위치, 액체/투명도 느낌이 01번과 거의 같아야 합니다.\n- 라벨 텍스트는 다음처럼 보여야 합니다: YOURSKIN+ / HYALURONIC ACID TONER / HYDRATING FORMULA / 500ml / 16.9 fl.oz.\n- AQUA LOTION, CREAM, SERUM, 300ml, 다른 브랜드명, 박스/패키지는 절대 금지입니다.\n\n[02번 이미지 목적]\n제목: 매일 쓰는 산뜻 수분 토너\n서브: 끈적임 없이 가볍게, 세안 후 촉촉한 첫 루틴\n작은 포인트 칩: 산뜻한 사용감 / 피부결 정돈 / 500ml 대용량\n\n[레이아웃]\n- 전체 톤은 01번처럼 흰색/오프화이트 베이스, 깨끗하고 밝은 제품 썸네일 톤.\n- 제품병은 오른쪽에 중간 크기로 배치. 너무 크거나 잘리지 않게.\n- 왼쪽에 제목/서브/칩을 간결하게 배치.\n- 민트/아쿠아 장식은 약하게만 사용.\n- 제품병은 대표 01과 같은 상품이라는 느낌이 최우선입니다. 디자인 퀄리티보다 제품 동일성이 더 중요합니다.\n\n[검수 실패 조건]\n- 병이 01번보다 뚱뚱하거나 짧거나 다른 캡이면 실패\n- 라벨 물결/로고/제품명 배치가 크게 달라지면 실패\n- 500ml가 아니거나 다른 상품명으로 보이면 실패\n- 새 제품 디자인처럼 보이면 실패`;

await fs.writeFile(path.join(promptDir, '02-representative-product-preserve-proof-prompt.txt'), prompt);
await fs.writeFile(path.join(promptDir, '02-representative-product-preserve-proof-refs.json'), JSON.stringify({ refs, backup }, null, 2));

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
await fs.writeFile(path.join(promptDir, '02-representative-product-preserve-proof-chat-url.txt'), chatUrl + '\n');
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
  console.log('poll 02 proof', i, 'busy', s.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
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
    const raw = path.join(rawDir, '02-representative-product-preserve-proof-agent.png');
    const final = path.join(repDir, '02.png');
    await fs.writeFile(raw, buf);
    await sharp(buf).resize(1000, 1000, { fit: 'cover', position: 'center' }).png({ compressionLevel: 9 }).toFile(final);
    const meta = await sharp(final).metadata();
    const result = { chatUrl, id: img.id, natural: `${img.w}x${img.h}`, bytes: buf.length, raw, final, finalSize: `${meta.width}x${meta.height}`, refs, backup, alt: img.alt, rule: 'direct ChatGPT Images output; normalized only; no local compositing/text patch' };
    await fs.writeFile(path.join(promptDir, '02-representative-product-preserve-proof-result.json'), JSON.stringify(result, null, 2));
    console.log('saved', JSON.stringify(result));
    await page.close().catch(() => {});
    process.exit(0);
  }
}
throw new Error('no generated image');

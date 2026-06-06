import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const detailDir = path.join(outDir, 'detail');
const rawDir = path.join(outDir, 'agent-detail-raw');
const promptDir = path.join(outDir, 'agent-detail-prompts');
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(promptDir, { recursive: true });

const refs = [
  path.join(root, 'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png'),
  path.join(outDir, 'representative/01.png'),
  path.join(outDir, 'rejected/detail01-underfilled-before-agent-edit-20260605T210049/01.png'),
];

const prompt = `이미지 에이전트로 쿠팡 상세 이미지 01을 다시 생성해 주세요. 실제 완성 이미지를 생성하세요.\n\n반드시 첨부한 원본 제품 이미지(히알루론산토너.png)를 제품 정체성 기준으로 사용하세요.\n\n중요한 수정 배경:\n- 이전 생성본은 병 안의 내용물/액면 높이가 원본 제품과 다르게 올라가 보여 실패했습니다.\n- 사용자가 원하는 “용량이 꽉 차 보이는 이미지”는 병 안 액면을 임의로 높이라는 뜻이 아닙니다.\n- 원본 제품의 실제 액면/내용물 높이는 그대로 유지하고, 500ml 대용량감은 제품을 크게, 선명하게, 존재감 있게 배치해서 표현해야 합니다.\n\n제품 보존 하드 룰:\n- 원본 제품 사진의 병 모양, 흰색 캡, 어깨/목 투명부, 라벨 위치, YOURSKIN+ 로고, HYALURONIC ACID TONER, HYDRATING FORMULA, 500ml / 16.9 fl.oz를 유지하세요.\n- 특히 병 안 내용물/액면 높이를 원본과 다르게 바꾸지 마세요.\n- 원본처럼 어깨 아래쪽의 투명한 공간과 실제 액면 경계가 자연스럽게 보여야 합니다.\n- 액면을 목 바로 아래까지 올리거나 병 전체가 물로 꽉 찬 것처럼 만들지 마세요.\n- 제품이 실제 상품과 다르게 보이면 실패입니다.\n\n디자인 목표:\n- 기존 상세 01의 톤: 흰색/연아쿠아/민트, 물방울, 화장솜, 깨끗한 수분 토너 분위기.\n- 세로 상세페이지 이미지. 기존 문구/구성은 최대한 유지하세요.\n- 제품은 작거나 빈약해 보이지 않게 크게 배치하되, 제품 자체의 액면과 라벨은 원본 그대로.\n\n포함할 주요 문구:\nDAILY HYDRATION TONER\n매일 쓰는 토너라면, 넉넉하고 신선하게\n세안 후 첫 단계부터 화장솜, 스킨팩까지\n아침저녁 아끼지 않고 사용하는 500ml 수분 토너\n500ml 대용량\n제조 6개월 이내 제품 보장\n직접 제조\n유어스킨플러스 히알루론산 토너 500ml\n\n금지:\n- 내용물 높이/액면 임의 변경 금지\n- 다른 병/다른 라벨/다른 브랜드 금지\n- AQUA LOTION, CREAM, SERUM 금지\n- 정사각형 대표 이미지로 변경 금지\n- 로컬 합성용 배경만 만들지 말 것\n- 제작용 번호, CUT, STEP, V1 등 금지\n\n결론: 원본 제품의 실제 내용물 높이를 보존하면서, 제품을 크게 보여 500ml 대용량감이 느껴지는 프리미엄 상세 이미지 01을 생성하세요.`;

await fs.writeFile(path.join(promptDir, '01-original-fill-agent-prompt.txt'), prompt);

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
    imgs: Array.from(document.images).map(img => ({ alt: img.alt || '', src: img.currentSrc || img.src || '', w: img.naturalWidth, h: img.naturalHeight })).filter(x => x.src.includes('backend-api/estuary/content')),
  }));
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(1500); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await state(page);
const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));
await fs.writeFile(path.join(promptDir, '01-original-fill-before.json'), JSON.stringify({ ids: [...beforeIds] }, null, 2));

await page.setInputFiles('input#upload-files,input#upload-photos,input#image-gen-action-modal-upload-photos,input[name="images-app-drop-container-input"],input[type="file"]', refs);
await page.waitForTimeout(9000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(8000);
const chatUrl = page.url();
await fs.writeFile(path.join(promptDir, '01-original-fill-chat-url.txt'), chatUrl + '\n');
console.log('submitted-original-fill', chatUrl);

for (let i = 1; i <= 150; i++) {
  await page.waitForTimeout(8000);
  const s = await state(page);
  const candidates = [];
  const seen = new Set();
  for (const img of s.imgs) {
    if (img.w < 900 || img.h < 900) continue;
    if (hasKnownId(img.src, beforeIds)) continue;
    if (['01.png', '히알루론산토너.png'].includes(img.alt)) continue;
    const id = primaryId(img.src);
    if (seen.has(id)) continue;
    seen.add(id);
    candidates.push({ ...img, id });
  }
  console.log('poll-original-fill', i, 'busy', s.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
  if (candidates.length && !s.busy) {
    const img = candidates.at(-1);
    const b64 = await page.evaluate(async (src) => {
      const r = await fetch(src, { credentials: 'include' });
      if (!r.ok) throw new Error('fetch ' + r.status);
      const ab = await r.arrayBuffer();
      const bytes = new Uint8Array(ab);
      let s = '';
      for (let j = 0; j < bytes.length; j += 0x8000) s += String.fromCharCode(...bytes.subarray(j, j + 0x8000));
      return btoa(s);
    }, img.src);
    const buf = Buffer.from(b64, 'base64');
    const raw = path.join(rawDir, '01-original-fill-agent.png');
    const final = path.join(detailDir, '01.png');
    await fs.writeFile(raw, buf);
    await fs.writeFile(final, buf);
    const result = { chatUrl, id: img.id, natural: `${img.w}x${img.h}`, bytes: buf.length, raw, final, alt: img.alt, rule: 'direct ChatGPT Images output; original product image attached; no local compositing/editing' };
    await fs.writeFile(path.join(promptDir, '01-original-fill-result.json'), JSON.stringify(result, null, 2));
    console.log('saved-original-fill', img.id, `${img.w}x${img.h}`, buf.length);
    await page.close().catch(() => {});
    process.exit(0);
  }
}
throw new Error('no generated original-fill image');

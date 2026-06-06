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
  path.join(outDir, 'detail/01.png'), // base canvas to preserve
  path.join(outDir, 'representative/01.png'), // product identity reference
  path.join(root, 'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png'), // real packshot
];

const prompt = `이미지 에이전트로 기존 쿠팡 상세 이미지 01을 수정/재생성해 주세요. 설명만 하지 말고 완성 이미지를 실제 생성하세요.\n\n가장 중요한 목표:\n- 업로드한 기존 상세 01 이미지를 베이스 캔버스로 사용하세요.\n- 전체 디자인, 한국어 문구, 카드 3개, 물방울/화장솜/배경, 색감, 세로 상세페이지 구성을 최대한 그대로 유지하세요.\n- 바꿀 것은 제품 병의 용량감뿐입니다. 병 안 내용물이 비어 보이지 않고, 상품의 용량이 꽉 차 있는 이미지처럼 보여야 합니다.\n\n제품 용량감 수정 지시:\n- 현재 병 윗부분에 투명한 빈 공간이 너무 많아 덜 찬 상품처럼 보입니다.\n- 병 안의 투명한 토너 액체/수분 내용물이 목 아래까지 충분히 차 보이게 조정하세요.\n- 500ml 대용량 토너가 가득 들어 있는 느낌: 하단부터 상단 어깨 근처까지 수분감이 꽉 찬 느낌.\n- 단, 병은 물이 넘치거나 비정상적으로 꽉 막힌 것처럼 보이면 안 됩니다. 자연스러운 만충/충분히 찬 토너 병으로 보이게 해주세요.\n\n보존해야 할 요소:\n- YOURSKIN+ HYALURONIC ACID TONER 500ml 제품 정체성 유지\n- 흰색 짧은 캡, 투명한 병 어깨, 라벨 위치/구성, HYDRATING FORMULA, 500ml / 16.9 fl.oz 유지\n- 상단 문구: DAILY HYDRATION TONER / 매일 쓰는 토너라면, 넉넉하고 신선하게\n- 설명 문구와 좌측 카드: 500ml 대용량, 제조 6개월 이내 제품 보장, 직접 제조\n- 하단 문구와 전체 780:1360 세로 상세페이지 느낌 유지\n\n금지:\n- 새 레이아웃으로 재디자인 금지\n- 병을 다른 상품/다른 라벨/다른 브랜드로 변경 금지\n- 대표이미지처럼 정사각형으로 바꾸지 말 것\n- 로컬 합성용 빈 배경만 만들지 말 것\n- 한국어 문구를 임의로 크게 바꾸거나 오타 만들지 말 것\n\n결론: 기존 상세 01의 프리미엄 수분 토너 광고 디자인은 유지하고, 병 내부 내용물만 더 가득 차 보이게 자연스럽게 수정한 완성 상세 이미지 1장을 생성하세요.`;

await fs.writeFile(path.join(promptDir, '01-full-bottle-agent-prompt.txt'), prompt);

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
await fs.writeFile(path.join(promptDir, '01-full-bottle-before.json'), JSON.stringify({ ids: [...beforeIds], imgs: before.imgs }, null, 2));

const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, refs);
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
await fs.writeFile(path.join(promptDir, '01-full-bottle-chat-url.txt'), chatUrl + '\n');
console.log('submitted-detail01-full-bottle', chatUrl);

for (let i = 1; i <= 150; i++) {
  await page.waitForTimeout(8000);
  const s = await state(page);
  const candidates = [];
  const seen = new Set();
  for (const img of s.imgs) {
    // Detail output can be portrait or square; require large image, not small refs.
    if (img.w < 900 || img.h < 900) continue;
    if (hasKnownId(img.src, beforeIds)) continue;
    // Uploaded refs may appear as candidates in new chat; skip known alt names.
    if (['01.png', '히알루론산토너.png'].includes(img.alt)) continue;
    const id = primaryId(img.src);
    if (seen.has(id)) continue;
    seen.add(id);
    candidates.push({ ...img, id });
  }
  console.log('poll-detail01', i, 'busy', s.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
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
    const raw = path.join(rawDir, '01-full-bottle-agent.png');
    const final = path.join(detailDir, '01.png');
    // Direct image-agent output only. No local composition or text patch.
    await fs.writeFile(raw, buf);
    await fs.writeFile(final, buf);
    const result = { chatUrl, id: img.id, natural: `${img.w}x${img.h}`, bytes: buf.length, raw, final, alt: img.alt, rule: 'direct ChatGPT Images output; no local compositing/editing' };
    await fs.writeFile(path.join(promptDir, '01-full-bottle-result.json'), JSON.stringify(result, null, 2));
    console.log('saved-detail01-full-bottle', img.id, `${img.w}x${img.h}`, buf.length);
    await page.close().catch(() => {});
    process.exit(0);
  }
}
await page.screenshot({ path: path.join(root, 'tmp-toner-detail01-full-bottle-failed.png'), fullPage: true }).catch(() => {});
throw new Error('no generated detail01 full-bottle image');

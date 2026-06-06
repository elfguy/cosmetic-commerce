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
  path.join(promptDir, 'original-product-fill-height-reference.png'),
  path.join(outDir, 'rejected/detail01-underfilled-before-agent-edit-20260605T210049/01.png'),
  path.join(outDir, 'rejected/detail01-artificial-fill-line-20260605T214247/user-screenshot-visible-fill-line.jpeg'),
];

const prompt = `이미지 에이전트로 히알루론산 토너 상세 이미지 01을 다시 생성하세요. 설명만 하지 말고 실제 완성 이미지를 생성하세요.\n\n이번 수정의 핵심:\n- 첨부한 사용자 스크린샷은 실패 예시입니다. 최종 이미지에 그대로 따라하면 안 됩니다.\n- 실패 이유: 병 안에 너무 선명한 수평 액면선이 생겨 원본 상품이 아니라 AI가 만든 투명 물병처럼 보입니다.\n- 원본 상품 사진과 원본 액면 클로즈업을 정답 기준으로 사용하세요.\n\n제품 보존 하드 룰:\n- 반드시 첨부한 원본 제품 사진(히알루론산토너.png)의 병 질감/내용물 느낌을 기준으로 하세요.\n- 병 내부를 단순한 맑은 물병처럼 그리지 마세요.\n- 인위적으로 길고 진한 수평 액면선을 만들지 마세요.\n- 원본처럼 반투명한 병, 자연스러운 어깨 반사, 내용물과 빈 공간의 부드러운 경계가 보여야 합니다.\n- 내용물이 너무 아래로 내려간 빈 병 느낌도 안 되고, 캡 바로 아래까지 꽉 찬 느낌도 안 됩니다.\n- 제품은 YOURSKIN+ HYALURONIC ACID TONER 500ml 그대로여야 합니다.\n\n제품 외형:\n- 흰색 짧은 캡\n- 투명한 둥근 어깨와 목\n- YOURSKIN+ 로고\n- HYALURONIC ACID TONER\n- HYDRATING FORMULA\n- 500ml / 16.9 fl.oz\n- 라벨 위치와 병 비율은 원본 상품에 가깝게 유지\n\n상세 이미지 디자인:\n- 기존 상세 01의 좋은 구성은 유지합니다: 흰색/연아쿠아/민트 배경, 물방울, 화장솜, 깨끗한 수분감.\n- 제품은 오른쪽에 크게 배치해서 500ml 대용량감이 느껴지게 하세요.\n- 하지만 제품 병 내부 표현은 원본 상품 사진을 우선합니다.\n\n포함할 문구:\nDAILY HYDRATION TONER\n매일 쓰는 토너라면, 넉넉하고 신선하게\n세안 후 첫 단계부터 화장솜, 스킨팩까지\n아침저녁 아끼지 않고 사용하는 500ml 수분 토너\n500ml 대용량\n제조 6개월 이내 제품 보장\n직접 제조\n유어스킨플러스 히알루론산 토너 500ml\n\n금지:\n- 실패 예시 스크린샷의 선명한 물높이 수평선 복사 금지\n- 라벨 위에 두꺼운 직선 액면선 만들기 금지\n- 병을 유리컵/생수병처럼 그리기 금지\n- 다른 제품명(AQUA LOTION, CREAM, SERUM 등) 금지\n- CUT, STEP, V1 같은 제작 번호 금지\n- 정사각형 대표 이미지 금지\n\n결론: 기존 상세 01 디자인은 유지하되, 제품 병은 원본 상품처럼 자연스럽고 실제 제품 같은 내용물/투명부 질감으로 다시 생성하세요.`;

await fs.writeFile(path.join(promptDir, '01-no-artificial-fill-line-prompt.txt'), prompt);

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
await fs.writeFile(path.join(promptDir, '01-no-artificial-fill-line-before.json'), JSON.stringify({ ids: [...beforeIds] }, null, 2));

await page.setInputFiles('input#upload-files,input#upload-photos,input#image-gen-action-modal-upload-photos,input[name="images-app-drop-container-input"],input[type="file"]', refs);
await page.waitForTimeout(11000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(8000);
const chatUrl = page.url();
await fs.writeFile(path.join(promptDir, '01-no-artificial-fill-line-chat-url.txt'), chatUrl + '\n');
console.log('submitted-no-artificial-fill-line', chatUrl);

for (let i = 1; i <= 150; i++) {
  await page.waitForTimeout(8000);
  const s = await state(page);
  const candidates = [];
  const seen = new Set();
  for (const img of s.imgs) {
    if (img.w < 900 || img.h < 900) continue;
    if (hasKnownId(img.src, beforeIds)) continue;
    if (['01.png', '히알루론산토너.png', 'original-product-fill-height-reference.png'].includes(img.alt)) continue;
    const id = primaryId(img.src);
    if (seen.has(id)) continue;
    seen.add(id);
    candidates.push({ ...img, id });
  }
  console.log('poll-no-artificial-fill-line', i, 'busy', s.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
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
    const raw = path.join(rawDir, '01-no-artificial-fill-line-agent.png');
    const final = path.join(detailDir, '01.png');
    await fs.writeFile(raw, buf);
    await fs.writeFile(final, buf);
    const result = { chatUrl, id: img.id, natural: `${img.w}x${img.h}`, bytes: buf.length, raw, final, alt: img.alt, rule: 'direct ChatGPT Images output; original product + failure screenshot attached; no local compositing/editing' };
    await fs.writeFile(path.join(promptDir, '01-no-artificial-fill-line-result.json'), JSON.stringify(result, null, 2));
    console.log('saved-no-artificial-fill-line', img.id, `${img.w}x${img.h}`, buf.length);
    await page.close().catch(() => {});
    process.exit(0);
  }
}
throw new Error('no generated image');

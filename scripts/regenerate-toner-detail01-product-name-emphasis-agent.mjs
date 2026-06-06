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
  path.join(detailDir, '02.png'),
  path.join(detailDir, '03.png'),
  path.join(detailDir, '04.png'),
  path.join(detailDir, '01.png'),
  path.join(root, 'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png'),
];

const prompt = `이미지 에이전트로 히알루론산 토너 상세 이미지 01을 수정해서 완성 이미지 1장을 생성하세요. 설명만 하지 말고 실제 이미지를 생성해야 합니다.\n\n중요: 반드시 ChatGPT Images 결과물 안에 한국어 텍스트까지 자연스럽게 포함해 주세요. 배경만 만들거나 텍스트를 나중에 붙이는 방식은 안 됩니다.\n\n[참고 이미지 역할]\n- detail 02, 03, 04: 승인된 상세페이지 톤/폰트/카드 스타일 기준입니다.\n- 현재 detail 01: 전체 구성과 제품/카피를 유지할 구조 참고입니다.\n- 원본 상품 사진: 제품명과 병 외형 기준입니다.\n\n[이번 수정 목표]\n현재 상세 01의 하단에 있는 상품명 “유어스킨플러스 히알루론산 토너 500ml”이 너무 작고 약합니다.\n하단 상품명이 지금보다 더 잘 보이고, 상품명으로 인지되도록 부각해 주세요.\n\n[수정 지시]\n- 전체 레이아웃, 물방울, 화장솜, 오른쪽 큰 제품, 상단 타이틀, 3개 정보 카드 구성은 유지합니다.\n- 하단 상품명 영역만 더 명확하게 만듭니다.\n- 하단 상품명 “유어스킨플러스 히알루론산 토너 500ml”을 현재보다 약 25~35% 크게 보이게 하세요.\n- 상품명은 하단 중앙에 배치하되 너무 아래에 붙이지 말고 여백을 확보하세요.\n- 검은색/진한 네이비 본문 + 포인트 블루 조합으로 또렷하게 표현하세요.\n- 양쪽 가는 라인은 유지해도 되지만, 상품명을 가리지 않게 더 깔끔하게 정리하세요.\n- 필요하면 하단에 아주 은은한 흰색 반투명 캡슐/라벨 영역을 넣어 상품명이 더 잘 읽히게 하세요. 단, 과한 배너처럼 보이면 안 됩니다.\n- 모바일에서 한눈에 읽히는 크기와 대비가 되어야 합니다.\n\n[반드시 들어갈 문구 — 정확히 유지]\nDAILY HYDRATION TONER\n매일 쓰는 토너라면\n넉넉하고 신선하게\n세안 후 첫 단계부터 화장솜, 스킨팩까지\n매일 넉넉하게 쓰기 좋은 500ml 대용량\n500ml 대용량\n제조 6개월 이내 제품 보장\n직접 제조\n유어스킨플러스 히알루론산 토너 500ml\n\n[제품 기준]\n- YOURSKIN+ HYALURONIC ACID TONER 500ml 제품입니다.\n- 병/캡/라벨/용량이 다른 제품처럼 바뀌면 실패입니다.\n- 제품은 오른쪽에 크고 입체감 있게 유지합니다.\n\n[금지]\n- 상품명을 다른 이름으로 바꾸지 마세요.\n- “유어스킨플러스 히알루론산 토너 500ml” 오탈자 금지.\n- AQUA LOTION, CREAM, SERUM 등 다른 제품명 금지.\n- CUT, STEP, V1 같은 제작 번호 금지.\n- 하단 상품명을 너무 작게 유지 금지.\n- 정사각형 대표 이미지 금지. 세로형 상세페이지 이미지여야 합니다.\n\n[검수 기준]\n- 하단 상품명이 이전보다 확실히 부각되어야 합니다.\n- 한국어가 깨지거나 이상한 글자로 변형되면 실패입니다.\n- 상세 02~04와 폰트/톤이 자연스럽게 이어져야 합니다.\n- 전체적으로 쿠팡 모바일 상세페이지 첫 컷처럼 고급스럽고 깨끗해야 합니다.`;

const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
await fs.writeFile(path.join(promptDir, `01-product-name-emphasis-${stamp}-prompt.txt`), prompt);

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
    url: location.href,
    title: document.title,
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    imgs: Array.from(document.images).map(img => ({ alt: img.alt || '', src: img.currentSrc || img.src || '', w: img.naturalWidth, h: img.naturalHeight })).filter(x => x.src.includes('backend-api/estuary/content')),
  }));
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);
const opened = await state(page);
await fs.writeFile(path.join(promptDir, `01-product-name-emphasis-${stamp}-opened.json`), JSON.stringify({ startUrl: 'https://chatgpt.com/images/', actualUrl: opened.url, title: opened.title }, null, 2));
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(1500); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await state(page);
const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));
await fs.writeFile(path.join(promptDir, `01-product-name-emphasis-${stamp}-before.json`), JSON.stringify({ ids: [...beforeIds] }, null, 2));

await page.setInputFiles('input#upload-files,input#upload-photos,input#image-gen-action-modal-upload-photos,input[name="images-app-drop-container-input"],input[type="file"]', refs);
await page.waitForTimeout(12000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(8000);
const chatUrl = page.url();
await fs.writeFile(path.join(promptDir, `01-product-name-emphasis-${stamp}-chat-url.txt`), chatUrl + '\n');
console.log('submitted-product-name-emphasis', chatUrl);

for (let i = 1; i <= 160; i++) {
  await page.waitForTimeout(8000);
  const s = await state(page);
  const candidates = [];
  const seen = new Set();
  for (const img of s.imgs) {
    if (img.w < 900 || img.h < 900) continue;
    if (hasKnownId(img.src, beforeIds)) continue;
    if (['01.png', '02.png', '03.png', '04.png', '히알루론산토너.png'].includes(img.alt)) continue;
    const id = primaryId(img.src);
    if (seen.has(id)) continue;
    seen.add(id);
    candidates.push({ ...img, id });
  }
  console.log('poll-product-name-emphasis', i, 'busy', s.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
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
    const raw = path.join(rawDir, `detail01-product-name-emphasis-agent-${stamp}.png`);
    await fs.writeFile(raw, buf);
    const result = { chatUrl, id: img.id, natural: `${img.w}x${img.h}`, bytes: buf.length, raw, alt: img.alt, refs, rule: 'direct ChatGPT Images output; adjacent cuts uploaded; no local text overlay' };
    await fs.writeFile(path.join(promptDir, `01-product-name-emphasis-${stamp}-result.json`), JSON.stringify(result, null, 2));
    console.log('saved-product-name-emphasis', JSON.stringify(result));
    await page.close().catch(() => {});
    process.exit(0);
  }
}
throw new Error('no generated product-name-emphasis image');

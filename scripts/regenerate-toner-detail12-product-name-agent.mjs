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
  path.join(detailDir, '11.png'),
  path.join(detailDir, '12.png'),
  path.join(detailDir, '13.png'),
  path.join(root, 'public/coupang/images/aqua-lotion/versions/v4/detail/12.png'),
];

const prompt = `이미지 에이전트로 히알루론산 토너 상세 이미지 12를 수정해서 완성 이미지 1장을 생성하세요. 설명만 하지 말고 실제 이미지를 생성해야 합니다.\n\n중요: 반드시 ChatGPT Images 이미지 생성 결과물 안에 한국어 텍스트까지 자연스럽게 포함해 주세요. 배경만 만들지 마세요.\n\n[참고 이미지 역할]\n- 현재 detail 12: 구조/레이아웃/배경/카드 위치를 최대한 유지할 기준입니다.\n- detail 11, detail 13: 승인된 후반부 톤/폰트/여백 기준입니다.\n- aqua-lotion v4 detail 12: 같은 계열의 제품정보/전성분 카드 스타일 참고입니다.\n\n[이번 수정의 핵심]\n현재 detail 12의 제품 정보 카드 첫 줄에 있는 제품명이 잘못되어 있습니다.\n잘못된 문구: 제품명 : 히알루론산 수분광채 토너\n반드시 아래 정확한 문구로 바꿔 주세요:\n제품명 : 유어스킨플러스 히알루론산 토너\n\n[레이아웃 지시]\n- 기존 detail 12와 거의 같은 구성으로 유지하세요.\n- 상단 큰 제목: “제품 정보와 전성분을 확인하세요” 유지.\n- 첫 번째 카드 제목: “제품 정보” 유지.\n- 두 번째 카드 제목: “전성분” 유지.\n- 실제 제품병, 제품 라벨, 패키지, 박스, 목업, 병 실루엣은 넣지 마세요. 정보 카드 중심입니다.\n- 흰색/아쿠아/연한 민트, 물방울, 잎사귀, 둥근 카드 톤을 유지하세요.\n- 폰트는 기존 상세컷과 같은 굵은 한국어 산세리프입니다. 절대 붓글씨, 캘리그라피, 명조/세리프, 손글씨 제목 금지.\n- 이미지 비율은 780 x 1360 세로형 상세페이지입니다.\n\n[반드시 들어갈 한국어 텍스트 — 그대로 사용]\n제목:\n제품 정보와\n전성분을 확인하세요\n\n카드 제목:\n제품 정보\n\n제품 정보 항목:\n제품명 : 유어스킨플러스 히알루론산 토너\n용량 : 500ml\n피부타입 : 모든 피부\n판매·제조 : (주)유어스킨\n제조국 : 대한민국\n\n카드 제목:\n전성분\n\n전성분 본문:\n정제수, 다이프로필렌글라이콜, 글리세린,\n부틸렌글라이콜, 나이아신아마이드, 베타인,\n판테놀, 소듐하이알루로네이트,\n하이드롤라이즈드하이알루로닉애씨드,\n하이알루로닉애씨드,\n소듐아세틸레이티드하이알루로네이트,\n하이드록시프로필트라이모늄하이알루로네이트,\n포타슘하이알루로네이트,\n소듐하이알루로네이트크로스폴리머,\n하이드롤라이즈드소듐하이알루로네이트,\n알란토인, 카보머, 알지닌, 1,2-헥산다이올,\n에틸헥실글리세린\n\n하단 작은 문구:\n전성분 정보는 제공 자료 기준이며,\n구매 전 제품 라벨을 함께 확인해 주세요.\n\n[검수 기준]\n- 제품명은 반드시 “유어스킨플러스 히알루론산 토너”여야 합니다.\n- “히알루론산 수분광채 토너” 문구가 남아 있으면 실패입니다.\n- 한국어 텍스트가 깨지거나 이상한 글자로 변형되면 실패입니다.\n- 용량 500ml, 판매·제조 (주)유어스킨, 제조국 대한민국을 유지하세요.\n- 전성분을 요약하거나 성분명을 임의로 바꾸지 마세요.\n- 기존 11~13번과 톤/폰트/카드 스타일이 자연스럽게 이어져야 합니다.\n- CUT, STEP, V1 같은 제작 번호를 이미지 안에 넣지 마세요.`;

const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
await fs.writeFile(path.join(promptDir, `12-product-name-fix-${stamp}-prompt.txt`), prompt);

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
await fs.writeFile(path.join(promptDir, `12-product-name-fix-${stamp}-opened.json`), JSON.stringify({ startUrl: 'https://chatgpt.com/images/', actualUrl: opened.url, title: opened.title }, null, 2));
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(1500); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await state(page);
const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));
await fs.writeFile(path.join(promptDir, `12-product-name-fix-${stamp}-before.json`), JSON.stringify({ ids: [...beforeIds] }, null, 2));

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
await fs.writeFile(path.join(promptDir, `12-product-name-fix-${stamp}-chat-url.txt`), chatUrl + '\n');
console.log('submitted-detail12-product-name-fix', chatUrl);

for (let i = 1; i <= 170; i++) {
  await page.waitForTimeout(8000);
  const s = await state(page);
  const candidates = [];
  const seen = new Set();
  for (const img of s.imgs) {
    if (img.w < 900 || img.h < 900) continue;
    if (hasKnownId(img.src, beforeIds)) continue;
    if (['11.png', '12.png', '13.png'].includes(img.alt)) continue;
    const id = primaryId(img.src);
    if (seen.has(id)) continue;
    seen.add(id);
    candidates.push({ ...img, id });
  }
  console.log('poll-detail12-product-name-fix', i, 'busy', s.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
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
    const raw = path.join(rawDir, `detail12-product-name-fix-agent-${stamp}.png`);
    await fs.writeFile(raw, buf);
    const result = { chatUrl, id: img.id, natural: `${img.w}x${img.h}`, bytes: buf.length, raw, alt: img.alt, refs, rule: 'direct ChatGPT Images output; exact corrected product name in prompt; no local text overlay' };
    await fs.writeFile(path.join(promptDir, `12-product-name-fix-${stamp}-result.json`), JSON.stringify(result, null, 2));
    console.log('saved-detail12-product-name-fix', JSON.stringify(result));
    await page.close().catch(() => {});
    process.exit(0);
  }
}
throw new Error('no generated detail12 product-name-fix image');

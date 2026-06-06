import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const repDir = path.join(outDir, 'representative');
const rawDir = path.join(outDir, 'agent-representative-raw');
const promptDir = path.join(outDir, 'agent-representative-prompts');
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(promptDir, { recursive: true });

const refs = [
  path.join(outDir, 'representative/01.png'),
  path.join(root, 'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png'),
  path.join(root, 'public/coupang/images/hyaluronic-acid-toner/product/01.png'),
  path.join(root, 'public/coupang/images/hyaluronic-acid-toner/product/02.png'),
  path.join(outDir, 'detail/01.png'),
  path.join(outDir, 'detail/02.png'),
  path.join(outDir, 'detail/04.png'),
  path.join(outDir, 'detail/05.png'),
];
const existingRefs = [];
for (const r of refs) { try { await fs.stat(r); existingRefs.push(r); } catch {} }

function fileIdsFromText(text) { return [...String(text || '').matchAll(/file_[0-9a-fA-F]+/g)].map(m => m[0]); }
function candidateIds(src) {
  const ids = new Set(fileIdsFromText(src));
  try {
    const u = new URL(src); const id = u.searchParams.get('id');
    for (const x of fileIdsFromText(id || '')) ids.add(x);
    if (id && id.startsWith('file_')) ids.add(id);
  } catch {}
  return [...ids];
}
function hasKnownId(src, known) { return candidateIds(src).some(id => known.has(id)); }
function primaryId(src) { return candidateIds(src).find(id => id.startsWith('file_')) || src; }

async function getImageData(page) {
  return page.evaluate(() => ({
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    imgs: Array.from(document.images).map(img => ({
      alt: img.alt || '', src: img.currentSrc || img.src || '', w: img.naturalWidth, h: img.naturalHeight
    })).filter(x => x.src.includes('backend-api/estuary/content'))
  }));
}

const num = '02';
const prompt = `쿠팡 대표/메인 이미지 정사각형 1장을 ChatGPT Images 2.0 완성본으로 실제 생성해 주세요. 설명만 하지 말고 이미지 자체를 만들어 주세요.\n\n제품: YOURSKIN+ HYALURONIC ACID TONER 500ml / 유어스킨플러스 히알루론산 토너 500ml\n목표: 대표 이미지 02 교체본. 기존의 “온 가족” 메시지는 사용하지 않습니다. 개인 데일리 수분 루틴/산뜻한 사용감 중심으로 다시 구성합니다.\n비율: 1:1 정사각형, 쿠팡 대표 이미지 썸네일용, 안전 여백 충분히.\n\n[중요 - 이미지 에이전트 완성본]\n- 한국어 제목/포인트까지 이미지 안에 자연스럽게 포함한 완성 광고 이미지로 생성하세요.\n- 업로드한 실제 토너 제품 사진을 제품 형태/투명 용기/라벨/500ml 기준으로 사용하세요.\n- 제품명은 반드시 HYALURONIC ACID TONER / 500ml 느낌을 유지하세요. AQUA LOTION, AQUA MOISTURE LOTION, CREAM, SERUM으로 바꾸지 마세요.\n- 업로드한 V1 상세컷들의 흰색 + 연아쿠아 + 민트 + 깨끗한 화장품 광고 톤과 맞추세요.\n\n[이번 컷 핵심 카피]\n큰 제목: 매일 쓰는 산뜻 수분 토너\n서브 카피: 끈적임 없이 가볍게, 세안 후 촉촉한 첫 루틴\n포인트 칩: 산뜻한 사용감 / 피부결 정돈 / 500ml 대용량\n\n[시각 구성]\n- 밝은 화장대 또는 세면대 위에 토너 제품을 주인공으로 배치.\n- 깨끗한 화장솜, 투명한 물방울, 맑은 토너 제형, 부드러운 민트/아쿠아 그래픽으로 “산뜻하고 가벼운 수분감”을 표현.\n- 사람/가족/아이/단체 사용 이미지는 넣지 마세요.\n- 제품은 너무 작지 않게, 썸네일에서 HYALURONIC ACID TONER 제품임이 보이게.\n\n[대표 이미지 디자인 기준]\n- 프리미엄 한국 쿠팡 화장품 대표 이미지 느낌.\n- 제품과 카피가 모바일 썸네일에서 직관적으로 보여야 합니다.\n- 한국어 글자는 크고 명확하게, 짧은 문장만.\n- 의료/치료/개선 보장 표현 없이 화장품 사용감 중심.\n\n[절대 금지]\n- 온 가족, 가족, 아이, 모두 함께 같은 메시지 금지.\n- CUT, STEP, POINT, V1, V2, 후보번호, 01, 02 같은 제작용 표식 금지.\n- AQUA LOTION 또는 로션 제품으로 변형 금지.\n- 가짜 박스/가짜 인증마크/가짜 로고 금지.\n- 한국어 오타, 깨진 글자, 너무 작은 긴 문장, 잘린 텍스트 금지.\n- 설명 텍스트 답변만 하지 말고 반드시 이미지 생성.`;
await fs.writeFile(path.join(promptDir, `${num}-regenerate-no-family-submitted.txt`), prompt);

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error(`not images url: ${page.url()}`);
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(1500); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await getImageData(page);
const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));
await fs.writeFile(path.join(promptDir, `${num}-regenerate-no-family-before.json`), JSON.stringify({ ids: [...beforeIds], imgs: before.imgs }, null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, existingRefs);
await page.waitForTimeout(8000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.screenshot({ path: path.join(root, 'tmp-toner-rep02-no-family-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(8000);
const chatUrl = page.url();
await fs.writeFile(path.join(promptDir, `${num}-regenerate-no-family-chat-url.txt`), chatUrl + '\n');
console.log('submitted', chatUrl);

for (let attempt = 1; attempt <= 150; attempt++) {
  await page.waitForTimeout(8000);
  const data = await getImageData(page);
  const candidates = []; const seen = new Set();
  for (const img of data.imgs) {
    if (img.w < 900 || img.h < 900) continue;
    if (hasKnownId(img.src, beforeIds)) continue;
    const id = primaryId(img.src);
    if (seen.has(id)) continue;
    seen.add(id); candidates.push({ ...img, id });
  }
  console.log('poll', attempt, 'busy', data.busy, 'candidates', candidates.map(x => ({ id: x.id, w: x.w, h: x.h, alt: x.alt })));
  if (candidates.length && !data.busy) {
    const img = candidates.at(-1);
    const b64 = await page.evaluate(async (src) => {
      const r = await fetch(src, { credentials: 'include' });
      if (!r.ok) throw new Error('fetch ' + r.status);
      const ab = await r.arrayBuffer(); const bytes = new Uint8Array(ab);
      let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return btoa(s);
    }, img.src);
    const buf = Buffer.from(b64, 'base64');
    const raw = path.join(rawDir, `${num}-gpt-regenerate-no-family.png`);
    const final = path.join(repDir, `${num}.png`);
    await fs.writeFile(raw, buf);
    await sharp(buf).resize(1000, 1000, { fit: 'cover', position: 'center' }).png({ compressionLevel: 9 }).toFile(final);
    await fs.copyFile(raw, path.join(rawDir, `${num}-gpt.png`));
    await fs.writeFile(path.join(promptDir, `${num}-regenerate-no-family-result.txt`), JSON.stringify({ chatUrl, src: img.src, id: img.id, bytes: buf.length, natural: `${img.w}x${img.h}`, raw, final, alt: img.alt }, null, 2));
    await fs.writeFile(path.join(promptDir, `${num}-result.txt`), JSON.stringify({ chatUrl, src: img.src, id: img.id, bytes: buf.length, natural: `${img.w}x${img.h}`, raw, final, alt: img.alt, replacementReason: 'Removed family-use messaging per Leo feedback' }, null, 2));
    console.log('saved', final, img.id, buf.length, `${img.w}x${img.h}`);
    await page.close().catch(() => {});
    process.exit(0);
  }
}
await page.screenshot({ path: path.join(root, 'tmp-toner-rep02-no-family-failed.png'), fullPage: true }).catch(() => {});
throw new Error('no new generated image for rep02 no-family');

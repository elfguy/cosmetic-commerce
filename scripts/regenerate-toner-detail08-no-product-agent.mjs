import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const detailDir = path.join(outDir, 'detail');
const rawDir = path.join(outDir, 'agent-detail-raw');
const promptDir = path.join(outDir, 'agent-detail-prompts');
const refDir = path.join(outDir, 'reference');
const rejectedDir = path.join(outDir, 'rejected');
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(promptDir, { recursive: true });
await fs.mkdir(refDir, { recursive: true });
await fs.mkdir(rejectedDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, '');
const currentFinal = path.join(detailDir, '08.png');
const currentBackup = path.join(rejectedDir, `08-before-no-product-${stamp}.png`);
try { await fs.copyFile(currentFinal, currentBackup); } catch {}

const refs = [
  path.join(outDir, 'detail/06.png'),
  path.join(outDir, 'detail/07.png'),
  path.join(outDir, 'detail/08.png'),
  path.join(outDir, 'detail/09.png'),
  path.join(root, 'public/coupang/images/aqua-lotion/versions/v4/detail/08.png'),
];

const prompt = `업로드한 참고 이미지들을 기준으로 쿠팡 모바일 상세페이지용 세로 이미지 1장을 다시 만들어주세요.

목표: 유어스킨플러스 히알루론산 토너 상세페이지 08번째 컷 리뉴얼.
중요: 반드시 ChatGPT Images 이미지 생성 결과물 안에 텍스트까지 자연스럽게 포함해 주세요. 배경만 만들지 마세요.

[이번 수정의 핵심]
- 기존 08번 컷은 앞 컷들과 제품 병이 너무 반복되어 보입니다.
- 이번 08번 컷에는 실제 제품병, 제품 라벨, 패키지, 박스, 목업을 절대 넣지 마세요.
- 상품 없이 정보 카드/아이콘/수분감 있는 배경만으로 구성합니다.
- 업로드한 아쿠아 로션 v4 08번처럼 상품 없이도 신뢰감 있는 큰 제목 + 카드형 정보 + 부드러운 아쿠아/민트 톤을 참고하세요.
- 단, 아쿠아 로션의 피부자극 테스트/인증서 내용은 복사하지 말고 톤과 구성감만 참고합니다.

[스타일 기준]
- 기존 토너 상세컷 06, 07, 09와 이어지는 톤: 흰색 베이스, 부드러운 아쿠아/민트/그린 포인트, 물결/물방울, 깨끗한 카드형 레이아웃.
- 고급 한국 화장품 상세페이지 느낌.
- 폰트는 굵은 한국어 산세리프 제목 + 읽기 쉬운 본문.
- 제품 사진 없이도 빈약하지 않게, 중앙에 큰 rounded card 또는 3개 정보 카드로 균형 있게 채워 주세요.
- 과한 잎사귀, 어두운 실험실, 공장 인포그래픽, fake certificate, official EWG 로고 사용 금지.
- 이미지 비율은 780 x 1360 세로형에 맞는 구도.

[컷의 역할]
이번 컷은 “향료 무첨가 / EWG 그린 등급 원료 구성 / 산뜻한 워터리 사용감”을 담백하게 보여주는 정보 컷입니다.
앞 컷에서 제품 병이 이미 충분히 나왔으므로 이번 컷은 상품 없이 쉬어가는 카드형 정보 컷이어야 합니다.

[반드시 들어갈 한국어 텍스트 — 그대로 사용]
제목:
매일 쓰는 토너라
더 담백하게

서브 문장:
향료 무첨가, EWG 그린 등급 원료 구성으로
데일리 루틴에 맞췄습니다

카드 1:
향료 무첨가
향료를 넣지 않아 부담 없이 사용 가능

카드 2:
EWG 그린 등급 원료 구성
일상 사용을 고려한 원료 배합

카드 3:
산뜻한 워터리 사용감
끈적임 없이 가볍고 산뜻한 마무리

하단 작은 문구:
원료 등급은 원료사 기준 정보에 따름

[시각 아이디어]
- 제품 대신 투명한 물방울, 잎사귀 아이콘, 비커/드롭 아이콘 정도만 사용.
- 중앙 또는 하단에 물결과 투명한 아쿠아 카드가 겹치는 구조.
- 3개 카드는 같은 크기로 정돈하고, 아이콘은 심플한 라인 아이콘.
- 전체적으로 기존 07→08→09 흐름에서 제품 반복을 줄이는 쉬어가는 정보 컷.

[검수 기준]
- 제품병/제품 라벨/박스/목업이 하나라도 나오면 실패입니다.
- 한국어 텍스트가 깨지거나 이상한 글자로 변형되면 실패입니다.
- “안전한 성분만”, “민감 피부도 안심”, “무자극” 같은 과장/의학적 표현이 나오면 실패입니다.
- 공식 EWG 로고처럼 보이는 로고를 만들면 실패입니다.
- 폰트와 색감이 기존 토너 상세컷과 지나치게 이질적이면 실패입니다.`;

await fs.writeFile(path.join(promptDir, '08-fragrance-ewg-no-product-prompt.txt'), prompt);
await fs.writeFile(path.join(promptDir, '08-fragrance-ewg-no-product-refs.json'), JSON.stringify({ refs, currentBackup }, null, 2));
console.log('start 08 no product', { refs, currentBackup });

function fileIdsFromText(text) { return [...String(text || '').matchAll(/file_[0-9a-fA-F]+/g)].map(m => m[0]); }
function candidateIds(src) { const ids = new Set(fileIdsFromText(src)); try { const u = new URL(src); const id = u.searchParams.get('id'); for (const x of fileIdsFromText(id || '')) ids.add(x); if (id?.startsWith('file_')) ids.add(id); } catch {} return [...ids]; }
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
console.log('goto images');
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);
console.log({ url: page.url(), title: await page.title() });
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { console.log('click create'); await create.click({ timeout: 15000 }).catch(e => console.log('create click fail', e.message)); await page.waitForTimeout(1500); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await state(page);
const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));
console.log('upload refs');
await page.setInputFiles('input[type="file"]', refs);
await page.waitForTimeout(10000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
console.log('submit prompt');
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(8000);
const chatUrl = page.url();
await fs.writeFile(path.join(promptDir, '08-fragrance-ewg-no-product-chat-url.txt'), chatUrl + '\n');
console.log('submitted', chatUrl);

for (let i = 1; i <= 120; i++) {
  await page.waitForTimeout(8000);
  const s = await state(page);
  const candidates = [];
  const seen = new Set();
  for (const img of s.imgs) {
    if (img.w < 900 || img.h < 900) continue;
    if (hasKnownId(img.src, beforeIds)) continue;
    if (['06.png', '07.png', '08.png', '09.png'].includes(img.alt)) continue;
    const id = primaryId(img.src);
    if (seen.has(id)) continue;
    seen.add(id);
    candidates.push({ ...img, id });
  }
  console.log('poll 08', i, 'busy', s.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
  if (candidates.length && !s.busy) {
    const gen = candidates.filter(c => c.alt.includes('생성된 이미지'));
    const img = (gen.length ? gen : candidates).at(-1);
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
    const raw = path.join(rawDir, '08-fragrance-ewg-no-product-agent.png');
    const final = path.join(detailDir, '08.png');
    await fs.writeFile(raw, buf);
    await fs.writeFile(final, buf);
    const result = { chatUrl, id: img.id, natural: `${img.w}x${img.h}`, bytes: buf.length, raw, final, currentBackup, alt: img.alt, rule: 'direct ChatGPT Images output; no local compositing/editing; no product requested' };
    await fs.writeFile(path.join(promptDir, '08-fragrance-ewg-no-product-result.json'), JSON.stringify(result, null, 2));
    console.log('saved', JSON.stringify(result));
    await page.close().catch(() => {});
    process.exit(0);
  }
}
throw new Error('no generated image');

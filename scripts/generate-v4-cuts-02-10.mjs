import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const base = path.join(root, 'public/coupang/images/aqua-lotion/versions');
const v4 = path.join(base, 'v4');
const outDir = path.join(v4, 'detail');
await fs.mkdir(outDir, { recursive: true });

const globalBrief = await fs.readFile(path.join(v4, 'prompts/00-global-brief.txt'), 'utf8');
const board = path.join(v4, 'reference/v4-reference-board.png');
const productRef = path.join(base, 'original/representative/01.png');
const v2Rep = path.join(base, 'v2/representative/01.png');

const cuts = [
  {n:'02', title:'가족 데일리 보습', refs:['v2/detail/02.png'], prompt:`V4 상세 02 — 가족 데일리 보습\n\n참조: V2 detail 02.\n온 가족이 함께 쓰는 산뜻한 데일리 보습 페이지를 만든다. 밝은 욕실/거실 느낌, 부모와 아이가 함께 있는 깨끗한 라이프스타일 이미지.\n큰 문구: 온 가족이 함께 쓰는 산뜻한 데일리 보습\n보조 문구: 끈적임 없이 편안하게, 매일 부담 없이 촉촉하게\n아이콘 카드 3개: 얼굴부터 건조한 부위까지 / 끈적임 없이 편안하게 / 건조하고 민감한 피부에도 데일리 케어\n제품이 보이면 내용물은 흰색, 용기 상단은 투명하게.`},
  {n:'03', title:'크림 부담 대안', refs:['v2/detail/01.png','v2/representative/01.png'], prompt:`V4 상세 03 — 크림 부담 대안\n\n참조: V2 대표이미지 01, V2 detail 01.\n제품 중심의 문제-해결형 상세페이지.\n큰 문구: 크림은 무겁고 토너는 부족할 때\n보조 문구: 산뜻하게 채우는 데일리 아쿠아 로션\n구성: 제품 1개, 물결 배경, 성분 아이콘 4개(8종 히알루론산, 병풀추출물, 해양심층수, Fresh Bud No.6).\n제품은 반드시 흰색 내용물과 투명한 상단이 보이게.`},
  {n:'04', title:'핵심 수분·진정 성분', refs:['v2/detail/01.png','v2/detail/03.png','v2/detail/04.png'], prompt:`V4 상세 04 — 핵심 수분·진정 성분\n\n참조: V2 detail 01, 03, 04.\n깨끗한 성분 카드형 페이지.\n큰 문구: 수분부터 진정까지 한 번에 채우는 핵심 성분\n핵심 성분: 8종 히알루론산, 병풀추출물, 해양심층수, Fresh Bud No.6.\n각 성분은 물방울/잎/해양/새싹 원료 이미지와 함께 고급스럽게 배치.\n작은 글자는 최소화하고 모바일에서 읽히게.`},
  {n:'05', title:'특허 진정 원료 통합', refs:['v2/detail/05.png','v2/detail/06.png','original/detail/06.png'], prompt:`V4 상세 05 — 특허 진정 원료 통합\n\n참조: V2 detail 05와 06. 전체 느낌은 V2 detail 06을 우선한다.\nV2의 특허성분 05와 06 내용을 한 페이지로 통합한다.\n큰 문구: 민감 피부를 위해 설계된 특허 진정 원료\n구성: 6가지 새싹/식물 원료를 원형 접시 또는 물 위 플로팅 원료로 풍성하게 배치. 하단에는 특허 증서 느낌을 작게 배치하되 공식 인증 과장 금지.\n문구 예: Fresh Bud No.6 함유 / 새싹 유래 복합 성분 / 민감 피부 적합\nCUT/POINT 번호 금지.`},
  {n:'06', title:'발효성분 보강', refs:['v2/detail/07.png','original/detail/07.png','original/detail/08.png'], prompt:`V4 상세 06 — 발효성분 보강\n\n참조: V2 detail 07, original detail 07, original detail 08.\nV2 07의 가운데가 비어 보이는 문제를 해결한다. 발효 원료 이미지와 발효 비커/투명 접시를 풍성하게 배치한다.\n큰 문구: 발효 성분이 깨우는 피부 컨디션\n반드시 아래 성분명을 명확히 넣기:\n효모/겨우살이추출물\n효모/띠뿌리발효추출물\n락토바실러스/콩발효추출물\n하단에는 식물 유래 오일 블렌딩을 간단히 표시: 마카다미아씨오일, 해바라기씨오일, 로즈힙열매오일.\n중앙이 비지 않게 원료 이미지, 물방울, 투명 접시, 발효 보울을 균형 있게 채운다.`},
  {n:'07', title:'EWG 그린 & 약산성 pH', refs:['v3/detail/06.png','v3/detail/07.png'], prompt:`V4 상세 07 — EWG 그린 & 약산성 pH\n\n참조: V3 detail 06, V3 detail 07.\nV2에는 없던 전성분 EWG 그린과 약산성 pH 내용을 추가한다.\n큰 문구: 예민한 피부도 편안하게, 전성분 EWG 그린 & 약산성 pH\n내용: 전성분 EWG 그린 등급 / pH 5.0~6.5 / 피부 밸런스 케어 / 무향.\n구성: pH 게이지, 녹색 등급표, 물방울, 제품 이미지.\n중요: EWG VERIFIED나 공식 인증처럼 보이는 로고/마크는 만들지 말고, 일반 설명형 그래픽으로만 표현.`},
  {n:'08', title:'제조일자/신선 제품 보장', refs:['v2/detail/09.png','v3/detail/07.png'], prompt:`V4 상세 08 — 제조일자/신선 제품 보장\n\n참조: V2 detail 09, V3 detail 07 하단.\nV2 09의 중간 이하 어려운 설명을 소비자가 이해하기 쉬운 그림식 비교로 바꾼다.\n큰 문구: 신선함은 제조일자에서 시작됩니다\n구성: 왼쪽 좋은 예 — 제조번호와 제조일자 표시 / 오른쪽 비교 — 사용기한만 표시.\n핵심 문구: 제조 6개월 이내 신선 제품만 출고\n아래 문구: 신선한 제품일수록 안심하고 사용할 수 있습니다.\n그림/아이콘 중심, 너무 어려운 표나 긴 본문 금지.`},
  {n:'09', title:'사용법 + 친환경포장 + 제조사 직접판매', refs:['v3/detail/08.png','v2/detail/10.png'], prompt:`V4 상세 09 — 사용법 + 친환경포장 + 제조사 직접판매\n\n참조: V3 detail 08.\nSTOP/잠금 방향 설명은 절대 넣지 않는다. 펌프를 돌리는 그림/OPEN/STOP 문구 금지.\n큰 문구: 매일 편하게 사용하는 아쿠아 로션\n사용법은 사진/그림 2개 정도로 간단히: 얼굴과 몸에 부드럽게 펴 바르기 / 건조한 부위에 가볍게 덧바르기.\n하단 카드 2개: 친환경 포장 / 제조사가 직접 판매.\n아이콘 중심으로 쉽고 친근하게. 긴 전성분 표는 넣지 말 것.`},
  {n:'10', title:'마무리 신뢰/제품 정보', refs:['v2/detail/10.png','v2/detail/11.png','v3/detail/08.png'], prompt:`V4 상세 10 — 마무리 신뢰/제품 정보\n\n참조: V2 detail 10~11, V3 detail 08 하단.\n구매 전 마지막 신뢰 컷.\n큰 문구: 매일 쓰는 보습, 더 안심할 수 있게\n구성: 제품 이미지, 제품 정보 표를 깔끔하게.\n표 내용: 제품명 히알루론산 아쿠아 로션 / 용량 300ml / 무향 / 약산성 / 제조 6개월 이내 신선 제품 보장.\n과장 표현 없이 깨끗하고 신뢰감 있게 마무리.`}
];

function idOf(src){ try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
async function estuaryImages(page) {
  return await page.evaluate(() => Array.from(document.images).map((img,i)=>({i, alt:img.alt, src:img.currentSrc||img.src, w:img.naturalWidth, h:img.naturalHeight})).filter(x => x.src && x.src.includes('backend-api/estuary/content')));
}
async function download(page, src, file) {
  const b64 = await page.evaluate(async (src) => {
    const r = await fetch(src, { credentials: 'include' });
    if (!r.ok) throw new Error('fetch '+r.status);
    const ab = await r.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(ab);
    const chunk = 0x8000;
    for (let i=0;i<bytes.length;i+=chunk) binary += String.fromCharCode(...bytes.subarray(i,i+chunk));
    return btoa(binary);
  }, src);
  await fs.writeFile(file, Buffer.from(b64, 'base64'));
  return Buffer.from(b64, 'base64').length;
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const chatLog = [];

for (const cut of cuts) {
  const targetFile = path.join(outDir, `${cut.n}.png`);
  try {
    await fs.access(targetFile);
    console.log(`\n=== CUT ${cut.n} ${cut.title} already exists, skip ===`);
    continue;
  } catch {}

  const page = await ctx.newPage();
  await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
  await page.waitForTimeout(2500);
  console.log(`\n=== CUT ${cut.n} ${cut.title} ===`);
  const rawFiles = [board, productRef, v2Rep, ...cut.refs.map(r => path.join(base, r))];
  const uploadPayloads = [];
  const seen = new Set();
  let idx = 1;
  for (const f of rawFiles) {
    const resolved = path.resolve(f);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    const ext = path.extname(f) || '.png';
    const safeBase = path.basename(f, ext).replace(/[^a-zA-Z0-9_-]/g, '-');
    uploadPayloads.push({
      name: `cut${cut.n}-ref${String(idx).padStart(2,'0')}-${safeBase}${ext}`,
      mimeType: ext.toLowerCase() === '.jpg' || ext.toLowerCase() === '.jpeg' ? 'image/jpeg' : 'image/png',
      buffer: await fs.readFile(f)
    });
    idx++;
  }
  await page.setInputFiles('input#upload-files', uploadPayloads);
  await page.waitForTimeout(8000);
  // Dismiss duplicate-file modal if ChatGPT still shows one.
  const dupModal = page.locator('#modal-duplicate-file');
  if (await dupModal.count()) {
    await page.keyboard.press('Escape').catch(()=>{});
    await page.waitForTimeout(1000);
  }
  const afterUpload = await estuaryImages(page);
  const uploadIds = new Set(afterUpload.map(x => idOf(x.src)));
  console.log('uploaded ids', [...uploadIds]);
  const fullPrompt = `${globalBrief}\n\n${cut.prompt}\n\n위 조건으로 V4 상세 ${cut.n} 이미지를 실제 이미지 파일로 1장 생성해줘. 이 새 대화의 첨부 이미지와 이 프롬프트만 기준으로 생성해줘.`;
  await fs.writeFile(path.join(v4, `prompts/${cut.n}-submitted.txt`), fullPrompt);
  await page.locator('#prompt-textarea').click();
  await page.keyboard.insertText(fullPrompt);
  await page.waitForTimeout(500);
  await page.locator('button[data-testid="send-button"], button[aria-label*="보내기"], button[aria-label*="전송"], button.composer-submit-button-color').last().click({ timeout: 15000 });
  console.log('submitted', page.url());
  let saved = false;
  for (let attempt=1; attempt<=72; attempt++) {
    await page.waitForTimeout(10000);
    const imgs = await estuaryImages(page);
    const candidates = imgs.filter(x => x.w >= 700 && x.h >= 900 && !uploadIds.has(idOf(x.src)));
    console.log('attempt', attempt, 'candidates', candidates.map(x=>({id:idOf(x.src), w:x.w, h:x.h, alt:x.alt})));
    if (candidates.length) {
      const gen = candidates[candidates.length-1];
      const file = path.join(outDir, `${cut.n}.png`);
      const bytes = await download(page, gen.src, file);
      await fs.writeFile(path.join(v4, `prompts/${cut.n}-chat-url.txt`), `${page.url()}\n${gen.src}\n`);
      console.log('saved', file, bytes, idOf(gen.src));
      chatLog.push({cut:cut.n, title:cut.title, url:page.url(), id:idOf(gen.src), bytes});
      saved = true;
      break;
    }
  }
  if (!saved) {
    await page.screenshot({path:path.join(root, `tmp-v4-cut-${cut.n}-failed.png`), fullPage:false});
    throw new Error(`No image generated for cut ${cut.n}`);
  }
  await page.close().catch(()=>{});
}
await fs.writeFile(path.join(v4, 'prompts/chatgpt-v4-generation-log.json'), JSON.stringify(chatLog, null, 2));
console.log('\nDONE', JSON.stringify(chatLog, null, 2));

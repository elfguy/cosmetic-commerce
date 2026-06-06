import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const repDir = path.join(outDir, 'representative');
const rawDir = path.join(outDir, 'agent-representative-raw');
const promptDir = path.join(outDir, 'agent-representative-prompts');
await fs.mkdir(repDir, { recursive: true });
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(promptDir, { recursive: true });

const refs = [
  path.join(outDir, 'representative/01.png'),
  path.join(root, 'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png'),
  path.join(root, 'public/coupang/images/hyaluronic-acid-toner/product/01.png'),
  path.join(root, 'public/coupang/images/hyaluronic-acid-toner/product/02.png'),
  path.join(outDir, 'detail/01.png'),
  path.join(outDir, 'detail/02.png'),
  path.join(outDir, 'detail/03.png'),
].filter(Boolean);

const existingRefs = [];
for (const r of refs) {
  try { await fs.stat(r); existingRefs.push(r); } catch {}
}

const briefs = [
  {
    n: 2,
    title: '온 가족 데일리 수분 토너',
    sub: '500ml 넉넉하게, 매일 산뜻한 수분 루틴',
    chips: '500ml 대용량 / 닦토·흡토·스킨팩',
    visual: '밝은 욕실/화장대 라이프스타일. 제품은 오른쪽 또는 중앙에 큼직하지만 자연스럽게. 가족 이미지는 직접 얼굴 클로즈업보다 수건, 세면대, 손, 데일리 루틴 소품 중심으로 깨끗하게.'
  },
  {
    n: 3,
    title: '500ml 대용량 수분 루틴',
    sub: '아침저녁 부담 없이 쓰는 넉넉한 토너',
    chips: '대용량 / 데일리 / 산뜻한 사용감',
    visual: '500ml 넉넉함이 느껴지는 제품 히어로. 투명한 물방울, 토너 패드, 깨끗한 화장솜. 제품 크기와 500ml 포인트가 한눈에 보이게.'
  },
  {
    n: 4,
    title: '세안 후 첫 수분',
    sub: '건조해지기 전, 가장 먼저 채우는 토너 케어',
    chips: '첫 단계 수분 / 피부결 정돈 / 촉촉한 시작',
    visual: '세안 후 맑은 피부와 물방울 감성. 물기 있는 세면대, 깨끗한 타월, 투명한 토너 제형. 크림처럼 끈적이거나 로션 바르는 장면 금지.'
  },
  {
    n: 5,
    title: '하나로 4가지 토너 케어',
    sub: '닦토 · 흡토 · 스킨팩 · 레이어링',
    chips: '4가지 활용 / 데일리 케어 / 산뜻 수분',
    visual: '4개의 둥근 카드나 아이콘으로 닦토, 흡토, 스킨팩, 레이어링을 간단히 보여주기. 제품은 중앙 또는 우측. 정보는 많지만 썸네일에서 답답하지 않게.'
  },
  {
    n: 6,
    title: '수분 레이어링',
    sub: '겹겹이 가볍게 쌓는 촉촉한 토너 루틴',
    chips: '흡수감 / 물방울 레이어 / 데일리 보습',
    visual: '투명한 수분 레이어, 물방울 막, 손바닥으로 얼굴을 가볍게 눌러 흡수시키는 토너 느낌. 로션/크림처럼 흰 제형을 문지르는 장면 금지.'
  },
];

function fileIdsFromText(text) {
  return [...String(text || '').matchAll(/file_[0-9a-fA-F]+/g)].map(m => m[0]);
}
function candidateIds(src) {
  const ids = new Set(fileIdsFromText(src));
  try {
    const u = new URL(src);
    const id = u.searchParams.get('id');
    for (const x of fileIdsFromText(id || '')) ids.add(x);
    if (id && id.startsWith('file_')) ids.add(id);
  } catch {}
  return [...ids];
}
function hasKnownId(src, known) {
  const ids = candidateIds(src);
  return ids.some(id => known.has(id));
}
function primaryId(src) {
  const ids = candidateIds(src);
  return ids.find(id => id.startsWith('file_')) || src;
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];

async function getImageData(page) {
  return page.evaluate(() => ({
    title: document.title,
    url: location.href,
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    bodyText: document.body.innerText.slice(0, 2000),
    imgs: Array.from(document.images).map(img => ({
      alt: img.alt || '',
      src: img.currentSrc || img.src || '',
      w: img.naturalWidth,
      h: img.naturalHeight,
      rect: (() => { const r = img.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()
    })).filter(x => x.src.includes('backend-api/estuary/content'))
  }));
}

async function submitAndDownload(brief) {
  const num = String(brief.n).padStart(2, '0');
  const prompt = `쿠팡 대표/메인 이미지 정사각형 1장을 ChatGPT Images 2.0 완성본으로 실제 생성해 주세요. 설명만 하지 말고 이미지 자체를 만들어 주세요.\n\n제품: YOURSKIN+ HYALURONIC ACID TONER 500ml / 유어스킨플러스 히알루론산 토너 500ml\n목표: 대표 이미지 ${num}. 최종 용도는 쿠팡 상품 대표 이미지 썸네일입니다.\n비율: 1:1 정사각형. 안전 여백 충분히.\n\n[중요 - 이미지 에이전트 완성본]\n- 한국어 제목/칩까지 이미지 안에 자연스럽게 포함한 완성 광고 이미지로 생성하세요.\n- 업로드한 실제 토너 제품 사진을 제품 형태/투명 용기/라벨/500ml 기준으로 사용하세요.\n- 제품명은 반드시 HYALURONIC ACID TONER / 500ml 느낌을 유지하세요. AQUA LOTION, AQUA MOISTURE LOTION, CREAM, SERUM으로 바꾸지 마세요.\n- 업로드한 V1 상세컷들의 흰색 + 연아쿠아 + 민트 + 깨끗한 화장품 광고 톤과 맞추세요.\n\n[이번 컷 핵심 카피]\n큰 제목: ${brief.title}\n서브 카피: ${brief.sub}\n칩/포인트: ${brief.chips}\n\n[시각 구성]\n${brief.visual}\n\n[대표 이미지 디자인 기준]\n- 프리미엄 한국 쿠팡 화장품 대표 이미지 느낌.\n- 제품이 한눈에 보여야 하며 너무 작거나 잘리면 안 됩니다.\n- 흰색/연아쿠아 배경, 맑은 물방울, 민트 포인트, 깨끗한 스킨케어 무드.\n- 한국어 글자는 크고 명확하게, 짧은 문장만.\n- 의료/치료/개선 보장 표현 없이 화장품 사용감 중심.\n\n[절대 금지]\n- CUT, STEP, POINT, V1, V2, 후보번호, 01, 02 같은 제작용 표식 금지.\n- AQUA LOTION 또는 로션 제품으로 변형 금지.\n- 가짜 박스/가짜 인증마크/가짜 로고 금지.\n- 한국어 오타, 깨진 글자, 너무 작은 긴 문장, 잘린 텍스트 금지.\n- 설명 텍스트 답변만 하지 말고 반드시 이미지 생성.`;
  await fs.writeFile(path.join(promptDir, `${num}-submitted.txt`), prompt);

  const page = await ctx.newPage();
  await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error(`not images url: ${page.url()}`);
  const create = page.getByText('이미지 만들기', { exact: true }).first();
  if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(1500); }
  await page.waitForSelector('#prompt-textarea', { timeout: 60000 });

  const beforeData = await getImageData(page);
  const beforeIds = new Set(beforeData.imgs.flatMap(x => candidateIds(x.src)));
  await fs.writeFile(path.join(promptDir, `${num}-before.json`), JSON.stringify({ ids: [...beforeIds], imgs: beforeData.imgs }, null, 2));

  const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
  await page.setInputFiles(uploadSelectors, existingRefs);
  await page.waitForTimeout(8000);
  for (const text of ['확인', '완료']) {
    const btn = page.getByRole('button', { name: text }).first();
    if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
  }

  const composer = page.locator('#prompt-textarea').last();
  await composer.click();
  await page.keyboard.insertText(prompt);
  await page.screenshot({ path: path.join(root, `tmp-toner-agent-rep-${num}-before-send.png`), fullPage: true });
  const send = page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last();
  await send.click({ timeout: 15000 });
  await page.waitForTimeout(8000);
  const chatUrl = page.url();
  await fs.writeFile(path.join(promptDir, `${num}-chat-url.txt`), chatUrl + '\n');
  console.log('submitted', num, chatUrl);

  for (let attempt = 1; attempt <= 150; attempt++) {
    await page.waitForTimeout(8000);
    const data = await getImageData(page);
    const candidates = [];
    const seen = new Set();
    for (const img of data.imgs) {
      if (img.w < 900 || img.h < 900) continue;
      if (hasKnownId(img.src, beforeIds)) continue;
      const id = primaryId(img.src);
      if (seen.has(id)) continue;
      seen.add(id);
      candidates.push({ ...img, id });
    }
    console.log('poll', num, attempt, 'busy', data.busy, 'candidates', candidates.map(x => ({ id: x.id, w: x.w, h: x.h, alt: x.alt })));
    if (candidates.length && !data.busy) {
      const img = candidates.at(-1);
      const b64 = await page.evaluate(async (src) => {
        const r = await fetch(src, { credentials: 'include' });
        if (!r.ok) throw new Error('fetch ' + r.status);
        const ab = await r.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let s = '';
        for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        return btoa(s);
      }, img.src);
      const buf = Buffer.from(b64, 'base64');
      const raw = path.join(rawDir, `${num}-gpt.png`);
      const final = path.join(repDir, `${num}.png`);
      await fs.writeFile(raw, buf);
      await sharp(buf).resize(1000, 1000, { fit: 'cover', position: 'center' }).png({ compressionLevel: 9 }).toFile(final);
      await fs.writeFile(path.join(promptDir, `${num}-result.txt`), JSON.stringify({ chatUrl, src: img.src, id: img.id, bytes: buf.length, natural: `${img.w}x${img.h}`, raw, final, alt: img.alt }, null, 2));
      console.log('saved', num, final, img.id, buf.length, `${img.w}x${img.h}`);
      await page.close().catch(() => {});
      return;
    }
  }
  await page.screenshot({ path: path.join(root, `tmp-toner-agent-rep-${num}-failed.png`), fullPage: true }).catch(() => {});
  throw new Error('no new generated image for rep ' + num);
}

for (const brief of briefs) {
  await submitAndDownload(brief);
}
console.log('done toner representatives 02-06 via ChatGPT Images workspace');

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

const productRefs = [
  path.join(root, 'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png'),
  path.join(root, 'public/coupang/images/hyaluronic-acid-toner/product/01.png'),
  path.join(outDir, 'representative/01.png'),
].filter(Boolean);
const existingRefs = [];
for (const r of productRefs) { try { await fs.stat(r); existingRefs.push(r); } catch {} }

const briefs = [
  { n: 2, label: '매일 쓰는 산뜻 수분 토너', sub: '끈적임 없이 가볍게, 세안 후 촉촉한 첫 루틴', chips: '산뜻한 사용감 / 피부결 정돈 / 500ml 대용량', visual: '깨끗한 화장대, 화장솜, 맑은 물방울. 사람/가족 없음. 제품은 실물 사진 그대로 중앙 우측 큰 배치.' },
  { n: 3, label: '500ml 대용량 수분 루틴', sub: '아침저녁 부담 없이 쓰는 넉넉한 토너', chips: '500ml / 데일리 / 넉넉한 용량', visual: '500ml 대용량이 느껴지는 제품 히어로. 제품 옆에 작은 500ml 포인트 카드와 물방울 그래픽.' },
  { n: 4, label: '세안 후 첫 수분', sub: '건조해지기 전, 가장 먼저 채우는 토너 케어', chips: '첫 단계 수분 / 산뜻한 시작 / 피부결 정돈', visual: '세안 직후 맑은 화장대/타월/물방울 무드. 제품은 실물 그대로 전면에. 크림/로션 제형 표현 금지.' },
  { n: 5, label: '하나로 4가지 토너 케어', sub: '닦토 · 흡토 · 스킨팩 · 레이어링', chips: '4가지 활용 / 데일리 케어 / 산뜻 수분', visual: '4개의 둥근 카드/아이콘으로 닦토, 흡토, 스킨팩, 레이어링 표현. 제품은 실물 그대로 중심.' },
  { n: 6, label: '수분 레이어링', sub: '겹겹이 가볍게 쌓는 촉촉한 토너 루틴', chips: '흡수감 / 물방울 레이어 / 데일리 보습', visual: '투명한 수분 레이어와 물방울 막. 손바닥 흡수 느낌은 작게만, 제품은 실물 그대로 크게.' },
];

function fileIdsFromText(text) { return [...String(text || '').matchAll(/file_[0-9a-fA-F]+/g)].map(m => m[0]); }
function candidateIds(src) {
  const ids = new Set(fileIdsFromText(src));
  try { const u = new URL(src); const id = u.searchParams.get('id'); for (const x of fileIdsFromText(id || '')) ids.add(x); if (id?.startsWith('file_')) ids.add(id); } catch {}
  return [...ids];
}
function hasKnownId(src, known) { return candidateIds(src).some(id => known.has(id)); }
function primaryId(src) { return candidateIds(src).find(id => id.startsWith('file_')) || src; }
async function getImageData(page) {
  return page.evaluate(() => ({
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    imgs: Array.from(document.images).map(img => ({ alt: img.alt || '', src: img.currentSrc || img.src || '', w: img.naturalWidth, h: img.naturalHeight })).filter(x => x.src.includes('backend-api/estuary/content'))
  }));
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];

async function runOne(brief) {
  const num = String(brief.n).padStart(2, '0');
  const prompt = `쿠팡 대표/메인 이미지 정사각형 1장을 ChatGPT Images 2.0 이미지 에이전트로 실제 생성해 주세요. 설명만 하지 말고 이미지 자체를 만들어 주세요.\n\n제품: 유어스킨플러스 히알루론산 토너 500ml / YOURSKIN+ HYALURONIC ACID TONER 500ml\n이번 작업의 최우선 목표: 업로드한 실물 토너 제품 사진을 우리 상품으로 보존하는 것입니다. 새 병을 디자인하거나 비슷한 다른 제품으로 다시 그리지 마세요.\n\n[실물 제품 보존 필수]\n- 흰색 원통형 500ml 병, 짧고 넓은 흰색 원통 캡, 둥근 어깨, 반투명 병목을 유지하세요.\n- 전면 YOURSKIN+ 로고를 유지하세요. YOURSKIN은 검정, +는 초록색, K 위에 작은 초록 잎이 있습니다.\n- 큰 검은 대문자 제품명: HYALURONIC ACID TONER 를 유지하세요.\n- 하단 텍스트 HYDRATING FORMULA 와 500ml / 16.9 fl.oz 를 유지하세요.\n- 라벨 하단의 연한 파란 물결 그래픽을 유지하세요.\n- AQUA LOTION, AQUA MOISTURE, CREAM, SERUM, 새 브랜드명, 가짜 병, 가짜 박스 절대 금지.\n- 제품은 업로드한 실물 사진을 그대로 광고 이미지에 배치한 것처럼 보여야 합니다. 병 모양/라벨/로고/용량이 달라지면 실패입니다.\n\n[이번 대표 ${num} 카피]\n큰 제목: ${brief.label}\n서브 카피: ${brief.sub}\n포인트: ${brief.chips}\n\n[구성]\n${brief.visual}\n흰색 + 연아쿠아 + 민트 톤의 깨끗한 한국 화장품 대표 이미지. 제품은 썸네일에서 우리 상품임을 알아볼 수 있게 크게.\n\n[텍스트/안전]\n한국어는 크고 짧게. 의료/치료/효능보장 표현 금지. CUT, STEP, POINT, V1, V2, 01, 02 같은 제작용 표식 금지.\n온 가족/가족/아이 메시지 금지. 제품 외에 가짜 패키지/가짜 인증마크 금지.\n\n중요: 이 작업은 새 제품 디자인이 아니라 '실물 토너 제품 사진 보존 + 배경/광고 구성 생성'입니다.`;
  await fs.writeFile(path.join(promptDir, `${num}-preserve-product-submitted.txt`), prompt);
  const page = await ctx.newPage();
  await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error(`not images url: ${page.url()}`);
  const create = page.getByText('이미지 만들기', { exact: true }).first();
  if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(1500); }
  await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
  const before = await getImageData(page);
  const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));
  await fs.writeFile(path.join(promptDir, `${num}-preserve-product-before.json`), JSON.stringify({ ids: [...beforeIds], imgs: before.imgs }, null, 2));
  const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
  await page.setInputFiles(uploadSelectors, existingRefs);
  await page.waitForTimeout(8000);
  for (const text of ['확인', '완료']) { const btn = page.getByRole('button', { name: text }).first(); if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); } }
  await page.locator('#prompt-textarea').last().click();
  await page.keyboard.insertText(prompt);
  await page.screenshot({ path: path.join(root, `tmp-toner-rep${num}-preserve-before-send.png`), fullPage: true });
  await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
  await page.waitForTimeout(8000);
  const chatUrl = page.url();
  await fs.writeFile(path.join(promptDir, `${num}-preserve-product-chat-url.txt`), chatUrl + '\n');
  console.log('submitted', num, chatUrl);

  for (let attempt = 1; attempt <= 150; attempt++) {
    await page.waitForTimeout(8000);
    const data = await getImageData(page);
    const candidates = []; const seen = new Set();
    for (const img of data.imgs) {
      if (img.w < 900 || img.h < 900) continue;
      if (hasKnownId(img.src, beforeIds)) continue;
      const id = primaryId(img.src); if (seen.has(id)) continue; seen.add(id); candidates.push({ ...img, id });
    }
    console.log('poll', num, attempt, 'busy', data.busy, 'candidates', candidates.map(x => ({ id: x.id, w: x.w, h: x.h, alt: x.alt })));
    if (candidates.length && !data.busy) {
      const img = candidates.at(-1);
      const b64 = await page.evaluate(async (src) => { const r = await fetch(src, { credentials: 'include' }); if (!r.ok) throw new Error('fetch ' + r.status); const ab = await r.arrayBuffer(); const bytes = new Uint8Array(ab); let s=''; for (let i=0;i<bytes.length;i+=0x8000) s += String.fromCharCode(...bytes.subarray(i,i+0x8000)); return btoa(s); }, img.src);
      const buf = Buffer.from(b64, 'base64');
      const raw = path.join(rawDir, `${num}-gpt-preserve-product.png`);
      const final = path.join(repDir, `${num}.png`);
      await fs.writeFile(raw, buf);
      await sharp(buf).resize(1000, 1000, { fit: 'cover', position: 'center' }).png({ compressionLevel: 9 }).toFile(final);
      await fs.copyFile(raw, path.join(rawDir, `${num}-gpt.png`));
      const result = { chatUrl, src: img.src, id: img.id, bytes: buf.length, natural: `${img.w}x${img.h}`, raw, final, alt: img.alt, replacementReason: 'Regenerated to preserve real YOURSKIN+ HYALURONIC ACID TONER product identity' };
      await fs.writeFile(path.join(promptDir, `${num}-preserve-product-result.txt`), JSON.stringify(result, null, 2));
      await fs.writeFile(path.join(promptDir, `${num}-result.txt`), JSON.stringify(result, null, 2));
      console.log('saved', num, final, img.id, buf.length, `${img.w}x${img.h}`);
      await page.close().catch(() => {});
      return;
    }
  }
  await page.screenshot({ path: path.join(root, `tmp-toner-rep${num}-preserve-failed.png`), fullPage: true }).catch(() => {});
  throw new Error('no new image for ' + num);
}

for (const brief of briefs) await runOne(brief);
console.log('done preserve-product reps 02-06');

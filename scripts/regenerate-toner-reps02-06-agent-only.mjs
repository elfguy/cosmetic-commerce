import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const repDir = path.join(outDir, 'representative');
const rawDir = path.join(outDir, 'agent-representative-raw');
const promptDir = path.join(outDir, 'agent-representative-prompts');
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(promptDir, { recursive: true });

const refs = [
  path.join(root, 'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png'),
  path.join(outDir, 'representative/01.png'),
];

const briefs = [
  { n: '02', title: '매일 쓰는 산뜻 수분 토너', sub: '끈적임 없이 가볍게, 세안 후 촉촉한 첫 루틴', points: '산뜻한 사용감 / 피부결 정돈 / 500ml 대용량', scene: '깨끗한 화장대, 화장솜, 맑은 물방울, 민트·아쿠아 배경' },
  { n: '03', title: '500ml 넉넉한 수분 루틴', sub: '아침저녁 부담 없이 쓰는 대용량 데일리 토너', points: '500ml / 데일리 / 넉넉한 용량', scene: '넉넉한 대용량이 느껴지는 깨끗한 화장품 광고 배경' },
  { n: '04', title: '세안 후 첫 수분', sub: '건조해지기 전, 가장 먼저 채우는 토너 케어', points: '첫 단계 수분 / 산뜻한 시작 / 피부결 정돈', scene: '세안 직후의 맑고 촉촉한 욕실·화장대 무드, 타월과 물방울' },
  { n: '05', title: '하나로 4가지 토너 케어', sub: '닦토 · 흡토 · 스킨팩 · 레이어링', points: '4가지 활용 / 데일리 케어 / 산뜻 수분', scene: '4개의 둥근 카드/아이콘으로 닦토, 흡토, 스킨팩, 레이어링 표현' },
  { n: '06', title: '수분 레이어링', sub: '겹겹이 가볍게 쌓는 촉촉한 토너 루틴', points: '흡수감 / 물방울 레이어 / 데일리 보습', scene: '투명한 수분 레이어와 물방울 막, 깨끗한 민트·화이트 광고 배경' },
];

function fileIdsFromText(text) { return [...String(text || '').matchAll(/file_[0-9a-fA-F]+/g)].map(m => m[0]); }
function candidateIds(src) {
  const ids = new Set(fileIdsFromText(src));
  try { const u = new URL(src); const id = u.searchParams.get('id'); for (const x of fileIdsFromText(id || '')) ids.add(x); if (id?.startsWith('file_')) ids.add(id); } catch {}
  return [...ids];
}
function hasKnownId(src, known) { return candidateIds(src).some(id => known.has(id)); }
function primaryId(src) { return candidateIds(src).find(id => id.startsWith('file_')) || src; }
async function imageState(page) {
  return page.evaluate(() => ({
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    imgs: Array.from(document.images).map(img => ({ alt: img.alt || '', src: img.currentSrc || img.src || '', w: img.naturalWidth, h: img.naturalHeight })).filter(x => x.src.includes('backend-api/estuary/content')),
  }));
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];

async function generate(brief) {
  const prompt = `이미지 에이전트로 쿠팡 대표 이미지 1장을 실제 생성해 주세요. 설명하지 말고 이미지 파일을 생성하세요.\n\n중요한 작업 원칙:\n- 최종 이미지는 반드시 이미지 에이전트가 만든 결과여야 합니다.\n- 업로드한 원본 제품 사진의 병을 실제 우리 상품으로 사용하세요.\n- 새 병, 비슷한 병, 둥근 다른 병, 다른 라벨을 디자인하지 마세요.\n- 제품 병/라벨/캡/용량은 업로드된 YOURSKIN+ HYALURONIC ACID TONER 500ml 실물 제품과 같아야 합니다.\n- 참고 이미지 01번의 실제 상품처럼 길고 슬림한 흰색 원통 병, 짧고 넓은 흰색 캡, YOURSKIN+ 로고, HYALURONIC ACID TONER, HYDRATING FORMULA, 500ml / 16.9 fl.oz, 하단 연파랑 물결 라벨을 유지하세요.\n- AQUA LOTION, AQUA MOISTURE, CREAM, SERUM, 다른 브랜드명, 다른 병 모양, 박스 패키지 금지.\n\n이번 이미지 카피:\n큰 제목: ${brief.title}\n서브 문구: ${brief.sub}\n포인트: ${brief.points}\n\n구성/무드:\n${brief.scene}\n흰색 + 연아쿠아 + 민트 톤의 고급스럽고 깔끔한 한국 화장품 대표 이미지. 제품은 크게 보여야 합니다.\n\n금지:\n온가족/가족/아이 메시지 금지. 의료·치료·효능보장 표현 금지. 제작용 번호, STEP, CUT, V1, V2 표기 금지.\n\n다시 강조: 이 작업은 로컬 합성이 아니라 이미지 에이전트 생성 작업입니다. 하지만 제품 정체성은 업로드한 실물 YOURSKIN+ HYALURONIC ACID TONER 500ml와 같아야 합니다.`;
  await fs.writeFile(path.join(promptDir, `${brief.n}-agent-only-prompt.txt`), prompt);

  const page = await ctx.newPage();
  await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  const create = page.getByText('이미지 만들기', { exact: true }).first();
  if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(1500); }
  await page.waitForSelector('#prompt-textarea', { timeout: 60000 });

  const before = await imageState(page);
  const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));
  await fs.writeFile(path.join(promptDir, `${brief.n}-agent-only-before.json`), JSON.stringify({ ids: [...beforeIds] }, null, 2));

  const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
  await page.setInputFiles(uploadSelectors, refs);
  await page.waitForTimeout(8000);
  for (const text of ['확인', '완료']) {
    const btn = page.getByRole('button', { name: text }).first();
    if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
  }
  await page.locator('#prompt-textarea').last().click();
  await page.keyboard.insertText(prompt);
  await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
  await page.waitForTimeout(8000);
  const chatUrl = page.url();
  await fs.writeFile(path.join(promptDir, `${brief.n}-agent-only-chat-url.txt`), chatUrl + '\n');
  console.log('submitted', brief.n, chatUrl);

  for (let i = 1; i <= 140; i++) {
    await page.waitForTimeout(8000);
    const state = await imageState(page);
    const candidates = [];
    const seen = new Set();
    for (const img of state.imgs) {
      if (img.w < 900 || img.h < 900) continue;
      if (hasKnownId(img.src, beforeIds)) continue;
      const id = primaryId(img.src);
      if (seen.has(id)) continue;
      seen.add(id);
      candidates.push({ ...img, id });
    }
    console.log('poll', brief.n, i, 'busy', state.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
    if (candidates.length && !state.busy) {
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
      const raw = path.join(rawDir, `${brief.n}-agent-only.png`);
      const final = path.join(repDir, `${brief.n}.png`);
      // No local compositing/editing: write the image-agent output bytes as final.
      await fs.writeFile(raw, buf);
      await fs.writeFile(final, buf);
      const result = { chatUrl, id: img.id, natural: `${img.w}x${img.h}`, bytes: buf.length, final, raw, alt: img.alt, rule: 'final file is direct image-agent output bytes; no local compositing' };
      await fs.writeFile(path.join(promptDir, `${brief.n}-agent-only-result.json`), JSON.stringify(result, null, 2));
      console.log('saved-agent-only', brief.n, img.id, `${img.w}x${img.h}`, buf.length);
      await page.close().catch(() => {});
      return result;
    }
  }
  await page.screenshot({ path: path.join(root, `tmp-agent-only-${brief.n}-failed.png`), fullPage: true }).catch(() => {});
  throw new Error('no generated image for ' + brief.n);
}

const results = [];
for (const brief of briefs) results.push(await generate(brief));
await fs.writeFile(path.join(promptDir, 'agent-only-batch-result.json'), JSON.stringify(results, null, 2));
console.log('done-agent-only', results.length);

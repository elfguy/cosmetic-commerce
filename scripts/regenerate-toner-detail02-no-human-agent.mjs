import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const detailDir = path.join(outDir, 'detail');
const rawDir = path.join(outDir, 'agent-detail-raw');
const promptDir = path.join(outDir, 'agent-detail-prompts');
const rejectedDir = path.join(outDir, 'rejected', `detail02-human-before-no-human-${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}`);
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(promptDir, { recursive: true });
await fs.mkdir(rejectedDir, { recursive: true });

const refs = [
  path.join(outDir, 'detail/01.png'),
  path.join(outDir, 'detail/03.png'),
  path.join(outDir, 'detail/04.png'),
  path.join(outDir, 'detail/05.png'),
  path.join(root, 'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png'),
];

const oldFinal = path.join(detailDir, '02.png');
const oldRaw = path.join(rawDir, '02-usage-volume-reason-agent.png');
await fs.copyFile(oldFinal, path.join(rejectedDir, '02.png')).catch(() => {});
await fs.copyFile(oldRaw, path.join(rejectedDir, '02-usage-volume-reason-agent.png')).catch(() => {});

const prompt = `이미지 에이전트로 쿠팡 상세 이미지 02를 새로 생성하세요. 실제 완성 이미지를 생성해야 합니다.

목표: 현재 상세 02와 03이 모두 여성 모델/사람 얼굴 사용 장면이라 연속으로 보기에 과합니다. 상세 03은 사람 루틴 컷으로 유지할 예정이므로, 이번 상세 02는 반드시 사람 없이 제품/물/아이콘/카드형 인포그래픽 중심으로 바꿔주세요.

주제:
토너는 생각보다 빨리 줄어듭니다 — 그래서 500ml 대용량이 필요합니다.

핵심 메시지:
- 세안 후 첫 단계
- 화장솜 닦토
- 건조할 때 수분 보충
- 스킨팩/집중 수분
- 매일 아침저녁 쓰면 토너는 빠르게 줄어듭니다
- 그래서 아끼지 않는 500ml 대용량

디자인 방향:
- 업로드한 상세 01/03/04/05와 같은 브랜드 톤: 흰색, 연아쿠아, 민트, 맑은 물방울, 깨끗한 수분감.
- 사람이 나오지 않는 프리미엄 인포그래픽 컷으로 구성하세요.
- 4개 사용 상황 카드는 유지하되, 각 카드 안은 여성 얼굴/손/피부 대신 미니멀 아이콘과 오브젝트로 표현하세요.
  예: 물방울, 세안 물결, 화장솜 패드, 수분 게이지, 스킨팩 시트 아이콘, 아침/저녁 아이콘.
- 하단에는 500ml 대용량을 강조하는 실제 제품병을 작게 또는 중간 크기로 1개만 자연스럽게 배치해도 됩니다. 제품을 상세 01처럼 크게 반복하지 마세요.
- 모바일에서 제목과 4개 카드가 잘 읽히는 세로 780x1360 상세페이지 이미지.
- 전체 느낌은 깨끗한 화장품 상세페이지, 너무 만화 같지 않게 고급스럽게.

포함할 한국어 문구 — 아래 문구를 그대로 사용:
토너는 생각보다
빨리 줄어듭니다
매일 쓰는 토너라면
넉넉한 500ml가 필요합니다
세안 후 첫 단계
화장솜 닦토
건조할 때 수분 보충
스킨팩 집중 수분
아침저녁 아끼지 않는
500ml 대용량

절대 금지:
- 사람, 여성 모델, 얼굴, 손, 피부 클로즈업, 인물 사진 금지
- 상세 03처럼 사람 얼굴 4컷을 반복하는 구성 금지
- 제품 병 크게 반복 금지
- CUT, STEP, V1 같은 제작 번호 금지
- AQUA LOTION, CREAM, SERUM 등 다른 제품명 금지
- 한국어 오타/깨진 글자 금지
- 배경만 만들고 텍스트를 빼는 것 금지

결론: 상세 03은 사람 루틴 컷으로 남기고, 상세 02는 사람 없는 사용량/대용량 필요성 컷으로 차별화된 완성 이미지를 생성하세요.`;

function fileIdsFromText(text) { return [...String(text || '').matchAll(/file_[0-9a-fA-F]+/g)].map(m => m[0]); }
function candidateIds(src) { const ids = new Set(fileIdsFromText(src)); try { const u = new URL(src); const id = u.searchParams.get('id'); for (const x of fileIdsFromText(id || '')) ids.add(x); if (id?.startsWith('file_')) ids.add(id); } catch {} return [...ids]; }
function hasKnownId(src, known) { return candidateIds(src).some(id => known.has(id)); }
function primaryId(src) { return candidateIds(src).find(id => id.startsWith('file_')) || src; }
async function state(page) {
  return page.evaluate(() => ({
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    imgs: Array.from(document.images).map(img => ({ alt: img.alt || '', src: img.currentSrc || img.src || '', w: img.naturalWidth, h: img.naturalHeight })).filter(x => x.src.includes('backend-api/estuary/content'))
  }));
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);
console.log('opened', { url: page.url(), title: await page.title() });
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(1500); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await state(page);
const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));
await fs.writeFile(path.join(promptDir, '02-usage-volume-no-human-before.json'), JSON.stringify({ ids: [...beforeIds], openedUrl: page.url(), title: await page.title(), refs }, null, 2));
await fs.writeFile(path.join(promptDir, '02-usage-volume-no-human-prompt.txt'), prompt);
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
await fs.writeFile(path.join(promptDir, '02-usage-volume-no-human-chat-url.txt'), chatUrl + '\n');
console.log('submitted', chatUrl);
for (let i=1; i<=180; i++) {
  await page.waitForTimeout(8000);
  const s = await state(page);
  const candidates = []; const seen = new Set();
  for (const img of s.imgs) {
    if (img.w < 900 || img.h < 900) continue;
    if (hasKnownId(img.src, beforeIds)) continue;
    if (['01.png','02.png','03.png','04.png','05.png','히알루론산토너.png'].includes(img.alt)) continue;
    if (!img.alt.includes('생성된 이미지') && s.busy) continue;
    const id = primaryId(img.src); if (seen.has(id)) continue; seen.add(id);
    candidates.push({ ...img, id });
  }
  console.log('poll', i, 'busy', s.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
  if (candidates.length && !s.busy) {
    const generated = candidates.filter(c => c.alt.includes('생성된 이미지'));
    const img = (generated.length ? generated : candidates).at(-1);
    const b64 = await page.evaluate(async (src) => {
      const r = await fetch(src, { credentials: 'include' });
      if (!r.ok) throw new Error('fetch '+r.status);
      const ab = await r.arrayBuffer();
      const bytes = new Uint8Array(ab); let s='';
      for (let j=0; j<bytes.length; j+=0x8000) s += String.fromCharCode(...bytes.subarray(j,j+0x8000));
      return btoa(s);
    }, img.src);
    const buf = Buffer.from(b64, 'base64');
    const raw = path.join(rawDir, '02-usage-volume-no-human-agent.png');
    const final = path.join(detailDir, '02.png');
    await fs.writeFile(raw, buf);
    await fs.writeFile(final, buf);
    const result = { chatUrl, id: img.id, natural: `${img.w}x${img.h}`, bytes: buf.length, raw, final, rejectedDir, alt: img.alt, rule: 'direct ChatGPT Images output; no local compositing/editing' };
    await fs.writeFile(path.join(promptDir, '02-usage-volume-no-human-result.json'), JSON.stringify(result, null, 2));
    console.log('saved', JSON.stringify(result, null, 2));
    await page.close().catch(() => {});
    process.exit(0);
  }
}
throw new Error('no generated image for detail 02 no-human');

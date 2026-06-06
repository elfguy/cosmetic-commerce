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

const commonRefs = [
  path.join(outDir, 'detail/01.png'),
  path.join(outDir, 'rejected/detail02-04-merge-before-20260605T215843/02.png'),
  path.join(outDir, 'rejected/detail02-04-merge-before-20260605T215843/03.png'),
  path.join(outDir, 'rejected/detail02-04-merge-before-20260605T215843/04.png'),
  path.join(root, 'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png'),
];

const jobs = [
  {
    n: '02',
    name: 'usage-volume-reason',
    prompt: `이미지 에이전트로 쿠팡 상세 이미지 02를 새로 생성하세요. 실제 완성 이미지를 생성해야 합니다.\n\n목표: 기존 상세 02/03/04의 중복 내용을 2장으로 압축합니다. 이 이미지는 첫 번째 압축 이미지입니다.\n\n주제:\n토너는 생각보다 빨리 줄어듭니다 — 그래서 500ml 대용량이 필요합니다.\n\n핵심 메시지:\n- 세안 후 첫 단계\n- 화장솜 닦토\n- 건조할 때 수분 보충\n- 스킨팩/집중 수분\n- 매일 아침저녁 쓰면 토너는 빠르게 줄어듭니다\n- 그래서 아끼지 않는 500ml 대용량\n\n디자인 방향:\n- 상세 01과 같은 톤: 흰색, 연아쿠아, 민트, 맑은 물방울, 깨끗한 수분감.\n- 기존 02의 4개 사용 장면 카드 구조를 더 깔끔하고 프리미엄하게 정리하세요.\n- 제품 병은 1번에서 크게 노출됐으므로 기본적으로 없어도 됩니다. 만약 넣는 게 자연스럽다면 하단 구석에 아주 작게만 넣으세요. 제품을 크게 반복하지 마세요.\n- 사람 얼굴/피부 사용 장면은 자연스럽고 고급스럽게, 잘리지 않게.\n\n포함할 한국어 문구:\n토너는 생각보다\n빨리 줄어듭니다\n매일 쓰는 토너라면\n넉넉한 500ml가 필요합니다\n세안 후 첫 단계\n화장솜 닦토\n건조할 때 수분 보충\n스킨팩 집중 수분\n아침저녁 아끼지 않는 500ml 대용량\n\n금지:\n- 상세 01처럼 제품을 크게 다시 보여주는 구성 금지\n- 03/04와 같은 내용을 그대로 반복 금지\n- CUT, STEP, V1 같은 제작 번호 금지\n- AQUA LOTION, CREAM, SERUM 등 다른 제품명 금지\n- 한국어 오타/깨진 글자 금지\n\n결론: 토너 사용량이 많다는 공감 → 500ml 대용량 필요성으로 자연스럽게 연결되는 세로 상세 이미지 1장을 생성하세요.`
  },
  {
    n: '03',
    name: 'four-way-routine',
    prompt: `이미지 에이전트로 쿠팡 상세 이미지 03을 새로 생성하세요. 실제 완성 이미지를 생성해야 합니다.\n\n목표: 기존 상세 03/04의 루틴 내용을 한 장으로 압축합니다. 이 이미지는 두 번째 압축 이미지입니다.\n\n주제:\n닦토, 흡토, 스킨팩, 레이어링까지 — 하나로 완성하는 4 WAY 토너 루틴.\n\n핵심 메시지:\n- 닦토: 피부결 정돈\n- 흡토: 가볍게 흡수\n- 스킨팩: 잠시 올려 수분감\n- 레이어링: 얇게 덧바름\n- 500ml라 매일 다양한 방식으로 아낌없이 사용\n\n디자인 방향:\n- 상세 01/02와 같은 캠페인 톤: 흰색, 연아쿠아, 민트, 물방울, 부드러운 잎사귀 포인트.\n- 4개 루틴 카드를 깔끔하게 배치하세요.\n- 제품 병은 없어도 됩니다. 필요하면 아주 작은 보조 아이콘/미니 제품만 하단에 배치하세요. 큰 병 반복 금지.\n- 기존 04보다 더 덜 복잡하고, 모바일에서 읽기 쉽고 프리미엄하게.\n\n포함할 한국어 문구:\n닦토, 흡토, 스킨팩까지\n아낌없이 사용하는 500ml\n4 WAY TONER ROUTINE\n닦토\n피부결 정돈\n흡토\n가볍게 흡수\n스킨팩\n잠시 올려 수분감\n레이어링\n얇게 덧바름\n매일 다른 피부 컨디션에 맞춰 가볍게 조절해 사용하세요\n\n금지:\n- 상세 02와 같은 사용량/빨리 줄어듦 메시지 반복 금지\n- 제품 병 크게 반복 금지\n- CUT, STEP, V1 같은 제작 번호 금지\n- AQUA LOTION, CREAM, SERUM 등 다른 제품명 금지\n- 한국어 오타/깨진 글자 금지\n\n결론: 4가지 사용법을 한눈에 보여주는 깨끗한 세로 상세 이미지 1장을 생성하세요.`
  }
];

function fileIdsFromText(text) { return [...String(text || '').matchAll(/file_[0-9a-fA-F]+/g)].map(m => m[0]); }
function candidateIds(src) { const ids = new Set(fileIdsFromText(src)); try { const u = new URL(src); const id = u.searchParams.get('id'); for (const x of fileIdsFromText(id || '')) ids.add(x); if (id?.startsWith('file_')) ids.add(id); } catch {} return [...ids]; }
function hasKnownId(src, known) { return candidateIds(src).some(id => known.has(id)); }
function primaryId(src) { return candidateIds(src).find(id => id.startsWith('file_')) || src; }
async function state(page) { return page.evaluate(() => ({ busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'), imgs: Array.from(document.images).map(img => ({ alt: img.alt || '', src: img.currentSrc || img.src || '', w: img.naturalWidth, h: img.naturalHeight })).filter(x => x.src.includes('backend-api/estuary/content')) })); }
async function submitJob(ctx, job) {
  const page = await ctx.newPage();
  await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  const create = page.getByText('이미지 만들기', { exact: true }).first();
  if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(1500); }
  await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
  const before = await state(page);
  const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));
  await fs.writeFile(path.join(promptDir, `${job.n}-${job.name}-before.json`), JSON.stringify({ ids: [...beforeIds] }, null, 2));
  await fs.writeFile(path.join(promptDir, `${job.n}-${job.name}-prompt.txt`), job.prompt);
  await page.setInputFiles('input#upload-files,input#upload-photos,input#image-gen-action-modal-upload-photos,input[name="images-app-drop-container-input"],input[type="file"]', commonRefs);
  await page.waitForTimeout(11000);
  for (const text of ['확인', '완료']) {
    const btn = page.getByRole('button', { name: text }).first();
    if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
  }
  await page.locator('#prompt-textarea').last().click();
  await page.keyboard.insertText(job.prompt);
  await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
  await page.waitForTimeout(8000);
  const chatUrl = page.url();
  await fs.writeFile(path.join(promptDir, `${job.n}-${job.name}-chat-url.txt`), chatUrl + '\n');
  console.log('submitted', job.n, chatUrl);
  for (let i=1;i<=150;i++) {
    await page.waitForTimeout(8000);
    const s=await state(page);
    const candidates=[]; const seen=new Set();
    for (const img of s.imgs) {
      if (img.w < 900 || img.h < 900) continue;
      if (hasKnownId(img.src, beforeIds)) continue;
      if (['01.png','02.png','03.png','04.png','히알루론산토너.png'].includes(img.alt)) continue;
      if (!img.alt.includes('생성된 이미지') && s.busy) continue;
      const id=primaryId(img.src); if (seen.has(id)) continue; seen.add(id);
      candidates.push({...img,id});
    }
    console.log('poll', job.n, i, 'busy', s.busy, 'candidates', candidates.map(c=>({id:c.id,w:c.w,h:c.h,alt:c.alt})));
    if (candidates.length && !s.busy) {
      const generated = candidates.filter(c => c.alt.includes('생성된 이미지'));
      const img = (generated.length ? generated : candidates).at(-1);
      const b64 = await page.evaluate(async (src) => { const r=await fetch(src,{credentials:'include'}); if(!r.ok) throw new Error('fetch '+r.status); const ab=await r.arrayBuffer(); const bytes=new Uint8Array(ab); let s=''; for(let j=0;j<bytes.length;j+=0x8000) s+=String.fromCharCode(...bytes.subarray(j,j+0x8000)); return btoa(s); }, img.src);
      const buf=Buffer.from(b64,'base64');
      const raw=path.join(rawDir, `${job.n}-${job.name}-agent.png`);
      const final=path.join(detailDir, `${job.n}.png`);
      await fs.writeFile(raw, buf);
      await fs.writeFile(final, buf);
      const result={chatUrl,id:img.id,natural:`${img.w}x${img.h}`,bytes:buf.length,raw,final,alt:img.alt,rule:'direct ChatGPT Images output; no local compositing/editing'};
      await fs.writeFile(path.join(promptDir, `${job.n}-${job.name}-result.json`), JSON.stringify(result,null,2));
      console.log('saved', job.n, img.id, `${img.w}x${img.h}`, buf.length);
      await page.close().catch(()=>{});
      return result;
    }
  }
  throw new Error('no generated image for '+job.n);
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
for (const job of jobs) await submitJob(ctx, job);

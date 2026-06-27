import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/cleansing-oil/versions/v1');
const promptDir = path.join(outDir, 'representative-prompts');
const rawDir = path.join(outDir, 'representative-raw');
const candDir = path.join(outDir, 'representative-candidates');
await fs.mkdir(promptDir, { recursive: true });
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(candDir, { recursive: true });

const key = '05-v64-gpt-images-uniform-scale-original-product';
const currentSmallButSlim = path.join(outDir, 'representative/05.png');
const productOriginal = path.join(root, 'public/drive-originals/cleansing-oil/downloaded/클렌징오일/클렌징오일3.png');
const designBase = path.join(outDir, 'representative-backups/05-before-v60-smaller-product-20260627-134626/05.png');
const refined02 = path.join(outDir, 'representative/02.png');
const refined04 = path.join(outDir, 'representative/04.png');
const refs = [currentSmallButSlim, productOriginal, designBase, refined02, refined04];
for (const r of refs) await fs.stat(r);

const prompt = `첫 번째 첨부 이미지를 수정해 주세요. 제가 말한 “얇다”는 가로폭이 좁다는 뜻이 아니라, 제품이 차지하는 전체 면적/존재감이 좁아 보인다는 뜻입니다. 해결 방법은 두 번째 첨부의 실제 원본 제품을 통째로 균일 축소해서 배치하는 것입니다.

첨부 이미지 역할:
1) 첫 번째 첨부: 현재 적용본입니다. 전체 디자인/텍스트/톤/카드 구성은 유지하세요.
2) 두 번째 첨부: 실제 제품 원본 사진입니다. 제품 형태, 앞면 면적, 볼륨감, 펌프, 라벨 배치의 최우선 기준입니다.
3) 세 번째 첨부: 이전 큰 05번 디자인입니다. 이 이미지의 제품을 찌그러뜨리지 말고 통째로 줄인 느낌이 목표입니다.
4) 네 번째/다섯 번째 첨부: 같은 시리즈의 02번/04번 이미지입니다. 톤앤매너 참고용입니다.

출력 규격: 1000 x 1000 정사각형.

[핵심 수정 지시]
- 두 번째 첨부의 실제 원본 제품을 그대로 가져온 것처럼, 제품 전체를 통째로 균일 축소(scale down uniformly)해서 오른쪽에 배치하세요.
- “얇게 만들기”, “가로폭 줄이기”, “좁은 면적으로 압축하기”가 아닙니다. 제품의 앞면 면적/실루엣/볼륨감은 원본 그대로 유지하고, 전체 크기만 작게 줄이세요.
- 세 번째 첨부의 큰 제품을 약 10~15% 축소한 느낌이 목표입니다. 제품 비율은 절대 바꾸지 마세요.
- 제품은 오른쪽에 완전히 보여야 하며, 화면 오른쪽 가장자리에서 잘리면 안 됩니다. 오른쪽 여백을 남기세요.
- 제품 주변 배경은 밝게 유지해서 투명 용기가 살아나게 하세요.
- 제품 외의 레이아웃, 텍스트 구성, 색감, 카드 구성, 전체 톤은 첫 번째 첨부를 최대한 유지하세요.

[금지]
- 원본 제품을 슬림하게 재해석하지 마세요.
- 앞면 면적이 좁은 병, 길쭉한 병, 얇은 튜브, 원통형 병으로 바꾸지 마세요.
- 가로/세로 비율을 변경하지 마세요.

[반드시 유지할 한국어 텍스트 — 정확히 유지]
제목:
클렌징 후에도
산뜻한 마무리

카드 1:
신선 출고 기준

카드 2:
공식 판매 관리

카드 3:
간편한 데일리 클렌징

하단 문구:
유어스킨플러스 공식 판매 상품

한국어는 깨지거나 이상한 글자로 바뀌면 안 됩니다.
가짜 인증마크, 추가 문장, 박스, 사람, 손, 다른 화장품은 넣지 마세요.`;
await fs.writeFile(path.join(promptDir, `${key}-prompt.txt`), prompt);

function fileIdsFromText(text) { return [...String(text || '').matchAll(/file_[0-9a-fA-F]+/g)].map(m => m[0]); }
function candidateIds(src) { const ids=new Set(fileIdsFromText(src)); try { const u=new URL(src); const id=u.searchParams.get('id'); for (const x of fileIdsFromText(id||'')) ids.add(x); if (id&&id.startsWith('file_')) ids.add(id); } catch {} return [...ids]; }
function hasKnownId(src, known) { return candidateIds(src).some(id=>known.has(id)); }
function primaryId(src) { return candidateIds(src).find(id=>id.startsWith('file_')) || src; }
async function getImageData(page) { return page.evaluate(() => ({ busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'), imgs: Array.from(document.images).map(img=>({alt:img.alt||'', src:img.currentSrc||img.src||'', w:img.naturalWidth, h:img.naturalHeight})).filter(x=>x.src.includes('backend-api/estuary/content')) })); }
async function composerState(page) {
  return page.evaluate(() => {
    const fileRemoveButtons = Array.from(document.querySelectorAll('button')).map(b => b.getAttribute('aria-label') || '').filter(a => a.includes('파일') && a.includes('제거'));
    const textarea = document.querySelector('#prompt-textarea');
    const r = textarea?.getBoundingClientRect();
    return { url: location.href, title: document.title, bodyHasComment: document.body.innerText.includes('댓글 달기'), bodyHasShare: document.body.innerText.includes('공유하기'), fileRemoveButtons, textareaVisible: !!r && r.width > 100 && r.height > 20, promptText: textarea?.innerText || '' };
  });
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
for (const p of ctx.pages()) { try { if (p.url().includes('chatgpt.com') && !p.isClosed()) await p.close({ runBeforeUnload: false }); } catch {} }
const page = await ctx.newPage();
await page.setViewportSize({ width: 1920, height: 1080 });
await page.goto('https://chatgpt.com/images/', { waitUntil:'domcontentloaded', timeout:60000 });
await page.waitForTimeout(3500);
await page.goto('https://chatgpt.com/images/', { waitUntil:'domcontentloaded', timeout:60000 });
await page.waitForTimeout(2500);
for (let i=0; i<10; i++) { const st = await composerState(page); if (!st.fileRemoveButtons.length) break; await page.locator('button[aria-label*="파일"][aria-label*="제거"]').first().click({ timeout: 3000 }).catch(()=>{}); await page.waitForTimeout(500); }
await page.waitForSelector('#prompt-textarea', { timeout:60000 });
const before = await getImageData(page);
const beforeIds = new Set(before.imgs.flatMap(x=>candidateIds(x.src)));
await fs.writeFile(path.join(promptDir, `${key}-before.json`), JSON.stringify({ids:[...beforeIds], imgs:before.imgs}, null, 2));
await page.setInputFiles('input#upload-photos', refs);
await page.waitForTimeout(16000);
let st = await composerState(page);
await fs.writeFile(path.join(promptDir, `${key}-preprompt-state.json`), JSON.stringify(st, null, 2));
if (st.bodyHasComment || !st.textareaVisible || st.fileRemoveButtons.length !== refs.length) {
  await page.screenshot({ path:path.join(root, `tmp-${key}-invalid-attachments.png`), fullPage:true });
  throw new Error('invalid pre-send composer state: '+JSON.stringify(st));
}
await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
st = await composerState(page);
await fs.writeFile(path.join(promptDir, `${key}-before-send-state.json`), JSON.stringify(st, null, 2));
await page.screenshot({ path:path.join(root, `tmp-${key}-before-send.png`), fullPage:true });
if (st.bodyHasComment || !st.textareaVisible || st.fileRemoveButtons.length !== refs.length || !st.promptText.includes('통째로 균일 축소')) throw new Error('invalid before-send composer state: '+JSON.stringify(st));
await page.locator('button[data-testid="send-button"], button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout:15000 });
await page.waitForTimeout(8000);
const chatUrl = page.url();
await fs.writeFile(path.join(promptDir, `${key}-chat-url.txt`), chatUrl+'\n');
console.log('submitted', chatUrl);
for (let attempt=1; attempt<=180; attempt++) {
  await page.waitForTimeout(8000);
  const data = await getImageData(page);
  const candidates=[]; const seen=new Set();
  for (const img of data.imgs) {
    if (img.w < 850 || img.h < 850) continue;
    if (hasKnownId(img.src, beforeIds)) continue;
    if (!String(img.alt||'').includes('생성된 이미지') && !String(img.alt||'').toLowerCase().includes('generated')) continue;
    const id=primaryId(img.src); if (seen.has(id)) continue; seen.add(id); candidates.push({...img,id});
  }
  console.log('poll', attempt, 'busy', data.busy, 'candidates', candidates.map(x=>({id:x.id,w:x.w,h:x.h,alt:x.alt})));
  if (candidates.length && !data.busy) {
    const img = candidates.at(-1);
    const b64 = await page.evaluate(async (src)=>{ const r=await fetch(src,{credentials:'include'}); if(!r.ok) throw new Error('fetch '+r.status); const ab=await r.arrayBuffer(); const bytes=new Uint8Array(ab); let s=''; for(let i=0;i<bytes.length;i+=0x8000) s+=String.fromCharCode(...bytes.subarray(i,i+0x8000)); return btoa(s); }, img.src);
    const buf=Buffer.from(b64,'base64');
    const raw=path.join(rawDir, `${key}-raw-gpt.png`);
    const final=path.join(candDir, `${key}-candidate.png`);
    await fs.writeFile(raw, buf);
    const meta = await sharp(buf).metadata();
    if (meta.width === 1000 && meta.height === 1000) await fs.writeFile(final, buf);
    else await sharp(buf).resize(1000,1000,{fit:'cover',position:'center'}).png({compressionLevel:9}).toFile(final);
    await page.screenshot({ path:path.join(root, `tmp-${key}-generated-proof.png`), fullPage:true }).catch(()=>{});
    await fs.writeFile(path.join(promptDir, `${key}-result.json`), JSON.stringify({chatUrl, src:img.src, id:img.id, bytes:buf.length, natural:`${img.w}x${img.h}`, raw, final, alt:img.alt, refs, beforeSendState: st}, null, 2));
    console.log('saved', final, img.id, buf.length, `${img.w}x${img.h}`);
    await page.close().catch(()=>{});
    process.exit(0);
  }
}
await page.screenshot({ path:path.join(root, `tmp-${key}-failed.png`), fullPage:true }).catch(()=>{});
throw new Error('no generated image for '+key);

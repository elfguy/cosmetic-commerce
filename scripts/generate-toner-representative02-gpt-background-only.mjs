import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const base = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const repDir = path.join(base, 'representative');
const rawDir = path.join(base, 'agent-representative-raw');
const promptDir = path.join(base, 'agent-representative-prompts');
const rejectedDir = path.join(base, 'rejected');
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(promptDir, { recursive: true });
await fs.mkdir(rejectedDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, '');
const current = path.join(repDir, '02.png');
const backup = path.join(rejectedDir, `02-before-gpt-bg-original-product-composite-${stamp}.png`);
if (existsSync(current)) await fs.copyFile(current, backup);

const refs = [path.join(repDir, '01.png')].filter(p => existsSync(p));
const prompt = `정사각형 1000x1000 화장품 대표이미지용 프리미엄 광고 배경만 만들어주세요.\n\n중요: 제품병, 화장품 병, 박스, 로고, 라벨, 읽을 수 있는 글자/문구는 절대 넣지 마세요.\n제품은 나중에 원본 상품 사진을 별도로 올릴 예정이므로, 이 이미지는 배경/분위기/공간 구성만 필요합니다.\n\n스타일:\n- 흰색/오프화이트 베이스\n- 아주 은은한 민트/아쿠아 물결, 물방울, 깨끗한 수분감\n- 쿠팡 대표이미지처럼 밝고 신뢰감 있는 제품 광고 배경\n- 오른쪽에는 원본 상품병을 크게 올릴 빈 공간과 부드러운 그림자/광원\n- 왼쪽에는 제목과 칩을 올릴 깨끗한 여백\n- 과한 장식 금지, 텍스트 금지, 숫자 금지, 아이콘 글자 금지\n- 실제 제품 없이 배경만 완성도 있게`;
await fs.writeFile(path.join(promptDir, '02-gpt-background-only-prompt.txt'), prompt);
await fs.writeFile(path.join(promptDir, '02-gpt-background-only-refs.json'), JSON.stringify({ refs, backup }, null, 2));
function ids(t){return [...String(t||'').matchAll(/file_[0-9a-fA-F]+/g)].map(m=>m[0])}
function cids(src){const s=new Set(ids(src)); try{const u=new URL(src); const id=u.searchParams.get('id'); ids(id||'').forEach(x=>s.add(x)); if(id?.startsWith('file_'))s.add(id)}catch{} return [...s]}
function has(src,k){return cids(src).some(id=>k.has(id))}
function pid(src){return cids(src).find(id=>id.startsWith('file_'))||src}
async function state(page){return page.evaluate(()=>({busy:!!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),imgs:Array.from(document.images).map(img=>({alt:img.alt||'',src:img.currentSrc||img.src||'',w:img.naturalWidth,h:img.naturalHeight})).filter(x=>x.src.includes('backend-api/estuary/content'))}))}
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
const page=await ctx.newPage();
console.log('goto images');
await page.goto('https://chatgpt.com/images/',{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(3500);
console.log('workspace',{url:page.url(),title:await page.title()});
const create=page.getByText('이미지 만들기',{exact:true}).first();
if(await create.count()){await create.click({timeout:15000}).catch(e=>console.log('create click fail',e.message)); await page.waitForTimeout(1500)}
await page.waitForSelector('#prompt-textarea',{timeout:60000});
const before=await state(page); const beforeIds=new Set(before.imgs.flatMap(x=>cids(x.src)));
if(refs.length){console.log('upload refs',refs); await page.setInputFiles('input[type="file"]',refs); await page.waitForTimeout(6000);}
for(const text of ['확인','완료']){const btn=page.getByRole('button',{name:text}).first(); if(await btn.count()){await btn.click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(1000)}}
await page.locator('#prompt-textarea').last().click(); await page.keyboard.insertText(prompt);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({timeout:15000});
await page.waitForTimeout(8000); const chatUrl=page.url(); await fs.writeFile(path.join(promptDir,'02-gpt-background-only-chat-url.txt'),chatUrl+'\n'); console.log('submitted',chatUrl);
for(let i=1;i<=120;i++){
  await page.waitForTimeout(8000); const s=await state(page); const cand=[]; const seen=new Set();
  for(const img of s.imgs){ if(img.w<800||img.h<800)continue; if(has(img.src,beforeIds))continue; const id=pid(img.src); if(seen.has(id))continue; seen.add(id); cand.push({...img,id}); }
  console.log('poll bg',i,'busy',s.busy,'candidates',cand.map(c=>({id:c.id,w:c.w,h:c.h,alt:c.alt})));
  if(cand.length&&!s.busy){ const gen=cand.filter(c=>c.alt.includes('생성된 이미지')); const img=(gen.length?gen:cand).at(-1); const b64=await page.evaluate(async(src)=>{const r=await fetch(src,{credentials:'include'}); if(!r.ok)throw new Error('fetch '+r.status); const ab=await r.arrayBuffer(); const bytes=new Uint8Array(ab); let s=''; for(let j=0;j<bytes.length;j+=0x8000)s+=String.fromCharCode(...bytes.subarray(j,j+0x8000)); return btoa(s)},img.src); const buf=Buffer.from(b64,'base64'); const raw=path.join(rawDir,'02-gpt-background-only-agent.png'); await fs.writeFile(raw,buf); const bg=path.join(rawDir,'02-gpt-background-only-1000.png'); await sharp(buf).resize(1000,1000,{fit:'cover',position:'center'}).png({compressionLevel:9}).toFile(bg); const result={chatUrl,id:img.id,natural:`${img.w}x${img.h}`,bytes:buf.length,raw,background:bg,backup,refs,alt:img.alt,rule:'GPT Images background only; no product generated; final product will use original product layer'}; await fs.writeFile(path.join(promptDir,'02-gpt-background-only-result.json'),JSON.stringify(result,null,2)); console.log('saved',JSON.stringify(result)); await page.close().catch(()=>{}); process.exit(0); }
}
throw new Error('no generated background');

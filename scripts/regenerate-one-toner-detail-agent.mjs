import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const detailDir=path.join(outDir,'detail');
const rawDir=path.join(outDir,'agent-detail-raw');
const promptDir=path.join(outDir,'agent-detail-prompts');
await fs.mkdir(rawDir,{recursive:true}); await fs.mkdir(promptDir,{recursive:true});
const job=JSON.parse(process.argv[2]);
const refs=job.n==='02' ? [
 path.join(outDir,'detail/01.png'),
 path.join(outDir,'rejected/detail02-04-merge-before-20260605T215843/02.png'),
 path.join(root,'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png')
] : [
 path.join(outDir,'detail/01.png'),
 path.join(outDir,'detail/02.png'),
 path.join(outDir,'rejected/detail02-04-merge-before-20260605T215843/04.png'),
 path.join(root,'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png')
];
console.log('start', job.n, job.name, refs);
function fileIdsFromText(text){return [...String(text||'').matchAll(/file_[0-9a-fA-F]+/g)].map(m=>m[0]);}
function candidateIds(src){const ids=new Set(fileIdsFromText(src)); try{const u=new URL(src); const id=u.searchParams.get('id'); for(const x of fileIdsFromText(id||'')) ids.add(x); if(id?.startsWith('file_')) ids.add(id);}catch{} return [...ids];}
function hasKnownId(src,known){return candidateIds(src).some(id=>known.has(id));}
function primaryId(src){return candidateIds(src).find(id=>id.startsWith('file_'))||src;}
async function state(page){return page.evaluate(()=>({busy:!!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),imgs:Array.from(document.images).map(img=>({alt:img.alt||'',src:img.currentSrc||img.src||'',w:img.naturalWidth,h:img.naturalHeight})).filter(x=>x.src.includes('backend-api/estuary/content'))}));}
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
const page=await ctx.newPage();
console.log('goto images');
await page.goto('https://chatgpt.com/images/',{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(4000);
const create=page.getByText('이미지 만들기',{exact:true}).first();
if(await create.count()){console.log('click create'); await create.click({timeout:15000}).catch(e=>console.log('create click fail',e.message)); await page.waitForTimeout(1500);}
await page.waitForSelector('#prompt-textarea',{timeout:60000});
const before=await state(page); const beforeIds=new Set(before.imgs.flatMap(x=>candidateIds(x.src)));
await fs.writeFile(path.join(promptDir,`${job.n}-${job.name}-prompt.txt`),job.prompt);
console.log('upload refs');
await page.setInputFiles('input[type="file"]',refs);
await page.waitForTimeout(10000);
for(const text of ['확인','완료']){const btn=page.getByRole('button',{name:text}).first(); if(await btn.count()){await btn.click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(1000);}}
console.log('submit prompt');
await page.locator('#prompt-textarea').last().click(); await page.keyboard.insertText(job.prompt);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({timeout:15000});
await page.waitForTimeout(8000);
const chatUrl=page.url(); await fs.writeFile(path.join(promptDir,`${job.n}-${job.name}-chat-url.txt`),chatUrl+'\n'); console.log('submitted',chatUrl);
for(let i=1;i<=120;i++){await page.waitForTimeout(8000); const s=await state(page); const candidates=[]; const seen=new Set(); for(const img of s.imgs){ if(img.w<900||img.h<900) continue; if(hasKnownId(img.src,beforeIds)) continue; if(['01.png','02.png','04.png','히알루론산토너.png'].includes(img.alt)) continue; const id=primaryId(img.src); if(seen.has(id)) continue; seen.add(id); candidates.push({...img,id}); } console.log('poll',i,'busy',s.busy,'candidates',candidates.map(c=>({id:c.id,w:c.w,h:c.h,alt:c.alt}))); if(candidates.length&&!s.busy){const gen=candidates.filter(c=>c.alt.includes('생성된 이미지')); const img=(gen.length?gen:candidates).at(-1); const b64=await page.evaluate(async(src)=>{const r=await fetch(src,{credentials:'include'}); if(!r.ok) throw new Error('fetch '+r.status); const ab=await r.arrayBuffer(); const bytes=new Uint8Array(ab); let s=''; for(let j=0;j<bytes.length;j+=0x8000)s+=String.fromCharCode(...bytes.subarray(j,j+0x8000)); return btoa(s);},img.src); const buf=Buffer.from(b64,'base64'); const raw=path.join(rawDir,`${job.n}-${job.name}-agent.png`); const final=path.join(detailDir,`${job.n}.png`); await fs.writeFile(raw,buf); await fs.writeFile(final,buf); const result={chatUrl,id:img.id,natural:`${img.w}x${img.h}`,bytes:buf.length,raw,final,alt:img.alt,rule:'direct ChatGPT Images output; no local compositing/editing'}; await fs.writeFile(path.join(promptDir,`${job.n}-${job.name}-result.json`),JSON.stringify(result,null,2)); console.log('saved',JSON.stringify(result)); await page.close().catch(()=>{}); process.exit(0);} }
throw new Error('no generated image');

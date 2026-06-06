import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const rawDir=path.join(outDir,'agent-representative-raw');
const promptDir=path.join(outDir,'agent-representative-prompts');
const repDir=path.join(outDir,'representative');
function fileIdsFromText(text){return[...String(text||'').matchAll(/file_[0-9a-fA-F]+/g)].map(m=>m[0]);}
function candidateIds(src){const ids=new Set(fileIdsFromText(src));try{const u=new URL(src);const id=u.searchParams.get('id');for(const x of fileIdsFromText(id||''))ids.add(x);if(id?.startsWith('file_'))ids.add(id);}catch{}return[...ids];}
function hasKnownId(src, known){return candidateIds(src).some(id=>known.has(id));}
function primaryId(src){return candidateIds(src).find(id=>id.startsWith('file_'))||src;}
const beforeJson=JSON.parse(await fs.readFile(path.join(promptDir,'06-preserve-product-before.json'),'utf8'));
const beforeIds=new Set(beforeJson.ids || []);
const chatUrl=(await fs.readFile(path.join(promptDir,'06-preserve-product-chat-url.txt'),'utf8')).trim();
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
let page=ctx.pages().find(p=>p.url()===chatUrl) || ctx.pages().find(p=>p.url().includes('6a228613-c478')) || await ctx.newPage();
if(!page.url().includes('6a228613-c478')) await page.goto(chatUrl,{waitUntil:'domcontentloaded',timeout:60000});
for(let attempt=1;attempt<=90;attempt++){
 await page.waitForTimeout(8000);
 const data=await page.evaluate(()=>({
  busy:!!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
  imgs:Array.from(document.images).map(img=>({alt:img.alt||'',src:img.currentSrc||img.src||'',w:img.naturalWidth,h:img.naturalHeight})).filter(x=>x.src.includes('backend-api/estuary/content'))
 }));
 const candidates=[]; const seen=new Set();
 for(const img of data.imgs){
  if(img.w<900||img.h<900) continue;
  if(hasKnownId(img.src,beforeIds)) continue;
  const id=primaryId(img.src); if(seen.has(id)) continue; seen.add(id); candidates.push({...img,id});
 }
 console.log('poll06',attempt,'busy',data.busy,'candidates',candidates.map(x=>({id:x.id,w:x.w,h:x.h,alt:x.alt})));
 if(candidates.length && !data.busy){
  const img=candidates.at(-1);
  const b64=await page.evaluate(async(src)=>{const r=await fetch(src,{credentials:'include'});if(!r.ok)throw new Error('fetch '+r.status);const ab=await r.arrayBuffer();const bytes=new Uint8Array(ab);let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s);},img.src);
  const buf=Buffer.from(b64,'base64');
  const raw=path.join(rawDir,'06-gpt-preserve-product.png');
  const final=path.join(repDir,'06.png');
  await fs.writeFile(raw,buf);
  await sharp(buf).resize(1000,1000,{fit:'cover',position:'center'}).png({compressionLevel:9}).toFile(final);
  await fs.copyFile(raw,path.join(rawDir,'06-gpt.png'));
  const result={chatUrl,src:img.src,id:img.id,bytes:buf.length,natural:`${img.w}x${img.h}`,raw,final,alt:img.alt,replacementReason:'Regenerated to preserve real YOURSKIN+ HYALURONIC ACID TONER product identity'};
  await fs.writeFile(path.join(promptDir,'06-preserve-product-result.txt'),JSON.stringify(result,null,2));
  await fs.writeFile(path.join(promptDir,'06-result.txt'),JSON.stringify(result,null,2));
  console.log('saved06',final,img.id,buf.length,`${img.w}x${img.h}`);
  process.exit(0);
 }
}
throw new Error('no 06 result');

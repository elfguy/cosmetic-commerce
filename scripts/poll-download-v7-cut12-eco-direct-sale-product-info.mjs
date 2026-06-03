import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
const targetUrl=(await fs.readFile(path.join(outDir,'prompts/12-eco-direct-sale-product-info-chat-url.txt'),'utf8')).trim();
const beforeIds=new Set(JSON.parse(await fs.readFile(path.join(outDir,'prompts/12-eco-direct-sale-product-info-before-ids.json'),'utf8')));
function getId(src){try{let id=new URL(src).searchParams.get('id')||src; if(id.includes('#')) id=id.split('#').pop().replace('thumbnail',''); return id}catch{return src}}
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
let page=ctx.pages().find(p=>p.url().startsWith(targetUrl));
if(!page){page=await ctx.newPage(); await page.goto(targetUrl,{waitUntil:'domcontentloaded',timeout:60000});}
for(let attempt=1;attempt<=120;attempt++){
 await page.waitForTimeout(10000);
 const data=await page.evaluate(()=>({
  busy:!!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
  text:document.body.innerText.slice(-3000),
  imgs:Array.from(document.images).map(img=>({alt:img.alt,src:img.currentSrc||img.src,w:img.naturalWidth,h:img.naturalHeight,rect:(()=>{const r=img.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};})()})).filter(x=>x.src.includes('backend-api/estuary/content'))
 }));
 const candidates=data.imgs.map(x=>({...x,id:getId(x.src)})).filter(x=>x.w>=700&&x.h>=1000&&!beforeIds.has(x.id)&&!/cut12-|tone-ref|product-ref|original/i.test(String(x.alt||'')));
 console.log('attempt',attempt,'busy',data.busy,'candidates',candidates.map(x=>({id:x.id,w:x.w,h:x.h,alt:x.alt,y:x.rect.y})), 'tail', data.text.slice(-160).replace(/\n/g,' | '));
 if(candidates.length && !data.busy){
  const img=candidates.at(-1);
  const b64=await page.evaluate(async src=>{const r=await fetch(src,{credentials:'include'}); if(!r.ok) throw new Error('fetch '+r.status); const ab=await r.arrayBuffer(); const bytes=new Uint8Array(ab); let s=''; for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000)); return btoa(s);},img.src);
  const buf=Buffer.from(b64,'base64');
  const rawFile=path.join(outDir,'raw/12-eco-direct-sale-product-info-gpt.png');
  await fs.writeFile(rawFile,buf);
  await fs.writeFile(path.join(outDir,'prompts/12-eco-direct-sale-product-info-result.txt'),`${targetUrl}\n${img.src}\n${img.id}\n${buf.length}\n${img.w}x${img.h}\n${img.alt||''}\n`);
  console.log('saved',rawFile,img.id,buf.length,`${img.w}x${img.h}`,img.alt);
  process.exit(0);
 }
 if(!data.busy && /I can’t|re-upload|다시 업로드|available|failed|오류/i.test(data.text) && attempt>2){ console.log('response_issue',data.text); process.exit(3); }
}
console.error('no image found'); process.exit(2);

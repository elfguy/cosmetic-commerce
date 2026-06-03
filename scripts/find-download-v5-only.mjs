import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/aqua-lotion/versions/v5-gpt-images-workspace');
await fs.mkdir(path.join(outDir,'detail'),{recursive:true});
await fs.mkdir(path.join(outDir,'prompts'),{recursive:true});
function id(src){try{return new URL(src).searchParams.get('id')||src}catch{return src}}
const knownOld=new Set(['file_000000006ee8720799edebad76957aee','file_000000006dd87207bc9fa088ca895ef5','file_00000000c7f872078f65befcc14a8db2','file_0000000029187207a05d8d010202eadb','file_0000000048e87207832a5c3fbcbb70cb','file_0000000029147207a770cdd81950c2c1']);
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
const v5Urls=['https://chatgpt.com/c/6a1db252-7a14-83a3-9a6a-d3d1562fe91b','https://chatgpt.com/c/6a1db1a8-b8f0-83a8-8a39-ee98960f6ec7'];
for (const url of v5Urls) {
  let page=ctx.pages().find(p=>p.url().startsWith(url));
  if(!page){ page=await ctx.newPage(); await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000}); }
  await page.bringToFront();
  await page.waitForTimeout(5000);
  const data=await page.evaluate(()=>({
    url:location.href,
    title:document.title,
    text:document.body.innerText.slice(0,5000),
    tail:document.body.innerText.slice(-3000),
    busy:!!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    imgs:Array.from(document.images).map((img,i)=>({i,alt:img.alt,src:img.currentSrc||img.src,w:img.naturalWidth,h:img.naturalHeight})).filter(x=>x.src.includes('backend-api/estuary/content') || x.w>500 || x.h>500)
  }));
  console.log('\nV5 PAGE',data.url,'title=',data.title,'busy=',data.busy);
  console.log('text head',data.text.slice(0,800).replace(/\n/g,' | '));
  const imgs=data.imgs.map(x=>({...x,id:id(x.src)}));
  console.log('imgs',imgs.map(x=>({id:x.id,w:x.w,h:x.h,alt:x.alt})).slice(-30));
  const candidates=imgs.filter(x=>x.src.includes('backend-api/estuary/content') && x.w>=700 && x.h>=1000 && !knownOld.has(x.id));
  if(candidates.length){
    const img=candidates[candidates.length-1];
    const b64=await page.evaluate(async(src)=>{const r=await fetch(src,{credentials:'include'}); if(!r.ok) throw new Error('fetch '+r.status); const ab=await r.arrayBuffer(); let bin=''; const bytes=new Uint8Array(ab); for(let i=0;i<bytes.length;i+=0x8000) bin+=String.fromCharCode(...bytes.subarray(i,i+0x8000)); return btoa(bin);},img.src);
    const buf=Buffer.from(b64,'base64');
    const file=path.join(outDir,'detail/01.png');
    await fs.writeFile(file,buf);
    await fs.writeFile(path.join(outDir,'prompts/01-proof-result.txt'),`${data.url}\n${img.src}\n${img.id}\n${buf.length}\n`);
    console.log('saved',file,img.id,buf.length);
    process.exit(0);
  }
}
console.error('no V5 downloadable candidate found');
process.exit(2);

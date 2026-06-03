import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/aqua-lotion/versions/v5-gpt-images-workspace');
await fs.mkdir(path.join(outDir,'detail'),{recursive:true});
await fs.mkdir(path.join(outDir,'prompts'),{recursive:true});
function id(src){try{return new URL(src).searchParams.get('id')||src}catch{return src}}
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
const candidatePages=ctx.pages().filter(p=>p.url().startsWith('https://chatgpt.com/c/')).reverse();
console.log('candidate pages', candidatePages.map(p=>p.url()));
for (const page of candidatePages) {
  await page.bringToFront();
  await page.waitForTimeout(2000);
  const data=await page.evaluate(()=>({
    url:location.href,
    title:document.title,
    text:document.body.innerText.slice(0,4000),
    imgs:Array.from(document.images).map((img,i)=>({i,alt:img.alt,src:img.currentSrc||img.src,w:img.naturalWidth,h:img.naturalHeight})).filter(x=>x.src.includes('backend-api/estuary/content') || x.w>500 || x.h>500)
  }));
  console.log('\nPAGE', data.url, data.title, data.text.slice(0,500).replace(/\n/g,' | '));
  console.log('imgs', data.imgs.map(x=>({id:id(x.src),w:x.w,h:x.h,alt:x.alt})).slice(-20));
  const candidates=data.imgs.filter(x=>x.src.includes('backend-api/estuary/content') && x.w>=700 && x.h>=1000);
  if (data.text.includes('V5') || data.title.includes('V5') || candidates.length) {
    const img=candidates[candidates.length-1];
    if (img) {
      const b64=await page.evaluate(async(src)=>{const r=await fetch(src,{credentials:'include'}); if(!r.ok) throw new Error('fetch '+r.status); const ab=await r.arrayBuffer(); let bin=''; const bytes=new Uint8Array(ab); for(let i=0;i<bytes.length;i+=0x8000) bin+=String.fromCharCode(...bytes.subarray(i,i+0x8000)); return btoa(bin);}, img.src);
      const buf=Buffer.from(b64,'base64');
      const file=path.join(outDir,'detail/01.png');
      await fs.writeFile(file,buf);
      await fs.writeFile(path.join(outDir,'prompts/01-proof-result.txt'),`${data.url}\n${img.src}\n${id(img.src)}\n${buf.length}\n`);
      console.log('saved',file,id(img.src),buf.length);
      process.exit(0);
    }
  }
}
console.error('no downloadable candidate found');
process.exit(2);

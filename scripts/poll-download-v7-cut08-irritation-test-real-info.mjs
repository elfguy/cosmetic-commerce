import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir,'raw'),{recursive:true});
function getId(src){try{return new URL(src).searchParams.get('id')||src;}catch{return src;}}
const beforeIds=new Set(JSON.parse(await fs.readFile(path.join(outDir,'prompts/08-real-before-ids.json'),'utf8')));
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
async function inspectPage(p){return await p.evaluate(()=>({url:location.href,text:document.body.innerText,busy:!!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),imgs:Array.from(document.images).map((img,i)=>({i,alt:img.alt,src:img.currentSrc||img.src,w:img.naturalWidth,h:img.naturalHeight,rect:(()=>{const r=img.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};})()})).filter(x=>x.src&&x.src.includes('backend-api/estuary/content'))})).catch(()=>null);}
for(let attempt=1;attempt<=90;attempt++){
 await new Promise(r=>setTimeout(r,10000));
 const pages=ctx.pages().filter(p=>p.url().startsWith('https://chatgpt.com/'));
 const candidates=[]; let targetPages=[];
 for(const p of pages){
  const data=await inspectPage(p); if(!data) continue;
  const isCut08=data.text.includes('cut08-user-real-test-reference')||data.text.includes('실제로 회사에서 진행된')||data.text.includes('대한피부과학연구소')||data.text.includes('2025.11.24');
  if(!isCut08) continue;
  targetPages.push(p);
  const imgs=data.imgs.map(x=>({...x,id:getId(x.src),pageUrl:data.url,busy:data.busy}));
  for(const x of imgs.filter(x=>x.w>=700&&x.h>=1000&&!beforeIds.has(x.id))) candidates.push(x);
 }
 console.log('attempt',attempt,'candidates',candidates.map(x=>({id:x.id,w:x.w,h:x.h,alt:x.alt,page:x.pageUrl,y:x.rect.y,busy:x.busy})));
 if(candidates.length){
  const generated=candidates.filter(x=>!String(x.alt||'').startsWith('cut08-'));
  const arr=generated.length?generated:candidates;
  const img=arr[arr.length-1];
  const p=targetPages.find(pg=>pg.url()===img.pageUrl)||targetPages[0]||pages.find(pg=>pg.url()===img.pageUrl)||pages[0];
  const b64=await p.evaluate(async src=>{const r=await fetch(src,{credentials:'include'});if(!r.ok)throw new Error('fetch '+r.status);const ab=await r.arrayBuffer();const bytes=new Uint8Array(ab);let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(binary);},img.src);
  const buf=Buffer.from(b64,'base64');
  const rawFile=path.join(outDir,'raw/08-irritation-test-real-info-gpt.png');
  await fs.writeFile(rawFile,buf);
  await fs.writeFile(path.join(outDir,'prompts/08-real-result.txt'),`${img.pageUrl}\n${img.src}\n${img.id}\n${buf.length}\n${img.w}x${img.h}\n`);
  console.log('saved',rawFile,img.id,buf.length,`${img.w}x${img.h}`,img.pageUrl);
  process.exit(0);
 }
}
console.error('no cut08 real image found'); process.exit(2);

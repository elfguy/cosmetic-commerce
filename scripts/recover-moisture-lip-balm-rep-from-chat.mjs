import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root='/Users/elfguy/alba/cosmetic-commerce';
const slug='moisture-lip-balm';
const slot=process.argv[2];
if(!slot) throw new Error('Usage: node scripts/recover-moisture-lip-balm-rep-from-chat.mjs 01');
const v1=path.join(root,'public/coupang/images',slug,'versions/v1');
const rawDir=path.join(v1,'agent-representative-raw'); const repDir=path.join(v1,'representative');
const submitFiles=(await fs.readdir(rawDir)).filter(f=>f.startsWith(`${slot}-`)&&f.endsWith('-submit.json')).sort();
if(!submitFiles.length) throw new Error('no submit json');
const submitFile=submitFiles.at(-1); const sub=JSON.parse(await fs.readFile(path.join(rawDir,submitFile),'utf8'));
const key=submitFile.replace(`${slot}-`,'').replace('-submit.json','');
function fileIdsFromText(t){return [...String(t||'').matchAll(/file_[0-9a-fA-F]+/g)].map(m=>m[0]);}
function candidateIds(src){const ids=new Set(fileIdsFromText(src));try{const u=new URL(src);const id=u.searchParams.get('id');for(const x of fileIdsFromText(id||''))ids.add(x);if(id?.startsWith('file_'))ids.add(id);}catch{}return [...ids];}
const before=new Set((sub.beforeIds||[]).flatMap(candidateIds));
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0]||await browser.newContext();
const page=await ctx.newPage();
await page.goto(sub.submitUrl,{waitUntil:'commit',timeout:120000});
await page.waitForTimeout(10000);
let chosen=null;
for(let tries=0; tries<30 && !chosen; tries++){
  const imgs=await page.evaluate(()=>Array.from(document.images).map((img,idx)=>{const r=img.getBoundingClientRect();return{idx,src:img.currentSrc||img.src||'',alt:img.alt||'',w:img.naturalWidth,h:img.naturalHeight,visible:r.width>100&&r.height>100,y:r.y};}).filter(x=>x.src.includes('backend-api/estuary/content')));
  const cands=[]; const seen=new Set();
  for(const img of imgs){
    if(img.w<900||img.h<900) continue;
    const ids=[...(img.src.matchAll(/file_[0-9a-fA-F]+/g))].map(m=>m[0]);
    let uId=''; try{uId=new URL(img.src).searchParams.get('id')||''}catch{}
    const id=ids[0]||uId||img.src;
    if(before.has(id)||seen.has(id)) continue; seen.add(id);
    if(img.alt.includes('drive-')||img.alt.includes('current-layout')||img.alt.includes('ratio-guide')||img.alt.includes('fresh-badge')) continue;
    if(img.alt.includes('생성') || imgs.indexOf(img)===imgs.length-1) cands.push({...img,id});
  }
  console.log('recover poll',slot,tries,cands.map(c=>({id:c.id,w:c.w,h:c.h,alt:c.alt})));
  if(cands.length) chosen=cands.at(-1); else await page.waitForTimeout(8000);
}
if(!chosen){await page.screenshot({path:path.join(root,`tmp/moisture-lip-balm-rep-gpt-evidence/${slot}-${key}-recover-fail.png`),fullPage:true});throw new Error('no candidate recovered');}
const b64=await page.evaluate(async src=>{const r=await fetch(src,{credentials:'include'});if(!r.ok)throw new Error('fetch '+r.status);const ab=await r.arrayBuffer();const bytes=new Uint8Array(ab);let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s);},chosen.src);
const rawOut=path.join(rawDir,`${slot}-${key}-raw.png`); const finalOut=path.join(repDir,`${slot}.png`);
await fs.writeFile(rawOut,Buffer.from(b64,'base64'));
await sharp(rawOut).resize(1000,1000,{fit:'cover',position:'center'}).png({compressionLevel:9}).toFile(finalOut);
const meta=await sharp(finalOut).metadata();
await fs.writeFile(path.join(rawDir,`${slot}-${key}-download-log.json`),JSON.stringify({slot,key,chosen,rawOut,finalOut,meta,pageUrl:page.url(),recoveredAt:new Date().toISOString()},null,2));
console.log('recovered',JSON.stringify({slot,key,rawOut,finalOut,meta,pageUrl:page.url()},null,2));
process.exit(0);

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
const targetChat='6a1e43d8-91ec-83a2-be1e-5c1e07bbd49c';
const targetId='file_000000002c68720baf523a6506ea6731';
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
let page=ctx.pages().find(p=>p.url().includes(targetChat)) || await ctx.newPage();
if(!page.url().includes(targetChat)) await page.goto(`https://chatgpt.com/c/${targetChat}`, {waitUntil:'domcontentloaded', timeout:60000});
await page.waitForTimeout(3000);
const imgs=await page.evaluate((targetId)=>Array.from(document.images).map(img=>({alt:img.alt,src:img.currentSrc||img.src,w:img.naturalWidth,h:img.naturalHeight})).filter(x=>x.src.includes(targetId)), targetId);
console.log('matches', imgs.map(x=>({alt:x.alt,w:x.w,h:x.h,src:x.src.slice(0,120)})));
if(!imgs.length) throw new Error('target image not found');
const img=imgs.find(x=>x.w>=900 && x.h>=1600) || imgs[0];
const b64=await page.evaluate(async src=>{
 const r=await fetch(src,{credentials:'include'}); if(!r.ok) throw new Error('fetch '+r.status);
 const ab=await r.arrayBuffer(); const bytes=new Uint8Array(ab); let binary=''; const chunk=0x8000;
 for(let i=0;i<bytes.length;i+=chunk) binary += String.fromCharCode(...bytes.subarray(i,i+chunk));
 return btoa(binary);
}, img.src);
const buf=Buffer.from(b64,'base64');
const rawFile=path.join(outDir,'raw/04-hyaluronic-tone-match-gpt.png');
await fs.writeFile(rawFile,buf);
await fs.writeFile(path.join(outDir,'prompts/04-tone-match-result.txt'), `${page.url()}\n${img.src}\n${targetId}\n${buf.length}\n${img.w}x${img.h}\n`);
console.log('saved', rawFile, targetId, buf.length, `${img.w}x${img.h}`, page.url());

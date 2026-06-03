import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
const uploadDir=path.join(root,'tmp/cut11-replace-only-upload');
const all=await fs.readdir(uploadDir);
const uploadFiles=all.filter(f=>f.endsWith('.png')).map(f=>path.join(uploadDir,f));
const prompt=await fs.readFile(path.join(outDir,'prompts/11-replace-only-product-submitted.txt'),'utf8');
function getId(src){try{return new URL(src).searchParams.get('id')||src}catch{return src}}
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
const page=await ctx.newPage();
await page.goto('https://chatgpt.com/images/',{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(5000);
console.log('workspace',{url:page.url(),title:await page.title()});
const create=page.getByText('이미지 만들기',{exact:true}).first();
if(await create.count()){await create.click({timeout:15000}).catch(()=>{}); await page.waitForTimeout(3000);}
await page.waitForSelector('#prompt-textarea',{timeout:60000});
const before=await page.evaluate(()=>Array.from(document.images).map(img=>img.currentSrc||img.src).filter(src=>src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir,'prompts/11-replace-only-product-v2-before-ids.json'),JSON.stringify(before.map(getId),null,2));
const input=page.locator('input[name="images-app-drop-container-input"]').first();
await input.setInputFiles(uploadFiles);
console.log('set files',uploadFiles);
await page.waitForTimeout(15000);
let attached=await page.evaluate((names)=>{
 const text=document.body.innerText;
 const imgs=Array.from(document.images).map((img,i)=>({i,alt:img.alt,src:img.currentSrc||img.src,w:img.naturalWidth,h:img.naturalHeight,top:img.getBoundingClientRect().top}));
 return {bodyHas:names.map(n=>[n,text.includes(n)]), imageCount:imgs.length, estuary:imgs.filter(x=>x.src.includes('backend-api/estuary/content')).length, recentImgs:imgs.slice(-20)};
}, uploadFiles.map(f=>path.basename(f)));
console.log('attached_check', JSON.stringify(attached,null,2));
for (const text of ['확인','완료']) { const btn=page.getByRole('button',{name:text}).first(); if(await btn.count()){await btn.click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(1000);} }
// if filename text is absent, still require image count/estuary to have increased by at least 3 over before or visible thumbnails
const afterCount=await page.evaluate(()=>Array.from(document.images).filter(img=>(img.currentSrc||img.src).includes('backend-api/estuary/content')).length);
console.log('estuary before/after', before.length, afterCount);
if(afterCount < before.length + 3 && !JSON.stringify(attached).includes('leo-base-how-to-use')){
 console.error('attachments_not_visible_enough');
 await page.screenshot({path:path.join(root,'tmp-v7-cut11-replace-only-product-v2-upload-failed.png'),fullPage:true});
 process.exit(4);
}
const composer=page.locator('#prompt-textarea').last();
await composer.click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({timeout:15000});
await page.waitForTimeout(15000);
await fs.writeFile(path.join(outDir,'prompts/11-replace-only-product-v2-chat-url.txt'),page.url()+'\n');
await page.screenshot({path:path.join(root,'tmp-v7-cut11-replace-only-product-v2-submitted.png'),fullPage:true});
console.log('submitted',{url:page.url(),title:await page.title()});
process.exit(0);

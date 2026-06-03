import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
const key='12-full-text-eco-ingredients-gpt2-fix-product-name';
const targetUrl=(await fs.readFile(path.join(outDir,'prompts/12-full-text-eco-ingredients-gpt2-chat-url.txt'),'utf8')).trim();
const prompt=await fs.readFile(path.join(outDir,`prompts/${key}.txt`),'utf8');
function getId(src){try{return new URL(src).searchParams.get('id')||src}catch{return src}}
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
let page=ctx.pages().find(p=>p.url().startsWith(targetUrl));
if(!page){page=await ctx.newPage(); await page.goto(targetUrl,{waitUntil:'domcontentloaded',timeout:60000});}
await page.waitForTimeout(3000);
const before=await page.evaluate(()=>Array.from(document.images).map(img=>img.currentSrc||img.src).filter(src=>src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir,`prompts/${key}-before-ids.json`),JSON.stringify(before.map(getId),null,2));
await page.waitForSelector('#prompt-textarea',{timeout:60000});
const composer=page.locator('#prompt-textarea').last();
await composer.click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send"]').last().click({timeout:15000});
await page.waitForTimeout(12000);
await fs.writeFile(path.join(outDir,`prompts/${key}-chat-url.txt`),page.url()+'\n');
await page.screenshot({path:path.join(root,'tmp-v7-cut12-full-text-fix-product-name-submitted.png'),fullPage:true});
console.log('submitted fix',{url:page.url(),title:await page.title()});
process.exit(0);

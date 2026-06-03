import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
const refDir=path.join(outDir,'reference');
const uploadFiles=[
 'cut12-fix-01-wrong-box-product-negative.png',
 'cut12-fix-02-tone-ref-11.png',
 'cut12-fix-03-tone-ref-10.png',
 'cut12-fix-04-real-product-front.png',
 'cut12-fix-05-real-product-full.png',
].map(f=>path.join(refDir,f));
const prompt=await fs.readFile(path.join(outDir,'prompts/12-fix-no-fake-box-real-product-submitted.txt'),'utf8');
function getId(src){try{return new URL(src).searchParams.get('id')||src}catch{return src}}
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
const page=await ctx.newPage();
await page.goto('https://chatgpt.com/images/',{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(5000);
console.log('workspace',{url:page.url(),title:await page.title()});
const bodyText=await page.locator('body').innerText({timeout:10000}).catch(()=>'');
if (/사람인지|Cloudflare|Just a moment|로그인|Sign in/i.test(bodyText)) { console.log('blocked_or_login', bodyText.slice(0,1000)); process.exit(2); }
const create=page.getByText('이미지 만들기',{exact:true}).first();
if(await create.count()){await create.click({timeout:15000}).catch(()=>{}); await page.waitForTimeout(3000);}
await page.waitForSelector('#prompt-textarea',{timeout:60000});
const before=await page.evaluate(()=>Array.from(document.images).map(img=>img.currentSrc||img.src).filter(src=>src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir,'prompts/12-fix-no-fake-box-real-product-before-ids.json'),JSON.stringify(before.map(getId),null,2));
await page.locator('input[name="images-app-drop-container-input"]').first().setInputFiles(uploadFiles);
console.log('set files',uploadFiles);
await page.waitForTimeout(15000);
const after=await page.evaluate(()=>Array.from(document.images).filter(img=>(img.currentSrc||img.src).includes('backend-api/estuary/content')).length);
console.log('estuary before/after', before.length, after);
if(after < before.length + 5){ await page.screenshot({path:path.join(root,'tmp-v7-cut12-fix-upload-failed.png'),fullPage:true}); console.error('upload_maybe_failed'); process.exit(4); }
for (const text of ['확인','완료']) { const btn=page.getByRole('button',{name:text}).first(); if(await btn.count()){await btn.click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(1000);} }
const composer=page.locator('#prompt-textarea').last();
await composer.click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({timeout:15000});
await page.waitForTimeout(15000);
await fs.writeFile(path.join(outDir,'prompts/12-fix-no-fake-box-real-product-chat-url.txt'),page.url()+'\n');
await page.screenshot({path:path.join(root,'tmp-v7-cut12-fix-submitted.png'),fullPage:true});
console.log('submitted',{url:page.url(),title:await page.title()});
process.exit(0);

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
const refDir=path.join(outDir,'reference');
const uploadFiles=[
  path.join(outDir,'rejected/11-user-feedback-gpt-replaced-by-product-locked-label.png'),
  path.join(refDir,'cut11-product-lock-01-exact-yourskin-aqua-lotion.png'),
  path.join(refDir,'cut11-product-lock-02-full-product-identity.png'),
];
const prompt=await fs.readFile(path.join(outDir,'prompts/11-replace-only-product-submitted.txt'),'utf8');
function getId(src){try{return new URL(src).searchParams.get('id')||src}catch{return src}}
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
const page=await ctx.newPage();
await page.goto('https://chatgpt.com/images/',{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(5000);
console.log('workspace',{url:page.url(),title:await page.title()});
const bodyText=(await page.locator('body').innerText({timeout:10000}).catch(()=>''));
if (/사람인지|Cloudflare|Just a moment|로그인|Sign in/i.test(bodyText)) {
  console.log('blocked_or_login', bodyText.slice(0,1000));
  process.exit(2);
}
const create=page.getByText('이미지 만들기',{exact:true}).first();
if(await create.count()){await create.click({timeout:15000}).catch(()=>{}); await page.waitForTimeout(3000);}
await page.waitForSelector('#prompt-textarea',{timeout:60000});
const before=await page.evaluate(()=>Array.from(document.images).map(img=>img.currentSrc||img.src).filter(src=>src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir,'prompts/11-replace-only-product-before-ids.json'),JSON.stringify(before.map(getId),null,2));
await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded refs',uploadFiles.length,uploadFiles);
await page.waitForTimeout(10000);
for (const text of ['확인','완료']) { const btn=page.getByRole('button',{name:text}).first(); if(await btn.count()){await btn.click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(1000);} }
const composer=page.locator('#prompt-textarea').last();
await composer.click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({timeout:15000});
await page.waitForTimeout(15000);
await fs.writeFile(path.join(outDir,'prompts/11-replace-only-product-chat-url.txt'),page.url()+'\n');
await page.screenshot({path:path.join(root,'tmp-v7-cut11-replace-only-product-submitted.png'),fullPage:true});
console.log('submitted',{url:page.url(),title:await page.title()});
process.exit(0);

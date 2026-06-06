import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const base = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1-proof');
const key = '03-detail-routine-rev5-fix-text';
const prompt = await fs.readFile(path.join(base, 'prompts', `${key}.md`), 'utf8');
const refs = [
  path.join(base, 'detail/04.png'),
  path.join(base, 'representative/01.png'),
  path.join(root, 'public/drive-originals/hyaluronic-acid-toner/downloaded/히알루론산토너.png'),
];
function getId(src){ try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil:'domcontentloaded', timeout:60000 });
await page.waitForTimeout(5000);
console.log('workspace', {url:page.url(), title:await page.title(), refs});
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('not Images workspace');
const create=page.getByText('이미지 만들기',{exact:true}).first();
if(await create.count()){ await create.click({timeout:15000}).catch(()=>{}); await page.waitForTimeout(2500); }
await page.waitForSelector('#prompt-textarea', {timeout:60000});
const before=await page.evaluate(()=>Array.from(document.images).map(img=>img.currentSrc||img.src).filter(src=>src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(base,'raw',`${key}-before-ids.json`), JSON.stringify(before.map(getId), null, 2));
const uploadSelectors=['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, refs);
console.log('set files', refs.length);
await page.waitForTimeout(10000);
for(const text of ['확인','완료']){ const btn=page.getByRole('button',{name:text}).first(); if(await btn.count()){ await btn.click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(1000);} }
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.screenshot({path:path.join(root,'tmp-toner-routine-rev5-before-send.png'), fullPage:true});
const send=page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last();
console.log('send disabled?', await send.evaluate(el=>el.disabled || el.getAttribute('aria-disabled')==='true').catch(()=>null));
await send.click({timeout:15000});
await page.waitForTimeout(10000);
await fs.writeFile(path.join(base,'raw',`${key}-submit-log.json`), JSON.stringify({key, afterUrl:page.url(), title:await page.title(), refs, submittedAt:new Date().toISOString()}, null, 2));
console.log('submitted', page.url());
process.exit(0);

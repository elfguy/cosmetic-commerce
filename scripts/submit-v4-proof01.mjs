import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const versionDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
const files = [
  path.join(versionDir, 'reference/v4-reference-board.png'),
  path.join(root, 'public/coupang/images/aqua-lotion/versions/original/representative/01.png'),
  path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/representative/01.png'),
  path.join(root, 'public/coupang/images/aqua-lotion/versions/v3/detail/01.png'),
  path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/01.png'),
];
const globalBrief = await fs.readFile(path.join(versionDir, 'prompts/00-global-brief.txt'), 'utf8');
const cutPrompt = await fs.readFile(path.join(versionDir, 'prompts/01-hero.txt'), 'utf8');
const prompt = `${globalBrief}\n\n${cutPrompt}\n\n위 조건으로 V4 상세 01 히어로 이미지를 실제 이미지 파일로 1장 생성해줘. 기존 세션 스타일에 의존하지 말고, 첨부 이미지와 이 프롬프트만 기준으로 새롭게 만들어줘.`;

function idsFromUrl(url) {
  try { return new URL(url).searchParams.get('id') || url; } catch { return url; }
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
let page = ctx.pages().find(p => p.url() === 'https://chatgpt.com/' || p.url().startsWith('https://chatgpt.com/?'));
if (!page) {
  page = await ctx.newPage();
  await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
}
await page.bringToFront();
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });

const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
console.log('before estuary ids', before.map(src => new URL(src).searchParams.get('id')).filter(Boolean));

await page.setInputFiles('input#upload-files', files);
console.log('uploaded files requested', files.length);
await page.waitForTimeout(8000);

await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);

const buttons = await page.locator('button').evaluateAll(btns => btns.map((b,i)=>({i, text:b.innerText, aria:b.getAttribute('aria-label'), disabled:b.disabled, cls:b.className?.toString()})));
const submitCandidates = buttons.filter(b => /보내기|전송|submit|send/i.test((b.aria||'')+' '+(b.text||'')) || (b.cls||'').includes('composer-submit'));
console.log('submit candidates', JSON.stringify(submitCandidates.slice(-10), null, 2));

const submit = page.locator('button[data-testid="send-button"], button[aria-label*="보내기"], button[aria-label*="전송"], button.composer-submit-button-color').last();
await submit.click({ timeout: 15000 });
console.log('submitted', page.url());
await page.waitForTimeout(3000);
console.log('title', await page.title());
console.log('url', page.url());
await page.screenshot({ path: path.join(root, 'tmp-v4-proof-submitted.png'), fullPage: true });
// Keep browser open; disconnect only.

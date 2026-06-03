import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4/detail');
await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
let page = ctx.pages().find(p => p.url().includes('/c/6a1da38d-0f68-83a8-93fb-996a51f79b90')) || ctx.pages().find(p => (p.url().includes('chatgpt.com/c/') && p.url().includes('6a1da38d')));
if (!page) throw new Error('proof chat page not found');
await page.bringToFront();
console.log('url', page.url());
console.log('title', await page.title());

function getId(src){ try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
for (let attempt=1; attempt<=60; attempt++) {
  await page.waitForTimeout(10000);
  const data = await page.evaluate(() => {
    return {
      busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
      text: document.body.innerText.slice(-2000),
      imgs: Array.from(document.images).map((img, i) => ({
        i,
        alt: img.alt,
        src: img.currentSrc || img.src,
        w: img.naturalWidth,
        h: img.naturalHeight
      })).filter(x => x.src && (x.src.includes('backend-api/estuary/content') || x.w > 500 || x.h > 500))
    };
  });
  const candidates = data.imgs.filter(x => x.src.includes('backend-api/estuary/content') && x.w >= 500 && x.h >= 500);
  console.log('attempt', attempt, 'busy', data.busy, 'imgs', data.imgs.length, 'candidates', candidates.map(x=>({id:getId(x.src), w:x.w, h:x.h, alt:x.alt})));
  if (candidates.length) {
    const img = candidates[candidates.length - 1];
    const b64 = await page.evaluate(async (src) => {
      const r = await fetch(src, { credentials: 'include' });
      if (!r.ok) throw new Error('fetch '+r.status);
      const ab = await r.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(ab);
      const chunk = 0x8000;
      for (let i=0;i<bytes.length;i+=chunk) binary += String.fromCharCode(...bytes.subarray(i,i+chunk));
      return btoa(binary);
    }, img.src);
    const file = path.join(outDir, '01.png');
    await fs.writeFile(file, Buffer.from(b64, 'base64'));
    await fs.writeFile(path.join(root, 'public/coupang/images/aqua-lotion/versions/v4/prompts/01-chat-url.txt'), page.url() + '\n' + img.src + '\n');
    console.log('saved', file, 'id', getId(img.src), 'size', Buffer.from(b64,'base64').length);
    await page.screenshot({ path: path.join(root, 'tmp-v4-proof01-page.png'), fullPage: false });
    process.exit(0);
  }
}
console.error('no generated image found');
process.exit(2);

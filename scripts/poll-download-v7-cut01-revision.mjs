import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });
await fs.mkdir(path.join(outDir, 'rejected'), { recursive: true });

function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
const beforeIds = new Set(JSON.parse(await fs.readFile(path.join(outDir, 'prompts/01-revision-before-estuary-ids.json'), 'utf8')));
const chatUrl = 'https://chatgpt.com/c/6a1e1d5e-399c-83a2-91b5-68791fc81942';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
let page = ctx.pages().find(p => p.url().includes('/c/6a1e1d5e-399c-83a2-91b5-68791fc81942'));
if (!page) {
  page = await ctx.newPage();
  await page.goto(chatUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
}
await page.bringToFront();
console.log('poll page', page.url(), await page.title());

for (let attempt = 1; attempt <= 60; attempt++) {
  await page.waitForTimeout(10000);
  const data = await page.evaluate(() => ({
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    imgs: Array.from(document.images).map((img,i)=>({
      i, alt: img.alt, src: img.currentSrc || img.src, w: img.naturalWidth, h: img.naturalHeight,
      rect: (()=>{const r=img.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};})()
    })).filter(x => x.src && x.src.includes('backend-api/estuary/content'))
  }));
  const imgs = data.imgs.map(x => ({...x, id:getId(x.src)}));
  const candidates = imgs.filter(x => x.w >= 700 && x.h >= 1000 && !beforeIds.has(x.id));
  console.log('attempt', attempt, 'busy', data.busy, 'candidates', candidates.map(x=>({id:x.id,w:x.w,h:x.h,alt:x.alt,y:x.rect.y})));
  if (candidates.length) {
    const img = candidates[candidates.length - 1];
    const b64 = await page.evaluate(async (src) => {
      const r = await fetch(src, { credentials: 'include' });
      if (!r.ok) throw new Error('fetch ' + r.status);
      const ab = await r.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(ab);
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      return btoa(binary);
    }, img.src);
    const buf = Buffer.from(b64, 'base64');
    const rawFile = path.join(outDir, 'raw/01-official-product-name-gpt.png');
    await fs.writeFile(rawFile, buf);
    await fs.writeFile(path.join(outDir, 'prompts/01-revision-result.txt'), `${page.url()}\n${img.src}\n${img.id}\n${buf.length}\n${img.w}x${img.h}\n`);
    console.log('saved', rawFile, img.id, buf.length, `${img.w}x${img.h}`);
    process.exit(0);
  }
}
console.error('no revision image found');
process.exit(2);

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v5-gpt-images-workspace');
await fs.mkdir(path.join(outDir, 'detail'), { recursive: true });
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });

function getId(src) {
  try { return new URL(src).searchParams.get('id') || src; } catch { return src; }
}

const oldIds = new Set([
  'file_0000000013b47209ab896dccd2c558a6',
  'file_000000003708720b8cd010461865b2ae',
  'file_000000002430720bae3f1c9951a15292',
  'file_00000000c278720ba2f6ed09d0548556',
  'file_000000001f04720bb7801d1b498900c3',
  'file_000000000de8720ba20f431d0f129395',
  'file_0000000070b0720bb210bf817ac49352',
  'file_0000000048ec71f89fedfc5f4d3810b4',
  'file_000000005304720bb36c63acb665d420',
  'file_000000006108720bb6a26ea442a42b01',
  'file_000000000914720ba4a5c439e9b109cc',
  'file_000000000ab8720b8042081ff221de8f',
  'file_0000000026d87207a1cad7b485c3aca6',
  'file_0000000050d872078373aae65355a6cd',
  'file_000000006ee8720799edebad76957aee',
  'file_00000000c7d0720792f519563eca0be5',
  'file_000000005d047209acc47e525b9318c8',
  'file_0000000074c47209950ead8ce6327fc7',
  'file_00000000dcec7209938065c6fac5fe07',
  'file_00000000a9fc7209964c3d2a671ba7d0',
  'file_0000000096607209be6150cb01bde97f',
  'file_00000000c23c720996c811425bd71bd6',
  'file_00000000cf2872099d0f281d229da383',
  'file_0000000040f87209b67e482bbdd46b60',
  'file_000000009dec7209b84d885b12a2407a',
  'file_00000000691c7209836a0e0f9f43e9b3'
]);

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
let page = ctx.pages().reverse().find(p => p.url().startsWith('https://chatgpt.com/images'));
if (!page) {
  page = await ctx.newPage();
  await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
}
await page.bringToFront();
console.log('poll page', page.url(), await page.title());

for (let attempt = 1; attempt <= 60; attempt++) {
  await page.waitForTimeout(10000);
  const data = await page.evaluate(() => ({
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    text: document.body.innerText.slice(0, 1500),
    tail: document.body.innerText.slice(-1500),
    imgs: Array.from(document.images).map((img, i) => ({
      i,
      alt: img.alt,
      src: img.currentSrc || img.src,
      w: img.naturalWidth,
      h: img.naturalHeight,
      rect: (() => { const r = img.getBoundingClientRect(); return { x:r.x, y:r.y, w:r.width, h:r.height }; })(),
    })).filter(x => x.src && x.src.includes('backend-api/estuary/content'))
  }));
  const imgs = data.imgs.map(x => ({ ...x, id: getId(x.src) }));
  const candidates = imgs
    .filter(x => x.w >= 700 && x.h >= 1000)
    .filter(x => !oldIds.has(x.id));
  console.log('attempt', attempt, 'busy', data.busy, 'imgs', imgs.length, 'newCandidates', candidates.map(x => ({ id:x.id, w:x.w, h:x.h, alt:x.alt, y:x.rect.y })));
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
    const file = path.join(outDir, 'detail/02.png');
    await fs.writeFile(file, buf);
    await fs.writeFile(path.join(outDir, 'prompts/02-proof-v2-white-content-result.txt'), `${page.url()}\n${img.src}\n${img.id}\n${buf.length}\n${img.w}x${img.h}\n`);
    console.log('saved', file, img.id, buf.length, `${img.w}x${img.h}`);
    process.exit(0);
  }
}
console.error('no new generated image found');
process.exit(2);

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });
await fs.mkdir(path.join(outDir, 'detail'), { recursive: true });
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });

function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
const beforeIds = new Set(JSON.parse(await fs.readFile(path.join(outDir, 'prompts/02-before-estuary-ids.json'), 'utf8')));

async function pageData(page) {
  return await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    text: document.body.innerText.slice(0, 1200),
    tail: document.body.innerText.slice(-1200),
    imgs: Array.from(document.images).map((img, i) => ({
      i,
      alt: img.alt,
      src: img.currentSrc || img.src,
      w: img.naturalWidth,
      h: img.naturalHeight,
      rect: (() => { const r = img.getBoundingClientRect(); return { x:r.x, y:r.y, w:r.width, h:r.height }; })(),
    })).filter(x => x.src && x.src.includes('backend-api/estuary/content'))
  }));
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
let pages = ctx.pages().filter(p => p.url().startsWith('https://chatgpt.com/'));
let page = pages.reverse().find(p => p.url().startsWith('https://chatgpt.com/images')) || pages[0];
if (!page) {
  page = await ctx.newPage();
  await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
}
await page.bringToFront();
console.log('poll start', page.url(), await page.title());

for (let attempt = 1; attempt <= 80; attempt++) {
  await page.waitForTimeout(10000);
  // Include all ChatGPT pages because Images submissions can land in /c/ pages.
  pages = ctx.pages().filter(p => p.url().startsWith('https://chatgpt.com/'));
  const allCandidates = [];
  for (const p of pages) {
    let data;
    try { data = await pageData(p); } catch { continue; }
    const imgs = data.imgs.map(x => ({ ...x, id: getId(x.src), pageUrl: data.url, pageTitle: data.title, busy: data.busy }));
    const candidates = imgs
      .filter(x => x.w >= 700 && x.h >= 1000)
      .filter(x => !beforeIds.has(x.id));
    for (const c of candidates) allCandidates.push(c);
  }
  console.log('attempt', attempt, 'pages', pages.length, 'newCandidates', allCandidates.map(x => ({ id:x.id, w:x.w, h:x.h, page:x.pageUrl, y:x.rect.y, alt:x.alt })));
  if (allCandidates.length) {
    // Prefer the newest/largest non-thumbnail portrait-ish candidate.
    const img = allCandidates
      .filter(x => !String(x.id).includes('#thumbnail'))
      .sort((a,b) => (b.w*b.h) - (a.w*a.h))[0] || allCandidates[allCandidates.length - 1];
    const p = pages.find(pg => img.pageUrl === pg.url()) || page;
    await p.bringToFront();
    const b64 = await p.evaluate(async (src) => {
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
    const rawFile = path.join(outDir, 'raw/02-family-daily-gpt.png');
    await fs.writeFile(rawFile, buf);
    await fs.writeFile(path.join(outDir, 'prompts/02-result.txt'), `${img.pageUrl}\n${img.src}\n${img.id}\n${buf.length}\n${img.w}x${img.h}\n`);
    console.log('saved raw', rawFile, img.id, buf.length, `${img.w}x${img.h}`);
    process.exit(0);
  }
}
console.error('no new generated image found');
process.exit(2);

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { cleanupStaleImageAgentTabs } from './lib/chrome-tab-cleanup.mjs';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
const promptDir = path.join(outDir, 'representative-prompts');
const rawDir = path.join(outDir, 'representative-raw');
const repDir = path.join(outDir, 'representative');
const rejectedDir = path.join(outDir, 'rejected');
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(repDir, { recursive: true });
await fs.mkdir(rejectedDir, { recursive: true });

function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
async function readJson(p) { return JSON.parse(await fs.readFile(p, 'utf8')); }

const targets = [3, 5, 6];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
const keepUrls = [];
for (const n of targets) {
  const nn = String(n).padStart(2, '0');
  try { keepUrls.push((await fs.readFile(path.join(promptDir, `${nn}-product-volume-fix-chat-url.txt`), 'utf8')).trim()); } catch {}
}
await cleanupStaleImageAgentTabs(ctx, { keepUrls, maxTabs: 4 });

for (const n of targets) {
  const nn = String(n).padStart(2, '0');
  const targetUrl = (await fs.readFile(path.join(promptDir, `${nn}-product-volume-fix-chat-url.txt`), 'utf8')).trim();
  const beforeIds = new Set(await readJson(path.join(promptDir, `${nn}-product-volume-fix-before-ids.json`)));
  let page = ctx.pages().find(p => p.url().startsWith(targetUrl));
  if (!page) {
    page = await ctx.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  console.log('poll-target', { n, targetUrl });
  let saved = false;
  for (let attempt = 1; attempt <= 150; attempt++) {
    await page.waitForTimeout(8000);
    const data = await page.evaluate(() => ({
      busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
      text: document.body.innerText.slice(-2000),
      imgs: Array.from(document.images)
        .map(img => ({ alt: img.alt, src: img.currentSrc || img.src, w: img.naturalWidth, h: img.naturalHeight }))
        .filter(x => x.src.includes('backend-api/estuary/content'))
    }));
    const uniq = [];
    const seen = new Set();
    for (const x of data.imgs.map(x => ({ ...x, id: getId(x.src) })).filter(x => x.w >= 900 && x.h >= 900 && !beforeIds.has(x.id))) {
      if (!seen.has(x.id)) { seen.add(x.id); uniq.push(x); }
    }
    console.log('poll', n, attempt, 'busy', data.busy, 'candidates', uniq.map(x => ({ id: x.id, w: x.w, h: x.h, alt: x.alt })));
    if (uniq.length && !data.busy) {
      const img = uniq.at(-1);
      const b64 = await page.evaluate(async src => {
        const r = await fetch(src, { credentials: 'include' });
        if (!r.ok) throw new Error('fetch ' + r.status);
        const ab = await r.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let s = '';
        for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        return btoa(s);
      }, img.src);
      const buf = Buffer.from(b64, 'base64');
      const raw = path.join(rawDir, `${nn}-product-volume-fix-gpt.png`);
      await fs.writeFile(raw, buf);
      const current = path.join(repDir, `${nn}.png`);
      try {
        const ts = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
        await fs.copyFile(current, path.join(rejectedDir, `${nn}-before-product-volume-fix-${ts}.png`));
      } catch {}
      await sharp(buf).resize(1254, 1254, { fit: 'cover', position: 'center' }).png({ compressionLevel: 9 }).toFile(current);
      await fs.writeFile(path.join(promptDir, `${nn}-product-volume-fix-result.txt`), `${targetUrl}\n${img.src}\n${img.id}\n${buf.length}\n${img.w}x${img.h}\nraw=${raw}\nfinal=${current}\n`);
      console.log('saved', { n, current, id: img.id, bytes: buf.length, dims: `${img.w}x${img.h}` });
      saved = true;
      break;
    }
  }
  if (!saved) throw new Error('no generated image saved for representative ' + nn);
}
console.log('saved all product-volume fixes');

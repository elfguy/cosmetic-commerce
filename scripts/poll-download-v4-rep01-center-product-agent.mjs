import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
const promptDir = path.join(outDir, 'representative-prompts');
const rawDir = path.join(outDir, 'representative-raw');
await fs.mkdir(rawDir, { recursive: true });
function getId(src){ try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
const targetUrl = (await fs.readFile(path.join(promptDir, '01-center-product-agent-chat-url.txt'), 'utf8')).trim();
const beforeIds = new Set(JSON.parse(await fs.readFile(path.join(promptDir, '01-center-product-agent-before-ids.json'), 'utf8')));
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
let page = ctx.pages().find(p => p.url().startsWith(targetUrl));
if (!page) { page = await ctx.newPage(); await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }); }
for (let attempt=1; attempt<=120; attempt++) {
  await page.waitForTimeout(10000);
  const data = await page.evaluate(() => ({
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    imgs: Array.from(document.images).map(img => ({ alt: img.alt || '', src: img.currentSrc || img.src || '', w: img.naturalWidth, h: img.naturalHeight })).filter(x => x.src.includes('backend-api/estuary/content'))
  }));
  const uniq=[]; const seen=new Set();
  for (const x of data.imgs.map(x => ({...x, id:getId(x.src)})).filter(x => x.w>=900 && x.h>=900 && !beforeIds.has(x.id))) {
    if (!seen.has(x.id)) { seen.add(x.id); uniq.push(x); }
  }
  console.log('poll', attempt, 'busy', data.busy, 'candidates', uniq.map(x => ({ id:x.id, w:x.w, h:x.h, alt:x.alt.slice(0,80) })));
  if (uniq.length && !data.busy) {
    const img = uniq.at(-1);
    const b64 = await page.evaluate(async src => {
      const r = await fetch(src, { credentials:'include' });
      if (!r.ok) throw new Error('fetch '+r.status);
      const ab = await r.arrayBuffer();
      const bytes = new Uint8Array(ab);
      let s=''; for (let i=0;i<bytes.length;i+=0x8000) s += String.fromCharCode(...bytes.subarray(i,i+0x8000));
      return btoa(s);
    }, img.src);
    const buf = Buffer.from(b64, 'base64');
    const stamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
    const raw = path.join(rawDir, `01-center-product-agent-${stamp}.png`);
    const norm = path.join(rawDir, `01-center-product-agent-${stamp}-1254.png`);
    await fs.writeFile(raw, buf);
    await sharp(buf).resize(1254, 1254, { fit:'cover', position:'center' }).png({ compressionLevel: 9 }).toFile(norm);
    await fs.writeFile(path.join(promptDir, '01-center-product-agent-result.json'), JSON.stringify({ targetUrl, src: img.src, id: img.id, natural: `${img.w}x${img.h}`, bytes: buf.length, raw, normalized: norm }, null, 2));
    console.log('saved', { raw, norm, id: img.id, bytes: buf.length, natural: `${img.w}x${img.h}` });
    process.exit(0);
  }
}
process.exit(2);

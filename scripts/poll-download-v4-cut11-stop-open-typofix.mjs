import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
const targetUrl = (await fs.readFile(path.join(outDir, 'prompts/11-stop-open-typofix-chat-url.txt'), 'utf8')).trim();
const beforeIds = new Set(JSON.parse(await fs.readFile(path.join(outDir, 'prompts/11-stop-open-typofix-before-ids.json'), 'utf8')));
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
let page = ctx.pages().find(p => p.url().startsWith(targetUrl));
if (!page) { page = await ctx.newPage(); await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }); }
for (let attempt = 1; attempt <= 120; attempt++) {
  await page.waitForTimeout(10000);
  const data = await page.evaluate(() => ({
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    imgs: Array.from(document.images).map(img => ({ alt: img.alt, src: img.currentSrc || img.src, w: img.naturalWidth, h: img.naturalHeight })).filter(x => x.src.includes('backend-api/estuary/content'))
  }));
  const uniq=[]; const seen=new Set();
  for (const x of data.imgs.map(x => ({...x, id:getId(x.src)})).filter(x => x.w>=700 && x.h>=1000 && !beforeIds.has(x.id) && !String(x.alt||'').startsWith('cut11-typofix-'))) {
    if (!seen.has(x.id)) { seen.add(x.id); uniq.push(x); }
  }
  console.log('attempt', attempt, 'busy', data.busy, 'candidates', uniq.map(x => ({ id:x.id, w:x.w, h:x.h, alt:x.alt })));
  if (uniq.length && !data.busy) {
    const img = uniq.at(-1);
    const b64 = await page.evaluate(async src => {
      const r = await fetch(src, { credentials:'include' });
      if (!r.ok) throw new Error('fetch '+r.status);
      const ab = await r.arrayBuffer(); const bytes = new Uint8Array(ab); let s='';
      for (let i=0;i<bytes.length;i+=0x8000) s += String.fromCharCode(...bytes.subarray(i,i+0x8000));
      return btoa(s);
    }, img.src);
    const buf = Buffer.from(b64, 'base64');
    const rawFile = path.join(outDir, 'raw/11-stop-open-typofix-gpt.png');
    const finalFile = path.join(outDir, 'detail/11.png');
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
    const backupFile = path.join(outDir, `rejected/11-before-stop-open-typofix-${stamp}.png`);
    await fs.copyFile(finalFile, backupFile).catch(() => {});
    await fs.writeFile(rawFile, buf);
    await sharp(buf).resize(780, 1360, { fit:'cover', position:'center' }).png({ compressionLevel: 9 }).toFile(finalFile);
    await fs.writeFile(path.join(outDir, 'prompts/11-stop-open-typofix-result.txt'), `${targetUrl}\n${img.src}\n${img.id}\n${buf.length}\n${img.w}x${img.h}\nraw=${rawFile}\nfinal=${finalFile}\nbackup=${backupFile}\n`);
    console.log('saved', { rawFile, finalFile, backupFile, id: img.id, bytes: buf.length, size: `${img.w}x${img.h}` });
    process.exit(0);
  }
}
process.exit(2);

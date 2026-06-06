import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const base = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1-proof');
const key = '03-detail-routine-rev4-toner-skin-layering';
const beforeIds = new Set(JSON.parse(await fs.readFile(path.join(base, 'raw', `${key}-before-ids.json`), 'utf8')));
function getId(src){ try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
let page = ctx.pages().reverse().find(p => p.url().includes('6a223f15-ef88-83a7-bb8a-951cd2e7ad01'));
if (!page) { page = await ctx.newPage(); await page.goto('https://chatgpt.com/c/6a223f15-ef88-83a7-bb8a-951cd2e7ad01', { waitUntil:'domcontentloaded', timeout:60000 }); }
await page.waitForTimeout(3000);
let chosen = null, lastData = null;
for (let i=0;i<80;i++) {
  const data = await page.evaluate(() => ({
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    textTail: document.body.innerText.slice(-1200),
    imgs: Array.from(document.images).map(img => ({ alt: img.alt, src: img.currentSrc || img.src, w: img.naturalWidth, h: img.naturalHeight, rect: (()=>{const r=img.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};})() })).filter(x => x.src.includes('backend-api/estuary/content'))
  }));
  lastData = data;
  const candidates = data.imgs.map(x => ({...x, id:getId(x.src)}))
    .filter(x => x.w >= 700 && x.h >= 1000 && !beforeIds.has(x.id));
  console.log('poll', i, 'busy', data.busy, 'cands', candidates.map(c=>({id:c.id,w:c.w,h:c.h,alt:c.alt})).slice(-5));
  if (candidates.length && !data.busy) { chosen = candidates.at(-1); break; }
  await page.waitForTimeout(10000);
}
await fs.writeFile(path.join(base, 'raw', `${key}-poll-state.json`), JSON.stringify({chosen,lastData}, null, 2));
if (!chosen) { await page.screenshot({path:path.join(root,'tmp-toner-routine-rev4-poll-failed.png'), fullPage:true}); throw new Error('no generated candidate'); }
const res = await page.request.get(chosen.src);
if (!res.ok()) throw new Error('download failed '+res.status());
const buf = await res.body();
const out = path.join(base, 'raw', `${key}-generated-raw.png`);
await fs.writeFile(out, buf);
await fs.writeFile(path.join(base, 'raw', `${key}-download-log.json`), JSON.stringify({chosen,out,bytes:buf.length,downloadedAt:new Date().toISOString(),url:page.url()}, null, 2));
console.log('DOWNLOADED', out, buf.length, chosen.w, chosen.h);

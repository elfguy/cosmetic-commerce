import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cleanupStaleImageAgentTabs } from './lib/chrome-tab-cleanup.mjs';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const base = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const cut = process.env.CUT;
const key = process.env.KEY || `${cut}-detail`;
if (!cut) throw new Error('CUT env is required');
const beforeIds = new Set(JSON.parse(await fs.readFile(path.join(base, 'raw', `${key}-before-ids.json`), 'utf8')));
function getId(src){ try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
let page = null;
const submitLogPath = path.join(base, 'raw', `${key}-submit-log.json`);
try {
  const log = JSON.parse(await fs.readFile(submitLogPath, 'utf8'));
  const target = log.afterUrl;
  page = ctx.pages().reverse().find(p => p.url() === target || p.url().startsWith(target));
  if (!page && target) { page = await ctx.newPage(); await page.goto(target, { waitUntil:'domcontentloaded', timeout:60000 }); }
} catch {}
if (!page) page = ctx.pages().reverse().find(p => p.url().startsWith('https://chatgpt.com/c/')) || ctx.pages().reverse().find(p => p.url().startsWith('https://chatgpt.com/images'));
if (!page) { page = await ctx.newPage(); await page.goto('https://chatgpt.com/images/', { waitUntil:'domcontentloaded', timeout:60000 }); }
await cleanupStaleImageAgentTabs(ctx, { keepPage: page, maxTabs: 2 });
await page.waitForTimeout(3000);
let chosen = null, lastData = null;
for (let i=0; i<90; i++) {
  const data = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    textTail: document.body.innerText.slice(-1600),
    imgs: Array.from(document.images).map(img => ({ alt: img.alt, src: img.currentSrc || img.src, w: img.naturalWidth, h: img.naturalHeight, rect: (()=>{ const r=img.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; })() })).filter(x => x.src.includes('backend-api/estuary/content')),
  }));
  lastData = data;
  const candidates = data.imgs
    .map(x => ({...x, id:getId(x.src)}))
    .filter(x => x.w >= 700 && x.h >= 1000 && !beforeIds.has(x.id))
    // Uploaded source references appear after submit and can share the current cut filename.
    // Never select those as generated outputs.
    .filter(x => !String(x.alt || '').trim().match(new RegExp(`^${cut}\\.(png|jpg|jpeg|webp)$`, 'i')));
  console.log('poll', i, 'busy', data.busy, 'url', data.url, 'cands', candidates.map(c => ({id:c.id,w:c.w,h:c.h,alt:c.alt})).slice(-4));
  if (candidates.length && !data.busy) { chosen = candidates.at(-1); break; }
  await page.waitForTimeout(10000);
}
await fs.writeFile(path.join(base, 'raw', `${key}-poll-state.json`), JSON.stringify({ chosen, lastData }, null, 2));
if (!chosen) { await page.screenshot({ path: path.join(root, `tmp-toner-v1-${key}-poll-failed.png`), fullPage:true }); throw new Error('no generated candidate'); }
const res = await page.request.get(chosen.src);
if (!res.ok()) throw new Error('download failed ' + res.status());
const buf = await res.body();
const out = path.join(base, 'raw', `${key}-generated-raw.png`);
await fs.writeFile(out, buf);
await fs.writeFile(path.join(base, 'raw', `${key}-download-log.json`), JSON.stringify({ chosen, out, bytes:buf.length, downloadedAt:new Date().toISOString(), url: page.url() }, null, 2));
console.log('DOWNLOADED', out, buf.length, chosen.w, chosen.h);
process.exit(0);

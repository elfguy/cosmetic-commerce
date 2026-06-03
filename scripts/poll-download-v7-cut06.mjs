import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
const beforeIds = new Set(JSON.parse(await fs.readFile(path.join(outDir, 'prompts/06-before-estuary-ids.json'), 'utf8')));

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
let targetPage = null;
async function inspectPage(p) {
  return await p.evaluate(() => ({
    url: location.href,
    title: document.title,
    text: document.body.innerText,
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    imgs: Array.from(document.images).map((img,i)=>({
      i, alt: img.alt, src: img.currentSrc || img.src, w: img.naturalWidth, h: img.naturalHeight,
      rect: (()=>{const r=img.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};})()
    })).filter(x => x.src && x.src.includes('backend-api/estuary/content'))
  })).catch(() => null);
}

for (let attempt = 1; attempt <= 90; attempt++) {
  await new Promise(r => setTimeout(r, 10000));
  const pages = ctx.pages().filter(p => p.url().startsWith('https://chatgpt.com/'));
  const candidates = [];
  for (const p of pages) {
    const data = await inspectPage(p);
    if (!data) continue;
    const isCut06 = data.text.includes('아쿠아로션 상세페이지 06번') || data.text.includes('Fresh Bud No.6') && data.text.includes('특허 진정 원료') || data.text.includes('cut06-ref-v2-detail-06-patent-bud');
    if (!isCut06) continue;
    targetPage = p;
    const imgs = data.imgs.map(x => ({...x, id:getId(x.src), pageUrl:data.url, busy:data.busy}));
    for (const x of imgs.filter(x => x.w >= 700 && x.h >= 1000 && !beforeIds.has(x.id))) candidates.push(x);
  }
  console.log('attempt', attempt, 'candidates', candidates.map(x=>({id:x.id,w:x.w,h:x.h,alt:x.alt,page:x.pageUrl,y:x.rect.y})));
  if (candidates.length) {
    const generated = candidates.filter(x => !String(x.alt||'').startsWith('cut06-'));
    const arr = generated.length ? generated : candidates;
    const img = arr[arr.length - 1];
    const p = targetPage || pages.find(pg => pg.url() === img.pageUrl) || pages[0];
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
    const rawFile = path.join(outDir, 'raw/06-fresh-bud-patent-gpt.png');
    await fs.writeFile(rawFile, buf);
    await fs.writeFile(path.join(outDir, 'prompts/06-result.txt'), `${img.pageUrl}\n${img.src}\n${img.id}\n${buf.length}\n${img.w}x${img.h}\n`);
    console.log('saved', rawFile, img.id, buf.length, `${img.w}x${img.h}`, img.pageUrl);
    process.exit(0);
  }
}
console.error('no cut06 image found');
process.exit(2);

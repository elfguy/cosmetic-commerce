import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const slot = process.argv[2];
const key = process.argv[3];
if (!slot || !key) throw new Error('usage: node scripts/generate-cleansing-oil-representative-slot.mjs <02> <key>');
const outDir = path.join(root, 'public/coupang/images/cleansing-oil/versions/v1');
const promptDir = path.join(outDir, 'representative-prompts');
const rawDir = path.join(outDir, 'agent-representative-raw');
const repDir = path.join(outDir, 'representative');
const refDir = path.join(root, `tmp/cleansing-oil-rep${slot}-refs`);
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(repDir, { recursive: true });
await fs.mkdir(refDir, { recursive: true });

const refPairs = [
  [path.join(root, 'public/drive-originals/cleansing-oil/downloaded/클렌징오일.png'), path.join(refDir, 'cleansing-oil-original-product.png')],
  [path.join(root, 'public/coupang/images/cleansing-oil/versions/v1/representative/01.png'), path.join(refDir, 'rep01-approved.png')],
  [path.join(root, 'public/coupang/images/cleansing-oil/versions/v1/detail/01.png'), path.join(refDir, 'detail01-style.png')],
];
// Include previous accepted representative slots as rhythm references if present.
for (const s of ['02','03','04','05']) {
  if (Number(s) < Number(slot)) {
    const p = path.join(root, `public/coupang/images/cleansing-oil/versions/v1/representative/${s}.png`);
    try { await fs.stat(p); refPairs.push([p, path.join(refDir, `rep${s}-accepted.png`)]); } catch {}
  }
}
let refs;
if (process.env.ONLY_REFS) {
  refs = process.env.ONLY_REFS.split(',').map(s => s.trim()).filter(Boolean);
  if (!refs.length) throw new Error('ONLY_REFS provided but empty');
  for (const p of refs) await fs.stat(p);
} else {
  for (const [src, dst] of refPairs) await fs.copyFile(src, dst);
  refs = refPairs.map(([,dst]) => dst);
}
const prompt = await fs.readFile(path.join(promptDir, `${key}-prompt.txt`), 'utf8');

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
for (const p of ctx.pages()) {
  if (p.url().startsWith('https://chatgpt.com/images')) await p.close().catch(()=>{});
}
const page = await ctx.newPage();
await page.setViewportSize({ width: 1440, height: 1200 });
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(5000);
for (let i=0; i<3; i++) {
  const close = page.locator('button[aria-label="전체 화면 닫기"], button[aria-label="Close fullscreen"]').first();
  if (await close.count()) { await close.click({ timeout: 3000 }).catch(()=>{}); await page.waitForTimeout(1500); }
}
if (!(await page.locator('#prompt-textarea').count())) {
  await page.goto('https://chatgpt.com/images/?create=true', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);
}
await page.waitForSelector('#prompt-textarea', { timeout: 90000 });
await page.locator('#prompt-textarea').last().scrollIntoViewIfNeeded();
let body = await page.locator('body').innerText().catch(()=> '');
if (/편집 내용을 설명하세요|Describe your edit/.test(body)) throw new Error('editor mode before upload');
const upload = page.locator('input[name="images-app-drop-container-input"]').first();
if (!(await upload.count())) throw new Error('images-app-drop-container-input missing');
await upload.setInputFiles(refs);
await page.waitForTimeout(10000);
await page.locator('#prompt-textarea').last().scrollIntoViewIfNeeded();
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(1000);
const beforeSendShot = path.join(root, `tmp/cleansing-oil-rep${slot}-${key}-before-send.png`);
await page.screenshot({ path: beforeSendShot, fullPage: true });
const baselineIds = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).map(src => String(src).match(/id=([^&]+)/)?.[1]).filter(Boolean));
await fs.writeFile(path.join(promptDir, `${key}-baseline-after-upload-ids.json`), JSON.stringify(baselineIds, null, 2));
const evidence = await page.evaluate(() => ({ url: location.href, title: document.title, editor: /편집 내용을 설명하세요|Describe your edit/.test(document.body.innerText || ''), promptCount: document.querySelectorAll('#prompt-textarea').length }));
await fs.writeFile(path.join(rawDir, `${key}-before-send-evidence.json`), JSON.stringify({ beforeSendShot, refs, evidence }, null, 2));
console.log('beforeSend', JSON.stringify({ beforeSendShot, refs, evidence }, null, 2));
if (evidence.editor) throw new Error('editor mode before send');

let clicked = false;
for (const sel of ['button[data-testid="send-button"]', 'button[aria-label="전송"]', 'button[aria-label="Send"]']) {
  const btn = page.locator(sel).last();
  if (await btn.count()) { await btn.click({ timeout: 5000 }).catch(()=>{}); clicked = true; break; }
}
if (!clicked) await page.mouse.click(1102, 554);
await page.waitForTimeout(3000);
console.log('submitted', page.url());
let chosen = null;
for (let i=1; i<=100; i++) {
  await page.waitForTimeout(5000);
  const state = await page.evaluate((baseline) => {
    const imgs = Array.from(document.images).map(img => {
      const src = img.currentSrc || img.src;
      const m = src.match(/id=([^&]+)/);
      return { src, id: m?.[1] || '', nw: img.naturalWidth, nh: img.naturalHeight, alt: img.alt || '' };
    }).filter(x => x.src.includes('backend-api/estuary/content') && x.nw >= 900 && x.nh >= 900 && x.id && !baseline.includes(x.id));
    const text = document.body.innerText || '';
    const busy = /생성 중|이미지를 생성|Creating|Generating|생각 중/.test(text);
    return { busy, fresh: imgs };
  }, baselineIds);
  console.log('poll', i, 'busy', state.busy, 'fresh', state.fresh.map(x => ({id:x.id,w:x.nw,h:x.nh,alt:x.alt})).slice(-5));
  if (state.fresh.length && !state.busy) { chosen = state.fresh[state.fresh.length - 1]; break; }
}
if (!chosen) throw new Error('no generated candidate');
const raw = path.join(rawDir, `${key}-agent.png`);
const candidate = path.join(repDir, `${slot}-candidate-${key}.png`);
const res = await page.goto(chosen.src, { waitUntil: 'networkidle', timeout: 60000 });
const buf = await res.body();
await fs.writeFile(raw, buf);
await sharp(buf).resize(1000, 1000, { fit: 'cover', position: 'center' }).png({ compressionLevel: 9 }).toFile(candidate);
const meta = await sharp(candidate).metadata();
const result = { startUrl: 'https://chatgpt.com/images/', title: 'ChatGPT Images 2.0 | AI 이미지 생성기', submittedUrl: 'https://chatgpt.com/images/', resultUrl: page.url(), id: chosen.id, raw, candidate, finalSize: `${meta.width}x${meta.height}`, beforeSendShot, refs, rule: 'direct ChatGPT Images output; visible attachments verified before submit; candidate only; normalized only' };
await fs.writeFile(path.join(rawDir, `${key}-result.json`), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exit(0);

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const base = path.join(root, 'public/coupang/images/whitening-cream/versions/v1');
const repDir = path.join(base, 'representative');
const rawDir = path.join(base, 'agent-representative-raw');
const promptDir = path.join(base, 'agent-representative-prompts');
const cut = process.env.CUT;
const key = process.env.KEY || `${cut}-gpt-product-locked-v5`;
if (!cut) throw new Error('CUT env is required, e.g. CUT=03');
const prompt = await fs.readFile(path.join(promptDir, `${key}-prompt.txt`), 'utf8');
const extraRefs = (process.env.REFS || '').split(',').map(s => s.trim()).filter(Boolean);
const refs = [
  path.join(base, 'reference/whitening-cream-original-product-do-not-change.png'),
  path.join(repDir, '01.png'),
  path.join(repDir, '02.png'),
  path.join(repDir, `${cut}.png`),
  ...extraRefs,
].filter((p, i, arr) => fssync.existsSync(p) && arr.indexOf(p) === i);

await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(promptDir, { recursive: true });
await fs.mkdir(repDir, { recursive: true });

function fileIdsFromText(text) { return [...String(text || '').matchAll(/file_[0-9a-fA-F]+/g)].map(m => m[0]); }
function candidateIds(src) {
  const ids = new Set(fileIdsFromText(src));
  try { const u = new URL(src); const id = u.searchParams.get('id'); for (const x of fileIdsFromText(id || '')) ids.add(x); if (id?.startsWith('file_')) ids.add(id); } catch {}
  return [...ids];
}
function hasKnownId(src, known) { return candidateIds(src).some(id => known.has(id)); }
function primaryId(src) { return candidateIds(src).find(id => id.startsWith('file_')) || src; }
async function pageState(page) {
  return page.evaluate(() => ({
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    attachedLabels: Array.from(document.querySelectorAll('[aria-label]')).map(el => el.getAttribute('aria-label')).filter(Boolean),
    imgs: Array.from(document.images).map(img => ({ alt: img.alt || '', src: img.currentSrc || img.src || '', w: img.naturalWidth, h: img.naturalHeight })).filter(x => x.src.includes('backend-api/estuary/content')),
  }));
}
const refHashes = new Set();
for (const ref of refs) refHashes.add(crypto.createHash('sha256').update(await fs.readFile(ref)).digest('hex'));

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
let page = ctx.pages().find(p => p.url().startsWith('https://chatgpt.com/images'));
if (!page) {
  page = await ctx.newPage();
  await page.goto('https://chatgpt.com/images/', { waitUntil: 'commit', timeout: 120000 });
}
await page.bringToFront().catch(() => {});
await page.waitForTimeout(5000);
console.log('workspace', JSON.stringify({ url: page.url(), title: await page.title(), refs }, null, 2));
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('not images workspace ' + page.url());
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await pageState(page);
const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));

const uploadSelector = '#image-gen-action-modal-upload-photos, input#upload-photos, input[name="images-app-drop-container-input"], input[type="file"]';
await page.locator(uploadSelector).first().setInputFiles(refs);
await page.waitForTimeout(12000);
const afterUpload = await pageState(page);
const attachedOriginal = afterUpload.attachedLabels.some(x => x.includes('whitening-cream-original-product-do-not-change.png'));
await page.screenshot({ path: path.join(root, `tmp-${key}-after-upload.png`), fullPage: false });
console.log('attachedOriginal', attachedOriginal, afterUpload.attachedLabels.filter(x => x.includes('whitening') || x.includes('파일') || x.includes('이미지')).slice(0, 30));
if (!attachedOriginal) throw new Error('original product file not visibly attached');

await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(root, `tmp-${key}-before-send.png`), fullPage: true });
await page.locator('#composer-submit-button, button[aria-label*="프롬프트 보내기"], button[data-testid="send-button"]').last().click({ timeout: 15000 });
await page.waitForTimeout(10000);
const chatUrl = page.url();
await fs.writeFile(path.join(promptDir, `${key}-submit-log.json`), JSON.stringify({ startUrl: 'https://chatgpt.com/images/', chatUrl, title: await page.title(), refs, submittedAt: new Date().toISOString() }, null, 2));
console.log('submitted', chatUrl);

let saved = null;
for (let i = 1; i <= 120; i++) {
  await page.waitForTimeout(8000);
  const s = await pageState(page);
  const candidates = [];
  const seen = new Set();
  for (const img of s.imgs) {
    if (img.w < 900 || img.h < 900) continue;
    if (hasKnownId(img.src, beforeIds)) continue;
    if (img.alt.includes('whitening-cream-original-product-do-not-change.png')) continue;
    const id = primaryId(img.src);
    if (seen.has(id)) continue;
    seen.add(id);
    candidates.push({ ...img, id });
  }
  console.log('poll', i, 'busy', s.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
  if (candidates.length && !s.busy) {
    for (const img of [...candidates].reverse()) {
      const b64 = await page.evaluate(async (src) => {
        const r = await fetch(src, { credentials: 'include' });
        if (!r.ok) throw new Error('fetch ' + r.status);
        const ab = await r.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let s = '';
        for (let j = 0; j < bytes.length; j += 0x8000) s += String.fromCharCode(...bytes.subarray(j, j + 0x8000));
        return btoa(s);
      }, img.src);
      const buf = Buffer.from(b64, 'base64');
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      if (refHashes.has(hash)) {
        console.log('reject identical uploaded ref', { id: img.id, rawBytes: buf.length, alt: img.alt });
        continue;
      }
      const raw = path.join(rawDir, `${key}-agent.png`);
      const candidate = path.join(repDir, `${key}-candidate.png`);
      await fs.writeFile(raw, buf);
      await sharp(buf).resize(1000, 1000, { fit: 'cover', position: 'center' }).png({ compressionLevel: 9 }).toFile(candidate);
      const meta = await sharp(candidate).metadata();
      saved = { cut, key, startUrl: 'https://chatgpt.com/images/', chatUrl, id: img.id, natural: `${img.w}x${img.h}`, rawBytes: buf.length, raw, candidate, finalSize: `${meta.width}x${meta.height}`, alt: img.alt, refs, rule: 'GPT Images direct output; saved as candidate only; no final overwrite' };
      await fs.writeFile(path.join(promptDir, `${key}-result.json`), JSON.stringify(saved, null, 2));
      console.log('savedCandidate', JSON.stringify(saved, null, 2));
      break;
    }
    if (saved) break;
  }
}
if (!saved) throw new Error('no valid generated candidate');

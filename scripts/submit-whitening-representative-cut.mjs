import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { cleanupStaleImageAgentTabs } from './lib/chrome-tab-cleanup.mjs';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const base = path.join(root, 'public/coupang/images/whitening-cream/versions/v1');
const repDir = path.join(base, 'representative');
const rawDir = path.join(base, 'agent-representative-raw');
const promptDir = path.join(base, 'agent-representative-prompts');
const cut = process.env.CUT;
const key = process.env.KEY || `${cut}-representative`;
if (!cut) throw new Error('CUT env is required, e.g. CUT=01');
const promptPath = path.join(promptDir, `${key}-prompt.txt`);
const prompt = await fs.readFile(promptPath, 'utf8');
const extraRefs = (process.env.REFS || '').split(',').map(s => s.trim()).filter(Boolean);
const defaultRefs = process.env.ONLY_REFS === '1'
  ? extraRefs
  : [
    path.join(root, 'public/coupang-main/whitening-cream/01.png'),
    path.join(base, 'detail/01.png'),
    path.join(base, 'detail/03.png'),
    path.join(base, 'detail/05.png'),
    path.join(base, 'detail/10.png'),
    path.join(root, 'public/coupang/images/aqua-lotion/versions/v4/representative/01.png'),
    path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1/representative/01.png'),
    ...Array.from({ length: 5 }, (_, i) => path.join(repDir, String(i + 1).padStart(2, '0') + '.png')),
    ...extraRefs,
  ];
const refs = [];
for (const ref of defaultRefs) {
  try { await fs.access(ref); refs.push(ref); } catch {}
}
const refHashes = new Set();
for (const ref of refs) {
  try {
    const b = await fs.readFile(ref);
    refHashes.add(crypto.createHash('sha256').update(b).digest('hex'));
  } catch {}
}

await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(promptDir, { recursive: true });
await fs.mkdir(repDir, { recursive: true });

function fileIdsFromText(text) {
  return [...String(text || '').matchAll(/file_[0-9a-fA-F]+/g)].map(m => m[0]);
}
function candidateIds(src) {
  const ids = new Set(fileIdsFromText(src));
  try {
    const u = new URL(src);
    const id = u.searchParams.get('id');
    for (const x of fileIdsFromText(id || '')) ids.add(x);
    if (id?.startsWith('file_')) ids.add(id);
  } catch {}
  return [...ids];
}
function hasKnownId(src, known) {
  return candidateIds(src).some(id => known.has(id));
}
function primaryId(src) {
  return candidateIds(src).find(id => id.startsWith('file_')) || src;
}
async function pageState(page) {
  return page.evaluate(() => ({
    busy: !!document.querySelector('[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'),
    imgs: Array.from(document.images).map(img => ({
      alt: img.alt || '',
      src: img.currentSrc || img.src || '',
      w: img.naturalWidth,
      h: img.naturalHeight,
    })).filter(x => x.src.includes('backend-api/estuary/content')),
  }));
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
await cleanupStaleImageAgentTabs(ctx, { maxTabs: 2 });
let page = ctx.pages().find(p => p.url().startsWith('https://chatgpt.com/images'));
if (page) {
  console.log('reuse images workspace');
  await page.bringToFront().catch(() => {});
} else {
  page = await ctx.newPage();
  console.log('goto images workspace');
  await page.goto('https://chatgpt.com/images/', { waitUntil: 'commit', timeout: 120000 });
}
await page.waitForTimeout(5000);
console.log('workspace', JSON.stringify({ url: page.url(), title: await page.title(), refs }, null, 2));
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('not Images workspace: ' + page.url());
const bodyText = await page.locator('body').innerText().catch(() => '');
if (/사람인지|human|Cloudflare|verify/i.test(bodyText) && !bodyText.includes('이미지 만들기')) {
  throw new Error('human verification/login likely required');
}
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) {
  await create.click({ timeout: 15000 }).catch(e => console.log('create click skipped', e.message));
  await page.waitForTimeout(2500);
}
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await pageState(page);
const beforeIds = new Set(before.imgs.flatMap(x => candidateIds(x.src)));
await fs.writeFile(path.join(promptDir, `${key}-before-ids.json`), JSON.stringify([...beforeIds], null, 2));

const uploadSelectors = ['input[name="images-app-drop-container-input"]','input#image-gen-action-modal-upload-photos','input#upload-photos','input#upload-files','input[type="file"]'].join(', ');
console.log('upload refs', refs.length);
await page.setInputFiles(uploadSelectors, refs);
await page.waitForTimeout(9000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) {
    await btn.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }
}
const composer = page.locator('#prompt-textarea').last();
await composer.click();
await page.keyboard.insertText(prompt);
await page.screenshot({ path: path.join(root, `tmp-whitening-rep-${key}-before-send.png`), fullPage: true });
const send = page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last();
console.log('send disabled?', await send.evaluate(el => el.disabled || el.getAttribute('aria-disabled') === 'true').catch(() => null));
await send.click({ timeout: 15000 });
await page.waitForTimeout(10000);
const chatUrl = page.url();
await fs.writeFile(path.join(promptDir, `${key}-submit-log.json`), JSON.stringify({ key, cut, chatUrl, title: await page.title(), refs, submittedAt: new Date().toISOString(), startUrl: 'https://chatgpt.com/images/' }, null, 2));
console.log('submitted', chatUrl);

for (let i = 1; i <= 120; i++) {
  await page.waitForTimeout(8000);
  const s = await pageState(page);
  const candidates = [];
  const seen = new Set();
  for (const img of s.imgs) {
    if (img.w < 900 || img.h < 900) continue;
    if (hasKnownId(img.src, beforeIds)) continue;
    const id = primaryId(img.src);
    if (seen.has(id)) continue;
    seen.add(id);
    candidates.push({ ...img, id });
  }
  console.log('poll', i, 'busy', s.busy, 'candidates', candidates.map(c => ({ id: c.id, w: c.w, h: c.h, alt: c.alt })));
  if (candidates.length && !s.busy) {
    const gen = candidates.filter(c => c.alt.includes('생성된 이미지'));
    const img = (gen.length ? gen : candidates).at(-1);
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
    const bufHash = crypto.createHash('sha256').update(buf).digest('hex');
    if (refHashes.has(bufHash)) {
      console.log('reject candidate identical to uploaded reference', JSON.stringify({ id: img.id, rawBytes: buf.length, alt: img.alt }));
      continue;
    }
    const raw = path.join(rawDir, `${key}-agent.png`);
    const final = path.join(repDir, `${cut}.png`);
    await fs.writeFile(raw, buf);
    await sharp(buf).resize(1000, 1000, { fit: 'cover', position: 'center' }).png({ compressionLevel: 9 }).toFile(final);
    const meta = await sharp(final).metadata();
    const result = { startUrl: 'https://chatgpt.com/images/', chatUrl, id: img.id, natural: `${img.w}x${img.h}`, rawBytes: buf.length, raw, final, finalSize: `${meta.width}x${meta.height}`, alt: img.alt, refs, rule: 'direct ChatGPT Images output; normalized only, no local text/compositing' };
    await fs.writeFile(path.join(promptDir, `${key}-result.json`), JSON.stringify(result, null, 2));
    console.log('saved', JSON.stringify(result, null, 2));
    await page.close().catch(() => {});
    process.exit(0);
  }
}
throw new Error('no generated image');

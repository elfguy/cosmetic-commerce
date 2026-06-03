import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
const targetId = 'file_0000000092307209abf26fa82fe7aac3';
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages().filter(p => p.url().startsWith('https://chatgpt.com/'));
for (const p of pages) {
  const imgs = await p.evaluate(() => Array.from(document.images).map((img,i)=>({i,alt:img.alt,src:img.currentSrc||img.src,w:img.naturalWidth,h:img.naturalHeight})).filter(x=>x.src&&x.src.includes('backend-api/estuary/content'))).catch(()=>[]);
  const img = imgs.find(x => getId(x.src) === targetId);
  if (!img) continue;
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
  await fs.writeFile(path.join(outDir, 'prompts/02-result.txt'), `${p.url()}\n${img.src}\n${targetId}\n${buf.length}\n${img.w}x${img.h}\n`);
  console.log('saved', rawFile, targetId, buf.length, `${img.w}x${img.h}`, p.url());
  process.exit(0);
}
console.error('target image not found');
process.exit(2);

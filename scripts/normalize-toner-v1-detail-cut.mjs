import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const base = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const cut = process.env.CUT;
const key = process.env.KEY || `${cut}-detail`;
if (!cut) throw new Error('CUT env required');
const raw = path.join(base, 'raw', `${key}-generated-raw.png`);
const out = path.join(base, 'detail', `${cut}.png`);
await fs.mkdir(path.dirname(out), { recursive: true });
const meta = await sharp(raw).metadata();
await sharp(raw)
  .resize(780, 1360, { fit: 'cover', position: 'centre' })
  .png({ compressionLevel: 9 })
  .toFile(out);
const finalMeta = await sharp(out).metadata();
await fs.writeFile(path.join(base, 'raw', `${key}-normalize-log.json`), JSON.stringify({ raw, out, input: { width: meta.width, height: meta.height }, output: { width: finalMeta.width, height: finalMeta.height }, normalizedAt: new Date().toISOString() }, null, 2));
console.log('NORMALIZED', out, finalMeta.width, finalMeta.height);

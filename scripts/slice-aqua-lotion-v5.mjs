import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const dir = path.join(root, 'public/coupang/images/aqua-lotion/renewal-2026-05-24-v5');
const input = path.join(dir, '05-aqua-lotion-full-detail-v5.png');
const slicesDir = path.join(dir, 'slices');
const sliceHeight = 1600;

await fs.rm(slicesDir, { recursive: true, force: true });
await fs.mkdir(slicesDir, { recursive: true });

const meta = await sharp(input).metadata();
if (!meta.width || !meta.height) {
  throw new Error('Could not read V5 image metadata');
}

const results = [];
for (let top = 0, index = 1; top < meta.height; top += sliceHeight, index += 1) {
  const height = Math.min(sliceHeight, meta.height - top);
  const file = path.join(slicesDir, `v5-slice-${String(index).padStart(2, '0')}.jpg`);
  await sharp(input)
    .extract({ left: 0, top, width: meta.width, height })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 94, mozjpeg: true })
    .toFile(file);
  results.push({ file, width: meta.width, height });
}

console.log(JSON.stringify({ input, width: meta.width, height: meta.height, slices: results }, null, 2));

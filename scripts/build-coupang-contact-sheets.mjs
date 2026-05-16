import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(rootDir, "data", "coupang");
const products = JSON.parse(await readFile(join(dataDir, "products.json"), "utf8"));

const sharp = (await import("sharp")).default;

async function imageFiles(dir) {
  if (!existsSync(dir)) return [];
  const files = await readdir(dir);
  return files
    .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
    .sort()
    .map((file) => join(dir, file));
}

async function buildSheet(product) {
  const detailDir = join(dataDir, "images", product.slug, "detail");
  const files = await imageFiles(detailDir);
  if (files.length === 0) return null;

  const thumbWidth = 360;
  const gap = 24;
  const labelHeight = 44;
  const columns = 2;
  const processed = [];

  for (const [index, file] of files.entries()) {
    const resized = await sharp(file).resize({ width: thumbWidth }).png().toBuffer();
    const metadata = await sharp(resized).metadata();
    const width = thumbWidth;
    const height = metadata.height ?? 460;
    const label = Buffer.from(
      `<svg width="${width}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#111827"/>
        <text x="18" y="29" font-family="Arial, sans-serif" font-size="20" fill="#ffffff">Detail ${String(index + 1).padStart(2, "0")}</text>
      </svg>`
    );
    const buffer = await sharp({
      create: {
        width,
        height: height + labelHeight,
        channels: 4,
        background: "#ffffff",
      },
    })
      .composite([
        { input: label, left: 0, top: 0 },
        { input: resized, left: 0, top: labelHeight },
      ])
      .png()
      .toBuffer();
    processed.push({ buffer, width, height: height + labelHeight });
  }

  const columnWidth = thumbWidth;
  const rowHeights = [];
  for (let i = 0; i < processed.length; i += columns) {
    rowHeights.push(Math.max(...processed.slice(i, i + columns).map((item) => item.height)));
  }

  const sheetWidth = columns * columnWidth + (columns + 1) * gap;
  const sheetHeight = rowHeights.reduce((sum, height) => sum + height, 0) + (rowHeights.length + 1) * gap + 72;
  const title = Buffer.from(
    `<svg width="${sheetWidth}" height="72" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f9fafb"/>
      <text x="24" y="44" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#111827">${product.name}</text>
    </svg>`
  );

  const composites = [{ input: title, left: 0, top: 0 }];
  let y = 72 + gap;
  for (let row = 0; row < rowHeights.length; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const item = processed[row * columns + col];
      if (!item) continue;
      composites.push({
        input: item.buffer,
        left: gap + col * (columnWidth + gap),
        top: y,
      });
    }
    y += rowHeights[row] + gap;
  }

  const outPath = join(dataDir, "contact-sheets", `${product.slug}.jpg`);
  await mkdir(dirname(outPath), { recursive: true });
  await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 3,
      background: "#f3f4f6",
    },
  })
    .composite(composites)
    .jpeg({ quality: 92 })
    .toFile(outPath);

  return outPath.replace(rootDir + "/", "");
}

const generated = [];
for (const product of products) {
  const sheetPath = await buildSheet(product);
  if (sheetPath) generated.push({ slug: product.slug, name: product.name, path: sheetPath });
}

await writeFile(join(dataDir, "contact-sheets.json"), `${JSON.stringify(generated, null, 2)}\n`);
console.log(JSON.stringify(generated, null, 2));

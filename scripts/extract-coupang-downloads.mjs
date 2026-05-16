import { copyFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, "data/coupang/downloads");
const outputPath = path.join(root, "data/coupang/downloaded-products.json");
const publicDetailDir = path.join(root, "public/coupang-detail");

function parseJsonLd(html) {
  return [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function slugifyProductId(url = "") {
  return url.split("/").filter(Boolean).pop() || "unknown-product";
}

function getImageDimensions(filePath) {
  try {
    const output = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return {
      width: Number(output.match(/pixelWidth:\s*(\d+)/)?.[1] || 0),
      height: Number(output.match(/pixelHeight:\s*(\d+)/)?.[1] || 0),
    };
  } catch {
    return { width: 0, height: 0 };
  }
}

function isDetailImage({ width, height }) {
  return width >= 760 && width <= 790 && height >= 1100;
}

function extractReferencedImageOrder(html) {
  const order = [];
  const seen = new Set();
  const pattern = /_files\/([^"'<>?]+?\.(?:png|jpe?g))/gi;

  for (const match of html.matchAll(pattern)) {
    const entry = decodeURIComponent(match[1]).replaceAll("&amp;", "&");
    if (seen.has(entry)) continue;
    seen.add(entry);
    order.push(entry);
  }

  return order;
}

async function collectDetailImages(fileName, productId, html) {
  const baseName = fileName.replace(/\.html?$/i, "");
  const filesDir = path.join(sourceDir, `${baseName}_files`);
  const targetDir = path.join(publicDetailDir, productId);
  const entries = await readdir(filesDir).catch(() => []);
  const htmlOrder = extractReferencedImageOrder(html);
  const orderIndex = new Map(htmlOrder.map((entry, index) => [entry, index]));
  const candidates = [];

  for (const entry of entries) {
    if (!/\.(png|jpe?g)$/i.test(entry)) continue;
    const sourcePath = path.join(filesDir, entry);
    const dimensions = getImageDimensions(sourcePath);
    if (!isDetailImage(dimensions)) continue;
    const fileStat = await stat(sourcePath);
    candidates.push({
      entry,
      sourcePath,
      dimensions,
      bytes: fileStat.size,
      order: orderIndex.has(entry) ? orderIndex.get(entry) : Number.MAX_SAFE_INTEGER,
    });
  }

  candidates.sort((a, b) => a.order - b.order || a.entry.localeCompare(b.entry));
  await mkdir(targetDir, { recursive: true });

  const detailImages = [];
  for (const [index, image] of candidates.entries()) {
    const extension = path.extname(image.entry).toLowerCase();
    const fileName = `${String(index + 1).padStart(2, "0")}${extension}`;
    const targetPath = path.join(targetDir, fileName);
    await copyFile(image.sourcePath, targetPath);
    detailImages.push({
      src: `/coupang-detail/${productId}/${fileName}`,
      originalFileName: image.entry,
      sourceOrder: image.order === Number.MAX_SAFE_INTEGER ? null : image.order,
      width: image.dimensions.width,
      height: image.dimensions.height,
      bytes: image.bytes,
    });
  }

  return detailImages;
}

async function normalizeProduct(fileName, size, product, breadcrumb, html) {
  const skuParts = String(product.sku || "").split("-");
  const productId = slugifyProductId(product.offers?.url);
  const itemId = skuParts[1] || null;
  const price = Number(product.offers?.price || 0);
  const originalPrice = Number(product.offers?.priceSpecification?.price || 0);
  const discountRate = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const categories = breadcrumb?.itemListElement?.flat?.()
    ?.map((item) => item?.name)
    ?.filter(Boolean)
    ?.filter((name) => name !== "쿠팡 홈") || [];

  return {
    slug: productId,
    fileName: fileName.normalize("NFC"),
    fileSize: size,
    name: product.name,
    description: product.description,
    productId,
    itemId,
    sku: product.sku,
    url: product.offers?.url,
    category: categories.at(-1) || "",
    categories,
    price,
    originalPrice,
    discountRate,
    availability: product.offers?.availability?.split("/").pop() || "",
    ratingValue: Number(product.aggregateRating?.ratingValue || 0),
    reviewCount: Number(product.aggregateRating?.ratingCount || 0),
    images: Array.isArray(product.image) ? product.image : [],
    detailImages: await collectDetailImages(fileName, productId, html),
  };
}

const fileNames = (await readdir(sourceDir))
  .filter((fileName) => /\.html?$/i.test(fileName))
  .sort((a, b) => a.localeCompare(b, "ko"));

const products = [];

for (const fileName of fileNames) {
  const filePath = path.join(sourceDir, fileName);
  const html = await readFile(filePath, "utf8");
  const jsonLd = parseJsonLd(html);
  const product = jsonLd.find((entry) => entry["@type"] === "Product");
  const breadcrumb = jsonLd.find((entry) => entry["@type"] === "BreadcrumbList");
  if (!product) continue;

  const fileStat = await stat(filePath);
  products.push(await normalizeProduct(fileName, fileStat.size, product, breadcrumb, html));
}

const payload = {
  source: "data/coupang/downloads",
  generatedAt: new Date().toISOString(),
  count: products.length,
  products,
};

await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${products.length} products to ${path.relative(root, outputPath)}`);

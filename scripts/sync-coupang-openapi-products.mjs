import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import https from "node:https";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const listPath = "/v2/providers/seller_api/apis/api/v1/marketplace/seller-products";
const imageCdnBase = "https://image.coupangcdn.com/image/";
const publicDetailDir = path.join(root, "public", "coupang-detail");
const openapiOutputPath = path.join(root, "data", "coupang", "openapi-products.json");
const syncReportPath = path.join(root, "data", "coupang", "openapi-sync-report.json");
const downloadedProductsPath = path.join(root, "data", "coupang", "downloaded-products.json");
const comparisonPath = path.join(root, "data", "yourskinplus-8-product-comparison.json");
const collectedProductsPath = path.join(root, "data", "coupang", "products.json");
const downloadsDir = path.join(root, "data", "coupang", "downloads");

const args = new Set(process.argv.slice(2));
const shouldDownload = !args.has("--no-download");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function requireEnv(keys) {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

function signedDate() {
  return new Date().toISOString().slice(2, 19).replace(/[-:]/g, "") + "Z";
}

function authorizationHeader({ method, requestPath, query }) {
  const datetime = signedDate();
  const message = datetime + method + requestPath + query;
  const signature = crypto.createHmac("sha256", process.env.COUPANG_SECRET_KEY).update(message).digest("hex");

  return `CEA algorithm=HmacSHA256, access-key=${process.env.COUPANG_ACCESS_KEY}, signed-date=${datetime}, signature=${signature}`;
}

function requestJson({ host, method, requestPath, query = "" }) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host,
        method,
        path: query ? `${requestPath}?${query}` : requestPath,
        timeout: 20000,
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: authorizationHeader({ method, requestPath, query }),
        },
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = body ? JSON.parse(body) : null;
          } catch {
            parsed = null;
          }

          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            parsed,
          });
        });
      },
    );

    req.on("timeout", () => req.destroy(new Error("Request timed out")));
    req.on("error", reject);
    req.end();
  });
}

function productsFromList(parsed) {
  const data = parsed?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.sellerProducts)) return data.sellerProducts;
  return [];
}

async function readJsonIfExists(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function byProductId(products, getId = (product) => product.productId) {
  return new Map((products || []).filter((product) => getId(product)).map((product) => [String(getId(product)), product]));
}

function priceDataFor(item) {
  return item?.marketplaceItemData?.priceData || item?.rocketGrowthItemData?.priceData || {
    originalPrice: item?.originalPrice,
    salePrice: item?.salePrice,
    supplyPrice: item?.supplyPrice,
  };
}

function idDataFor(item) {
  return item?.marketplaceItemData || item?.rocketGrowthItemData || {
    sellerProductItemId: item?.sellerProductItemId,
    vendorItemId: item?.vendorItemId,
    itemId: item?.itemId,
    externalVendorSku: item?.externalVendorSku,
    barcode: item?.barcode,
    modelNo: item?.modelNo,
    maximumBuyCount: item?.maximumBuyCount,
  };
}

function discountRate({ originalPrice, salePrice }) {
  if (!originalPrice || !salePrice) return 0;
  return Math.round(((Number(originalPrice) - Number(salePrice)) / Number(originalPrice)) * 100);
}

function compact(value) {
  return value === undefined || value === null || value === "" ? null : value;
}

function imageUrl(cdnPath) {
  if (!cdnPath) return null;
  if (/^https?:\/\//i.test(cdnPath)) return cdnPath;
  return `${imageCdnBase}${cdnPath.replace(/^\/+/, "")}`;
}

function imageExtension(cdnPath, contentType = "") {
  const cleanPath = cdnPath.split("?")[0];
  const ext = path.extname(cleanPath).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) return ext;
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  return ".jpg";
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }

  return output;
}

function extractContentImages(detail) {
  return uniqueBy(
    (detail.items || []).flatMap((item) =>
      (item.contents || []).flatMap((content) =>
        (content.contentDetails || [])
          .filter((detailItem) => detailItem.detailType === "IMAGE" && detailItem.content)
          .map((detailItem) => ({
            cdnPath: detailItem.content,
            contentsType: content.contentsType,
          })),
      ),
    ),
    (item) => item.cdnPath,
  );
}

function extractProductImages(detail) {
  return uniqueBy(
    (detail.items || []).flatMap((item) =>
      (item.images || []).map((image) => ({
        imageOrder: image.imageOrder,
        imageType: image.imageType,
        cdnPath: image.cdnPath,
        url: imageUrl(image.cdnPath),
      })),
    ),
    (item) => `${item.imageType}:${item.imageOrder}:${item.cdnPath}`,
  );
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

async function downloadImage({ url, outputPath }) {
  await mkdir(path.dirname(outputPath), { recursive: true });

  return new Promise((resolve) => {
    const req = https.request(
      url,
      {
        method: "GET",
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      },
      (res) => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          resolve({
            ok: false,
            statusCode: res.statusCode,
            contentType: res.headers["content-type"] || "",
            bytes: 0,
          });
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", async () => {
          const buffer = Buffer.concat(chunks);
          await writeFile(outputPath, buffer);
          resolve({
            ok: true,
            statusCode: res.statusCode,
            contentType: res.headers["content-type"] || "",
            bytes: buffer.length,
          });
        });
      },
    );

    req.on("timeout", () => req.destroy(new Error("Image request timed out")));
    req.on("error", (error) => {
      resolve({
        ok: false,
        statusCode: null,
        contentType: "",
        bytes: 0,
        error: error.message,
      });
    });
    req.end();
  });
}

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

async function chromeSavedProductIds() {
  const entries = await readdir(downloadsDir).catch(() => []);
  const ids = new Set();

  for (const entry of entries) {
    if (!/\.html?$/i.test(entry)) continue;
    const html = await readFile(path.join(downloadsDir, entry), "utf8").catch(() => "");
    for (const data of parseJsonLd(html)) {
      const url = data?.offers?.url || data?.url || "";
      const productId = String(url).match(/\/products\/(\d+)/)?.[1];
      if (productId) ids.add(productId);
    }
  }

  return ids;
}

function publicPathFor(filePath) {
  return `/${path.relative(path.join(root, "public"), filePath).split(path.sep).join("/")}`;
}

async function fetchAllProducts(host) {
  const products = [];
  let nextToken = "1";

  for (let page = 0; page < 20 && nextToken; page += 1) {
    const query = new URLSearchParams({
      vendorId: process.env.COUPANG_VENDOR_ID,
      nextToken,
      maxPerPage: "50",
    }).toString();
    const response = await requestJson({ host, method: "GET", requestPath: listPath, query });
    if (response.statusCode < 200 || response.statusCode >= 300 || response.parsed?.code === "ERROR") {
      throw new Error(`Failed to fetch product list: ${response.statusCode} ${response.parsed?.message || ""}`);
    }

    const pageProducts = productsFromList(response.parsed);
    products.push(...pageProducts);

    const newNextToken = response.parsed?.nextToken || response.parsed?.data?.nextToken || "";
    if (!newNextToken || newNextToken === nextToken || pageProducts.length === 0) break;
    nextToken = String(newNextToken);
  }

  return products;
}

async function fetchProductDetail(host, sellerProductId) {
  const response = await requestJson({
    host,
    method: "GET",
    requestPath: `${listPath}/${encodeURIComponent(sellerProductId)}`,
  });
  if (response.statusCode < 200 || response.statusCode >= 300 || response.parsed?.code === "ERROR") {
    throw new Error(`Failed to fetch product detail ${sellerProductId}: ${response.statusCode} ${response.parsed?.message || ""}`);
  }
  return response.parsed?.data;
}

function noticesFromItem(item) {
  return (item?.notices || []).map((notice) => ({
    name: notice.noticeCategoryDetailName,
    content: notice.content,
  }));
}

function attributesFromItem(item) {
  return (item?.attributes || []).map((attribute) => ({
    name: attribute.attributeTypeName,
    value: attribute.attributeValueName,
    unit: attribute.exposed || null,
  }));
}

function buildCoupangUrl({ productId, itemId, vendorItemId }) {
  const params = new URLSearchParams();
  if (itemId) params.set("itemId", itemId);
  if (vendorItemId) params.set("vendorItemId", vendorItemId);
  const query = params.toString();
  return `https://www.coupang.com/vp/products/${productId}${query ? `?${query}` : ""}`;
}

function sortedByNewest(products) {
  return [...products].sort((a, b) => Number(b.sellerProductId || 0) - Number(a.sellerProductId || 0));
}

function diffField(field, before, after) {
  if (before === undefined || before === null || after === undefined || after === null) return null;
  if (String(before) === String(after)) return null;
  return { field, before, after };
}

loadEnvFile(envPath);
requireEnv(["COUPANG_API_BASE_URL", "COUPANG_ACCESS_KEY", "COUPANG_SECRET_KEY", "COUPANG_VENDOR_ID"]);

const generatedAt = new Date().toISOString();
const baseUrl = new URL(process.env.COUPANG_API_BASE_URL);
const existingDownloaded = await readJsonIfExists(downloadedProductsPath, { products: [] });
const existingDownloadedById = byProductId(existingDownloaded.products);
const comparison = await readJsonIfExists(comparisonPath, { products: [] });
const comparisonById = byProductId(comparison.products);
const collectedProducts = await readJsonIfExists(collectedProductsPath, []);
const collectedById = byProductId(collectedProducts, (product) => product?.coupang?.productId);
const savedChromeIds = await chromeSavedProductIds();

const listProducts = await fetchAllProducts(baseUrl.host);
const detailProducts = [];

for (const listProduct of sortedByNewest(listProducts)) {
  const detail = await fetchProductDetail(baseUrl.host, listProduct.sellerProductId);
  const item = detail.items?.[0] || {};
  const priceData = priceDataFor(item);
  const idData = idDataFor(item);
  const productId = String(detail.productId || listProduct.productId || "");
  const existing = existingDownloadedById.get(productId) || {};
  const comparisonProduct = comparisonById.get(productId) || {};
  const collectedProduct = collectedById.get(productId) || {};
  const itemId = compact(idData.itemId || item.itemId || existing.itemId || listProduct.itemId);
  const vendorItemId = compact(idData.vendorItemId || existing.vendorItemId);
  const originalPrice = Number(priceData.originalPrice || existing.originalPrice || comparisonProduct.price?.original || 0);
  const salePrice = Number(priceData.salePrice || existing.price || comparisonProduct.price?.sale || 0);
  const productImages = extractProductImages(detail);
  const contentImages = extractContentImages(detail);

  detailProducts.push({
    sellerProductId: String(detail.sellerProductId || listProduct.sellerProductId || ""),
    productId,
    itemId: itemId ? String(itemId) : null,
    vendorItemId: vendorItemId ? String(vendorItemId) : null,
    sellerProductName: detail.sellerProductName || listProduct.sellerProductName || existing.name || "",
    displayProductName: detail.displayProductName || "",
    generalProductName: detail.generalProductName || "",
    productGroup: detail.productGroup || existing.category || "",
    brand: detail.brand || "",
    statusName: detail.statusName || listProduct.statusName || existing.availability || "",
    status: detail.status || "",
    saleStartedAt: detail.saleStartedAt || "",
    saleEndedAt: detail.saleEndedAt || "",
    displayCategoryCode: detail.displayCategoryCode || "",
    categoryId: detail.categoryId || "",
    delivery: {
      method: detail.deliveryMethod || "",
      companyCode: detail.deliveryCompanyCode || "",
      chargeType: detail.deliveryChargeType || "",
      charge: detail.deliveryCharge ?? null,
      freeShipOverAmount: detail.freeShipOverAmount ?? null,
      outboundShippingTimeDay: item.outboundShippingTimeDay ?? null,
    },
    price: {
      original: originalPrice || null,
      sale: salePrice || null,
      supply: Number(priceData.supplyPrice || 0) || null,
      discountRate: discountRate({ originalPrice, salePrice }),
    },
    ids: {
      sellerProductItemId: compact(idData.sellerProductItemId),
      itemId: itemId ? String(itemId) : null,
      vendorItemId: vendorItemId ? String(vendorItemId) : null,
      externalVendorSku: compact(idData.externalVendorSku || item.externalVendorSku || existing.sku),
      barcode: compact(idData.barcode || item.barcode),
      modelNo: compact(idData.modelNo || item.modelNo),
    },
    item: {
      itemName: item.itemName || "",
      maximumBuyCount: item.maximumBuyCount ?? null,
      maximumBuyForPerson: item.maximumBuyForPerson ?? null,
      unitCount: item.unitCount ?? null,
      adultOnly: item.adultOnly || "",
      taxType: item.taxType || "",
      searchTags: item.searchTags || [],
      notices: noticesFromItem(item),
      attributes: attributesFromItem(item),
    },
    images: {
      product: productImages,
      detailContent: contentImages.map((image, index) => ({
        order: index + 1,
        cdnPath: image.cdnPath,
        url: imageUrl(image.cdnPath),
        contentsType: image.contentsType,
      })),
    },
    localFallback: {
      ratingValue: existing.ratingValue ?? comparisonProduct.rating?.value ?? 0,
      reviewCount: existing.reviewCount ?? comparisonProduct.commerce?.reviewCount ?? collectedProduct.coupang?.reviewCount ?? 0,
      category: existing.category || comparisonProduct.category || detail.productGroup || "쿠팡 등록 상품",
      categories: existing.categories?.length ? existing.categories : [comparisonProduct.category, detail.productGroup, detail.displayCategoryCode].filter(Boolean),
      fileName: existing.fileName || "Coupang OpenAPI",
      fileSize: existing.fileSize || 0,
      description: existing.description || detail.displayProductName || detail.generalProductName || detail.productGroup || "",
      slug: existing.slug || productId,
    },
  });
}

const downloadSummaries = [];

if (shouldDownload) {
  for (const product of detailProducts) {
    const targetDir = path.join(publicDetailDir, product.productId);
    const downloadedImages = [];
    const failures = [];

    for (const [index, image] of product.images.detailContent.entries()) {
      const url = image.url;
      const ext = imageExtension(image.cdnPath);
      const fileName = `${String(index + 1).padStart(2, "0")}${ext}`;
      const outputPath = path.join(targetDir, fileName);
      const result = await downloadImage({ url, outputPath });

      if (!result.ok) {
        failures.push({
          order: index + 1,
          cdnPath: image.cdnPath,
          statusCode: result.statusCode,
          error: result.error || "",
        });
        continue;
      }

      const fileStat = await stat(outputPath);
      const dimensions = getImageDimensions(outputPath);
      downloadedImages.push({
        src: publicPathFor(outputPath),
        cdnPath: image.cdnPath,
        sourceOrder: index + 1,
        width: dimensions.width,
        height: dimensions.height,
        bytes: fileStat.size,
      });
    }

    product.localDetailImages = downloadedImages;
    downloadSummaries.push({
      productId: product.productId,
      sellerProductId: product.sellerProductId,
      name: product.sellerProductName,
      apiDetailImageCount: product.images.detailContent.length,
      downloadedCount: downloadedImages.length,
      failedCount: failures.length,
      failures,
    });
  }
}

const normalizedProducts = detailProducts.map((product) => {
  const firstProductImage = product.images.product.find((image) => image.imageType === "REPRESENTATION") || product.images.product[0];
  const detailImages = product.localDetailImages || [];
  const url = buildCoupangUrl({
    productId: product.productId,
    itemId: product.itemId,
    vendorItemId: product.vendorItemId,
  });

  return {
    slug: product.localFallback.slug,
    fileName: product.localFallback.fileName,
    fileSize: product.localFallback.fileSize,
    name: product.sellerProductName,
    description: product.localFallback.description,
    productId: product.productId,
    sellerProductId: product.sellerProductId,
    itemId: product.itemId,
    vendorItemId: product.vendorItemId,
    sku: product.ids.externalVendorSku || "",
    url,
    category: product.localFallback.category,
    categories: product.localFallback.categories.length ? product.localFallback.categories : [product.localFallback.category],
    price: product.price.sale || 0,
    originalPrice: product.price.original || product.price.sale || 0,
    discountRate: product.price.discountRate,
    availability: product.statusName,
    ratingValue: Number(product.localFallback.ratingValue || 0),
    reviewCount: Number(product.localFallback.reviewCount || 0),
    images: product.images.product.map((image) => image.url).filter(Boolean),
    detailImages,
    api: {
      source: "coupang-openapi",
      sellerProductId: product.sellerProductId,
      statusName: product.statusName,
      saleStartedAt: product.saleStartedAt,
      saleEndedAt: product.saleEndedAt,
      brand: product.brand,
      displayProductName: product.displayProductName,
      generalProductName: product.generalProductName,
      productGroup: product.productGroup,
      representationImage: firstProductImage?.url || null,
      productImageCount: product.images.product.length,
      detailContentImageCount: product.images.detailContent.length,
      searchTags: product.item.searchTags,
      notices: product.item.notices,
      attributes: product.item.attributes,
    },
  };
});

const existingIds = new Set((existingDownloaded.products || []).map((product) => String(product.productId)).filter(Boolean));
const apiIds = new Set(normalizedProducts.map((product) => String(product.productId)));
const fieldDiffs = [];

for (const product of normalizedProducts) {
  const existing = existingDownloadedById.get(String(product.productId));
  if (!existing) continue;

  const changes = [
    diffField("name", existing.name, product.name),
    diffField("price", existing.price, product.price),
    diffField("originalPrice", existing.originalPrice, product.originalPrice),
    diffField("discountRate", existing.discountRate, product.discountRate),
    diffField("itemId", existing.itemId, product.itemId),
    diffField("detailImages.length", existing.detailImages?.length || 0, product.detailImages.length),
  ].filter(Boolean);

  if (changes.length) {
    fieldDiffs.push({
      productId: product.productId,
      name: product.name,
      changes,
    });
  }
}

const syncReport = {
  source: "coupang-openapi",
  generatedAt,
  apiProductCount: normalizedProducts.length,
  previousDownloadedProductCount: existingDownloaded.products?.length || 0,
  chromeSavedHtmlProductCount: savedChromeIds.size,
  newProductsFromApi: normalizedProducts
    .filter((product) => !existingIds.has(String(product.productId)))
    .map((product) => ({ productId: product.productId, sellerProductId: product.sellerProductId, name: product.name })),
  localProductsMissingFromApi: [...existingIds]
    .filter((productId) => !apiIds.has(productId))
    .map((productId) => ({ productId, name: existingDownloadedById.get(productId)?.name || "" })),
  apiProductsMissingChromeHtml: normalizedProducts
    .filter((product) => !savedChromeIds.has(String(product.productId)))
    .map((product) => ({ productId: product.productId, sellerProductId: product.sellerProductId, name: product.name })),
  fieldDiffs,
  downloads: downloadSummaries,
};

const openapiProducts = {
  source: "coupang-openapi",
  generatedAt,
  count: detailProducts.length,
  products: detailProducts.map(({ localFallback, localDetailImages, ...product }) => ({
    ...product,
    localDetailImages: localDetailImages || [],
  })),
};

const downloadedProducts = {
  source: "coupang-openapi",
  generatedAt,
  count: normalizedProducts.length,
  products: normalizedProducts,
};

await writeFile(openapiOutputPath, `${JSON.stringify(openapiProducts, null, 2)}\n`);
await writeFile(syncReportPath, `${JSON.stringify(syncReport, null, 2)}\n`);
await writeFile(downloadedProductsPath, `${JSON.stringify(downloadedProducts, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      ok: true,
      apiProductCount: syncReport.apiProductCount,
      previousDownloadedProductCount: syncReport.previousDownloadedProductCount,
      chromeSavedHtmlProductCount: syncReport.chromeSavedHtmlProductCount,
      newProductsFromApi: syncReport.newProductsFromApi.length,
      apiProductsMissingChromeHtml: syncReport.apiProductsMissingChromeHtml.length,
      fieldDiffs: syncReport.fieldDiffs.length,
      downloadedDetailImages: syncReport.downloads.reduce((sum, item) => sum + item.downloadedCount, 0),
      failedDownloads: syncReport.downloads.reduce((sum, item) => sum + item.failedCount, 0),
      outputs: {
        openapiProducts: path.relative(root, openapiOutputPath),
        syncReport: path.relative(root, syncReportPath),
        downloadedProducts: path.relative(root, downloadedProductsPath),
        detailImages: path.relative(root, publicDetailDir),
      },
    },
    null,
    2,
  ),
);

import { mkdir, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(rootDir, "data", "coupang");
const cafe24Base = "https://yourskinplus.cafe24.com";

const products = [
  {
    slug: "hyaluronic-acid-toner",
    name: "유어스킨플러스 히알루론산 토너",
    coupangUrl: "https://www.coupang.com/vp/products/9025733014",
    coupang: {
      productId: "9025733014",
      itemId: "26470069791",
      vendorItemId: null,
      originalPrice: 20000,
      salePrice: 10900,
      discountRate: "45%",
      unitPrice: "10ml당 218원",
      reviewCount: 33,
      seller: "(주)유어스킨",
      attributes: ["사용대상: 남녀공용", "사용 부위: 얼굴", "피부고민: 진정/보습", "피부타입: 모든피부"],
      source: "search-index",
    },
    cafe24Path: "/product/유어스킨플러스-히알루론산-토너/25/category/1/display/2/?icid=MAIN.product_listmain_1",
  },
  {
    slug: "low-ph-cleansing-gel",
    name: "유어스킨플러스 로우 피에이치 클렌징 젤",
    coupangUrl: "https://www.coupang.com/vp/products/9025751494",
    coupang: {
      productId: "9025751494",
      itemId: "26470131485",
      vendorItemId: null,
      originalPrice: 19500,
      salePrice: 10500,
      discountRate: "46%",
      unitPrice: "10ml당 350원",
      reviewCount: 23,
      seller: "(주)유어스킨",
      attributes: ["사용기한: 상품 상세페이지 참조", "용기 타입: 펌프형", "피부고민: 진정/보습", "피부타입: 모든피부"],
      source: "search-index",
    },
    cafe24Path: "/product/유어스킨플러스-로우피에이치-마일드-클렌징-젤/28/category/1/display/2/?icid=MAIN.product_listmain_1",
  },
  {
    slug: "rose-damascus-tonic-essence",
    name: "유어스킨플러스 로즈 다마스쿠스 토닉 에센스",
    coupangUrl: "https://www.coupang.com/vp/products/9025775541?itemId=26470208024&vendorItemId=93445364050",
    coupang: {
      productId: "9025775541",
      itemId: "26470208024",
      vendorItemId: "93445364050",
      originalPrice: null,
      salePrice: null,
      discountRate: null,
      unitPrice: null,
      reviewCount: null,
      seller: "(주)유어스킨",
      attributes: [],
      source: "user-provided-url",
    },
    cafe24Path: "/product/유어스킨플러스-로즈-다마스쿠스-토닉-에센스/26/category/1/display/2/?icid=MAIN.product_listmain_1",
  },
  {
    slug: "younger-than-all-in-one-lotion",
    name: "유어스킨플러스 영거 댄 올인원 로션",
    coupangUrl: "https://www.coupang.com/vp/products/9025793946?itemId=26470268560&vendorItemId=93445424254",
    coupang: {
      productId: "9025793946",
      itemId: "26470268560",
      vendorItemId: "93445424254",
      originalPrice: 18000,
      salePrice: 9500,
      discountRate: "47%",
      unitPrice: "10ml당 475원",
      reviewCount: 33,
      seller: "(주)유어스킨",
      attributes: ["사용기한: 상품 상세페이지 참조", "올인원 여부: 올인원", "피부고민: 진정/보습", "피부타입: 모든피부", "사용대상: 남성용"],
      source: "search-index",
    },
    cafe24Path: "/product/유어스킨플러스-영거댄-올인원-로션/27/category/1/display/2/?icid=MAIN.product_listmain_1",
  },
  {
    slug: "moisture-lip-balm",
    name: "유어스킨플러스 모이스춰 립밤",
    coupangUrl: "https://www.coupang.com/vp/products/9025810298?itemId=26470336590&vendorItemId=93445490553",
    coupang: {
      productId: "9025810298",
      itemId: "26470336590",
      vendorItemId: "93445490553",
      originalPrice: 18000,
      salePrice: 9900,
      discountRate: "45%",
      unitPrice: "10g당 12,375원",
      reviewCount: 23,
      seller: "(주)유어스킨",
      attributes: ["사용기한: 상품 상세페이지 참조", "색상계열: 무색", "용기형태: 스틱/펜슬형", "사용대상: 남녀공용"],
      source: "search-index",
    },
    cafe24Path: "/product/유어스킨플러스-모이스춰-립밤/30/category/1/display/2/?icid=MAIN.product_listmain_1",
  },
  {
    slug: "hyaluronic-acid-aqua-lotion",
    name: "유어스킨플러스 히알루론산 아쿠아 로션",
    coupangUrl: "https://www.coupang.com/vp/products/9218811640",
    coupang: {
      productId: "9218811640",
      itemId: "27239514580",
      vendorItemId: null,
      originalPrice: 19000,
      salePrice: 10300,
      discountRate: "45%",
      unitPrice: "100ml당 3,433원",
      reviewCount: 33,
      seller: "(주)유어스킨",
      attributes: ["사용기한: 상품 상세페이지 참조", "장점: 보습", "사용 부위: 얼굴", "향 유무: 무향", "피부고민: 진정/보습"],
      source: "search-index",
    },
    cafe24Path: null,
  },
  {
    slug: "pure-deep-cleansing-oil",
    name: "유어스킨플러스 퓨어 딥 클렌징 오일",
    coupangUrl: "https://www.coupang.com/vp/products/9221762154",
    coupang: {
      productId: "9221762154",
      itemId: "27251064471",
      vendorItemId: null,
      originalPrice: 23000,
      salePrice: 12700,
      discountRate: "44%",
      unitPrice: "10ml당 423원",
      reviewCount: 32,
      seller: "(주)유어스킨",
      attributes: ["유통기한: 2027-12-21 또는 이후", "용기 타입: 펌프형", "피부타입: 모든피부", "장점: 모공 관리", "피부고민: 블랙헤드 제거"],
      source: "search-index",
    },
    cafe24Path: null,
  },
  {
    slug: "whitening-tone-care-cream",
    name: "유어스킨플러스 화이트닝 톤 케어 크림",
    coupangUrl: "https://www.coupang.com/vp/products/9264527939",
    coupang: {
      productId: "9264527939",
      itemId: "27414863570",
      vendorItemId: null,
      originalPrice: 18500,
      salePrice: 10100,
      discountRate: "45%",
      unitPrice: "10ml당 505원",
      reviewCount: 21,
      seller: "(주)유어스킨",
      attributes: ["사용기한: 상품 상세페이지 참조", "사용 부위: 얼굴", "크림 타입: 크림", "피부고민: 브라이트닝", "피부타입: 모든피부"],
      source: "search-index",
    },
    cafe24Path: null,
  },
  {
    slug: "unknown-coupang-product",
    name: "미확인 쿠팡 등록 상품",
    coupangUrl: null,
    coupang: {
      productId: null,
      itemId: null,
      vendorItemId: null,
      originalPrice: null,
      salePrice: null,
      discountRate: null,
      unitPrice: null,
      reviewCount: null,
      seller: "(주)유어스킨",
      attributes: [],
      source: "not-found",
    },
    cafe24Path: null,
  },
];

let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  sharp = null;
}

function absoluteUrl(value) {
  if (!value) return null;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `${cafe24Base}${value}`;
  return value;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractJsString(html, variableName) {
  const match = html.match(new RegExp(`var\\s+${variableName}\\s*=\\s*'([^']*)'`));
  return match ? decodeHtml(match[1]) : null;
}

function extractJsNumberString(html, variableName) {
  const value = extractJsString(html, variableName);
  return value === null || value === "" ? null : Number(value);
}

function extractImages(html) {
  const attrs = [];
  const attrPattern = /\b(?:src|ec-data-src)=["']([^"']+\.(?:png|jpe?g|gif|webp)(?:\?[^"']*)?)["']/gi;
  for (const match of html.matchAll(attrPattern)) {
    attrs.push(absoluteUrl(decodeHtml(match[1])));
  }

  const normalized = unique(attrs);
  const productImages = normalized.filter((url) => url.includes("yourskinplus.cafe24.com/web/product/"));
  const detailImages = normalized.filter((url) => url.includes("yourskinplus.cafe24.com/web/upload/NNEditor/"));

  return {
    productImages,
    detailImages,
    allImages: unique([...productImages, ...detailImages]),
  };
}

function toCsvValue(value) {
  if (value === null || value === undefined) return "";
  const stringValue = Array.isArray(value) ? value.join("; ") : String(value);
  return `"${stringValue.replaceAll('"', '""')}"`;
}

function extFromUrl(url, contentType) {
  const pathExt = extname(new URL(url).pathname);
  if (pathExt) return pathExt.toLowerCase();
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("gif")) return ".gif";
  return ".jpg";
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function downloadImage(url, filePath) {
  await mkdir(dirname(filePath), { recursive: true });
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      Referer: cafe24Base,
    },
  });
  if (!response.ok || !response.body) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await writeFile(filePath, buffer);

  let dimensions = null;
  if (sharp) {
    try {
      const metadata = await sharp(buffer).metadata();
      dimensions = {
        width: metadata.width ?? null,
        height: metadata.height ?? null,
        format: metadata.format ?? null,
      };
    } catch {
      dimensions = null;
    }
  }

  return {
    url,
    filePath: filePath.replace(rootDir + "/", ""),
    bytes: buffer.byteLength,
    contentType,
    dimensions,
  };
}

async function collectProduct(product) {
  const result = {
    ...product,
    cafe24Url: product.cafe24Path ? absoluteUrl(product.cafe24Path) : null,
    cafe24: null,
    images: {
      product: [],
      detail: [],
    },
    collectionStatus: "metadata-only",
    collectionNotes: [],
  };

  if (!product.cafe24Path) {
    result.collectionNotes.push("Cafe24 상세 페이지를 찾지 못해 이미지 다운로드를 건너뜀");
    return result;
  }

  const cafe24Url = absoluteUrl(product.cafe24Path);
  const html = await fetchText(cafe24Url);
  const rawPath = join(outDir, "raw", `${product.slug}.html`);
  await mkdir(dirname(rawPath), { recursive: true });
  await writeFile(rawPath, html);

  const extractedImages = extractImages(html);
  const cafe24 = {
    productNo: extractJsString(html, "iProductNo"),
    productCode: extractJsString(html, "product_code"),
    itemCode: extractJsString(html, "item_code"),
    productName: extractJsString(html, "product_name") ?? product.name,
    productPrice: extractJsNumberString(html, "product_price"),
    productPriceMobile: extractJsNumberString(html, "product_price_mobile"),
    stockNumber: extractJsNumberString(html, "stock_number"),
    isSoldoutIcon: extractJsString(html, "is_soldout_icon"),
    productImageTiny: extractJsString(html, "product_image_tiny"),
    rawHtmlPath: rawPath.replace(rootDir + "/", ""),
    productImageUrls: extractedImages.productImages,
    detailImageUrls: extractedImages.detailImages,
  };

  result.cafe24 = cafe24;

  for (const [index, url] of extractedImages.productImages.entries()) {
    const ext = extFromUrl(url);
    const imagePath = join(outDir, "images", product.slug, "product", `${String(index + 1).padStart(2, "0")}${ext}`);
    result.images.product.push(await downloadImage(url, imagePath));
  }

  for (const [index, url] of extractedImages.detailImages.entries()) {
    const ext = extFromUrl(url);
    const imagePath = join(outDir, "images", product.slug, "detail", `${String(index + 1).padStart(2, "0")}${ext}`);
    result.images.detail.push(await downloadImage(url, imagePath));
  }

  result.collectionStatus = "downloaded";
  return result;
}

function productMarkdown(product) {
  const lines = [];
  lines.push(`# ${product.name}`);
  lines.push("");
  lines.push("## 기본 정보");
  lines.push(`- Coupang URL: ${product.coupangUrl ?? "-"}`);
  lines.push(`- productId: ${product.coupang.productId ?? "-"}`);
  lines.push(`- itemId: ${product.coupang.itemId ?? "-"}`);
  lines.push(`- vendorItemId: ${product.coupang.vendorItemId ?? "-"}`);
  lines.push(`- Cafe24 URL: ${product.cafe24Url ?? "-"}`);
  lines.push(`- 수집 상태: ${product.collectionStatus}`);
  lines.push("");
  lines.push("## 가격/리뷰");
  lines.push(`- 쿠팡 정상가: ${product.coupang.originalPrice ? `${product.coupang.originalPrice.toLocaleString("ko-KR")}원` : "-"}`);
  lines.push(`- 쿠팡 판매가: ${product.coupang.salePrice ? `${product.coupang.salePrice.toLocaleString("ko-KR")}원` : "-"}`);
  lines.push(`- 할인율: ${product.coupang.discountRate ?? "-"}`);
  lines.push(`- 단위가: ${product.coupang.unitPrice ?? "-"}`);
  lines.push(`- 상품평 수: ${product.coupang.reviewCount ?? "-"}`);
  lines.push("");
  lines.push("## 쿠팡 속성");
  if (product.coupang.attributes.length > 0) {
    product.coupang.attributes.forEach((attribute) => lines.push(`- ${attribute}`));
  } else {
    lines.push("- 미확인");
  }
  lines.push("");
  lines.push("## Cafe24 등록 정보");
  if (product.cafe24) {
    lines.push(`- 상품번호: ${product.cafe24.productNo ?? "-"}`);
    lines.push(`- 상품코드: ${product.cafe24.productCode ?? "-"}`);
    lines.push(`- 아이템코드: ${product.cafe24.itemCode ?? "-"}`);
    lines.push(`- 판매가: ${product.cafe24.productPrice ? `${product.cafe24.productPrice.toLocaleString("ko-KR")}원` : "-"}`);
    lines.push(`- 재고수량: ${product.cafe24.stockNumber ?? "-"}`);
  } else {
    lines.push("- Cafe24 상세 페이지 미확인");
  }
  lines.push("");
  lines.push("## 이미지 수집");
  lines.push(`- 상품 이미지: ${product.images.product.length}개`);
  lines.push(`- 상세 이미지: ${product.images.detail.length}개`);
  for (const image of product.images.detail) {
    const dimension = image.dimensions?.width && image.dimensions?.height ? `${image.dimensions.width}x${image.dimensions.height}` : "unknown";
    lines.push(`- ${image.filePath} (${dimension}, ${image.bytes.toLocaleString("ko-KR")} bytes)`);
  }
  if (product.collectionNotes.length > 0) {
    lines.push("");
    lines.push("## 수집 메모");
    product.collectionNotes.forEach((note) => lines.push(`- ${note}`));
  }
  lines.push("");
  return lines.join("\n");
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const collected = [];

  for (const product of products) {
    console.log(`Collecting ${product.name}`);
    try {
      collected.push(await collectProduct(product));
    } catch (error) {
      collected.push({
        ...product,
        cafe24Url: product.cafe24Path ? absoluteUrl(product.cafe24Path) : null,
        cafe24: null,
        images: { product: [], detail: [] },
        collectionStatus: "failed",
        collectionNotes: [error.message],
      });
    }
  }

  await writeFile(join(outDir, "products.json"), `${JSON.stringify(collected, null, 2)}\n`);

  const csvColumns = [
    "status",
    "product_name",
    "coupang_url",
    "product_id",
    "item_id",
    "vendor_item_id",
    "sale_price",
    "original_price",
    "review_count",
    "cafe24_url",
    "cafe24_product_no",
    "cafe24_product_code",
    "product_image_count",
    "detail_image_count",
    "notes",
  ];
  const csvRows = [
    csvColumns.join(","),
    ...collected.map((product) =>
      [
        product.collectionStatus,
        product.name,
        product.coupangUrl,
        product.coupang.productId,
        product.coupang.itemId,
        product.coupang.vendorItemId,
        product.coupang.salePrice,
        product.coupang.originalPrice,
        product.coupang.reviewCount,
        product.cafe24Url,
        product.cafe24?.productNo,
        product.cafe24?.productCode,
        product.images.product.length,
        product.images.detail.length,
        product.collectionNotes.join("; "),
      ].map(toCsvValue).join(",")
    ),
  ];
  await writeFile(join(outDir, "products.csv"), `${csvRows.join("\n")}\n`);

  const analysisDir = join(outDir, "analysis");
  await mkdir(analysisDir, { recursive: true });
  for (const product of collected) {
    await writeFile(join(analysisDir, `${product.slug}.md`), productMarkdown(product));
  }

  const summary = {
    productCount: collected.length,
    downloadedProductCount: collected.filter((product) => product.collectionStatus === "downloaded").length,
    totalProductImages: collected.reduce((sum, product) => sum + product.images.product.length, 0),
    totalDetailImages: collected.reduce((sum, product) => sum + product.images.detail.length, 0),
    blockedOrMetadataOnly: collected
      .filter((product) => product.collectionStatus !== "downloaded")
      .map((product) => ({ name: product.name, status: product.collectionStatus, notes: product.collectionNotes })),
  };
  await writeFile(join(outDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

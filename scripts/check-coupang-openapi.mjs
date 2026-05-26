import crypto from "node:crypto";
import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const baseProductPath = "/v2/providers/seller_api/apis/api/v1/marketplace/seller-products";

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

function mask(value) {
  const text = String(value ?? "");
  if (!text) return "";
  if (text.length <= 4) return "*".repeat(text.length);
  return `${text.slice(0, 2)}${"*".repeat(Math.max(4, text.length - 4))}${text.slice(-2)}`;
}

function parseArgs(argv) {
  const args = {
    maxPerPage: "10",
    nextToken: "1",
    sellerProductId: "",
  };

  for (const arg of argv) {
    if (arg.startsWith("--max=")) args.maxPerPage = arg.slice("--max=".length);
    if (arg.startsWith("--next-token=")) args.nextToken = arg.slice("--next-token=".length);
    if (arg.startsWith("--seller-product-id=")) args.sellerProductId = arg.slice("--seller-product-id=".length);
  }

  return args;
}

function requireEnv(keys) {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          stage: "env",
          missing,
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }
}

function hmacAuthorization({ method, requestPath, query }) {
  const signedDate = new Date().toISOString().slice(2, 19).replace(/[-:]/g, "") + "Z";
  const message = signedDate + method + requestPath + query;
  const signature = crypto.createHmac("sha256", process.env.COUPANG_SECRET_KEY).update(message).digest("hex");

  return `CEA algorithm=HmacSHA256, access-key=${process.env.COUPANG_ACCESS_KEY}, signed-date=${signedDate}, signature=${signature}`;
}

function requestJson({ host, method, requestPath, query = "" }) {
  return new Promise((resolve, reject) => {
    const pathWithQuery = query ? `${requestPath}?${query}` : requestPath;
    const req = https.request(
      {
        host,
        method,
        path: pathWithQuery,
        timeout: 15000,
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: hmacAuthorization({ method, requestPath, query }),
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

function getProductsFromListResponse(parsed) {
  const data = parsed?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.sellerProducts)) return data.sellerProducts;
  return [];
}

function success(response) {
  return response.statusCode >= 200 && response.statusCode < 300 && response.parsed?.code !== "ERROR";
}

loadEnvFile(envPath);
requireEnv(["COUPANG_API_BASE_URL", "COUPANG_ACCESS_KEY", "COUPANG_SECRET_KEY", "COUPANG_VENDOR_ID"]);

const args = parseArgs(process.argv.slice(2));
const baseUrl = new URL(process.env.COUPANG_API_BASE_URL);
const listQuery = new URLSearchParams({
  vendorId: process.env.COUPANG_VENDOR_ID,
  nextToken: args.nextToken,
  maxPerPage: args.maxPerPage,
}).toString();

const listResponse = await requestJson({
  host: baseUrl.host,
  method: "GET",
  requestPath: baseProductPath,
  query: listQuery,
});

const products = getProductsFromListResponse(listResponse.parsed);
const selectedSellerProductId = args.sellerProductId || products[0]?.sellerProductId || "";
let detailResponse = null;

if (selectedSellerProductId) {
  detailResponse = await requestJson({
    host: baseUrl.host,
    method: "GET",
    requestPath: `${baseProductPath}/${encodeURIComponent(selectedSellerProductId)}`,
  });
}

const detailData = detailResponse?.parsed?.data;

console.log(
  JSON.stringify(
    {
      ok: success(listResponse) && (!detailResponse || success(detailResponse)),
      endpoint: baseUrl.origin,
      vendorId: mask(process.env.COUPANG_VENDOR_ID),
      listLookup: {
        statusCode: listResponse.statusCode,
        statusMessage: listResponse.statusMessage,
        code: listResponse.parsed?.code ?? null,
        message: listResponse.parsed?.message ?? null,
        itemCount: products.length,
        nextToken: listResponse.parsed?.nextToken ?? listResponse.parsed?.data?.nextToken ?? null,
        firstItemFields: products[0] ? Object.keys(products[0]).slice(0, 12) : null,
      },
      detailLookup: detailResponse
        ? {
            sellerProductId: mask(selectedSellerProductId),
            statusCode: detailResponse.statusCode,
            statusMessage: detailResponse.statusMessage,
            code: detailResponse.parsed?.code ?? null,
            message: detailResponse.parsed?.message ?? null,
            returnedSellerProductIdMatches: String(detailData?.sellerProductId ?? "") === String(selectedSellerProductId),
            fields: detailData ? Object.keys(detailData).slice(0, 15) : null,
          }
        : null,
    },
    null,
    2,
  ),
);

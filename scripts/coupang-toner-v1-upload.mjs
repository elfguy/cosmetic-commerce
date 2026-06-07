#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const sellerProductId = '15704749086';
const productSlug = 'hyaluronic-toner';
const versionRoot = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v1');
const args = new Set(process.argv.slice(2));
const baseUrlArg = process.argv.find((arg) => arg.startsWith('--base-url='))?.slice('--base-url='.length);
const baseUrl = (process.env.COUPANG_IMAGE_BASE_URL || baseUrlArg || '').replace(/\/$/, '');
const execute = process.env.COUPANG_UPDATE_EXECUTE === '1' && args.has('--execute') && args.has('--i-understand-this-updates-coupang');

if (!baseUrl) throw new Error('Missing --base-url=https://... or COUPANG_IMAGE_BASE_URL');
if (!/^https:\/\//.test(baseUrl)) throw new Error('Coupang image vendorPath must be an https URL');

async function loadEnv() {
  const text = await fs.readFile(path.join(root, '.env.local'), 'utf8');
  for (const raw of text.split(/\r?\n/)) {
    const match = raw.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
  }
  for (const key of ['COUPANG_API_BASE_URL', 'COUPANG_ACCESS_KEY', 'COUPANG_SECRET_KEY']) {
    if (!process.env[key]) throw new Error(`Missing ${key}`);
  }
}

function auth(method, requestPath, query = '') {
  const signedDate = new Date().toISOString().slice(2, 19).replace(/[-:]/g, '') + 'Z';
  const signature = crypto.createHmac('sha256', process.env.COUPANG_SECRET_KEY)
    .update(signedDate + method + requestPath + query)
    .digest('hex');
  return `CEA algorithm=HmacSHA256, access-key=${process.env.COUPANG_ACCESS_KEY}, signed-date=${signedDate}, signature=${signature}`;
}

function requestJson(method, requestPath, { query = '', body = null } = {}) {
  return new Promise((resolve, reject) => {
    const apiBase = new URL(process.env.COUPANG_API_BASE_URL || 'https://api-gateway.coupang.com');
    const payload = body == null ? null : JSON.stringify(body);
    const req = https.request({
      host: apiBase.host,
      method,
      path: requestPath + (query ? `?${query}` : ''),
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: auth(method, requestPath, query),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { text += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(text); } catch {}
        resolve({ statusCode: res.statusCode, statusMessage: res.statusMessage, parsed, text });
      });
    });
    req.on('timeout', () => req.destroy(new Error('Request timed out')));
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function httpHead(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 15000 }, (res) => {
      res.resume();
      resolve({ url, statusCode: res.statusCode, contentType: res.headers['content-type'] || null, length: res.headers['content-length'] || null });
    });
    req.on('timeout', () => req.destroy(new Error('HEAD timeout')));
    req.on('error', (error) => resolve({ url, error: error.message }));
    req.end();
  });
}

async function assertFiles() {
  const reps = [];
  const details = [];
  for (let i = 1; i <= 6; i++) reps.push(path.join(versionRoot, 'representative', `${String(i).padStart(2, '0')}.png`));
  for (let i = 1; i <= 13; i++) details.push(path.join(versionRoot, 'detail', `${String(i).padStart(2, '0')}.png`));
  for (const file of [...reps, ...details]) {
    const stat = await fs.stat(file);
    if (!stat.isFile() || stat.size <= 0) throw new Error(`Invalid image file ${file}`);
  }
  return { reps, details };
}

function publicUrl(file) {
  const rel = path.relative(path.join(root, 'public'), file).split(path.sep).map(encodeURIComponent).join('/');
  return `${baseUrl}/${rel}`;
}

function summaryOf(product) {
  const item = product.items?.[0] || {};
  return {
    sellerProductId: product.sellerProductId,
    sellerProductName: product.sellerProductName,
    productId: product.productId,
    statusName: product.statusName,
    saleStartedAt: product.saleStartedAt,
    saleEndedAt: product.saleEndedAt,
    imageCounts: (item.images || []).reduce((acc, image) => {
      acc[image.imageType] = (acc[image.imageType] || 0) + 1;
      return acc;
    }, {}),
    contentCount: item.contents?.length || 0,
    firstImages: (item.images || []).slice(0, 8).map((image) => ({ imageOrder: image.imageOrder, imageType: image.imageType, vendorPath: image.vendorPath, cdnPath: image.cdnPath })),
    firstContentDetails: (item.contents || []).flatMap((content) => content.contentDetails || []).slice(0, 5).map((detail) => ({ detailType: detail.detailType, content: detail.content })),
  };
}

await loadEnv();
const { reps, details } = await assertFiles();
const imageUrls = {
  baseUrl,
  sellerProductId,
  representation: publicUrl(reps[0]),
  additionalImages: reps.slice(1).map(publicUrl),
  detailContents: details.map(publicUrl),
};
const headChecks = await Promise.all([imageUrls.representation, ...imageUrls.additionalImages, ...imageUrls.detailContents].map(httpHead));
const badHeads = headChecks.filter((x) => x.error || x.statusCode < 200 || x.statusCode >= 300 || !String(x.contentType || '').includes('image/'));
if (badHeads.length) throw new Error(`Image URL check failed: ${JSON.stringify(badHeads.slice(0, 3), null, 2)}`);

const getPath = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${sellerProductId}`;
const current = await requestJson('GET', getPath);
if (!(current.statusCode >= 200 && current.statusCode < 300 && current.parsed?.code === 'SUCCESS')) {
  throw new Error(`GET failed ${current.statusCode} ${current.text.slice(0, 500)}`);
}
const currentProduct = current.parsed.data;
if (String(currentProduct.sellerProductId) !== sellerProductId) throw new Error('sellerProductId mismatch');
const item = currentProduct.items?.[0];
if (!item) throw new Error('No item found');

const ts = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const backupDir = path.join(root, 'data/coupang/rollback', productSlug, ts);
const updateDir = path.join(root, 'data/coupang/update', productSlug, ts);
await fs.mkdir(backupDir, { recursive: true });
await fs.mkdir(updateDir, { recursive: true });
await fs.writeFile(path.join(backupDir, 'current-product-response.raw.json'), JSON.stringify(current.parsed, null, 2));
await fs.writeFile(path.join(backupDir, 'rollback-summary.json'), JSON.stringify(summaryOf(currentProduct), null, 2));
await fs.writeFile(path.join(updateDir, 'image-url-map.json'), JSON.stringify({ ...imageUrls, headChecks }, null, 2));

const product = structuredClone(currentProduct);
product.requested = true;
if (product.rocketGrowthAdditionalInformation || product.items?.some((x) => x.rocketGrowthItemData)) {
  product.rocketGrowthAdditionalInformation = {
    ...(product.rocketGrowthAdditionalInformation || {}),
    legalAgreement: 'AGREE',
  };
}
const targetItem = product.items?.[0];
targetItem.images = [
  { imageOrder: 0, imageType: 'REPRESENTATION', vendorPath: imageUrls.representation },
  ...imageUrls.additionalImages.map((url, index) => ({ imageOrder: index, imageType: 'DETAIL', vendorPath: url })),
];
targetItem.contents = imageUrls.detailContents.map((url) => ({
  contentsType: 'IMAGE_NO_SPACE',
  contentDetails: [{ detailType: 'IMAGE', content: url }],
}));
await fs.writeFile(path.join(updateDir, 'payload.redacted.json'), JSON.stringify(product, null, 2));

if (!execute) {
  console.log(JSON.stringify({
    ok: true,
    mode: 'dry-run',
    backupDir,
    updateDir,
    sellerProductId: product.sellerProductId,
    sellerProductName: product.sellerProductName,
    current: summaryOf(currentProduct),
    prepared: { imageCount: targetItem.images.length, detailContentCount: targetItem.contents.length },
    note: 'No Coupang update sent. Set COUPANG_UPDATE_EXECUTE=1 and pass --execute --i-understand-this-updates-coupang.',
  }, null, 2));
  process.exit(0);
}

const putPath = '/v2/providers/seller_api/apis/api/v1/marketplace/seller-products';
const update = await requestJson('PUT', putPath, { body: product });
await fs.writeFile(path.join(updateDir, 'update-response.json'), JSON.stringify({
  statusCode: update.statusCode,
  statusMessage: update.statusMessage,
  parsed: update.parsed,
  text: update.parsed ? undefined : update.text,
}, null, 2));

const verify = await requestJson('GET', getPath);
await fs.writeFile(path.join(updateDir, 'post-update-product-response.raw.json'), JSON.stringify(verify.parsed || { text: verify.text }, null, 2));
const verifiedProduct = verify.parsed?.data;
const verifiedItem = verifiedProduct?.items?.[0] || {};
console.log(JSON.stringify({
  ok: update.statusCode >= 200 && update.statusCode < 300 && update.parsed?.code !== 'ERROR',
  mode: 'execute',
  backupDir,
  updateDir,
  sellerProductId: product.sellerProductId,
  sellerProductName: product.sellerProductName,
  updateStatus: { statusCode: update.statusCode, statusMessage: update.statusMessage, code: update.parsed?.code ?? null, message: update.parsed?.message ?? null, data: update.parsed?.data ?? null },
  verifyStatus: { statusCode: verify.statusCode, code: verify.parsed?.code ?? null, statusName: verifiedProduct?.statusName ?? null, imageCount: verifiedItem.images?.length || 0, contentCount: verifiedItem.contents?.length || 0, firstImage: verifiedItem.images?.[0] || null, firstContent: verifiedItem.contents?.[0]?.contentDetails?.[0] || null },
}, null, 2));

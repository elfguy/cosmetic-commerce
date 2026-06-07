#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';
import { setTimeout as sleep } from 'node:timers/promises';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const sellerProductId = '15895499351';
const productSlug = 'aqua-lotion';
const imageFile = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4/representative/01.png');
const args = new Set(process.argv.slice(2));
const baseUrl = (process.env.COUPANG_IMAGE_BASE_URL || process.argv.find((arg) => arg.startsWith('--base-url='))?.slice('--base-url='.length) || '').replace(/\/$/, '');
const execute = process.env.COUPANG_UPDATE_EXECUTE === '1' && args.has('--execute') && args.has('--i-understand-this-updates-coupang');

if (!baseUrl) throw new Error('Missing --base-url=https://... or COUPANG_IMAGE_BASE_URL');
if (!/^https:\/\//.test(baseUrl)) throw new Error('Coupang image vendorPath must be https URL');

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
    requested: product.requested,
    imageCount: item.images?.length || 0,
    contentCount: item.contents?.length || 0,
    firstImage: item.images?.[0] || null,
  };
}

async function sha256(file) {
  const buf = await fs.readFile(file);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 30000 }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, contentType: res.headers['content-type'], buffer: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

await loadEnv();
const stat = await fs.stat(imageFile);
if (!stat.isFile() || stat.size <= 0) throw new Error('Invalid main image file');
const mainUrl = publicUrl(imageFile);
const head = await httpHead(mainUrl);
if (head.error || head.statusCode < 200 || head.statusCode >= 300 || !String(head.contentType || '').includes('image/')) {
  throw new Error(`Image URL check failed: ${JSON.stringify(head, null, 2)}`);
}

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
const backupDir = path.join(root, 'data/coupang/rollback', productSlug, `${ts}-main01`);
const updateDir = path.join(root, 'data/coupang/update', productSlug, `${ts}-main01`);
await fs.mkdir(backupDir, { recursive: true });
await fs.mkdir(updateDir, { recursive: true });
await fs.writeFile(path.join(backupDir, 'current-product-response.raw.json'), JSON.stringify(current.parsed, null, 2));
await fs.writeFile(path.join(backupDir, 'rollback-summary.json'), JSON.stringify(summaryOf(currentProduct), null, 2));
await fs.writeFile(path.join(updateDir, 'image-url-map.json'), JSON.stringify({ baseUrl, sellerProductId, main01: mainUrl, head, localSha256: await sha256(imageFile) }, null, 2));

const product = structuredClone(currentProduct);
product.requested = true;
if (product.rocketGrowthAdditionalInformation || product.items?.some((x) => x.rocketGrowthItemData)) {
  product.rocketGrowthAdditionalInformation = {
    ...(product.rocketGrowthAdditionalInformation || {}),
    legalAgreement: 'AGREE',
  };
}
const targetItem = product.items?.[0];
const images = targetItem.images || [];
const repIndex = images.findIndex((img) => img.imageType === 'REPRESENTATION');
if (repIndex < 0) throw new Error('No REPRESENTATION image found');
images[repIndex] = { imageOrder: 0, imageType: 'REPRESENTATION', vendorPath: mainUrl };
targetItem.images = images;
await fs.writeFile(path.join(updateDir, 'payload.redacted.json'), JSON.stringify(product, null, 2));

if (!execute) {
  console.log(JSON.stringify({ ok: true, mode: 'dry-run', backupDir, updateDir, current: summaryOf(currentProduct), preparedMain01: mainUrl, note: 'No Coupang update sent.' }, null, 2));
  process.exit(0);
}

const putPath = '/v2/providers/seller_api/apis/api/v1/marketplace/seller-products';
const update = await requestJson('PUT', putPath, { body: product });
await fs.writeFile(path.join(updateDir, 'update-response.json'), JSON.stringify({ statusCode: update.statusCode, statusMessage: update.statusMessage, parsed: update.parsed, text: update.parsed ? undefined : update.text }, null, 2));

let verify = null;
for (const delay of [0, 20_000, 60_000]) {
  if (delay) await sleep(delay);
  verify = await requestJson('GET', getPath);
  await fs.writeFile(path.join(updateDir, `verify-after-${delay / 1000}s.raw.json`), JSON.stringify(verify.parsed || { text: verify.text }, null, 2));
  const vp = verify.parsed?.data;
  const vi = vp?.items?.[0] || {};
  const first = vi.images?.find((img) => img.imageType === 'REPRESENTATION') || vi.images?.[0] || null;
  const pathValue = String(first?.cdnPath || first?.vendorPath || '');
  if (vp?.statusName === '승인완료' && vp?.requested === false && pathValue.includes('vendor_inventory/')) break;
}
const verifiedProduct = verify.parsed?.data;
const verifiedItem = verifiedProduct?.items?.[0] || {};
const firstImage = verifiedItem.images?.find((img) => img.imageType === 'REPRESENTATION') || verifiedItem.images?.[0] || null;
const cdnPath = firstImage?.cdnPath || firstImage?.vendorPath || '';
let cdnCheck = null;
if (String(cdnPath).includes('vendor_inventory/')) {
  const cdnUrl = `https://image.coupangcdn.com/image/${cdnPath.replace(/^image\//, '')}`;
  const fetched = await fetchBuffer(cdnUrl);
  const remoteSha = crypto.createHash('sha256').update(fetched.buffer).digest('hex');
  cdnCheck = { cdnUrl, statusCode: fetched.statusCode, contentType: fetched.contentType, bytes: fetched.buffer.length, remoteSha256: remoteSha, localSha256: await sha256(imageFile), shaMatches: remoteSha === await sha256(imageFile) };
  await fs.writeFile(path.join(updateDir, 'cdn-main01-check.json'), JSON.stringify(cdnCheck, null, 2));
}

console.log(JSON.stringify({
  ok: update.statusCode >= 200 && update.statusCode < 300 && update.parsed?.code !== 'ERROR',
  mode: 'execute',
  backupDir,
  updateDir,
  updateStatus: { statusCode: update.statusCode, statusMessage: update.statusMessage, code: update.parsed?.code ?? null, message: update.parsed?.message ?? null, data: update.parsed?.data ?? null },
  verifyStatus: { statusCode: verify.statusCode, code: verify.parsed?.code ?? null, statusName: verifiedProduct?.statusName ?? null, requested: verifiedProduct?.requested ?? null, imageCount: verifiedItem.images?.length || 0, contentCount: verifiedItem.contents?.length || 0, firstImage },
  cdnCheck,
}, null, 2));

#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const sellerProductId = '15895499351';

async function loadEnv() {
  const text = await fs.readFile(path.join(root, '.env.local'), 'utf8');
  for (const raw of text.split(/\r?\n/)) {
    const match = raw.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
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
    const base = new URL(process.env.COUPANG_API_BASE_URL || 'https://api-gateway.coupang.com');
    const payload = body == null ? null : JSON.stringify(body);
    const req = https.request({
      host: base.host,
      method,
      path: requestPath + (query ? `?${query}` : ''),
      timeout: 30000,
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

await loadEnv();
const requestPath = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${sellerProductId}`;
const response = await requestJson('GET', requestPath);
if (!(response.statusCode >= 200 && response.statusCode < 300 && response.parsed?.code === 'SUCCESS')) {
  throw new Error(`GET failed ${response.statusCode} ${response.text.slice(0, 300)}`);
}

const ts = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const dir = path.join(root, 'data/coupang/rollback/aqua-lotion', ts);
await fs.mkdir(dir, { recursive: true });
await fs.writeFile(path.join(dir, 'current-product-response.raw.json'), JSON.stringify(response.parsed, null, 2));

const product = response.parsed.data;
const summary = {
  sellerProductId: product.sellerProductId,
  sellerProductName: product.sellerProductName,
  productId: product.productId,
  items: (product.items || []).map((item) => ({
    itemId: item.itemId,
    vendorItemId: item.vendorItemId,
    itemName: item.itemName,
    imageCounts: (item.images || []).reduce((acc, image) => {
      acc[image.imageType] = (acc[image.imageType] || 0) + 1;
      return acc;
    }, {}),
    images: (item.images || []).map((image) => ({
      imageOrder: image.imageOrder,
      imageType: image.imageType,
      vendorPath: image.vendorPath,
      cdnPath: image.cdnPath,
    })),
    contentCount: item.contents?.length || 0,
    contentDetails: (item.contents || []).flatMap((content) => (content.contentDetails || []).map((detail) => ({
      contentsType: content.contentsType,
      detailType: detail.detailType,
      content: detail.content,
    }))),
  })),
};
await fs.writeFile(path.join(dir, 'rollback-summary.json'), JSON.stringify(summary, null, 2));
const item = product.items?.[0] || {};
console.log(JSON.stringify({
  ok: true,
  backupDir: dir,
  sellerProductId: product.sellerProductId,
  sellerProductName: product.sellerProductName,
  imageCounts: summary.items?.[0]?.imageCounts,
  contentCount: item.contents?.length || 0,
  firstImages: (item.images || []).slice(0, 8).map((image) => ({ type: image.imageType, order: image.imageOrder, vendorPath: image.vendorPath, cdnPath: image.cdnPath })),
  firstContentDetails: (item.contents || []).flatMap((content) => content.contentDetails || []).slice(0, 5).map((detail) => ({ type: detail.detailType, content: detail.content })),
}, null, 2));

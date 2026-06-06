#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const sellerProductId = '15895499351';
const expectedBase = process.argv.find((arg) => arg.startsWith('--base-url='))?.slice('--base-url='.length) || process.env.COUPANG_IMAGE_BASE_URL || '';

async function loadEnv() {
  const text = await fs.readFile(path.join(root, '.env.local'), 'utf8');
  for (const raw of text.split(/\r?\n/)) {
    const match = raw.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
  }
}
function auth(method, requestPath, query = '') {
  const signedDate = new Date().toISOString().slice(2, 19).replace(/[-:]/g, '') + 'Z';
  const signature = crypto.createHmac('sha256', process.env.COUPANG_SECRET_KEY).update(signedDate + method + requestPath + query).digest('hex');
  return `CEA algorithm=HmacSHA256, access-key=${process.env.COUPANG_ACCESS_KEY}, signed-date=${signedDate}, signature=${signature}`;
}
function requestJson(method, requestPath) {
  return new Promise((resolve, reject) => {
    const base = new URL(process.env.COUPANG_API_BASE_URL || 'https://api-gateway.coupang.com');
    const req = https.request({ host: base.host, method, path: requestPath, timeout: 60000, headers: { 'Content-Type': 'application/json;charset=UTF-8', Authorization: auth(method, requestPath) } }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { text += chunk; });
      res.on('end', () => { let parsed = null; try { parsed = JSON.parse(text); } catch {}; resolve({ statusCode: res.statusCode, parsed, text }); });
    });
    req.on('error', reject); req.end();
  });
}
await loadEnv();
const r = await requestJson('GET', `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${sellerProductId}`);
if (!(r.statusCode >= 200 && r.statusCode < 300 && r.parsed?.code === 'SUCCESS')) throw new Error(`GET failed ${r.statusCode} ${r.text.slice(0, 300)}`);
const product = r.parsed.data;
const item = product.items?.[0] || {};
const details = (item.contents || []).flatMap((content) => content.contentDetails || []);
const images = item.images || [];
const result = {
  ok: true,
  sellerProductId: product.sellerProductId,
  statusName: product.statusName,
  imageCounts: images.reduce((acc, image) => { acc[image.imageType] = (acc[image.imageType] || 0) + 1; return acc; }, {}),
  contentCount: details.length,
  imageSamples: images.slice(0, 6).map((image) => ({ type: image.imageType, order: image.imageOrder, vendorPath: image.vendorPath, cdnPath: image.cdnPath })),
  contentSamples: details.slice(0, 3).map((detail) => detail.content),
  expectedBaseFoundInImages: expectedBase ? images.some((image) => String(image.vendorPath || image.cdnPath || '').includes(expectedBase) || String(image.vendorPath || image.cdnPath || '').includes('versions/v4')) : null,
  expectedBaseFoundInContents: expectedBase ? details.some((detail) => String(detail.content || '').includes(expectedBase) || String(detail.content || '').includes('versions/v4')) : null,
};
console.log(JSON.stringify(result, null, 2));

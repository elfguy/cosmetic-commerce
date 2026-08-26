#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const sellerProductId = '15704749086';
const reportDir = process.argv.find((arg) => arg.startsWith('--report-dir='))?.slice('--report-dir='.length) || '';
const versionRoot = path.join(root, 'public/coupang/images/hyaluronic-acid-toner/versions/v5/representative');

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
const localFiles = await Promise.all(Array.from({ length: 6 }, async (_, i) => {
  const name = `${String(i + 1).padStart(2, '0')}.png`;
  const data = await fs.readFile(path.join(versionRoot, name));
  return { name, sha256: crypto.createHash('sha256').update(data).digest('hex') };
}));
const cdnPathHashes = images.map((image) => {
  const match = String(image.cdnPath || '').match(/vendor_inventory\/([0-9a-f]{4})\/([0-9a-f]{60})\.png$/i);
  return match ? `${match[1]}${match[2]}`.toLowerCase() : null;
});
const result = {
  ok: true,
  sellerProductId: product.sellerProductId,
  statusName: product.statusName,
  requested: product.requested,
  imageCounts: images.reduce((acc, image) => { acc[image.imageType] = (acc[image.imageType] || 0) + 1; return acc; }, {}),
  contentCount: details.length,
  imageSamples: images.slice(0, 6).map((image) => ({ type: image.imageType, order: image.imageOrder, vendorPath: image.vendorPath, cdnPath: image.cdnPath })),
  contentSamples: details.slice(0, 3).map((detail) => detail.content),
  contentPaths: details.map((detail) => detail.content),
  contentPathSha256: crypto.createHash('sha256').update(JSON.stringify(details.map((detail) => detail.content))).digest('hex'),
  externalImageUrls: images.filter((image) => /^https:\/\//.test(String(image.vendorPath || ''))).length,
  externalContentUrls: details.filter((detail) => /^https:\/\//.test(String(detail.content || ''))).length,
  localFiles,
  cdnPathHashes,
  cdnPathShaMatches: localFiles.length === cdnPathHashes.length && localFiles.every((file, i) => file.sha256 === cdnPathHashes[i]),
};
if (reportDir) {
  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(path.join(reportDir, 'final-api-verification.json'), JSON.stringify(result, null, 2));
}
console.log(JSON.stringify(result, null, 2));

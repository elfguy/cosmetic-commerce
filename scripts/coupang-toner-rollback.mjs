#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const backupRoot = path.join(root, 'data/coupang/rollback/hyaluronic-toner');
const args = new Set(process.argv.slice(2));

async function latestBackupDir() {
  const entries = await fs.readdir(backupRoot, { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (!dirs.length) throw new Error(`No rollback backups found under ${backupRoot}`);
  return path.join(backupRoot, dirs.at(-1));
}
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
function requestJson(method, requestPath, { body = null } = {}) {
  return new Promise((resolve, reject) => {
    const base = new URL(process.env.COUPANG_API_BASE_URL || 'https://api-gateway.coupang.com');
    const payload = body == null ? null : JSON.stringify(body);
    const req = https.request({
      host: base.host,
      method,
      path: requestPath,
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: auth(method, requestPath),
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
function summaryOf(product) {
  const item = product.items?.[0] || {};
  return {
    sellerProductId: product.sellerProductId,
    sellerProductName: product.sellerProductName,
    productId: product.productId,
    statusName: product.statusName,
    imageCount: item.images?.length || 0,
    contentCount: item.contents?.length || 0,
    firstImage: item.images?.[0] || null,
    firstContent: item.contents?.[0]?.contentDetails?.[0] || null,
  };
}

const dir = args.has('--backup-dir')
  ? path.resolve(process.argv[process.argv.indexOf('--backup-dir') + 1])
  : await latestBackupDir();
const response = JSON.parse(await fs.readFile(path.join(dir, 'current-product-response.raw.json'), 'utf8'));
const product = response.data;
const sellerProductId = String(product.sellerProductId);
product.requested = true;
if (product.rocketGrowthAdditionalInformation || product.items?.some((x) => x.rocketGrowthItemData)) {
  product.rocketGrowthAdditionalInformation = { ...(product.rocketGrowthAdditionalInformation || {}), legalAgreement: 'AGREE' };
}
console.log(JSON.stringify({
  mode: args.has('--execute') ? 'execute-requested' : 'dry-run',
  backupDir: dir,
  rollbackTarget: summaryOf(product),
  note: args.has('--execute') ? 'Execution guards will be checked.' : 'No Coupang update sent. Use COUPANG_ROLLBACK_EXECUTE=1 --execute --i-understand-this-updates-coupang to restore this backup.',
}, null, 2));
const execute = process.env.COUPANG_ROLLBACK_EXECUTE === '1' && args.has('--execute') && args.has('--i-understand-this-updates-coupang');
if (!execute) process.exit(0);
await loadEnv();
const putPath = '/v2/providers/seller_api/apis/api/v1/marketplace/seller-products';
const update = await requestJson('PUT', putPath, { body: product });
const getPath = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${sellerProductId}`;
const verify = await requestJson('GET', getPath);
console.log(JSON.stringify({
  ok: update.statusCode >= 200 && update.statusCode < 300 && update.parsed?.code !== 'ERROR',
  updateStatus: { statusCode: update.statusCode, code: update.parsed?.code ?? null, message: update.parsed?.message ?? null, data: update.parsed?.data ?? null },
  verifyStatus: { statusCode: verify.statusCode, code: verify.parsed?.code ?? null, ...(verify.parsed?.data ? summaryOf(verify.parsed.data) : {}) },
}, null, 2));

#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const sellerProductId = '15895499351';
const productSlug = 'aqua-lotion';
const v4Root = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
const args = new Set(process.argv.slice(2));
const tunnelBase = process.env.COUPANG_IMAGE_BASE_URL || process.argv.find((arg) => arg.startsWith('--base-url='))?.slice('--base-url='.length);
const execute = process.env.COUPANG_UPDATE_EXECUTE === '1' && args.has('--execute') && args.has('--i-understand-this-updates-coupang');

if (!tunnelBase) throw new Error('Missing --base-url=https://... or COUPANG_IMAGE_BASE_URL');
if (!/^https:\/\//.test(tunnelBase)) throw new Error('Coupang image vendorPath must be https URL');

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

async function assertFiles() {
  const reps = [];
  const detailNumbers = [
    ...Array.from({ length: 12 }, (_, i) => i + 1),
    14,
    15,
    16,
  ];
  const details = [];
  for (let i = 1; i <= 6; i++) reps.push(path.join(v4Root, 'representative', `${String(i).padStart(2, '0')}.png`));
  for (const i of detailNumbers) details.push(path.join(v4Root, 'detail', `${String(i).padStart(2, '0')}.png`));
  for (const file of [...reps, ...details]) {
    const stat = await fs.stat(file);
    if (!stat.isFile() || stat.size <= 0) throw new Error(`Invalid file ${file}`);
  }
  return { reps, details };
}

function publicUrl(file) {
  const rel = path.relative(path.join(root, 'public'), file).split(path.sep).map(encodeURIComponent).join('/');
  return `${tunnelBase.replace(/\/$/, '')}/${rel}`;
}

await loadEnv();
const { reps, details } = await assertFiles();

const getPath = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${sellerProductId}`;
const current = await requestJson('GET', getPath);
if (!(current.statusCode >= 200 && current.statusCode < 300 && current.parsed?.code === 'SUCCESS')) {
  throw new Error(`GET failed ${current.statusCode} ${current.text.slice(0, 500)}`);
}

const product = current.parsed.data;
product.requested = true;
if (String(product.sellerProductId) !== sellerProductId) throw new Error('sellerProductId mismatch');
const item = product.items?.[0];
if (!item) throw new Error('No item found');

// Hybrid Marketplace/Rocket Growth products require this agreement field on PUT.
// The GET response may omit it even though the official RG product update schema requires it.
if (product.rocketGrowthAdditionalInformation || item.rocketGrowthItemData) {
  product.rocketGrowthAdditionalInformation = {
    ...(product.rocketGrowthAdditionalInformation || {}),
    legalAgreement: 'AGREE',
  };
}

item.images = [
  { imageOrder: 0, imageType: 'REPRESENTATION', vendorPath: publicUrl(reps[0]) },
  ...reps.slice(1).map((file, index) => ({ imageOrder: index, imageType: 'DETAIL', vendorPath: publicUrl(file) })),
];
item.contents = details.map((file) => ({
  contentsType: 'IMAGE_NO_SPACE',
  contentDetails: [{ detailType: 'IMAGE', content: publicUrl(file) }],
}));

const ts = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const outDir = path.join(root, 'data/coupang/update', productSlug, ts);
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, 'payload.redacted.json'), JSON.stringify(product, null, 2));
await fs.writeFile(path.join(outDir, 'image-url-map.json'), JSON.stringify({
  tunnelBase,
  sellerProductId,
  representation: item.images[0].vendorPath,
  additionalImages: item.images.slice(1).map((image) => image.vendorPath),
  detailContents: item.contents.map((content) => content.contentDetails[0].content),
}, null, 2));

if (!execute) {
  console.log(JSON.stringify({
    ok: true,
    mode: 'dry-run',
    outDir,
    sellerProductId: product.sellerProductId,
    sellerProductName: product.sellerProductName,
    imageCount: item.images.length,
    contentCount: item.contents.length,
    sample: { representation: item.images[0].vendorPath, firstDetailContent: item.contents[0].contentDetails[0].content },
    note: 'No Coupang update sent. Set COUPANG_UPDATE_EXECUTE=1 and pass --execute --i-understand-this-updates-coupang.',
  }, null, 2));
  process.exit(0);
}

const putPath = '/v2/providers/seller_api/apis/api/v1/marketplace/seller-products';
const result = await requestJson('PUT', putPath, { body: product });
await fs.writeFile(path.join(outDir, 'update-response.json'), JSON.stringify({
  statusCode: result.statusCode,
  statusMessage: result.statusMessage,
  parsed: result.parsed,
  text: result.parsed ? undefined : result.text,
}, null, 2));
console.log(JSON.stringify({
  ok: result.statusCode >= 200 && result.statusCode < 300 && result.parsed?.code !== 'ERROR',
  mode: 'execute',
  outDir,
  statusCode: result.statusCode,
  statusMessage: result.statusMessage,
  code: result.parsed?.code ?? null,
  message: result.parsed?.message ?? null,
  data: result.parsed?.data ?? null,
}, null, 2));

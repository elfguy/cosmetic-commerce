#!/usr/bin/env node
/**
 * Rollback helper for Coupang aqua-lotion product images.
 *
 * Default mode is SAFE/DRY-RUN: it only reads the backup and prints a summary.
 * To actually call Coupang update API, this script intentionally requires all of:
 *   COUPANG_ROLLBACK_EXECUTE=1
 *   --execute
 *   --i-understand-this-updates-coupang
 *
 * NOTE: The exact Coupang update endpoint/payload should be verified against the
 * official seller-products modification docs before enabling the PUT block below.
 * Until then, this file serves as a guarded rollback package entry point and
 * immutable backup locator.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const sellerProductId = '15895499351';
const backupRoot = path.join(root, 'data/coupang/rollback/aqua-lotion');
const args = new Set(process.argv.slice(2));

async function latestBackupDir() {
  const entries = await fs.readdir(backupRoot, { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (!dirs.length) throw new Error(`No rollback backups found under ${backupRoot}`);
  return path.join(backupRoot, dirs.at(-1));
}

async function loadEnv() {
  const text = await fs.readFile(path.join(root, '.env.local'), 'utf8');
  const env = {};
  for (const raw of text.split(/\r?\n/)) {
    const match = raw.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function sign({ env, method, requestPath, query = '' }) {
  const signedDate = new Date().toISOString().slice(2, 19).replace(/[-:]/g, '') + 'Z';
  const signature = crypto
    .createHmac('sha256', env.COUPANG_SECRET_KEY)
    .update(signedDate + method + requestPath + query)
    .digest('hex');
  return `CEA algorithm=HmacSHA256, access-key=${env.COUPANG_ACCESS_KEY}, signed-date=${signedDate}, signature=${signature}`;
}

function requestJson({ env, method, requestPath, body }) {
  return new Promise((resolve, reject) => {
    const base = new URL(env.COUPANG_API_BASE_URL || 'https://api-gateway.coupang.com');
    const payload = body == null ? null : JSON.stringify(body);
    const req = https.request({
      host: base.host,
      method,
      path: requestPath,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: sign({ env, method, requestPath }),
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
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const dir = args.has('--backup-dir')
  ? path.resolve(process.argv[process.argv.indexOf('--backup-dir') + 1])
  : await latestBackupDir();
const rawPath = path.join(dir, 'current-product-response.raw.json');
const summaryPath = path.join(dir, 'rollback-summary.json');
const response = JSON.parse(await fs.readFile(rawPath, 'utf8'));
const summary = JSON.parse(await fs.readFile(summaryPath, 'utf8'));
const product = response.data;
const item = product?.items?.[0] || {};

console.log(JSON.stringify({
  mode: 'dry-run',
  backupDir: dir,
  sellerProductId: product?.sellerProductId,
  sellerProductName: product?.sellerProductName,
  imageCounts: summary.imageCounts,
  contentCount: item.contents?.length || 0,
  note: 'No Coupang update has been sent. Add required execute guards only after Leo explicitly approves rollback execution.',
}, null, 2));

const execute = process.env.COUPANG_ROLLBACK_EXECUTE === '1'
  && args.has('--execute')
  && args.has('--i-understand-this-updates-coupang');

if (!execute) process.exit(0);

throw new Error([
  'Execution block intentionally disabled until the official Coupang seller-product update endpoint/payload is verified.',
  'Use this backup as the rollback source of truth. Do not guess the PUT endpoint.',
].join('\n'));

// Placeholder only after endpoint is verified:
// const env = await loadEnv();
// const requestPath = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${sellerProductId}`;
// const result = await requestJson({ env, method: 'PUT', requestPath, body: product });
// console.log(JSON.stringify({ statusCode: result.statusCode, code: result.parsed?.code, message: result.parsed?.message }, null, 2));

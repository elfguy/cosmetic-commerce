import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';

const root = process.cwd();
const envText = await fs.readFile(path.join(root, '.env.local'), 'utf8');
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l && !l.trim().startsWith('#') && l.includes('=')).map(l=>{
  const i=l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^['\"]|['\"]$/g,'')];
}));
const baseUrl = env.COUPANG_API_BASE_URL || 'https://api-gateway.coupang.com';
const accessKey = env.COUPANG_ACCESS_KEY;
const secretKey = env.COUPANG_SECRET_KEY;
const vendorId = env.COUPANG_VENDOR_ID;
if (!accessKey || !secretKey || !vendorId) throw new Error('Missing required Coupang env vars');

function auth(method, requestPath, query='') {
  const signedDate = new Date().toISOString().replace(/[-:]/g,'').slice(2,15)+'Z';
  const message = signedDate + method + requestPath + query;
  const signature = crypto.createHmac('sha256', secretKey).update(message).digest('hex');
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;
}
function requestJson(method, requestPath, params={}) {
  const qs = new URLSearchParams(params).toString();
  const url = new URL(baseUrl + requestPath + (qs ? '?' + qs : ''));
  return new Promise((resolve, reject) => {
    const req = https.request(url, {method, headers: {Authorization: auth(method, requestPath, qs), 'Content-Type':'application/json;charset=UTF-8'}}, res => {
      let data=''; res.on('data', c=>data+=c); res.on('end',()=>{
        let parsed; try { parsed=JSON.parse(data); } catch {}
        resolve({statusCode: res.statusCode, parsed, text: data});
      });
    });
    req.on('error', reject); req.end();
  });
}
const statuses = ['ACCEPT','INSTRUCT','DEPARTURE','DELIVERING','FINAL_DELIVERY','NONE_TRACKING'];
const from = process.argv.find(a=>a.startsWith('--from='))?.slice(7) || '2026-05-16';
const to = process.argv.find(a=>a.startsWith('--to='))?.slice(5) || '2026-06-15';

const productsData = JSON.parse(await fs.readFile(path.join(root, 'data/coupang/openapi-products.json'), 'utf8'));
const products = productsData.products.map(p => ({
  sellerProductId: String(p.sellerProductId), productId: String(p.productId), vendorItemId: String(p.vendorItemId || p.ids?.vendorItemId || ''),
  name: p.displayProductName || p.sellerProductName || p.generalProductName,
}));
const byId = new Map();
for (const p of products) for (const id of [p.sellerProductId, p.productId, p.vendorItemId]) if (id) byId.set(String(id), p);

// Extract first successful/live-ish update timestamp per product slug from local artifacts.
const slugToProduct = {
  // Keep these strict. Broad words like "크림" incorrectly match unrelated products.
  'aqua-lotion': /히알루론산\s*아쿠아\s*로션/i,
  'hyaluronic-toner': /히알루론산\s*토너/i,
  'whitening-cream': /화이트닝\s*톤\s*케어\s*크림/i,
  'cleansing-gel': /로우\s*피에이치\s*클렌징\s*젤|클렌징\s*젤/i,
  'rose-essence': /로즈\s*다마스쿠스\s*토닉\s*에센스/i,
};
const updateRoot = path.join(root, 'data/coupang/update');
const improvements = [];
try {
  const slugs = await fs.readdir(updateRoot);
  for (const slug of slugs) {
    const re = slugToProduct[slug]; if (!re) continue;
    const p = products.find(x => re.test(x.name));
    if (!p) continue;
    const dirs = (await fs.readdir(path.join(updateRoot, slug), {withFileTypes:true})).filter(d=>d.isDirectory()).map(d=>d.name).filter(n=>/^20\d{6}T\d{6}Z/.test(n) && !n.includes('rollback'));
    const successDirs = [];
    for (const d of dirs) {
      const rp = path.join(updateRoot, slug, d, 'update-response.json');
      try {
        const r = JSON.parse(await fs.readFile(rp,'utf8'));
        const code = r.parsed?.code ?? r.code ?? r.data?.code;
        const http = r.statusCode ?? r.status;
        if ((http == null || (http >= 200 && http < 300)) && (code == null || code === 'SUCCESS' || code === 200 || code === 'OK')) successDirs.push(d);
      } catch {}
    }
    if (successDirs.length) {
      successDirs.sort();
      const d = successDirs[0];
      const m=d.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/);
      const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
      improvements.push({...p, slug, firstUpdateUtc: iso, firstUpdateKst: new Date(iso).toLocaleString('sv-SE',{timeZone:'Asia/Seoul'}), artifacts: successDirs.length});
    }
  }
} catch {}

const orders = [];
const errors = [];
for (const status of statuses) {
  let nextToken = undefined;
  for (let page=0; page<200; page++) {
    const params = {createdAtFrom: from, createdAtTo: to, status, maxPerPage: '50'};
    if (nextToken) params.nextToken = nextToken;
    const r = await requestJson('GET', `/v2/providers/openapi/apis/api/v4/vendors/${vendorId}/ordersheets`, params);
    if (!(r.statusCode >= 200 && r.statusCode < 300) || !r.parsed || !(r.parsed.code === 200 || r.parsed.code === 'SUCCESS')) {
      errors.push({status, httpStatus: r.statusCode, code: r.parsed?.code ?? null, message: r.parsed?.message ?? String(r.text).slice(0,200)}); break;
    }
    const data = r.parsed.data || [];
    const rows = Array.isArray(data) ? data : (data.ordersheets || data.orders || []);
    for (const os of rows) {
      const items = os.orderItems || os.items || [];
      for (const item of items) {
        const idCandidates = [item.vendorItemId, item.sellerProductId, item.productId, item.sellerProductItemId].filter(v=>v!=null).map(String);
        let p = idCandidates.map(id=>byId.get(id)).find(Boolean);
        if (!p) {
          const nm = item.sellerProductName || item.productName || item.vendorItemName || item.itemName || '';
          p = products.find(x => nm && (nm.includes(x.name) || x.name.includes(nm)));
        }
        const qty = Number(item.shippingCount ?? item.orderCount ?? item.quantity ?? 0) || 0;
        const amount = Number(item.orderPrice ?? item.salesPrice ?? item.instantCouponDiscount ?? 0) || 0;
        orders.push({
          status,
          orderId: String(os.orderId ?? os.orderSheetNo ?? ''),
          orderedAt: os.orderedAt || os.createdAt || os.paidAt || os.orderDate || null,
          productName: p?.name || item.sellerProductName || item.productName || item.vendorItemName || 'UNKNOWN',
          sellerProductId: p?.sellerProductId || item.sellerProductId || null,
          productId: p?.productId || item.productId || null,
          vendorItemId: p?.vendorItemId || item.vendorItemId || null,
          qty,
          amount,
          cancelled: Boolean(item.cancelCount || item.cancelYn === 'Y' || item.cancelStatus),
        });
      }
    }
    nextToken = r.parsed.nextToken || r.parsed.data?.nextToken || r.parsed.pagination?.nextToken;
    if (!nextToken) break;
  }
}

function dayKst(s) { if (!s) return null; const d = new Date(s); if (Number.isNaN(d.getTime())) return String(s).slice(0,10); return d.toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'}); }
function dtKstMs(s) { const d = new Date(s); return Number.isNaN(d.getTime()) ? null : d.getTime(); }

const agg = new Map();
for (const p of products) agg.set(p.sellerProductId, { ...p, orderLines:0, qty:0, amount:0, byStatus:{}, daily:{}, orders:[] });
for (const o of orders) {
  const key = o.sellerProductId || 'unknown';
  if (!agg.has(key)) agg.set(key, { sellerProductId:key, productId:o.productId, vendorItemId:o.vendorItemId, name:o.productName, orderLines:0, qty:0, amount:0, byStatus:{}, daily:{}, orders:[] });
  const a=agg.get(key); a.orderLines++; a.qty+=o.qty; a.amount+=o.amount; a.byStatus[o.status]=(a.byStatus[o.status]||0)+o.qty; const day=dayKst(o.orderedAt)||'unknown'; a.daily[day]=(a.daily[day]||0)+o.qty; a.orders.push(o);
}
const productRows = [...agg.values()].sort((a,b)=>b.amount-a.amount || b.qty-a.qty).map(a=>({sellerProductId:a.sellerProductId, vendorItemId:a.vendorItemId, productId:a.productId, name:a.name, orderLines:a.orderLines, qty:a.qty, amount:a.amount, byStatus:a.byStatus, daily:a.daily}));

const improvedRows = improvements.map(im => {
  const a = agg.get(im.sellerProductId) || {orders:[], qty:0, amount:0};
  const cut = new Date(im.firstUpdateUtc).getTime();
  const before = a.orders.filter(o => { const t=dtKstMs(o.orderedAt); return t!=null && t < cut; });
  const after = a.orders.filter(o => { const t=dtKstMs(o.orderedAt); return t!=null && t >= cut; });
  const sum = arr => ({lines: arr.length, qty: arr.reduce((s,o)=>s+o.qty,0), amount: arr.reduce((s,o)=>s+o.amount,0)});
  const b=sum(before), af=sum(after);
  const daysBefore = Math.max(0.01, (cut - new Date(from+'T00:00:00+09:00').getTime())/86400000);
  const daysAfter = Math.max(0.01, (new Date(to+'T23:59:59+09:00').getTime() - cut)/86400000);
  return {...im, before:b, after:af, beforeQtyPerDay:b.qty/daysBefore, afterQtyPerDay:af.qty/daysAfter, liftPct: b.qty===0 ? (af.qty>0 ? null : 0) : ((af.qty/daysAfter)/(b.qty/daysBefore)-1)*100};
});
const result = {generatedAtKst: new Date().toLocaleString('sv-SE',{timeZone:'Asia/Seoul'}), range:{from,to}, statusBuckets:statuses, apiErrors:errors, total:{orderLines:orders.length, qty:orders.reduce((s,o)=>s+o.qty,0), amount:orders.reduce((s,o)=>s+o.amount,0)}, products:productRows, improvements:improvedRows};
await fs.mkdir(path.join(root,'data/coupang/analysis'),{recursive:true});
const out = path.join(root,'data/coupang/analysis/monthly-sales-image-lift-20260615.json');
await fs.writeFile(out, JSON.stringify(result,null,2));
console.log(JSON.stringify({ok: errors.length===0, output: out, generatedAtKst: result.generatedAtKst, range: result.range, total: result.total, products: productRows.map(p=>({name:p.name, qty:p.qty, amount:p.amount})), improvements: improvedRows.map(r=>({slug:r.slug,name:r.name,firstUpdateKst:r.firstUpdateKst,before:r.before,after:r.after,beforeQtyPerDay:+r.beforeQtyPerDay.toFixed(3),afterQtyPerDay:+r.afterQtyPerDay.toFixed(3),liftPct:r.liftPct==null?null:+r.liftPct.toFixed(1)})), errors}, null, 2));

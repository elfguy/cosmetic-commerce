#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const sellerProductId = '15704749086';
const args = new Set(process.argv.slice(2));
const execute = process.env.COUPANG_APPROVAL_EXECUTE === '1' && args.has('--execute') && args.has('--i-understand-this-requests-coupang-approval');
async function loadEnv(){const text=await fs.readFile(path.join(root,'.env.local'),'utf8'); for(const raw of text.split(/\r?\n/)){const m=raw.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/); if(m&&!process.env[m[1]]) process.env[m[1]]=m[2].trim().replace(/^["']|["']$/g,'');}}
function auth(method,requestPath,query=''){const d=new Date().toISOString().slice(2,19).replace(/[-:]/g,'')+'Z'; const sig=crypto.createHmac('sha256',process.env.COUPANG_SECRET_KEY).update(d+method+requestPath+query).digest('hex'); return `CEA algorithm=HmacSHA256, access-key=${process.env.COUPANG_ACCESS_KEY}, signed-date=${d}, signature=${sig}`;}
function req(method,requestPath){return new Promise((resolve,reject)=>{const base=new URL(process.env.COUPANG_API_BASE_URL||'https://api-gateway.coupang.com'); const r=https.request({host:base.host,method,path:requestPath,timeout:60000,headers:{'Content-Type':'application/json;charset=UTF-8',Authorization:auth(method,requestPath)}},res=>{let text='';res.setEncoding('utf8');res.on('data',c=>text+=c);res.on('end',()=>{let parsed=null;try{parsed=JSON.parse(text)}catch{};resolve({statusCode:res.statusCode,statusMessage:res.statusMessage,parsed,text})})}); r.on('error',reject); r.end();});}
await loadEnv();
const approvalPath = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${sellerProductId}/approvals`;
if(!execute){ console.log(JSON.stringify({ok:true,mode:'dry-run',sellerProductId,approvalPath,note:'No approval request sent'},null,2)); process.exit(0); }
const r=await req('PUT', approvalPath);
const outDir=path.join(root,'data/coupang/update/hyaluronic-toner/approval-'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z'));
await fs.mkdir(outDir,{recursive:true}); await fs.writeFile(path.join(outDir,'approval-response.json'),JSON.stringify({statusCode:r.statusCode,statusMessage:r.statusMessage,parsed:r.parsed,text:r.parsed?undefined:r.text},null,2));
console.log(JSON.stringify({ok:r.statusCode>=200&&r.statusCode<300&&r.parsed?.code!=='ERROR',outDir,statusCode:r.statusCode,statusMessage:r.statusMessage,code:r.parsed?.code??null,message:r.parsed?.message??null,data:r.parsed?.data??null},null,2));

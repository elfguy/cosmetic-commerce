import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const v4=path.join(root,'public/coupang/images/aqua-lotion/versions/v4');
const files=Array.from({length:10},(_,i)=>String(i+1).padStart(2,'0'));
const html=`<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#eee8de;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',sans-serif;color:#111}.page{width:1800px;padding:36px}h1{font-size:42px;margin:0 0 20px}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:22px}.card{background:#fff;border-radius:18px;padding:14px;box-shadow:0 6px 18px #0002}.label{font-size:24px;font-weight:800;margin-bottom:10px}.imgwrap{height:720px;background:#f5f5f5;border-radius:12px;overflow:hidden;display:flex;align-items:flex-start;justify-content:center}.imgwrap img{height:100%;width:100%;object-fit:contain}.note{font-size:20px;line-height:1.4;margin-top:18px;color:#5b5148}
</style></head><body><div class="page"><h1>아쿠아로션 V4 GPT Web 생성본 검수용 Contact Sheet</h1><div class="grid">${files.map(n=>`<div class="card"><div class="label">V4 상세 ${n}</div><div class="imgwrap"><img src="file://${v4}/detail/${n}.png"></div></div>`).join('')}</div><div class="note">라벨은 contact sheet용 외부 표기이며 원본 PNG에는 포함되지 않음. 원본 개별 파일은 detail/01.png~10.png.</div></div></body></html>`;
const htmlPath=path.join(v4,'v4-detail-contact-sheet.html');
const pngPath=path.join(v4,'v4-detail-contact-sheet.png');
await fs.writeFile(htmlPath,html);
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1800,height:1800},deviceScaleFactor:1});
await page.goto('file://'+htmlPath);
await page.screenshot({path:pngPath, fullPage:true});
await browser.close();
console.log(pngPath);

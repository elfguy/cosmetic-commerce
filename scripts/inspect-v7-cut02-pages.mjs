import { chromium } from 'playwright';

function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages().filter(p => p.url().startsWith('https://chatgpt.com/'));
for (const p of pages) {
  let data;
  try {
    data = await p.evaluate(() => ({
      url: location.href,
      title: document.title,
      text: document.body.innerText,
      imgs: Array.from(document.images).map((img,i)=>({i,alt:img.alt,src:img.currentSrc||img.src,w:img.naturalWidth,h:img.naturalHeight,rect:(()=>{const r=img.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}})()})).filter(x=>x.src&&x.src.includes('backend-api/estuary/content'))
    }));
  } catch { continue; }
  const isCut02 = data.text.includes('아쿠아로션 상세페이지 02번') || data.imgs.some(x => (x.alt||'').includes('cut02-ref'));
  if (!isCut02) continue;
  console.log('\nPAGE', data.url, data.title);
  console.log('text tail:', data.text.slice(-800).replace(/\n/g,' | '));
  for (const x of data.imgs.map(x=>({...x,id:getId(x.src)}))) {
    if (x.w >= 500 || x.h >= 500 || (x.alt||'').includes('cut02')) {
      console.log(JSON.stringify({i:x.i,id:x.id,w:x.w,h:x.h,alt:x.alt,y:x.rect.y,displayW:x.rect.w,displayH:x.rect.h}));
    }
  }
}

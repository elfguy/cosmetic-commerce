import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages().map((p,i)=>({i,url:p.url()}));
console.log('pages', JSON.stringify(pages,null,2));
const page = ctx.pages().reverse().find(p=>p.url().startsWith('https://chatgpt.com/images'));
if (!page) throw new Error('no images page');
await page.bringToFront();
const data = await page.evaluate(() => ({
  url: location.href,
  title: document.title,
  body: document.body.innerText.slice(0,5000),
  tail: document.body.innerText.slice(-5000),
  promptText: document.querySelector('#prompt-textarea')?.innerText,
  textarea: document.querySelector('textarea')?.value,
  buttons: Array.from(document.querySelectorAll('button')).map((b,i)=>({i,text:b.innerText,aria:b.getAttribute('aria-label'),disabled:b.disabled,id:b.id,testid:b.getAttribute('data-testid')})).filter(x=>x.text||x.aria||x.id||x.testid).slice(-80),
  files: Array.from(document.querySelectorAll('input[type=file]')).map((x,i)=>({i,id:x.id,testid:x.getAttribute('data-testid')})),
  imgs: Array.from(document.images).map((img,i)=>({i,alt:img.alt,src:img.currentSrc||img.src,w:img.naturalWidth,h:img.naturalHeight})).filter(x=>x.src.includes('backend-api/estuary/content')).slice(0,60)
}));
console.log(JSON.stringify(data,null,2));

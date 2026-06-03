import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);
console.log('url', page.url());
console.log('title', await page.title());
const info = await page.evaluate(() => {
  const q = (sel) => Array.from(document.querySelectorAll(sel)).map((el) => ({tag: el.tagName, text: (el.innerText||el.getAttribute('aria-label')||el.placeholder||'').slice(0,120), id: el.id, cls: el.className?.toString().slice(0,100), type: el.getAttribute('type'), aria: el.getAttribute('aria-label')})).slice(0,50);
  return {inputs:q('input, textarea, [contenteditable="true"], button'), body: document.body.innerText.slice(0,1000)};
});
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: '/Users/elfguy/alba/cosmetic-commerce/tmp-chatgpt-new.png', fullPage: true });
await browser.close();

import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images', {waitUntil:'domcontentloaded', timeout:60000});
await page.waitForTimeout(5000);
const data = await page.evaluate(() => ({
  url: location.href,
  title: document.title,
  body: document.body.innerText.slice(0,4000),
  elements: Array.from(document.querySelectorAll('button,a,input,textarea,[contenteditable="true"],[role="textbox"]')).map((el,i)=>({
    i, tag:el.tagName, text:(el.innerText||el.getAttribute('aria-label')||el.getAttribute('placeholder')||'').trim().replace(/\n/g,' | ').slice(0,200), aria:el.getAttribute('aria-label'), href:el.getAttribute('href'), type:el.getAttribute('type'), id:el.id, cls:(el.className||'').toString().slice(0,100)
  })).filter(e=>e.text||e.aria||e.href||e.type).slice(0,200)
}));
console.log(JSON.stringify(data,null,2));
await page.screenshot({path:'/Users/elfguy/alba/cosmetic-commerce/tmp-chatgpt-images-page.png', fullPage:true});

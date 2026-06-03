import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/', {waitUntil:'domcontentloaded', timeout:60000});
await page.waitForTimeout(5000);
const data = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('a,button,[role="menuitem"],[aria-label]')).map((el,i)=>({
    i,
    tag:el.tagName,
    text:(el.innerText||'').trim().slice(0,120),
    aria:el.getAttribute('aria-label'),
    href:el.getAttribute('href'),
    id:el.id,
    cls:(el.className||'').toString().slice(0,100)
  }));
  return {
    url: location.href,
    title: document.title,
    matches: els.filter(e => /이미지|image|사진|그림|create|생성|GPT|도구|tools|캔버스|canvas/i.test(`${e.text} ${e.aria} ${e.href}`)).slice(0,200),
    body: document.body.innerText.slice(0,3000)
  };
});
console.log(JSON.stringify(data,null,2));
await page.screenshot({path:'/Users/elfguy/alba/cosmetic-commerce/tmp-chatgpt-image-tool-search.png', fullPage:true});

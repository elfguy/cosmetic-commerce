import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
let page = ctx.pages().find(p=>p.url()==='https://chatgpt.com/' || p.url().startsWith('https://chatgpt.com/?')) || await ctx.newPage();
if (!page.url().startsWith('https://chatgpt.com')) await page.goto('https://chatgpt.com/', {waitUntil:'domcontentloaded'});
await page.bringToFront();
await page.waitForTimeout(2000);
async function dump(label){
 const data=await page.evaluate(()=>Array.from(document.querySelectorAll('a,button,[role="menuitem"]')).map((el,i)=>({i,tag:el.tagName,text:(el.innerText||'').trim().replace(/\n/g,' | ').slice(0,160),aria:el.getAttribute('aria-label'),href:el.getAttribute('href')})).filter(e=>e.text||e.aria||e.href).slice(0,160));
 console.log('\n## '+label); console.log(JSON.stringify(data,null,2));
}
await dump('initial');
for (const name of ['앱','더 보기','라이브러리']) {
 const loc = page.getByText(name, {exact:true}).first();
 if (await loc.count()) {
   console.log('click', name);
   await loc.click().catch(e=>console.log('click failed', e.message));
   await page.waitForTimeout(2000);
   await dump('after '+name);
   await page.keyboard.press('Escape').catch(()=>{});
   await page.waitForTimeout(500);
 }
}
await page.screenshot({path:'/Users/elfguy/alba/cosmetic-commerce/tmp-chatgpt-apps-menu.png', fullPage:true});

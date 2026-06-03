import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const contexts = browser.contexts();
console.log('contexts', contexts.length);
for (const [ci, ctx] of contexts.entries()) {
  const pages = ctx.pages();
  console.log('context', ci, 'pages', pages.length);
  for (const [pi, p] of pages.entries()) {
    console.log(pi, await p.title().catch(()=>''), p.url());
  }
}
await browser.close();

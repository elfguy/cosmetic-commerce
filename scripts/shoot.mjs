// 페이지를 PC/모바일 폭으로 스크린샷. 사용: node scripts/shoot.mjs <path> [...more paths]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = 'http://localhost:4321';
const paths = process.argv.slice(2);
if (paths.length === 0) paths.push('/');

const viewports = [
  { name: 'pc', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

mkdirSync('/tmp/cc-shots', { recursive: true });
const browser = await chromium.launch();
const issues = [];

for (const p of paths) {
  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.name === 'mobile',
    });
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
    const url = base + p;
    await page.goto(url, { waitUntil: 'networkidle' }).catch((e) => issues.push(`${p} goto: ${e.message}`));
    await page.waitForTimeout(350);

    // 가로 스크롤(오버플로) 검사
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      return { scrollW: de.scrollWidth, clientW: de.clientWidth, win: window.innerWidth };
    });
    if (overflow.scrollW > overflow.clientW + 2) {
      issues.push(`${p} [${vp.name}] 가로 오버플로: scrollW=${overflow.scrollW} > clientW=${overflow.clientW}`);
    }
    if (consoleErrors.length) issues.push(`${p} [${vp.name}] console: ${consoleErrors.slice(0, 2).join(' | ')}`);

    const slug = (p === '/' ? 'home' : p.replace(/\//g, '_').replace(/^_|_$/g, '')) || 'home';
    const file = `/tmp/cc-shots/${slug}__${vp.name}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(`shot: ${file}  (scrollW ${overflow.scrollW}/${overflow.clientW})`);
    await ctx.close();
  }
}

await browser.close();
console.log('\n=== ISSUES ===');
console.log(issues.length ? issues.join('\n') : '없음 (가로 오버플로/콘솔에러 없음)');

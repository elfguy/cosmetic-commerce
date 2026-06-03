import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
const targetUrl=(await fs.readFile(path.join(outDir,'prompts/10-chat-url.txt'),'utf8')).trim();
const prompt=`방금 생성한 제조일자/신선함 이미지를 수정한다. 실제 이미지를 다시 생성한다.

[반드시 수정]
- 상단의 “V7” 글자/버전 표시/장식선을 완전히 제거한다.
- 이미지 안에는 버전명, 컷 번호, Point, POINT, CUT, STEP, 페이지 번호 같은 제작용 표식이 절대 없어야 한다.

[유지할 내용]
- 제목: 제조일자는 신선함을 판단하는 가장 정확한 기준입니다.
- 유어스킨플러스: 제조번호와 제조일자를 표기하고 있습니다. 언제 제조했는지 소비자가 바로 확인할 수 있습니다.
- 일부 타사 제품: 제조번호와 사용기한만을 표기하고 있습니다. 언제 제조했는지 실제 제조 시점을 알기 어렵습니다.
- 하단 강조: 유어스킨플러스는 제조일로부터 6개월 이내의 제품만을 출고합니다.
- 하단 주의: 일부 저가로 유통되는 제품들 중에 제조일로부터 상당 기간이 지났거나 사용기한 만료일에 임박한 제품들이 있습니다.

[추가 품질]
- 현재 레이아웃, 좌우 비교 카드, 민트/아쿠아 톤, 바닥면 제조일자 예시는 유지한다.
- 한국어는 선명하고 자연스럽게 유지한다.
- “확인 할수”가 아니라 “확인할 수”로 표기한다.
- “제조일자로부터”가 아니라 “제조일로부터”로 표기한다.
- 과도한 타사 비방 느낌 없이 “일부 타사 제품” 수준으로 유지한다.
- 브라우저/휴대폰 UI, 제품 전체 병/패키지 정면 샷, 치료/효능 보장 표현 금지.
- 780×1360 세로 상세페이지에 맞는 안전 여백.`;
await fs.writeFile(path.join(outDir,'prompts/10-revision-remove-v7-submitted.txt'),prompt);
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
let page=ctx.pages().find(p=>p.url().startsWith(targetUrl));
if(!page){page=await ctx.newPage(); await page.goto(targetUrl,{waitUntil:'domcontentloaded',timeout:60000}); await page.waitForTimeout(5000);}
const before=await page.evaluate(()=>Array.from(document.images).map(img=>img.currentSrc||img.src).filter(src=>src.includes('backend-api/estuary/content')).map(src=>{try{return new URL(src).searchParams.get('id')||src}catch{return src}}));
await fs.writeFile(path.join(outDir,'prompts/10-revision-before-ids.json'),JSON.stringify(before,null,2));
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({timeout:15000});
await page.waitForTimeout(12000);
await fs.writeFile(path.join(outDir,'prompts/10-revision-chat-url.txt'),page.url()+'\n');
await page.screenshot({path:path.join(root,'tmp-v7-cut10-revision-submitted.png'),fullPage:true});
console.log('revision submitted',page.url());
process.exit(0);

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
const refDir=path.join(outDir,'reference');
const targetUrl=(await fs.readFile(path.join(outDir,'prompts/11-product-locked-chat-url.txt'),'utf8')).trim();
const uploadFiles=[
 path.join(outDir,'raw/11-product-locked-gpt.png'),
 path.join(refDir,'cut11-product-lock-01-exact-yourskin-aqua-lotion.png'),
 path.join(refDir,'cut11-product-lock-02-full-product-identity.png'),
];
const prompt=`이전 생성 이미지의 구도와 전체 분위기는 좋다. 같은 780×1360 쿠팡 상세페이지 사용법 컷으로 유지하면서, 제품 병 라벨만 실제 제품 레퍼런스처럼 더 정확하게 수정해줘. 설명만 하지 말고 실제 이미지를 생성해줘.

[유지할 것]
- 현재 구도: 상단 사용 방법 / HOW TO USE, 왼쪽 사용법 카드 2개, 하단 펌프 OPEN 카드, 오른쪽 제품 병.
- 화이트 + 연아쿠아 수분감 + V7 톤앤매너.
- STOP 없음, OPEN 안내만 있음.
- 한국어 사용법 문구는 유지.

[수정할 것 — 제품 라벨]
업로드한 실제 제품 레퍼런스처럼 오른쪽 제품 병 라벨을 표현한다.
라벨에는 다음 요소만 보여야 한다:
- YOURSKIN+
- HYALURONIC ACID
- AQUA LOTION
- 300ml / 10.14 fl.oz

[라벨에서 제거]
- 제품 라벨의 한국어 문장 제거. 예: 히아루론산 아쿠아 로션, 산뜻한 수분 공급, 촉촉한 피부 케어 같은 문구 넣지 말 것.
- 물방울 아이콘/초록 선/장식 아이콘을 라벨 중앙에 넣지 말 것.
- 다른 브랜드명, 다른 제품명, hydronic essence, aqua essence, generic lotion 금지.

[제품 형태]
- 흰색 펌프
- 투명한 원통형 병
- 안쪽은 흰색 로션 내용물
- 흰색 라벨
- 실제 YOURSKIN+ AQUA LOTION 제품처럼 보이게.

[절대 금지]
- STOP 글자/화살표/방향 안내 금지.
- 제품 라벨에 임의 한국어 설명문 추가 금지.
- 한국어 오타/깨짐/잘림 금지.
- 제작용 표식 V7, 11, CUT, STEP, POINT 금지.

구도는 크게 바꾸지 말고 제품 라벨 정확도만 개선한 새 이미지를 생성해줘.`;
await fs.writeFile(path.join(outDir,'prompts/11-product-locked-label-revision-submitted.txt'),prompt);
function getId(src){try{return new URL(src).searchParams.get('id')||src}catch{return src}}
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
let page=ctx.pages().find(p=>p.url().startsWith(targetUrl));
if(!page){page=await ctx.newPage(); await page.goto(targetUrl,{waitUntil:'domcontentloaded',timeout:60000});}
await page.waitForTimeout(3000);
const before=await page.evaluate(()=>Array.from(document.images).map(img=>img.currentSrc||img.src).filter(src=>src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir,'prompts/11-product-locked-label-revision-before-ids.json'),JSON.stringify(before.map(getId),null,2));
await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded revision refs',uploadFiles.length,uploadFiles);
await page.waitForTimeout(10000);
for (const text of ['확인','완료']) { const btn=page.getByRole('button',{name:text}).first(); if(await btn.count()){await btn.click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(1000);} }
const composer=page.locator('#prompt-textarea').last();
await composer.click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({timeout:15000});
await page.waitForTimeout(15000);
await fs.writeFile(path.join(outDir,'prompts/11-product-locked-label-revision-chat-url.txt'),page.url()+'\n');
console.log('submitted revision',{url:page.url(),title:await page.title()});
process.exit(0);

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/elfguy/alba/cosmetic-commerce';
const outDir=path.join(root,'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
const refDir=path.join(outDir,'reference');
const uploadFiles=[
 'cut11-user-01-negative-stop-reference-cropped.png',
 'cut11-user-02-positive-v3-08-photo-reference-cropped.png',
 'cut11-user-03-v7-tone-board.png',
 'cut11-user-04-adjacent-cut10-tone.png',
 'cut11-user-05-current-11-compare-only.png',
].map(f=>path.join(refDir,f));
const prompt=`쿠팡 상세페이지용 세로 이미지 1장을 새로 생성해줘. 설명만 하지 말고 실제 이미지를 생성해줘.

[첨부 이미지 역할]
1) cut11-user-01-negative-stop-reference-cropped.png
- 부정 레퍼런스다. 사용법 컷의 정보 목적과 카드 구조만 참고한다.
- 이 이미지의 STOP 문구, STOP 화살표, STOP 방향 회전 안내는 잘못된 예시다. 절대 복사하지 않는다.
- STOP 방향으로 돌리라는 표현은 펌프 자체가 풀릴 수 있다는 오해를 준다.

2) cut11-user-02-positive-v3-08-photo-reference-cropped.png
- 긍정 레퍼런스다. 펌프와 제품 사진감은 이 이미지가 더 낫다.
- 펌프 클로즈업의 실제 사진 느낌, 제품 상단/펌프 형태, 촉촉한 수분감만 참고한다.
- 단, 이 이미지 안의 STOP 문구/STOP 화살표도 절대 넣지 않는다.

3) cut11-user-03-v7-tone-board.png / cut11-user-04-adjacent-cut10-tone.png
- 최종 톤앤매너 레퍼런스다.
- V7 세트처럼 화이트 + 연아쿠아 + 깨끗한 수분감 + 둥근 흰색 카드형 정보 블록.
- 고급 단독 광고컷이 아니라 밝고 정돈된 쿠팡 상세페이지 정보컷.

4) cut11-user-05-current-11-compare-only.png
- 현재 후보의 문제를 피하기 위한 비교용이다. 그대로 복사하지 않는다.
- AI 글씨 느낌, 펌프 사진 약함, 로컬 조판 티가 나는 느낌을 피한다.

[이번 컷 주제]
사용 방법 / HOW TO USE
히알루론산 아쿠아 로션 사용법과 펌프 OPEN 안내.

[이미지 안 문구]
사용 방법
HOW TO USE

얼굴에 골고루 펴 바른 후
부드럽게 흡수시켜 주세요.

건조한 부위에는
한 번 더 덧발라 주세요.

펌프 헤드를 OPEN 방향으로
살짝 돌려 올린 후 눌러 사용하세요.

무리하게 돌리거나 분리하지 마세요.

[디자인 방향]
- 세로 780×1360 상세페이지 한 컷.
- 상단: 사용 방법 / HOW TO USE. 깨끗하고 여백 있는 제목.
- 중앙: 사용법 2개를 둥근 흰색 카드로 정리. 텍스트가 선명해야 한다.
- 하단 또는 우측: V3 08처럼 실제 사진 느낌의 펌프/제품 클로즈업. 단 OPEN 안내만 표시.
- 펌프 사진은 실제 사진처럼 보여야 하며, 병/펌프가 어색한 3D 장난감처럼 보이면 안 된다.
- 전체는 V7과 이어지는 연아쿠아/화이트 상세페이지 톤.
- 식물/잎사귀는 필수 아님. 넣어도 아주 작게만.

[펌프 안내 절대 규칙]
- OPEN만 표시한다.
- STOP 글자 금지.
- STOP 화살표 금지.
- STOP 방향 안내 금지.
- 잠금/해제 양방향 회전 도식 금지.
- 펌프가 빠지거나 분리되는 것처럼 보이는 그림 금지.
- 무리하게 돌리라는 느낌 금지.

[품질 규칙]
- 한국어 오타/깨짐/잘림 금지.
- AI가 그린 이상한 한글 폰트 느낌 금지. 실제 상세페이지처럼 선명하고 정상적인 폰트.
- V7, v7, 버전명, 컷번호, 11, Point, POINT, CUT, STEP, page 같은 제작용 표식 금지.
- 브라우저 UI, 휴대폰 UI, 검정 상태바 금지.
- 치료/완치/질병개선/효능보장 표현 금지.

최종 결과는 실제 쿠팡 상세페이지에 넣을 수 있는 완성 이미지처럼 만들어줘.`;
await fs.writeFile(path.join(outDir,'prompts/11-user-feedback-submitted.txt'),prompt);
function getId(src){try{return new URL(src).searchParams.get('id')||src}catch{return src}}
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
const page=await ctx.newPage();
await page.goto('https://chatgpt.com/images/',{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(5000);
console.log('workspace',{url:page.url(),title:await page.title()});
const create=page.getByText('이미지 만들기',{exact:true}).first();
if(await create.count()){await create.click({timeout:15000}).catch(()=>{}); await page.waitForTimeout(3000);}
await page.waitForSelector('#prompt-textarea',{timeout:60000});
const before=await page.evaluate(()=>Array.from(document.images).map(img=>img.currentSrc||img.src).filter(src=>src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir,'prompts/11-user-feedback-before-ids.json'),JSON.stringify(before.map(getId),null,2));
await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded refs',uploadFiles.length,uploadFiles);
await page.waitForTimeout(10000);
for (const text of ['확인','완료']) { const btn=page.getByRole('button',{name:text}).first(); if(await btn.count()){await btn.click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(1000);} }
const composer=page.locator('#prompt-textarea').last();
await composer.click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({timeout:15000});
await page.waitForTimeout(15000);
await fs.writeFile(path.join(outDir,'prompts/11-user-feedback-chat-url.txt'),page.url()+'\n');
await page.screenshot({path:path.join(root,'tmp-v7-cut11-user-feedback-submitted.png'),fullPage:true});
console.log('submitted',{url:page.url(),title:await page.title()});
process.exit(0);

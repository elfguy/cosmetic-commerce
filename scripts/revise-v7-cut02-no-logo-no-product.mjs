import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });

const prompt = `방금 만든 02번 이미지를 같은 상세페이지 세트의 두 번째 컷으로 다시 수정해서 생성해줘.

[수정 이유]
- 01번 히어로 컷에 이미 YOURSKIN+ 로고와 제품 병이 충분히 크게 나온다.
- 02번에서도 상단 로고와 제품 병이 다시 크게 나오면 너무 중복되고 답답하다.

[이번 수정 핵심]
- 상단 YOURSKIN+ 로고를 넣지 않는다.
- 제품 병 이미지를 메인으로 넣지 않는다. 가능하면 제품 병은 아예 제외한다.
- 이 컷은 제품 소개가 아니라 “온 가족이 함께 쓰는 산뜻한 데일리 보습”이라는 사용 장면/라이프스타일 컷으로 만든다.
- 밝은 욕실 또는 거실에서 아이와 부모가 함께 스킨케어/보습을 하는 따뜻하고 깨끗한 분위기.
- 인물은 자연스럽고 과장된 광고 포즈가 아니어야 한다.
- 화이트, 아쿠아 블루, 연한 그린 포인트는 유지한다.
- 01번과 같은 프리미엄 한국 쿠팡 모바일 상세페이지 세트처럼 보여야 한다.

[유지할 문구]
큰 문구:
온 가족이 함께 쓰는 산뜻한 데일리 보습

혜택 3개는 아이콘/카드 형태로 간단히:
얼굴부터 건조한 부위까지
끈적임 없이 편안하게
건조하고 민감한 피부에도 데일리 케어

[비율/레이아웃]
- 최종 비율은 780:1360 세로형.
- 나중에 780×1360으로 정규화해도 잘리지 않도록 안전 여백을 둔다.
- 모바일에서 문구가 크고 읽기 쉬워야 한다.
- 작은 본문은 최소화한다.

[금지]
- 상단 로고 금지.
- 큰 제품 병 반복 노출 금지.
- CUT, DETAIL CUT, POINT 01, STEP 01, 독립적인 컷 번호, 숫자 배지, 편집 가이드 라벨 금지.
- EWG VERIFIED 같은 공식 인증 마크 금지.
- 의료적 치료/완치/질병 개선 표현 금지.

위 조건으로 02번 가족 데일리 보습 이미지를 다시 1장 생성해줘.`;

await fs.writeFile(path.join(outDir, 'prompts/02-family-daily-revision-no-logo-no-product-submitted.txt'), prompt);

function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
let page = ctx.pages().find(p => p.url().includes('/c/6a1e22cf-13ec-83ab-83be-a2682abd2f4d'));
if (!page) {
  page = await ctx.newPage();
  await page.goto('https://chatgpt.com/c/6a1e22cf-13ec-83ab-83be-a2682abd2f4d', { waitUntil: 'domcontentloaded', timeout: 60000 });
}
await page.bringToFront();
await page.waitForTimeout(3000);
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/02-revision-before-estuary-ids.json'), JSON.stringify(before.map(src => { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }), null, 2));
console.log('page', page.url(), await page.title());
console.log('before ids', before.map(getId));

await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({ timeout: 15000 });
console.log('revision submitted', page.url());
await fs.writeFile(path.join(outDir, 'prompts/02-revision-chat-url.txt'), page.url() + '\n');

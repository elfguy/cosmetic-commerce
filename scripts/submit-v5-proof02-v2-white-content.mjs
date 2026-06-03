import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v5-gpt-images-workspace');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'detail'), { recursive: true });
await fs.mkdir(path.join(outDir, 'representative'), { recursive: true });

const userRef = '/Users/elfguy/.hermes/image_cache/img_456aa1629fa7.png';
const userRefDest = path.join(outDir, 'reference/v5-proof02-product-white-opaque-content-reference.png');
await fs.copyFile(userRef, userRefDest);

const refs = [
  [userRefDest, 'user attached product reference: transparent bottle with opaque white lotion inside'],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/01.png'), 'V2 detail 01 design style reference'],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/02.png'), 'V2 detail 02 mobile long detail-page ratio/style reference'],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/representative/01.png'), 'V2 representative clean aqua style reference'],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/representative/01.png'), 'original product photo and label reference'],
];
const uploadFiles = refs.map(([file]) => file);

const prompt = `아쿠아로션 상세페이지 V5 proof02 — 01번 히어로 이미지를 새로 생성한다.
반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[가장 중요한 수정 피드백]
- 전체 디자인/레이아웃/톤은 첨부한 V2 상세페이지 디자인처럼 한다. 깨끗한 흰색, 아쿠아 블루, 모바일 상세페이지용 프리미엄 수분감.
- 단, 제품 병 표현은 반드시 사용자가 첨부한 제품 기준 이미지를 따른다.
- 병 전체가 흰색 플라스틱처럼 보이면 불합격이다.
- 용기는 투명 PET/투명 플라스틱 병이어야 한다.
- 병 안의 내용물은 불투명한 우유빛 흰색 로션/제품으로 표현한다.
- 상단 어깨와 목 부분에는 투명 용기 특유의 회색 반사광, 유리/플라스틱 경계, 비어 보이는 투명 공간이 보여야 한다.
- 라벨 뒤나 라벨 아래쪽에는 흰색 내용물이 차 있는 느낌이 보여야 한다. 내용물은 맑은 물이 아니라 불투명한 흰색 로션이다.
- 제품 하단도 흰색 내용물이 차 있어서 부드러운 아이보리/우유빛으로 보여야 한다.
- 펌프는 흰색 펌프, 라벨은 실제 제품처럼 YOURSKIN+, HYALURONIC ACID AQUA LOTION, 300ml를 유지한다.

[히어로 이미지 구성]
- 세로형 긴 모바일 상세페이지 비율, 약 941×1672.
- 중앙 또는 약간 하단에 제품 1개를 크게 배치.
- V2처럼 깨끗하고 넓은 여백, 물결, 물방울, 병풀잎, 아쿠아 배경.
- 큰 한국어 문구:
  히알루론산 아쿠아 로션
  수분 · 진정 · 보호를 한 번에
- 보조 문구:
  끈적임 없이 산뜻하게
  제조 6개월 이내 신선 제품 보장
- 작은 혜택 칩: 수분충전, 피부진정, 무향, 약산성

[금지]
- CUT, DETAIL CUT, POINT 01, STEP 01, 독립적인 컷 번호, 숫자 배지, 편집 가이드 라벨 금지.
- STOP, 잠금 방향, 펌프 돌리는 설명 금지.
- EWG VERIFIED나 공식 인증처럼 보이는 로고/마크 금지.
- 의료적 치료/완치/질병 개선 표현 금지.
- 병이 통째로 불투명 흰색 플라스틱처럼 보이는 표현 금지.

첨부 이미지들을 참고해 V2 디자인 톤으로, 제품은 투명 용기 안에 불투명한 흰색 내용물이 든 모습으로 정확하게 1장 생성해줘.`;

await fs.writeFile(path.join(outDir, 'prompts/02-proof-v2-white-content-submitted.txt'), prompt);

function estuaryIds(urls) {
  return urls.map((src) => {
    try { return new URL(src).searchParams.get('id') || src; } catch { return src; }
  }).filter(Boolean);
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);

const title = await page.title();
const body = await page.locator('body').innerText({ timeout: 10000 });
if (!title.includes('Images') && !body.includes('이미지 만들기')) {
  throw new Error(`Not on Images workspace: title=${title}`);
}
console.log('workspace verified', { url: page.url(), title });

const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) {
  await create.click({ timeout: 15000 }).catch(async () => {
    await page.locator('button').filter({ hasText: '이미지 만들기' }).first().click({ timeout: 15000 });
  });
  await page.waitForTimeout(3000);
}

await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
console.log('before ids', estuaryIds(before));

await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded refs', uploadFiles.length, refs.map(([, label]) => label));
await page.waitForTimeout(10000);

for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) {
    await btn.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }
}

await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({ timeout: 15000 });
console.log('submitted', { url: page.url(), title: await page.title() });
await page.screenshot({ path: path.join(root, 'tmp-v5-proof02-v2-white-content-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/02-proof-v2-white-content-chat-url.txt'), page.url() + '\n');

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v6-product-swap');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'detail'), { recursive: true });
await fs.mkdir(path.join(outDir, 'representative'), { recursive: true });

const v2Base = path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/01.png');
const productRef = '/Users/elfguy/.hermes/image_cache/img_456aa1629fa7.png';
const v2BaseDest = path.join(outDir, 'reference/v2-detail-01-base-keep-everything.png');
const productRefDest = path.join(outDir, 'reference/product-transparent-bottle-opaque-white-content.png');
await fs.copyFile(v2Base, v2BaseDest);
await fs.copyFile(productRef, productRefDest);

const uploadFiles = [v2BaseDest, productRefDest];

const prompt = `이미지 편집 작업이다. 새 디자인을 만들지 말고, 첨부 1번 이미지를 베이스 캔버스로 그대로 사용한다.

[첨부 이미지]
1) v2-detail-01-base-keep-everything.png: 최종 결과의 베이스 이미지. 이 이미지의 디자인이 좋으므로 그대로 유지한다.
2) product-transparent-bottle-opaque-white-content.png: 교체할 상품 병의 정확한 외형/내용물 기준 이미지.

[작업 목표]
- 첨부 1번 V2 상세페이지 이미지를 거의 그대로 유지한다.
- 오직 중앙 상품 병 이미지만 첨부 2번 상품 기준 이미지처럼 교체/수정한다.
- 배경, 물결, 물방울, 잎, 색감, 레이아웃, 여백, 문구 위치, 폰트 느낌, 전체 분위기는 V2 원본과 최대한 동일하게 유지한다.
- 한국어 문구를 새로 쓰거나 바꾸지 말고, 원본 V2 이미지의 문구 배치와 느낌을 유지한다.

[상품 병 교체 기준 — 매우 중요]
- 기존 병을 통흰색 플라스틱처럼 보이게 만들지 않는다.
- 용기는 투명 PET/투명 플라스틱 병이다.
- 병 안의 내용물은 불투명한 우유빛 흰색 로션/제품이다.
- 상단 어깨/목 부분은 투명 용기 특유의 반사광과 비어 보이는 투명 공간이 보여야 한다.
- 라벨 아래와 하단은 불투명한 흰색 내용물이 차 있는 느낌이어야 한다.
- 펌프는 흰색 펌프, 라벨은 YOURSKIN+, HYALURONIC ACID AQUA LOTION, 300ml 제품 느낌을 유지한다.

[금지]
- 전체 상세페이지 디자인을 새로 만들지 말 것.
- 배경/문구/레이아웃을 바꾸지 말 것.
- 추가 문구, CUT, POINT, STEP, 숫자 배지, 가이드 라벨을 넣지 말 것.
- 병 전체를 흰색 플라스틱 병처럼 만들지 말 것.

결과는 첨부 1번과 같은 세로형 상세페이지 이미지로, 상품 병만 첨부 2번 기준으로 자연스럽게 교체한 실제 이미지 1장으로 생성해줘.`;

await fs.writeFile(path.join(outDir, 'prompts/01-v2-product-swap-submitted.txt'), prompt);

function ids(urls) {
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
console.log('before ids', ids(before));

await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded refs', uploadFiles.length, uploadFiles);
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
await page.screenshot({ path: path.join(root, 'tmp-v6-v2-product-swap-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/01-v2-product-swap-chat-url.txt'), page.url() + '\n');

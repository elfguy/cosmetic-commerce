import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'detail'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });

// Keep the accepted first cut as cut 01 in this sequential version.
const accepted01 = path.join(root, 'public/coupang/images/aqua-lotion/versions/v6-product-swap-780/detail/01.png');
const dest01 = path.join(outDir, 'detail/01.png');
try { await fs.copyFile(accepted01, dest01); } catch {}

const refs = [
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/02.png'), path.join(outDir, 'reference/cut02-ref-v2-detail-02-tone-layout.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v6-product-swap-780/detail/01.png'), path.join(outDir, 'reference/cut02-ref-approved-cut01-style.png')],
  ['/Users/elfguy/.hermes/image_cache/img_456aa1629fa7.png', path.join(outDir, 'reference/cut02-ref-product-transparent-bottle-white-lotion.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 02번 이미지를 1장 생성한다. 반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[첨부 이미지]
1) cut02-ref-v2-detail-02-tone-layout.png: 02번 컷의 기본 톤, 긴 모바일 상세페이지 비율, 깨끗한 흰색/아쿠아 느낌, 가독성 참고.
2) cut02-ref-approved-cut01-style.png: 이미 통과한 01번과 같은 제품/브랜드/아쿠아 블루/그린 포인트 스타일 참고.
3) cut02-ref-product-transparent-bottle-white-lotion.png: 제품 병 표현의 정확한 기준. 반드시 이 병처럼 투명 용기 + 흰색 내용물 느낌을 유지.

[이번 컷 주제]
02 가족 데일리 보습
- 온 가족이 함께 쓰는 산뜻한 데일리 보습.
- 아이/부모가 함께 있는 밝은 욕실 또는 거실 느낌.
- 너무 인물 광고처럼 과장하지 말고, 깨끗하고 따뜻한 가족 데일리 케어 분위기.
- 제품은 화면의 중요한 위치에 자연스럽게 배치한다.

[반드시 들어갈 큰 문구]
온 가족이 함께 쓰는 산뜻한 데일리 보습

[아이콘/혜택 3개]
얼굴부터 건조한 부위까지
끈적임 없이 편안하게
건조하고 민감한 피부에도 데일리 케어

[스타일]
- 한국 쿠팡/네이버 모바일 상세페이지용 프리미엄 스킨케어 이미지.
- 최종 비율은 780:1360 세로형. 나중에 780×1360으로 정규화해도 잘리지 않도록 안전 여백을 둔다.
- 깨끗한 흰색 배경, 아쿠아 블루 물결/물방울, 자연 그린 포인트.
- 01번과 같은 YOURSKIN+ 아쿠아로션 상세페이지 세트처럼 보여야 한다.
- 문구는 크게, 짧게, 모바일에서 읽기 쉽게. 작은 본문은 최소화한다.
- 이미지 안에 컷 번호나 편집용 라벨을 절대 넣지 않는다.

[제품 병 표현 — 매우 중요]
- 제품 용기 전체가 통흰색 플라스틱처럼 보이면 안 된다.
- 용기는 투명 PET/투명 플라스틱 병이다.
- 병 안의 내용물은 불투명한 우유빛 흰색 로션이다.
- 상단 어깨/목 부분은 투명 용기 특유의 반사광과 비어 보이는 투명 공간이 보여야 한다.
- 라벨 아래와 하단은 불투명한 흰색 내용물이 차 있는 느낌이어야 한다.
- 펌프는 흰색 펌프, 라벨은 YOURSKIN+, HYALURONIC ACID AQUA LOTION, 300ml 제품 느낌을 유지한다.

[금지]
- CUT, DETAIL CUT, POINT 01, STEP 01, 독립적인 컷 번호, 숫자 배지, 편집 가이드 라벨 금지.
- STOP, 잠금 방향, 펌프 돌리는 사용법 설명 금지.
- EWG VERIFIED 같은 공식 인증 로고/마크 금지.
- 의료적 치료/완치/질병 개선 표현 금지.
- 병 전체를 흰색 플라스틱 병으로 만들지 말 것.
- 투명한 물처럼 내용물을 표현하지 말 것.

위 조건으로 02번 가족 데일리 보습 상세페이지 이미지를 1장 생성해줘.`;

await fs.writeFile(path.join(outDir, 'prompts/02-family-daily-submitted.txt'), prompt);

function idOf(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
function ids(urls) { return urls.map(idOf).filter(Boolean); }

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
await fs.writeFile(path.join(outDir, 'prompts/02-before-estuary-ids.json'), JSON.stringify(ids(before), null, 2));
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
await page.screenshot({ path: path.join(root, 'tmp-v7-cut02-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/02-chat-url.txt'), page.url() + '\n');

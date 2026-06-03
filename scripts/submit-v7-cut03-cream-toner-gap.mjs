import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });
await fs.mkdir(path.join(outDir, 'detail'), { recursive: true });

const refs = [
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/01.png'), path.join(outDir, 'reference/cut03-ref-approved-01-hero.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/02.png'), path.join(outDir, 'reference/cut03-ref-approved-02-family.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/representative/01.png'), path.join(outDir, 'reference/cut03-ref-v2-representative-01.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/01.png'), path.join(outDir, 'reference/cut03-ref-v2-detail-01.png')],
  ['/Users/elfguy/.hermes/image_cache/img_456aa1629fa7.png', path.join(outDir, 'reference/cut03-ref-product-transparent-bottle-white-lotion.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 03번 이미지를 1장 생성한다. 반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[첨부 이미지]
1) cut03-ref-approved-01-hero.png: 통과/수정 완료된 01번 히어로. 전체 브랜드 톤, 제품 표현, 아쿠아/그린 분위기 참고.
2) cut03-ref-approved-02-family.png: 통과된 02번. 같은 세트의 여백, 밝은 톤, 로고/제품 반복을 피하는 흐름 참고.
3) cut03-ref-v2-representative-01.png: 03번의 제품 중심 구성/프리미엄 느낌 참고.
4) cut03-ref-v2-detail-01.png: 물결 배경, 수분감, 성분 카드/아이콘 느낌 참고.
5) cut03-ref-product-transparent-bottle-white-lotion.png: 제품 병 표현의 정확한 기준.

[이번 컷 주제]
03 크림 부담 대안
- 크림은 무겁고 토너는 부족할 때, 산뜻하게 채우는 데일리 아쿠아 로션.
- 01번 히어로와 완전히 같은 제품 단독 광고처럼 반복하지 말고, “크림/토너 사이의 사용감 대안”을 설명하는 정보형 상세 컷으로 만든다.
- 제품은 중심 요소로 자연스럽게 보이되, 01번처럼 단순히 큰 병 하나만 반복하는 구도는 피한다.
- 물결/수분 레이어/가벼운 텍스처/성분 아이콘을 활용한다.

[반드시 들어갈 큰 문구]
크림은 무겁고 토너는 부족할 때

[보조 문구]
산뜻하게 채우는 데일리 아쿠아 로션

[성분/혜택 아이콘 4개]
수분 충전
산뜻한 사용감
피부 진정
보호막 케어

[구성 제안]
- 상단 또는 중상단에 큰 문구.
- 중앙에는 제품 또는 제품+수분 레이어 그래픽. 단, 01번과 같은 히어로 반복 느낌은 줄인다.
- 주변에는 4개 성분/혜택 아이콘 카드.
- 하단은 깨끗한 여백과 아쿠아 물결로 마무리.

[스타일]
- 한국 쿠팡/네이버 모바일 상세페이지용 프리미엄 스킨케어 이미지.
- 최종 비율은 780:1360 세로형. 나중에 780×1360으로 정규화해도 잘리지 않도록 안전 여백을 둔다.
- 깨끗한 흰색 배경, 아쿠아 블루 물결/물방울, 자연 그린 포인트.
- 01, 02와 같은 YOURSKIN+ 아쿠아로션 상세페이지 세트처럼 보여야 한다.
- 문구는 크게, 짧게, 모바일에서 읽기 쉽게. 작은 본문은 최소화한다.

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
- 제품명을 “데일리 수분 아쿠아 로션”으로 쓰지 말 것. 정식 제품명은 히알루론산 아쿠아 로션 / HYALURONIC ACID AQUA LOTION이다.

위 조건으로 03번 상세페이지 이미지를 1장 생성해줘.`;

await fs.writeFile(path.join(outDir, 'prompts/03-cream-toner-gap-submitted.txt'), prompt);
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);
const title = await page.title();
const body = await page.locator('body').innerText({ timeout: 10000 });
if (!title.includes('Images') && !body.includes('이미지 만들기')) throw new Error(`Not on Images workspace: title=${title}`);
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
await fs.writeFile(path.join(outDir, 'prompts/03-before-estuary-ids.json'), JSON.stringify(before.map(getId), null, 2));
console.log('before ids', before.map(getId));

await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded refs', uploadFiles.length, uploadFiles);
await page.waitForTimeout(10000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({ timeout: 15000 });
console.log('submitted', { url: page.url(), title: await page.title() });
await page.screenshot({ path: path.join(root, 'tmp-v7-cut03-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/03-chat-url.txt'), page.url() + '\n');

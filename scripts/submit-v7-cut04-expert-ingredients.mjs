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
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/01.png'), path.join(outDir, 'reference/cut04-ref-approved-01-hero.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/02.png'), path.join(outDir, 'reference/cut04-ref-approved-02-family.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/03.png'), path.join(outDir, 'reference/cut04-ref-approved-03-target-users.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v1/detail/03.png'), path.join(outDir, 'reference/cut04-ref-v1-detail-03-expert-style.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/01.png'), path.join(outDir, 'reference/cut04-ref-v2-detail-01-water-tone.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/03.png'), path.join(outDir, 'reference/cut04-ref-v2-detail-03-ingredient.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v2/detail/04.png'), path.join(outDir, 'reference/cut04-ref-v2-detail-04-ingredient.png')],
  ['/Users/elfguy/.hermes/image_cache/img_456aa1629fa7.png', path.join(outDir, 'reference/cut04-ref-product-transparent-bottle-white-lotion.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 04번 이미지를 1장 생성한다. 반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[첨부 이미지 역할]
1) cut04-ref-approved-01-hero.png: 통과된 01번. 전체 브랜드 톤/제품 표현 참고.
2) cut04-ref-approved-02-family.png: 통과된 02번. 밝은 세트 톤 참고.
3) cut04-ref-approved-03-target-users.png: 통과된 03번. 앞 컷과 겹치지 않도록 흐름 참고.
4) cut04-ref-v1-detail-03-expert-style.png: 이번 04번에서 가장 중요한 스타일 참조. 전문가/연구소/포뮬러 분석 느낌, 수분 레이어, 분자/버블 그래픽, 성분 설명형 구성을 참고하되 숫자/Point 표기는 절대 따라 하지 않는다.
5) cut04-ref-v2-detail-01-water-tone.png: 아쿠아 물결/깨끗한 수분감 참고.
6) cut04-ref-v2-detail-03-ingredient.png, 7) cut04-ref-v2-detail-04-ingredient.png: 성분 원료 카드 느낌 참고.
8) cut04-ref-product-transparent-bottle-white-lotion.png: 제품 병 표현의 정확한 기준.

[이번 컷 주제]
04 핵심 수분·진정 성분
- 단순한 예쁜 성분 카드가 아니라, V1 3번째 이미지처럼 전문가가 포뮬러를 설명하는 연구소/스킨사이언스 느낌의 상세페이지.
- 제품을 여러 번 반복하지 말 것. 제품 병은 하단 또는 우측에 작게 1개만 보조 배치.
- 주인공은 성분/포뮬러 분석 그래픽이다.

[큰 문구 — 반드시 정확히]
수분부터 진정까지
한 번에 채우는 핵심 성분

[성분 카드 4개 — 반드시 포함]
8종 히알루론산
병풀추출물
해양심층수
Fresh Bud No.6

[각 카드의 짧은 보조 문구]
- 8종 히알루론산: 겹겹이 채우는 수분감
- 병풀추출물: 예민한 피부 진정 케어
- 해양심층수: 산뜻한 수분 밸런스
- Fresh Bud No.6: 식물 유래 보습·진정 성분

[구성 제안]
- 상단: 큰 제목을 진한 네이비/블루로 큼직하게.
- 중상단/중앙: 투명한 물방울, 분자 그래픽, 수분 레이어 단면, 연구소 느낌의 깨끗한 원료 분석 그래픽.
- 중앙~하단: 4개 핵심 성분 카드를 균형 있게 배치. 각 카드에는 원료 이미지/아이콘/짧은 문구.
- 하단: 작은 설명 박스: “수분·진정 원료를 균형 있게 담은 데일리 보습 포뮬러” 정도의 문구. 제품 병은 작게 1개만 가능.

[스타일]
- V1 detail 03처럼 전문가/연구소/스킨사이언스 느낌: 깨끗한 화이트 배경, 아쿠아 블루, 유리 같은 투명 버블, 수분층 단면, 분자 아이콘.
- 하지만 V1의 낡은 느낌/과한 숫자/Point 표기는 쓰지 말고, V7 01~03과 이어지는 프리미엄 모바일 상세페이지 톤으로 현대적으로 정리.
- 쿠팡/네이버 모바일에서 잘 읽히게 한국어 문구는 크게, 작은 본문은 최소화.
- 최종 비율은 780:1360 세로형. 나중에 780×1360으로 정규화해도 잘리지 않도록 안전 여백.

[제품 병 표현 — 매우 중요]
- 병 전체가 통흰색 플라스틱처럼 보이면 안 된다.
- 투명 PET/투명 플라스틱 용기 + 내부 우유빛 흰 로션.
- 상단 어깨/목 부분은 투명 용기 특유의 반사광과 비어 보이는 투명 공간이 보여야 한다.
- 펌프는 흰색, 라벨은 YOURSKIN+, HYALURONIC ACID AQUA LOTION, 300ml 느낌 유지.
- 제품명은 한국어로 쓴다면 반드시 '히알루론산 아쿠아 로션'. '데일리 수분 아쿠아 로션' 금지. '데일리 아쿠아 로션'을 제품명처럼 쓰는 것도 금지.

[금지]
- Point 1, POINT 04, STEP 01, CUT 04, DETAIL CUT, 독립적인 숫자 배지, 하단 페이지 번호 같은 컷 번호 금지.
- 제품 병 여러 개 반복 금지.
- EWG VERIFIED 같은 공식 인증 로고/마크 금지.
- 의료적 치료/완치/질병 개선 표현 금지.
- 한국어 깨짐/의미 없는 글자 금지.

위 조건으로 04번 상세페이지 이미지를 1장 생성해줘.`;

await fs.writeFile(path.join(outDir, 'prompts/04-expert-ingredients-submitted.txt'), prompt);
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
await fs.writeFile(path.join(outDir, 'prompts/04-before-estuary-ids.json'), JSON.stringify(before.map(getId), null, 2));
console.log('before ids', before.map(getId));

await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded refs', uploadFiles.length, uploadFiles);
await page.waitForTimeout(12000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({ timeout: 15000 });
console.log('submitted', { url: page.url(), title: await page.title() });
await page.screenshot({ path: path.join(root, 'tmp-v7-cut04-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/04-chat-url.txt'), page.url() + '\n');

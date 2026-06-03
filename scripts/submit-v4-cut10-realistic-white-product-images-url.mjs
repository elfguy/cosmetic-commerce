import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });
await fs.mkdir(path.join(outDir, 'rejected'), { recursive: true });

const refPairs = [
  ['detail/09.png', 'reference/cut10-realwhite-01-approved-cut09-tone.png'],
  ['detail/11.png', 'reference/cut10-realwhite-02-approved-cut11-tone.png'],
  ['detail/10.png', 'reference/cut10-realwhite-03-current-cut10-needs-more-real-product.png'],
  ['reference/cut10-v3-original-code-date-layout.png', 'reference/cut10-realwhite-04-original-code-date-structure.png'],
  ['reference/cut11-product-lock-01-exact-yourskin-aqua-lotion.png', 'reference/cut10-realwhite-05-real-product-ref.png'],
  ['reference/cut11-product-lock-02-full-product-identity.png', 'reference/cut10-realwhite-06-product-identity-ref.png'],
];
const uploadFiles = [];
for (const [relSrc, relDst] of refPairs) {
  const src = path.join(outDir, relSrc);
  const dst = path.join(outDir, relDst);
  try {
    await fs.stat(src);
    await fs.copyFile(src, dst);
    uploadFiles.push(dst);
  } catch {}
}

const prompt = `쿠팡 모바일 상세페이지용 세로 이미지 1장을 실제 이미지로 생성해 주세요.
반드시 이 ChatGPT Images 이미지 생성 결과물 안에 한국어 텍스트와 제품 클로즈업까지 모두 포함해 주세요. 설명만 하지 마세요.

목표: 히알루론산 아쿠아 로션 V4 상세페이지 10번째 컷 교체.
최종 비율: 780×1360 세로형.

[중요: 작업 위치]
이 이미지는 ChatGPT Images에서 생성하는 완성 이미지여야 합니다. 배경만 만들거나 텍스트 없이 만들지 마세요.

[참고 이미지 역할]
- 업로드한 09번/11번: 가장 중요한 톤앤매너, 폰트 크기, 여백, 흰색/연아쿠아/민트 카드 스타일 기준.
- 업로드한 현재 10번: 이전 개선안이지만 제품 표현이 아직 덜 현실적입니다. 현재보다 제품 바닥 클로즈업을 더 사실적으로 만들어 주세요.
- 업로드한 원본 제조일자 구조: 제조번호+제조일자 vs 제조번호+사용기한 비교 구조 참고.
- 업로드한 실제 제품 레퍼런스: 제품은 투명/흰색 계열이 아니라, 화면에서 깔끔한 흰색 화장품 용기/흰색 바닥면처럼 보이게 표현해 주세요. 용기 바닥 클로즈업은 현실적인 흰색 플라스틱/라벨 바닥 느낌이어야 합니다.

[이번 수정 핵심]
- 제품/바닥면 클로즈업을 더 현실적인 사진처럼 만들어 주세요. 3D 아이콘, 단순 일러스트, 플랫 벡터 느낌 금지.
- 제품 용기는 흰색 화장품 용기처럼 보여야 합니다. 회색/투명/금속/유리 느낌 금지.
- 바닥면에 인쇄된 코드와 날짜가 실제 제품 하단 인쇄처럼 보여야 합니다.
- 단, 제품 전체 병 정면샷은 넣지 말고, 좌우 카드 안의 바닥면 클로즈업만 보여 주세요.
- 09번/11번과 맞도록 제목과 본문 글씨 크기를 과하게 키우지 마세요.
- 전체 톤은 부드러운 흰색, 연아쿠아, 민트그린. 빨간색 큰 경고문 금지.

[반드시 들어갈 한국어 문구 — 아래 문구만 사용]
제목:
제조일자는 신선함의 기준입니다

좌측 카드 제목:
유어스킨플러스

좌측 카드 핵심:
제조번호 + 제조일자 표기

좌측 카드 보조:
소비자가 바로 확인 가능

좌측 바닥면 인쇄 예시:
A2507191
제조 2025.07.19

우측 카드 제목:
일부 타사 제품

우측 카드 핵심:
제조번호 + 사용기한만 표기

우측 카드 보조:
제조 시점 확인 어려움

우측 바닥면 인쇄 예시:
A39
2026.03.29까지

하단 배너:
제조일로부터 6개월 이내 제품만 출고

하단 작은 주의 문구:
제조일이 오래되었거나 사용기한 임박 제품을 주의하세요

[레이아웃]
- 상단: 09/11과 비슷한 작은 제목 스케일, 은은한 물방울/연아쿠아 배경.
- 중앙: 둥근 흰색 카드 2개 좌우 배치.
- 각 카드 중앙에는 실제 흰색 화장품 용기 바닥면 클로즈업 사진 느낌. 흰색 플라스틱/흰색 라벨 바닥에 검정/짙은 회색 인쇄가 찍힌 모습.
- 좌측 바닥면에는 반드시 코드 위, 날짜 아래 형태:
  A2507191
  제조 2025.07.19
- 우측 바닥면에는 반드시 코드 위, 사용기한 아래 형태:
  A39
  2026.03.29까지
- 하단: 민트/연아쿠아 배너와 작은 주의 문구.
- 전체적으로 고급 화장품 상세페이지처럼 깨끗하고 현실감 있게.

[절대 금지]
- 한국어 오타, 깨짐, 이상한 글자, 잘림 금지.
- '신선함' 오타 금지. '신서함', '시선함', '신선합' 금지.
- V4, V7, v7, 버전명, 컷번호, 10, POINT, STEP, CUT, page 같은 제작용 표식 금지.
- 체크 아이콘, GOOD, CHECK, OK, PASS, 인증 배지 금지.
- 제품 전체 병 정면샷 금지. 용기 바닥면 클로즈업만.
- 투명 유리병, 금속 캡, 파란 유리, 임의 브랜드 로고 금지.
- 과도한 빨간색 경고 포스터 느낌 금지.
- 브라우저 UI, 휴대폰 UI, 검정 상태바 금지.
- 치료/완치/질병개선/효능보장 표현 금지.

[검수 기준]
- 09/10/11을 나란히 봤을 때 새 10번이 세트 중 하나처럼 자연스럽게 보여야 합니다.
- 제품 바닥면이 흰색 화장품 용기의 현실적인 클로즈업처럼 보여야 합니다.
- 글씨가 현재 초기 10번처럼 크고 강하면 실패입니다.
- 한국어 문구가 깨지면 실패입니다.`;

await fs.writeFile(path.join(outDir, 'prompts/10-realistic-white-product-images-url-submitted.txt'), prompt);
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut10-realwhite-images-url-opened.png'), fullPage: true });
const title = await page.title();
const bodyText = (await page.locator('body').innerText().catch(() => '')).slice(0, 1200);
console.log('opened-images-workspace', { url: page.url(), title, uploadFiles: uploadFiles.length, hasLogin: /로그인/.test(bodyText) });
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('Not on images URL: ' + page.url());
if (/로그인\s*무료로 회원 가입|무료로 회원 가입/.test(bodyText) && !/이미지 만들기|프롬프트|무엇을/.test(bodyText)) {
  console.error('Looks logged out. Please login on the opened Chrome Images page.');
  process.exit(3);
}
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(3000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/10-realistic-white-product-images-url-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, uploadFiles);
console.log('uploaded refs', uploadFiles);
await page.waitForTimeout(10000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
const composer = page.locator('#prompt-textarea').last();
await composer.click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut10-realwhite-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(15000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut10-realwhite-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/10-realistic-white-product-images-url-chat-url.txt'), page.url() + '\n');
console.log('submitted', { startUrl: 'https://chatgpt.com/images/', finalUrl: page.url(), title: await page.title() });
process.exit(0);

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });
await fs.mkdir(path.join(outDir, 'rejected'), { recursive: true });

const refs = [
  [path.join(outDir, 'detail/09.png'), path.join(outDir, 'reference/cut10-tonefix-01-approved-cut09-tone.png')],
  [path.join(outDir, 'detail/11.png'), path.join(outDir, 'reference/cut10-tonefix-02-approved-cut11-tone.png')],
  [path.join(outDir, 'detail/10.png'), path.join(outDir, 'reference/cut10-tonefix-03-current-cut10-negative-scale.png')],
  [path.join(outDir, 'reference/cut10-v3-original-code-date-layout.png'), path.join(outDir, 'reference/cut10-tonefix-04-original-code-date-layout.png')],
].filter(([src]) => fs.stat(src).then(() => true).catch(() => false));

const uploadFiles = [];
for (const [src, dst] of refs) {
  await fs.copyFile(src, dst);
  uploadFiles.push(dst);
}

const prompt = `쿠팡 모바일 상세페이지용 세로 이미지 1장을 실제로 생성해 주세요. 설명만 하지 말고 이미지를 만들어 주세요.

목표: 히알루론산 아쿠아 로션 V4 상세페이지 10번째 컷 교체 이미지.
중요: 반드시 ChatGPT Images 이미지 생성 결과물 안에 한국어 텍스트까지 자연스럽게 포함해 주세요. 배경만 만들지 마세요.
최종 비율: 780×1360 세로형 상세페이지.

[참고 이미지 역할]
- 업로드한 09번, 11번 이미지는 최우선 스타일/톤/폰트 기준입니다.
- 업로드한 현재 10번 이미지는 문제 참고입니다. 현재 10번처럼 제목을 너무 크게 만들거나, 청록색을 강하게 쓰거나, 빨간 강조 문구를 크게 넣지 마세요.
- 업로드한 원본 제조일자 이미지는 구조 참고입니다. 핵심 구조(상단 제목 → 좌우 비교 카드 → 6개월 이내 출고 문구 → 작은 주의 문구)만 참고하세요.

[이번 수정 핵심]
- 현재 10번은 다른 컷보다 글씨가 너무 크고 포스터처럼 보여서 이질적입니다.
- 09번/11번처럼 부드러운 흰색 + 연아쿠아 + 민트그린 카드형 톤으로 맞춰 주세요.
- 제목 크기를 09번/11번 수준으로 낮추고, 여백을 충분히 주세요.
- 전체 문장 수를 줄여 모바일에서 깔끔하게 읽히게 해 주세요.
- 빨간색/코랄색 강조는 사용하지 않거나 아주 작게만 사용하세요. 세트의 부드러운 aqua/mint 분위기를 우선합니다.

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
- 상단: 작은 물방울/연아쿠아 배경, 제목은 너무 크지 않게. 09/11의 제목 스케일에 맞춤.
- 중앙: 둥근 흰색 카드 2개를 좌우로 배치. 카드 폭은 넉넉하되 내용은 과밀하지 않게.
- 각 카드 안에는 화장품 용기 바닥면 클로즈업을 실제 사진처럼 작고 깔끔하게 넣어 주세요.
- 제품 전체 병 정면샷은 넣지 마세요. 바닥면 클로즈업만 사용합니다.
- 하단: 민트/연아쿠아 배너와 작은 주의 문구. 빨간 큰 문장 금지.
- 배경은 09/11처럼 은은한 물결, 물방울, 깨끗한 여백. 과한 잎사귀 금지.

[절대 금지]
- 한국어 오타, 깨짐, 이상한 글자, 잘림 금지.
- 제목의 '신선함'을 절대 틀리지 마세요. '신서함', '시선함', '신선합' 금지.
- V4, V7, v7, 버전명, 컷번호, 10, POINT, STEP, CUT, page 같은 제작용 표식 금지.
- 체크 아이콘, GOOD, CHECK, OK, PASS, 인증 배지 금지. 양쪽 카드가 둘 다 승인된 것처럼 보이면 실패입니다.
- 과도한 타사 비방 금지. '일부 타사 제품' 표현만 사용하세요.
- 브라우저 UI, 휴대폰 UI, 검정 상태바 금지.
- 치료/완치/질병개선/효능보장 표현 금지.

[검수 기준]
- 09번/11번과 나란히 봤을 때 폰트 크기, 제목 굵기, 여백, 색감이 자연스럽게 이어져야 합니다.
- 현재 10번처럼 제목이 과하게 크면 실패입니다.
- 하단 빨간 강조 문구가 크게 보이면 실패입니다.
- 바닥면 코드와 날짜가 보이고, 제조일자 vs 사용기한 차이가 이해되어야 합니다.`;

await fs.writeFile(path.join(outDir, 'prompts/10-tone-match-revision-submitted.txt'), prompt);

function getId(src) {
  try { return new URL(src).searchParams.get('id') || src; } catch { return src; }
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);
const bodyText = (await page.locator('body').innerText().catch(() => '')).slice(0, 1000);
console.log('workspace', { url: page.url(), title: await page.title(), uploadFiles: uploadFiles.length });
if (/로그인|무료로 회원 가입/.test(bodyText) && !/프롬프트|메시지|무엇을 만들어/.test(bodyText)) {
  console.error('ChatGPT Images is not logged in. Please login in the opened Chrome window, then rerun this script.');
  process.exit(3);
}
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) {
  await create.click({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);
}
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/10-tone-match-revision-before-ids.json'), JSON.stringify(before.map(getId), null, 2));

const uploadSelectors = [
  'input#upload-files',
  'input#upload-photos',
  'input#image-gen-action-modal-upload-photos',
  'input[name="images-app-drop-container-input"]',
  'input[type="file"]'
].join(', ');
await page.setInputFiles(uploadSelectors, uploadFiles);
console.log('uploaded refs', uploadFiles);
await page.waitForTimeout(10000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) {
    await btn.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }
}
const composer = page.locator('#prompt-textarea').last();
await composer.click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(15000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut10-tone-match-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/10-tone-match-revision-chat-url.txt'), page.url() + '\n');
console.log('submitted', { url: page.url(), title: await page.title() });
process.exit(0);

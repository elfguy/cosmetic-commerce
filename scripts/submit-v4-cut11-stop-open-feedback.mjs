import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });
await fs.mkdir(path.join(outDir, 'rejected'), { recursive: true });

const userPumpPhoto = '/Users/elfguy/.hermes/image_cache/img_7ed10d11f80d.jpeg';
const refPairs = [
  ['detail/10.png', 'reference/cut11-stopopen-01-approved-cut10-tone.png'],
  ['detail/12.png', 'reference/cut11-stopopen-02-approved-cut12-tone.png'],
  ['detail/11.png', 'reference/cut11-stopopen-03-current-11-structure.png'],
  ['reference/cut11-product-lock-01-exact-yourskin-aqua-lotion.png', 'reference/cut11-stopopen-04-real-product-ref.png'],
  ['reference/cut11-product-lock-02-full-product-identity.png', 'reference/cut11-stopopen-05-product-identity-ref.png'],
];
const uploadFiles = [];
for (const [relSrc, relDst] of refPairs) {
  const src = path.join(outDir, relSrc);
  const dst = path.join(outDir, relDst);
  try { await fs.stat(src); await fs.copyFile(src, dst); uploadFiles.push(dst); } catch (e) { console.warn('missing ref', relSrc, e.message); }
}
const pumpDst = path.join(outDir, 'reference/cut11-stopopen-06-user-pump-stop-open-photo.jpeg');
try { await fs.copyFile(userPumpPhoto, pumpDst); uploadFiles.push(pumpDst); } catch (e) { console.warn('missing user pump photo', e.message); }

const prompt = `쿠팡 모바일 상세페이지용 세로 이미지 1장을 실제 이미지로 생성해 주세요.
반드시 ChatGPT Images 결과물 안에 한국어 텍스트와 펌프 STOP/OPEN 설명, 제품 펌프 클로즈업까지 모두 포함해 주세요. 설명만 하지 마세요.

목표: 히알루론산 아쿠아 로션 V4 상세페이지 11번째 컷 개선 이미지.
최종 비율: 780×1360 세로형.

[이번 피드백 핵심]
업로드한 실제 펌프 사진을 가장 중요하게 참고하세요.
제품 펌프 위쪽/헤드 주변에는 양각으로 STOP 과 OPEN 글자가 있습니다.
- STOP 방향으로 돌리면 펌프가 잠겨서 눌러도 내려가지 않습니다.
- OPEN 방향으로 돌리면 펌프가 열리고, 눌러서 내용물이 나오게 사용할 수 있습니다.
이 구조가 소비자가 바로 이해되도록 하단 펌프 안내 영역을 개선해 주세요.

[참고 이미지 역할]
- 현재 11번: 전체 컷 구조, 상단 제목, 1·2번 사용법 카드의 느낌은 유지합니다.
- 10번/12번: V4 세트의 흰색 + 연아쿠아 + 민트 카드형 톤, 폰트, 여백 기준입니다.
- 실제 제품/라벨 레퍼런스: YOURSKIN+ HYALURONIC ACID AQUA LOTION 300ml 제품 정체성 참고.
- 사용자 펌프 사진: STOP/OPEN이 펌프 위에 새겨진 실제 구조와 시선 각도 참고. 사진이 흐려도 구조는 반드시 반영하세요.

[레이아웃]
- 상단 55~60%: 기존처럼 깔끔한 사용 방법 영역.
- 하단 40~45%: 펌프 STOP/OPEN 안내를 자세히 보여주는 영역.
- 하단에는 흰색 화장품 펌프 헤드/목 부분의 현실적인 클로즈업을 크게 배치하세요.
- 펌프 윗면 또는 헤드 주변에 STOP / OPEN 글자가 보이게 표현하세요. 실제 제품처럼 양각/음각 느낌이면 좋지만, 소비자가 읽을 수 있게 적절히 선명하게 보정해도 됩니다.
- 작은 설명 카드 2개를 나란히 배치해도 좋습니다: STOP 상태 / OPEN 상태.

[반드시 들어갈 한국어 문구 — 정확히]
제목:
사용 방법

작은 영문:
HOW TO USE

1번 카드:
얼굴에 골고루 펴 바른 후
부드럽게 흡수시켜 주세요.

2번 카드:
건조한 부위에는
한 번 더 덧발라 주세요.

펌프 안내 제목:
펌프 STOP / OPEN 안내

STOP 설명:
STOP 방향으로 돌리면
펌프가 눌리지 않아요.

OPEN 설명:
OPEN 방향으로 돌린 후
눌러서 사용하세요.

하단 작은 주의 문구:
무리하게 돌리거나 분리하지 마세요.

[시각 표현]
- STOP 카드: 잠금 상태. 펌프가 내려가지 않는 느낌. 색은 과한 빨강 경고가 아니라 차분한 그레이/네이비/아쿠아 톤.
- OPEN 카드: 사용 가능 상태. 펌프가 위로 올라와 있고 손가락으로 누를 수 있는 느낌. 색은 아쿠아/민트 포인트.
- 제품 펌프 위의 STOP / OPEN 글자와 회전 방향을 작은 곡선 화살표로 설명하세요.
- 손가락이 펌프를 돌리거나 누르는 장면은 자연스럽게 가능하지만, 손/손가락이 어색하게 잘리거나 과하게 크면 안 됩니다.
- 실제 흰색 플라스틱 펌프와 반투명/흰색 용기 상단 느낌. 평면 아이콘만으로 만들지 마세요.

[절대 금지]
- STOP을 금지하지 마세요. 이번 컷에는 STOP과 OPEN 둘 다 정확히 필요합니다.
- 다만 빨간 경고 포스터처럼 과하게 만들지 마세요.
- STOP 방향으로 돌리면 내용물이 나온다는 식의 반대 설명 금지.
- OPEN 상태에서 펌프가 내려가고 눌러 사용할 수 있다는 설명을 바꾸지 마세요.
- 제품 라벨을 다른 브랜드/가짜 제품으로 바꾸지 마세요.
- 가짜 박스/패키지 추가 금지.
- V4, V7, 컷번호, 11, POINT, STEP, CUT 같은 제작용 표식 금지.
- 한국어 오타/깨짐/잘림 금지.
- 브라우저 UI, 휴대폰 UI, 검정 상태바 금지.
- 치료/효능보장 표현 금지.

[검수 기준]
- 하단에서 STOP/OPEN 구조가 바로 이해되어야 합니다.
- STOP: 펌프 잠김 / 눌리지 않음.
- OPEN: 펌프 열림 / 눌러서 사용 가능.
- 10/11/12를 나란히 봤을 때 같은 V4 상세페이지 세트처럼 보여야 합니다.
- 한국어 문구가 자연스럽고 읽을 수 있어야 합니다.`;

await fs.writeFile(path.join(outDir, 'prompts/11-stop-open-feedback-submitted.txt'), prompt);
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-stopopen-images-url-opened.png'), fullPage: true });
const bodyText = (await page.locator('body').innerText().catch(() => '')).slice(0, 1200);
console.log('opened-images-workspace', { url: page.url(), title: await page.title(), uploadFiles: uploadFiles.length, hasLogin: /로그인/.test(bodyText) });
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('Not on images URL: ' + page.url());
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(3000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/11-stop-open-feedback-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
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
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-stopopen-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(15000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-stopopen-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/11-stop-open-feedback-chat-url.txt'), page.url() + '\n');
console.log('submitted', { startUrl: 'https://chatgpt.com/images/', finalUrl: page.url(), title: await page.title() });
process.exit(0);

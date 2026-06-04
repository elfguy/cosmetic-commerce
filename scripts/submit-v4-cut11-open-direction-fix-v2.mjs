import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });

const refs = [];
const pairs = [
  ['detail/11.png', 'reference/cut11-open-direction-v2-01-current-ambiguous.png'],
  ['detail/10.png', 'reference/cut11-open-direction-v2-02-approved-cut10-tone.png'],
  ['detail/12.png', 'reference/cut11-open-direction-v2-03-approved-cut12-tone.png'],
  ['raw/11-open-direction-fix-gpt.png', 'reference/cut11-open-direction-v2-04-previous-gpt-raw.png'],
];
for (const [srcRel, dstRel] of pairs) {
  const src = path.join(outDir, srcRel);
  const dst = path.join(outDir, dstRel);
  try { await fs.stat(src); await fs.copyFile(src, dst); refs.push(dst); } catch (e) { console.warn('missing', srcRel, e.message); }
}
const userScreenshot = '/Users/elfguy/.hermes/image_cache/img_b0ba26ced6a2.jpeg';
try {
  const dst = path.join(outDir, 'reference/cut11-open-direction-v2-05-user-reference-right-open.jpeg');
  await fs.copyFile(userScreenshot, dst);
  refs.push(dst);
} catch (e) { console.warn('missing user screenshot', e.message); }

const prompt = `쿠팡 모바일 상세페이지용 세로 이미지 1장을 실제 이미지로 생성해 주세요.
설명만 하지 말고 반드시 이미지 결과물을 생성해 주세요.

[작업 목표]
현재 11번 이미지를 거의 그대로 유지하되, 하단 펌프 STOP / OPEN 안내에서 OPEN 회전 방향을 더 명확하고 정확하게 수정해 주세요.
최종 비율: 780×1360 세로형.

[사용자 피드백 핵심 — 가장 중요]
아직 방향이 잘못 보입니다.
정답은: 펌프를 오른쪽으로 돌릴 때 OPEN입니다.
소비자가 이미지를 보자마자 "오른쪽으로 돌리면 OPEN"이라고 이해해야 합니다.

[반드시 이렇게 그리기]
1. 펌프 헤드 윗면에 새겨진 흐름은 STOP에서 OPEN으로 가야 합니다.
   - STOP은 왼쪽, OPEN은 오른쪽.
   - 윗면의 작은 양각 화살표는 왼쪽 STOP에서 오른쪽 OPEN 방향으로 향하게 표현하세요.
   - 즉, 시각적으로 STOP → OPEN 입니다.

2. 큰 OPEN 안내 화살표는 오른쪽으로 향해야 합니다.
   - 현재 이미지처럼 OPEN 글자 옆에서 아래로 내려가는 화살표는 금지입니다.
   - 화살표 머리가 OPEN 쪽/오른쪽 끝에 있어야 합니다.
   - 왼쪽에서 오른쪽으로 이동해 OPEN에 도착하는 느낌이어야 합니다.
   - 가능한 경우 파란 화살표 옆에 "오른쪽으로 돌려 OPEN" 또는 "오른쪽으로 돌리면 OPEN"처럼 짧게 표현해도 좋습니다. 단, 전체 디자인과 어울리게 작고 깔끔하게.

3. 작은 하단 2번 단계도 오른쪽 방향이어야 합니다.
   - 2. OPEN 방향으로 돌려주세요.
   - 썸네일 화살표도 왼쪽에서 오른쪽으로, OPEN 방향으로 돌리는 느낌이어야 합니다.

[잘못된 예 — 절대 금지]
- OPEN 글자 오른쪽에서 아래로 떨어지는 곡선 화살표 금지.
- OPEN 방향이 왼쪽/반시계방향처럼 보이는 그림 금지.
- STOP과 OPEN 양쪽에 각각 아래로 떨어지는 같은 모양의 화살표를 두어 방향이 헷갈리는 구성 금지.
- 펌프 윗면 화살표가 OPEN에서 STOP으로 돌아가는 것처럼 보이면 실패.

[유지할 부분]
- 전체 레이아웃, 색감, 폰트, 여백, 물방울 배경, 제품 배치는 현재 이미지와 최대한 동일하게 유지하세요.
- STOP/OPEN 카드는 독립된 둥근 사각형 박스로 깨지지 않게 유지하세요.
- 한국어 텍스트는 현재 문구를 유지하세요.
- 로컬 덧칠/패치처럼 보이지 않게 자연스러운 생성 이미지로 완성하세요.

[반드시 유지할 한국어 문구]
제목: 사용 방법
작은 영문: HOW TO USE

상단 1번 카드:
얼굴에 골고루 펴 바른 후
부드럽게 흡수시켜 주세요.

상단 2번 카드:
건조한 부위에는
한 번 더 덧발라 주세요.

펌프 안내 제목:
펌프 STOP / OPEN 안내

설명 문구:
제품을 사용하기 전,
펌프 헤드의 방향을 확인해 주세요.

STOP 카드:
STOP
STOP 방향으로 돌리면
펌프가 눌리지 않아요.

OPEN 카드:
OPEN
OPEN 방향으로 돌린 후
눌러서 사용하세요.

하단 3단계:
1. STOP 상태 확인
2. OPEN 방향으로
돌려주세요.
3. 눌러서
사용하세요.

하단 주의 문구:
무리하게 돌리거나 분리하지 마세요.

[절대 금지]
- "놀리지", "놀러서", "눌러지" 같은 오타 금지. 반드시 "눌리지", "눌러서"입니다.
- OPEN 방향을 반대로 만들지 마세요.
- STOP/OPEN 의미를 바꾸지 마세요.
- STOP 카드 박스 라인을 깨뜨리지 마세요.
- 다른 브랜드/가짜 박스/새 제품 패키지 추가 금지.
- V4, V7, 컷번호, 11, POINT, STEP, CUT 같은 제작용 표식 금지.
- 휴대폰 UI, 검정 상태바, 브라우저 UI 금지.
- 치료/효능보장 표현 금지.

[검수 기준]
- 제일 중요한 검수: OPEN은 오른쪽으로 돌릴 때라는 사실이 모호하지 않아야 합니다.
- 펌프 윗면, 큰 화살표, 하단 2번 단계가 모두 같은 방향(STOP → OPEN, 왼쪽에서 오른쪽)이어야 합니다.
- 한국어 문구가 정확해야 합니다.
- 10/11/12를 나란히 봤을 때 같은 V4 상세페이지 세트처럼 보여야 합니다.`;

await fs.writeFile(path.join(outDir, 'prompts/11-open-direction-fix-v2-submitted.txt'), prompt);
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-open-direction-v2-opened.png'), fullPage: true });
console.log('opened-images-workspace', { url: page.url(), title: await page.title(), uploadFiles: refs.length });
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('Not on images URL: ' + page.url());
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(3000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/11-open-direction-fix-v2-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, refs);
await page.waitForTimeout(10000);
for (const text of ['확인', '완료']) {
 const btn = page.getByRole('button', { name: text }).first();
 if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-open-direction-v2-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(15000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-open-direction-v2-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/11-open-direction-fix-v2-chat-url.txt'), page.url() + '\n');
console.log('submitted', { startUrl: 'https://chatgpt.com/images/', finalUrl: page.url(), title: await page.title() });
process.exit(0);

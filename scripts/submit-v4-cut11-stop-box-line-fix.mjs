import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });

const refs = [];
const pairs = [
  ['detail/11.png', 'reference/cut11-stop-box-line-01-current-needs-border-fix.png'],
  ['detail/10.png', 'reference/cut11-stop-box-line-02-approved-cut10-tone.png'],
  ['detail/12.png', 'reference/cut11-stop-box-line-03-approved-cut12-tone.png'],
  ['raw/11-stop-open-typofix-gpt.png', 'reference/cut11-stop-box-line-04-current-gpt-raw.png'],
];
for (const [srcRel, dstRel] of pairs) {
  const src = path.join(outDir, srcRel);
  const dst = path.join(outDir, dstRel);
  try { await fs.stat(src); await fs.copyFile(src, dst); refs.push(dst); } catch (e) { console.warn('missing', srcRel, e.message); }
}
const userScreenshot = '/Users/elfguy/.hermes/image_cache/img_14c850081147.jpeg';
try {
  const dst = path.join(outDir, 'reference/cut11-stop-box-line-05-user-screenshot-problem.jpeg');
  await fs.copyFile(userScreenshot, dst);
  refs.push(dst);
} catch (e) { console.warn('missing user screenshot', e.message); }

const prompt = `쿠팡 모바일 상세페이지용 세로 이미지 1장을 실제 이미지로 생성해 주세요.
설명만 하지 말고 반드시 이미지 결과물을 생성해 주세요.

[작업 목표]
업로드한 현재 11번 이미지를 거의 그대로 유지하면서, 하단 "펌프 STOP / OPEN 안내" 영역의 STOP 카드 박스 라인 오류만 자연스럽게 수정해 주세요.
최종 비율: 780×1360 세로형.

[이번 수정 핵심 — 매우 중요]
사용자가 첨부한 스크린샷에서 보이는 문제처럼, STOP 카드의 박스 테두리/라운드 사각형 라인이 OPEN 카드와의 경계 쪽에서 잘못 보입니다.
STOP 카드와 OPEN 카드는 각각 독립된 둥근 사각형 카드여야 합니다.
- STOP 카드: 왼쪽 카드의 전체 테두리가 자연스럽고 끊김 없이 보여야 합니다.
- STOP 카드의 오른쪽 세로 테두리와 아래쪽/오른쪽 하단 라운드가 OPEN 카드와 섞이거나 깨지면 안 됩니다.
- 두 카드 사이에는 일정한 여백이 있어야 합니다.
- OPEN 카드 테두리와 같은 굵기, 같은 연한 회청색 라인, 같은 라운드 모서리로 맞춰 주세요.

[수정 범위]
- STOP 카드 박스 라인/테두리 문제만 고칩니다.
- 한국어 텍스트를 바꾸지 마세요.
- 제품/펌프 사진, 손가락, 화살표, 전체 레이아웃, 색감, 폰트, 여백은 현재 이미지와 최대한 동일하게 유지하세요.
- 로컬 패치처럼 보이는 덧칠/덮어쓰기 느낌 없이, 원래 생성된 디자인처럼 자연스럽게 만들어 주세요.

[반드시 유지할 한국어 문구 — 정확히]
제목:
사용 방법

작은 영문:
HOW TO USE

상단 1번 카드:
얼굴에 골고루 펴 바른 후
부드럽게 흡수시켜 주세요.

상단 2번 카드:
건조한 부위에는
한 번 더 덧발라 주세요.

펌프 안내 제목:
펌프 STOP / OPEN 안내

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
- STOP/OPEN 의미를 바꾸지 마세요.
- 다른 브랜드/가짜 박스/새 제품 패키지 추가 금지.
- V4, V7, 컷번호, 11, POINT, STEP, CUT 같은 제작용 표식 금지.
- 휴대폰 UI, 검정 상태바, 브라우저 UI 금지.
- 치료/효능보장 표현 금지.

[검수 기준]
- STOP 카드 테두리가 OPEN 카드처럼 정상적인 둥근 사각형으로 보여야 합니다.
- STOP 카드와 OPEN 카드가 서로 겹치거나 선이 엉키면 실패입니다.
- 한국어 문구가 모두 현재처럼 정확하고 선명해야 합니다.
- 10/11/12를 나란히 봤을 때 같은 V4 상세페이지 세트처럼 보여야 합니다.`;

await fs.writeFile(path.join(outDir, 'prompts/11-stop-box-line-fix-submitted.txt'), prompt);
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-stop-box-line-opened.png'), fullPage: true });
console.log('opened-images-workspace', { url: page.url(), title: await page.title(), uploadFiles: refs.length });
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('Not on images URL: ' + page.url());
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(3000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/11-stop-box-line-fix-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, refs);
await page.waitForTimeout(10000);
for (const text of ['확인', '완료']) {
 const btn = page.getByRole('button', { name: text }).first();
 if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-stop-box-line-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(15000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-stop-box-line-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/11-stop-box-line-fix-chat-url.txt'), page.url() + '\n');
console.log('submitted', { startUrl: 'https://chatgpt.com/images/', finalUrl: page.url(), title: await page.title() });
process.exit(0);

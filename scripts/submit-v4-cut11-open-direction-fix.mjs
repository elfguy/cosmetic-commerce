import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cleanupStaleImageAgentTabs } from './lib/chrome-tab-cleanup.mjs';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v4');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });

const refs = [];
const pairs = [
  ['detail/11.png', 'reference/cut11-open-direction-01-current-needs-direction-fix.png'],
  ['detail/10.png', 'reference/cut11-open-direction-02-approved-cut10-tone.png'],
  ['detail/12.png', 'reference/cut11-open-direction-03-approved-cut12-tone.png'],
  ['raw/11-stop-box-line-fix-gpt.png', 'reference/cut11-open-direction-04-current-gpt-raw.png'],
];
for (const [srcRel, dstRel] of pairs) {
  const src = path.join(outDir, srcRel);
  const dst = path.join(outDir, dstRel);
  try { await fs.stat(src); await fs.copyFile(src, dst); refs.push(dst); } catch (e) { console.warn('missing', srcRel, e.message); }
}
const userScreenshot = '/Users/elfguy/.hermes/image_cache/img_b0ba26ced6a2.jpeg';
try {
  const dst = path.join(outDir, 'reference/cut11-open-direction-05-user-screenshot-right-is-open.jpeg');
  await fs.copyFile(userScreenshot, dst);
  refs.push(dst);
} catch (e) { console.warn('missing user screenshot', e.message); }

const prompt = `쿠팡 모바일 상세페이지용 세로 이미지 1장을 실제 이미지로 생성해 주세요.
설명만 하지 말고 반드시 이미지 결과물을 생성해 주세요.

[작업 목표]
업로드한 현재 11번 이미지를 거의 그대로 유지하면서, 하단 펌프 STOP / OPEN 안내의 회전 방향을 정확히 수정해 주세요.
최종 비율: 780×1360 세로형.

[이번 수정 핵심 — 가장 중요]
사용자가 첨부한 스크린샷을 가장 중요하게 참고하세요.
이 펌프는 오른쪽으로 돌릴 때 OPEN입니다.
즉, 펌프 헤드를 시계방향/오른쪽 방향으로 회전하면 OPEN 상태가 됩니다.

반드시 이렇게 표현하세요:
- OPEN = 오른쪽으로 돌림 = 시계방향 회전 = 사용 가능
- STOP = 왼쪽/반대쪽으로 돌림 = 잠김 = 눌리지 않음
- OPEN 라벨은 오른쪽에 두고, OPEN 화살표는 오른쪽으로 돌리는 방향을 명확히 보여 주세요.
- 펌프 위 양각/흐릿한 글자도 가능한 범위에서 STOP은 왼쪽, OPEN은 오른쪽 흐름으로 자연스럽게 보여 주세요.
- 현재 이미지처럼 OPEN 화살표가 반대로 보이거나, OPEN 방향이 왼쪽으로 이해되면 실패입니다.

[수정 범위]
- 하단 펌프 클로즈업의 STOP/OPEN 회전 방향 표시와 관련 화살표만 수정합니다.
- STOP/OPEN 카드 박스 라인은 이전처럼 정상적인 독립 둥근 사각형으로 유지하세요.
- 한국어 텍스트를 바꾸지 마세요.
- 제품/펌프 사진, 전체 레이아웃, 색감, 폰트, 여백은 현재 이미지와 최대한 동일하게 유지하세요.
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
- OPEN 방향을 왼쪽/반시계방향으로 표시하지 마세요.
- 오른쪽으로 돌릴 때 OPEN이라는 사실을 절대 반대로 만들지 마세요.
- "놀리지", "놀러서", "눌러지" 같은 오타 금지. 반드시 "눌리지", "눌러서"입니다.
- STOP/OPEN 의미를 바꾸지 마세요.
- STOP 카드 박스 라인을 다시 깨뜨리지 마세요.
- 다른 브랜드/가짜 박스/새 제품 패키지 추가 금지.
- V4, V7, 컷번호, 11, POINT, STEP, CUT 같은 제작용 표식 금지.
- 휴대폰 UI, 검정 상태바, 브라우저 UI 금지.
- 치료/효능보장 표현 금지.

[검수 기준]
- 소비자가 봤을 때 오른쪽으로 돌리면 OPEN이라는 점이 즉시 이해되어야 합니다.
- STOP 카드와 OPEN 카드가 서로 겹치거나 선이 엉키지 않아야 합니다.
- 한국어 문구가 모두 현재처럼 정확하고 선명해야 합니다.
- 10/11/12를 나란히 봤을 때 같은 V4 상세페이지 세트처럼 보여야 합니다.`;

await fs.writeFile(path.join(outDir, 'prompts/11-open-direction-fix-submitted.txt'), prompt);
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
await cleanupStaleImageAgentTabs(ctx, { maxTabs: 2 });
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-open-direction-opened.png'), fullPage: true });
console.log('opened-images-workspace', { url: page.url(), title: await page.title(), uploadFiles: refs.length });
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('Not on images URL: ' + page.url());
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(3000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/11-open-direction-fix-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, refs);
await page.waitForTimeout(10000);
for (const text of ['확인', '완료']) {
 const btn = page.getByRole('button', { name: text }).first();
 if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-open-direction-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(15000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-open-direction-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/11-open-direction-fix-chat-url.txt'), page.url() + '\n');
console.log('submitted', { startUrl: 'https://chatgpt.com/images/', finalUrl: page.url(), title: await page.title() });
process.exit(0);

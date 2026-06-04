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
  ['raw/11-stop-open-feedback-gpt.png', 'reference/cut11-typofix-01-structure-before-typofix.png'],
  ['detail/10.png', 'reference/cut11-typofix-02-approved-cut10-tone.png'],
  ['detail/12.png', 'reference/cut11-typofix-03-approved-cut12-tone.png'],
  ['reference/cut11-stopopen-06-user-pump-stop-open-photo.jpeg', 'reference/cut11-typofix-04-user-pump-photo.jpeg'],
];
for (const [srcRel, dstRel] of pairs) {
  const src = path.join(outDir, srcRel);
  const dst = path.join(outDir, dstRel);
  try { await fs.stat(src); await fs.copyFile(src, dst); refs.push(dst); } catch (e) { console.warn('missing', srcRel, e.message); }
}

const prompt = `쿠팡 모바일 상세페이지용 세로 이미지 1장을 실제 이미지로 생성해 주세요.
업로드한 현재 11번 이미지를 거의 그대로 유지하면서, 한국어 오타만 정확히 수정한 개선본을 만들어 주세요.
설명만 하지 말고 반드시 이미지 결과물을 생성해 주세요.

[목표]
히알루론산 아쿠아 로션 V4 상세페이지 11번째 컷 오타 수정.
최종 비율: 780×1360 세로형.
현재 이미지의 레이아웃, 색감, 펌프 클로즈업, STOP/OPEN 설명 구조는 최대한 유지하세요.

[반드시 고칠 오타 — 가장 중요]
현재 이미지에서 “놀리지”, “놀러서”처럼 잘못 나온 글자를 모두 고쳐 주세요.

정확한 문구 1:
STOP 방향으로 돌리면
펌프가 눌리지 않아요.

정확한 문구 2:
OPEN 방향으로 돌린 후
눌러서 사용하세요.

하단 작은 3단계 설명도 정확히:
1. STOP 상태 확인
2. OPEN 방향으로 돌려주세요.
3. 눌러서 사용하세요.

중요: “놀리지”, “놀러서”, “눌러지”, “놀러”는 절대 사용하지 마세요. 반드시 “눌리지”, “눌러서”입니다.

[그 외 유지할 내용]
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

OPEN 설명:
OPEN 방향으로 돌린 후
눌러서 사용하세요.

하단 작은 주의 문구:
무리하게 돌리거나 분리하지 마세요.

[품질 기준]
- 현재 이미지와 거의 같은 톤/구성/품질이어야 합니다.
- STOP/OPEN 구조는 유지: STOP은 잠금/펌프가 눌리지 않음, OPEN은 눌러 사용 가능.
- 한국어 텍스트가 깨지거나 다른 오타가 생기면 실패입니다.
- 특히 “눌리지”를 “놀리지”, “눌러지”, “눌리지요” 등으로 바꾸지 마세요.
- V4, V7, 컷번호, 11, POINT, STEP, CUT 같은 제작용 표식 금지.
- 가짜 박스/브라우저 UI/휴대폰 UI 금지.
- 치료/효능보장 표현 금지.`;

await fs.writeFile(path.join(outDir, 'prompts/11-stop-open-typofix-submitted.txt'), prompt);
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] || await browser.newContext();
await cleanupStaleImageAgentTabs(ctx, { maxTabs: 2 });
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-typofix-images-opened.png'), fullPage: true });
console.log('opened-images-workspace', { url: page.url(), title: await page.title(), uploadFiles: refs.length });
if (!page.url().startsWith('https://chatgpt.com/images')) throw new Error('Not on images URL: ' + page.url());
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(() => {}); await page.waitForTimeout(3000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/11-stop-open-typofix-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
const uploadSelectors = ['input#upload-files','input#upload-photos','input#image-gen-action-modal-upload-photos','input[name="images-app-drop-container-input"]','input[type="file"]'].join(', ');
await page.setInputFiles(uploadSelectors, refs);
await page.waitForTimeout(9000);
for (const text of ['확인', '완료']) {
 const btn = page.getByRole('button', { name: text }).first();
 if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').last().click();
await page.keyboard.insertText(prompt);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-typofix-before-send.png'), fullPage: true });
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"], button[aria-label*="Send prompt"]').last().click({ timeout: 15000 });
await page.waitForTimeout(15000);
await page.screenshot({ path: path.join(root, 'tmp-v4-cut11-typofix-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/11-stop-open-typofix-chat-url.txt'), page.url() + '\n');
console.log('submitted', { startUrl: 'https://chatgpt.com/images/', finalUrl: page.url(), title: await page.title() });
process.exit(0);

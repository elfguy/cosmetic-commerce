import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });

const refs = [
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/detail/11.png'), path.join(outDir, 'reference/cut10-v3-original-code-date-layout.png')],
  [path.join(root, 'tmp-v7-01-09-contact-no-labels.png'), path.join(outDir, 'reference/cut10-v3-tone-board-no-labels.png')],
  [path.join(outDir, 'detail/09.png'), path.join(outDir, 'reference/cut10-v3-tone-ref-09.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `쿠팡 상세페이지용 세로 이미지 1장을 새로 생성해줘. 설명만 하지 말고 실제 이미지를 생성해줘.

[수정 이유]
이전 이미지는 양쪽 카드에 체크 표시/체크 배지가 들어가서 비교 의미가 불분명했다. 이번에는 체크 아이콘, 체크 마크, GOOD/CHECK 배지, 인증 배지를 모두 제거한다.
원본처럼 핵심은 제품 바닥면에 찍힌 “코드 + 날짜”다. 왼쪽은 코드 아래 제조일자, 오른쪽은 코드 아래 사용기한만 보이는 구조로 만든다.

[절대 금지]
- 체크 아이콘, 체크 마크, 노란 체크 원, GOOD, CHECK, OK, PASS, 인증 배지 금지.
- V7, v7, 버전명, 컷번호, 10, Point, POINT, CUT, STEP, page 같은 제작용 표식 금지.
- 브라우저 UI, 휴대폰 UI, 검정 상태바 금지.
- 제품 전체 병 정면샷 금지. 바닥면 클로즈업만 사용.

[이미지 문구]
제조일자는 신선함의 기준입니다

유어스킨플러스는
제조번호와 제조일자를 표기하고 있습니다.
언제 제조했는지 소비자가 바로 확인할 수 있습니다.

일부 타사 제품은
제조번호와 사용기한만을 표기하고 있습니다.
실제 제조 시점을 알기 어렵습니다.

유어스킨플러스는 제조일로부터 6개월 이내의 제품만을 출고합니다.

제조일이 오래되었거나 사용기한 임박 제품을 주의하세요

[중앙 비교 카드 구성]
- 좌우 카드 2개를 원본처럼 크게 배치한다.

왼쪽 카드:
- 제목: 유어스킨플러스는
- 큰 문구: 제조번호와 제조일자를 표기하고 있습니다.
- 중앙 이미지: 흰색 화장품 용기 바닥면 클로즈업.
- 바닥면 인쇄는 날짜 위에 코드가 있어야 한다. 정확히 다음처럼 두 줄로 보이게:
  A2507191
  제조 2025.07.19
- 하단 문구: 언제 제조했는지 소비자가 바로 확인할 수 있습니다.

오른쪽 카드:
- 제목: 일부 타사 제품은
- 큰 문구: 제조번호와 사용기한만을 표기하고 있습니다.
- 중앙 이미지: 흰색 화장품 용기 바닥면 클로즈업.
- 바닥면 인쇄는 날짜 위에 코드가 있어야 한다. 정확히 다음처럼 두 줄로 보이게:
  A39
  2026.03.29까지
- 하단 문구: 실제 제조 시점을 알기 어렵습니다.

[디자인]
- 원본 구조와 비슷하게: 상단 제목 → 좌우 비교 카드 → 하단 6개월 이내 출고 문구 → 작은 주의 문구.
- V7 세트 톤에 맞게 화이트 + 연아쿠아 + 민트그린. 오른쪽 강조 문구 일부는 부드러운 코랄/레드 사용 가능.
- 카드 안의 바닥면 클로즈업 이미지는 원본처럼 실제 사진 느낌으로, 텍스트는 선명하게.
- 정보는 넉넉한 여백으로 읽기 좋게.
- 최종 비율은 780×1360 세로 상세페이지.

[품질]
- 한국어 오타/깨짐/잘림 금지.
- “확인할 수” 정확히 표기.
- “제조일로부터” 정확히 표기.
- 과도한 타사 비방 금지. “일부 타사 제품” 표현만 사용.
- 치료/완치/질병개선/효능보장 표현 금지.`;

await fs.writeFile(path.join(outDir, 'prompts/10-v3-code-date-no-check-submitted.txt'), prompt);
function getId(src) { try { return new URL(src).searchParams.get('id') || src; } catch { return src; } }
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://chatgpt.com/images/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);
const title = await page.title();
console.log('workspace', {url: page.url(), title});
const create = page.getByText('이미지 만들기', { exact: true }).first();
if (await create.count()) { await create.click({ timeout: 15000 }).catch(()=>{}); await page.waitForTimeout(3000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/10-v3-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded refs', uploadFiles.length);
await page.waitForTimeout(10000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
const composer = page.locator('#prompt-textarea').last();
await composer.click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({ timeout: 15000 });
await page.waitForTimeout(15000);
await page.screenshot({ path: path.join(root, 'tmp-v7-cut10-v3-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/10-v3-chat-url.txt'), page.url() + '\n');
console.log('submitted', { url: page.url(), title: await page.title() });
process.exit(0);

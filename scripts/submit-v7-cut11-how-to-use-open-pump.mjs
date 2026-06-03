import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });

const refs = [
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/detail/12.png'), path.join(outDir, 'reference/cut11-original-how-to-use-pump.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v3/detail/08.png'), path.join(outDir, 'reference/cut11-v3-08-better-pump-photo.png')],
  [path.join(root, 'tmp-v7-01-10-contact-no-labels.png'), path.join(outDir, 'reference/cut11-v7-tone-board-no-labels.png')],
  [path.join(outDir, 'detail/10.png'), path.join(outDir, 'reference/cut11-tone-ref-10.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `쿠팡 상세페이지용 세로 이미지 1장을 새로 생성해줘. 설명만 하지 말고 실제 이미지를 생성해줘.

[이번 컷 주제]
히알루론산 아쿠아 로션 사용 방법 + 펌프 오픈 안내

[중요 요청사항]
- 사용자가 지적한 내용: 이전 사용법 컷의 STOP 안내는 잘못 보일 수 있다. STOP 방향으로 돌리면 펌프 자체가 풀리는 사용법처럼 오해될 수 있으므로 STOP 방향 화살표나 STOP 사용법 설명을 넣지 않는다.
- V3 08의 펌프 사진/제품 사진 느낌이 더 낫다. 펌프 클로즈업과 제품을 눕힌 촉촉한 연출을 참고한다.
- 원본 12번의 How to use 구성은 참고하되, STOP 문구는 수정한다.

[이미지 안에 들어갈 문구]
사용 방법
HOW TO USE

1. 적당량을 덜어 얼굴에 골고루 펴 바른 후
두드리듯이 흡수시켜 줍니다.

2. 건조함이 느껴지는 부위에는
한 번 더 덧발라 사용해 주세요.

펌프 헤드를 OPEN 방향으로 살짝 돌려 올린 후
눌러서 사용하세요.

무리하게 돌리거나 분리하지 마세요.

[펌프 안내 시각화]
- 제품 펌프 헤드 클로즈업을 크게 보여준다.
- 펌프 윗면 또는 주변에 OPEN 글자와 부드러운 화살표 1개만 표시한다.
- STOP 글자, STOP 화살표, STOP 방향 회전 설명은 넣지 않는다.
- 펌프가 분리되거나 뚜껑이 풀리는 느낌 금지.
- 펌프를 살짝 돌려 잠금 해제하고 누르는 사용법처럼 안전하고 단순하게 표현.

[제품 사진 연출]
- 하단에는 제품을 눕힌 촉촉한 사진 느낌을 넣는다. 물방울, 깨끗한 흰 배경, 연아쿠아 수분감.
- 제품 라벨은 가능하면 실제 제품처럼: YOURSKIN+ / HYALURONIC ACID AQUA LOTION / 300ml.
- 제품명이 데일리 수분 로션 등으로 바뀌지 않게 한다.

[디자인]
- 780×1360 세로 상세페이지 비율.
- 화이트 + 연아쿠아 + 민트블루 톤, V7 세트와 자연스럽게 연결.
- 상단: 사용 방법 제목.
- 중단 왼쪽: 사용법 1, 2단계 카드.
- 중단 오른쪽: 펌프 클로즈업 + OPEN 안내.
- 하단: 제품 눕힌 촉촉한 사진 연출.
- 정보는 넉넉한 여백과 둥근 카드로 읽기 쉽게.

[절대 금지]
- STOP 글자/STOP 화살표/STOP 방향 안내 금지.
- V7, v7, 버전명, 컷번호, 11, Point, POINT, CUT, STEP, page 같은 제작용 표식 금지.
- 브라우저 UI, 휴대폰 UI, 검정 상태바 금지.
- 한국어 오타, 깨짐, 의미 없는 글자, 잘림 금지.
- 치료, 완치, 질병 개선, 효능 보장 표현 금지.
- 펌프를 과도하게 회전시켜 분리하는 듯한 그림 금지.`;

await fs.writeFile(path.join(outDir, 'prompts/11-how-to-use-open-pump-submitted.txt'), prompt);
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
await fs.writeFile(path.join(outDir, 'prompts/11-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded refs', uploadFiles.length, uploadFiles);
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
await page.screenshot({ path: path.join(root, 'tmp-v7-cut11-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/11-chat-url.txt'), page.url() + '\n');
console.log('submitted', { url: page.url(), title: await page.title() });
process.exit(0);

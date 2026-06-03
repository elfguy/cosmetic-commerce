import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });

const refs = [
  [path.join(outDir, 'raw/07-fermented-oil-gpt.png'), path.join(outDir, 'reference/cut07-current-good-but-typo.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/detail/07.png'), path.join(outDir, 'reference/cut07-original-fermented-oil-revision.png')],
  [path.join(root, 'tmp-v7-01-06-contact.png'), path.join(outDir, 'reference/cut07-v7-tone-board-01-06-revision.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 V7 07번 이미지를 수정 생성한다. 반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[기준]
- cut07-current-good-but-typo.png의 전체 구성, 톤, 배경, 원료 배치는 좋다.
- 같은 레이아웃을 유지하되, 한국어 오타/깨짐 위험을 줄이기 위해 작은 설명 문구를 단순화한다.
- 특히 로즈힙열매오일 아래 문구에 '감사 보호' 같은 오타가 생기면 안 된다.

[상단 문구]
발효가 만든
피부 컨디션의 차이
발효 성분이 피부의 컨디션을 깨웁니다

[중단 원료명 — 이름만 또렷하게, 아래 작은 설명은 생략하거나 아주 짧게]
효모/겨우살이 발효추출물
효모/띠뿌리 발효추출물
락토바실러스/콩 발효추출물

[오일 영역 문구]
식물 유래 오일 블렌딩으로
피부를 편안하게 보호합니다
마카다미아씨오일 · 해바라기씨오일 · 로즈힙열매오일

[하단 원료명 — 이름만 또렷하게]
마카다미아씨오일
해바라기씨오일
로즈힙열매오일

[하단 큰 마무리 문구]
끈적임 없이
오래가는 촉촉한 보습막

[작은 주의 문구]
*상기 내용은 원료적 특성에 한함

[중요 수정 지시]
- 작은 설명 문장을 많이 넣지 말라. ingredient name 중심으로 깔끔하게.
- '감사 보호' 같은 오타 금지. 필요하면 로즈힙 아래 작은 설명은 아예 넣지 말고 원료명만 표시한다.
- 한국어가 깨지거나 의미 없는 글자가 나오면 안 된다.

[톤앤매너]
- V7 톤: 화이트 + 연아쿠아 + 민트그린 + 부드러운 골드 오일 포인트.
- 투명한 물방울, 오일 드롭, 유리 접시, 식물 원료 이미지.
- 제품 병/패키지는 넣지 않는다.
- 모바일 상세페이지용 780:1360 세로형, 안전 여백 확보.

[절대 금지]
- Point, POINT, CUT, DETAIL CUT, STEP, 독립 숫자 배지, 페이지 번호 금지.
- 브라우저 주소창, 휴대폰 상태바, 검정 UI 바, 안드로이드 내비게이션 바 금지.
- 제품 병/패키지 금지.
- 치료, 완치, 질병 개선, 재생, 피부 장벽 회복 같은 강한 의학 표현 금지.`;

await fs.writeFile(path.join(outDir, 'prompts/07-fermented-oil-revision-submitted.txt'), prompt);
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
if (await create.count()) { await create.click({ timeout: 15000 }).catch(()=>{}); await page.waitForTimeout(3000); }
await page.waitForSelector('#prompt-textarea', { timeout: 60000 });
const before = await page.evaluate(() => Array.from(document.images).map(img => img.currentSrc || img.src).filter(src => src.includes('backend-api/estuary/content')));
await fs.writeFile(path.join(outDir, 'prompts/07-revision-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
await page.setInputFiles('input#upload-files, input#upload-photos, input#image-gen-action-modal-upload-photos', uploadFiles);
console.log('uploaded refs', uploadFiles.length, uploadFiles);
await page.waitForTimeout(10000);
for (const text of ['확인', '완료']) {
  const btn = page.getByRole('button', { name: text }).first();
  if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1000); }
}
await page.locator('#prompt-textarea').click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(500);
await page.locator('button[data-testid="send-button"], #composer-submit-button, button[aria-label*="프롬프트 보내기"]').last().click({ timeout: 15000 });
console.log('submitted', { url: page.url(), title: await page.title() });
await page.screenshot({ path: path.join(root, 'tmp-v7-cut07-revision-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/07-revision-chat-url.txt'), page.url() + '\n');

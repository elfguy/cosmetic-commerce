import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });

const refs = [
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/detail/07.png'), path.join(outDir, 'reference/cut07-original-fermented-oil.png')],
  [path.join(root, 'tmp-v7-01-06-contact.png'), path.join(outDir, 'reference/cut07-v7-tone-board-01-06.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/05.png'), path.join(outDir, 'reference/cut07-tone-ref-05-ingredients.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/06.png'), path.join(outDir, 'reference/cut07-tone-ref-06-freshbud.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 V7 07번 이미지를 생성한다. 반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[이번 07번 목적]
- 01~06번 다음에 이어지는 "발효 오일 블렌딩 / 피부 컨디셔닝" 컷이다.
- 원본 cut07-original-fermented-oil.png의 정보 흐름을 참고하되, Point 4 같은 번호 라벨은 절대 넣지 않는다.
- V7 세트의 승인 톤은 cut07-v7-tone-board-01-06.png, cut07-tone-ref-05-ingredients.png, cut07-tone-ref-06-freshbud.png를 따른다.

[핵심 주제]
발효가 만든 피부 컨디션의 차이
발효 성분이 피부의 컨디션을 깨웁니다
식물 유래 오일 블렌딩으로 피부를 편안하게 보호합니다

[구성]
- 상단: 밝은 화이트/연아쿠아 배경 위에 고급스러운 제목 영역.
- 중단: 발효 성분 3개를 원형/유리 카드 형태로 보여준다.
  1) 호모/겨우살이 발효추출물
  2) 호모/땅뿌리 발효추출물
  3) 락토바실러스/콩 발효추출물
- 하단: 식물 유래 오일 3가지를 원료 이미지와 함께 보여준다.
  1) 마카다미아씨오일
  2) 해바라기씨오일
  3) 로즈힙열매오일
- 마지막 메시지: 끈적임 없이 오래가는 촉촉한 보습막
- 원료 특성 주의 문구를 반드시 작게 넣는다: *상기 내용은 원료적 특성에 한함

[비주얼 방향]
- 기존 원본의 노란 오일 느낌은 살리되 너무 촌스럽고 진한 노랑 포스터처럼 만들지 않는다.
- V7 톤과 어울리는 화이트 + 연아쿠아 + 민트그린 기반에, 오일 파트만 부드러운 골드/옐로우 포인트를 사용한다.
- 투명한 물방울, 오일 드롭, 유리 접시, 식물 씨앗/잎/꽃/로즈힙 이미지를 프리미엄 화장품 상세페이지처럼 배치한다.
- 제품 병/패키지는 넣지 않는다. 원료와 사용감 중심 컷이다.
- 전체는 모바일 상세페이지용 780:1360 세로형, 안전 여백 확보.

[문구 안전성]
- 화장품 상세페이지 표현으로 자연스럽게.
- 치료, 완치, 질병 개선, 재생, 피부 장벽 회복 같은 강한 의학적 표현은 쓰지 않는다.
- 허용 표현: 피부를 편안하게, 보습막, 촉촉함, 윤기 있는 피부결, 건조함으로부터 보호, 피부 컨디션.

[절대 금지]
- Point 4, POINT, CUT, DETAIL CUT, STEP, 독립 숫자 배지, 페이지 번호 금지.
- 브라우저 주소창, 휴대폰 상태바, 검정 UI 바, 안드로이드 내비게이션 바 금지.
- 제품 병/패키지 금지.
- 한국어 깨짐/의미 없는 글자/잘림 금지.
- 지나치게 어두운 네이비, 강한 연구소 포스터 느낌 금지.
- 원본 07의 낡고 노란 포스터 느낌을 그대로 복제 금지. V7의 깨끗하고 부드러운 톤으로 업그레이드.`;

await fs.writeFile(path.join(outDir, 'prompts/07-fermented-oil-submitted.txt'), prompt);
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
await fs.writeFile(path.join(outDir, 'prompts/07-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
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
await page.screenshot({ path: path.join(root, 'tmp-v7-cut07-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/07-chat-url.txt'), page.url() + '\n');

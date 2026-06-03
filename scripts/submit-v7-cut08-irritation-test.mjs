import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });

const refs = [
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/detail/08.png'), path.join(outDir, 'reference/cut08-original-irritation-test.png')],
  [path.join(root, 'tmp-v7-01-07-contact.png'), path.join(outDir, 'reference/cut08-v7-tone-board-01-07.png')],
  [path.join(outDir, 'detail/04.png'), path.join(outDir, 'reference/cut08-tone-ref-04-science.png')],
  [path.join(outDir, 'detail/06.png'), path.join(outDir, 'reference/cut08-tone-ref-06-document-blur.png')],
  [path.join(outDir, 'detail/07.png'), path.join(outDir, 'reference/cut08-tone-ref-07-ingredient.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 V7 08번 이미지를 생성한다. 반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[이번 08번 목적]
- 01~07번 다음에 이어지는 "피부 저자극 테스트 완료 / 민감 피부 안심" 신뢰 컷이다.
- 원본 cut08-original-irritation-test.png의 정보 구조를 참고하되, Point 4 같은 번호 라벨은 절대 넣지 않는다.
- V7 세트 톤은 cut08-v7-tone-board-01-07.png를 따른다: 화이트, 연아쿠아, 민트그린, 깨끗한 카드, 부드러운 수분감.

[핵심 주제]
피부 저자극 테스트 완료
민감한 피부도 편안하게
피부자극지수 0.00
비자극 제품 인증

[상단 문구]
피부 저자극 테스트 완료
민감한 피부도 편안하게 사용할 수 있도록
꼼꼼하게 확인했습니다

[중앙 핵심 영역]
- 중앙에 큰 숫자 카드: 피부자극지수 0.00
- 주변에 작은 신뢰 칩 3개:
  1) 비자극 제품 인증
  2) 민감 피부 사용 테스트
  3) 피부 편안함 확인
- 숫자 0.00은 선명하고 크게, 과장되지 않게.

[시험확인서/문서 영역]
- 오른쪽 또는 하단에 시험확인서 느낌의 세로 문서를 배치한다.
- cut08-tone-ref-06-document-blur.png처럼 문서/인증서 분위기는 살리되, 회사명, 시험기관명, 담당자명, 문서번호, 주소, 세부 표 내용은 블러/블루밍 처리하여 읽히지 않게 한다.
- 공식기관 로고/인증마크가 선명하게 보이면 안 된다. 분위기만 흐릿하게.
- 문서 제목은 '피부 저자극 테스트 결과' 정도로 보이게 하되, 세부 식별정보는 읽히지 않게 한다.

[하단 요약 문구]
자극을 줄인 데일리 보습 케어
민감한 피부도 부담 없이 촉촉하게

[작은 주의 문구]
*인체적용시험 결과에 한하며 개인차가 있을 수 있음

[비주얼 방향]
- 밝은 화이트 + 연아쿠아 + 민트그린 톤.
- 부드러운 피부 텍스처, 물방울, 체크 아이콘, 둥근 카드, 투명한 시험 리포트 느낌.
- 너무 차갑고 딱딱한 병원/의학 포스터 느낌 금지.
- 제품 병/패키지는 넣지 않는다. 신뢰/테스트/문서 중심 컷이다.
- 모바일 상세페이지용 780:1360 세로형, 안전 여백 확보.

[문구 안전성]
- 화장품 상세페이지 표현으로 자연스럽게.
- 허용 표현: 저자극 테스트 완료, 피부자극지수 0.00, 비자극 제품 인증, 민감한 피부도 편안하게, 피부 편안함 확인.
- 피해야 할 표현: 치료, 완치, 질병 개선, 아토피 개선, 100% 무자극 보장, 모든 피부 무조건 안전.

[절대 금지]
- Point, POINT, CUT, DETAIL CUT, STEP, 독립 숫자 배지, 페이지 번호 금지.
- 브라우저 주소창, 휴대폰 상태바, 검정 UI 바, 안드로이드 내비게이션 바 금지.
- 제품 병/패키지 금지.
- 한국어 깨짐/의미 없는 글자/잘림 금지.
- 회사명, 시험기관명, 문서번호, 주소, 담당자명, 등록번호 등 식별정보를 선명하게 표시 금지.
- 공식 인증기관/정부기관 보증처럼 오해될 만큼 선명한 로고 금지.`;

await fs.writeFile(path.join(outDir, 'prompts/08-irritation-test-submitted.txt'), prompt);
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
await fs.writeFile(path.join(outDir, 'prompts/08-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
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
await page.screenshot({ path: path.join(root, 'tmp-v7-cut08-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/08-chat-url.txt'), page.url() + '\n');

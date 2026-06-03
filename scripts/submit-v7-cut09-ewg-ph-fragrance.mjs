import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/elfguy/alba/cosmetic-commerce';
const outDir = path.join(root, 'public/coupang/images/aqua-lotion/versions/v7-sequential-780');
await fs.mkdir(path.join(outDir, 'prompts'), { recursive: true });
await fs.mkdir(path.join(outDir, 'reference'), { recursive: true });
await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });

const refs = [
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/original/detail/09.png'), path.join(outDir, 'reference/cut09-original-ewg-fragrance.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v3/detail/06.png'), path.join(outDir, 'reference/cut09-v3-06-ewg-test-info.png')],
  [path.join(root, 'public/coupang/images/aqua-lotion/versions/v3/detail/07.png'), path.join(outDir, 'reference/cut09-v3-07-ph-info.png')],
  [path.join(root, 'tmp-v7-01-08-contact.png'), path.join(outDir, 'reference/cut09-v7-tone-board-01-08.png')],
  [path.join(outDir, 'detail/08.png'), path.join(outDir, 'reference/cut09-tone-ref-08-test.png')],
];
for (const [src, dst] of refs) await fs.copyFile(src, dst);
const uploadFiles = refs.map(([, dst]) => dst);

const prompt = `아쿠아로션 상세페이지 V7 09번 이미지를 생성한다. 반드시 ChatGPT Images 2.0 이미지 생성 결과물로 만든다. 설명 텍스트만 답하지 말고 실제 이미지를 생성한다.

[중요 배경]
- 사용자가 이전에 요청한 내용: 전성분 EWG 그린과 약산성 pH의 내용은 V2에는 없으니 V3의 06과 07 내용을 넣어야 한다.
- 따라서 이번 09번은 원본 09만 참고하지 말고, V3 06의 EWG 그린 등급 내용과 V3 07의 약산성 pH 내용을 함께 반영한다.
- V7 08에서 피부 저자극 테스트는 이미 다뤘으므로, 이번 09번은 “성분 안전성 + 약산성 pH + 무향/미향” 컷이다.

[참조 역할]
- cut09-original-ewg-fragrance.png: EWG 그린 등급 + 무향/미향 정보 구조 참고. Point 6은 절대 넣지 않는다.
- cut09-v3-06-ewg-test-info.png: 최신 EWG 카드 정보, 등급 설명, FRAGRANCE FREE 구성 참고. 단 저자극 테스트 영역은 08번과 중복되므로 최소화.
- cut09-v3-07-ph-info.png: 약산성 pH 5.0~6.5 구성, pH 게이지, 피부와 유사한 약산성/유수분 밸런스/피부 보호막 케어 내용 참고.
- cut09-v7-tone-board-01-08.png: V7 전체 톤앤매너 기준. 화이트, 연아쿠아, 민트그린, 깨끗한 카드, 고급스러운 수분감.

[상단 제목]
안전한 성분과 약산성 밸런스
민감한 피부도 편안하게

[핵심 문구 1 — EWG]
전성분 100% EWG 그린 등급
모든 전성분이 EWG 그린 등급에 해당합니다

[EWG 설명 카드]
EWG 등급이란?
화장품 원료의 유해성을 1~10까지 구분해 성분 안전도를 평가하는 등급입니다.
1-2 안전등급 / 3-6 주의요망등급 / 7-10 주의등급
- EWG VERIFIED 공식 로고를 완벽 복제하지 말고, EWG 그린 등급을 설명하는 안전한 녹색 원형 아이콘/배지 느낌으로 만든다.
- “EWG VERIFIED”라는 문구를 공식 인증 마크처럼 크게 쓰지 말고, 필요하면 작은 설명형으로만 사용한다.

[핵심 문구 2 — 약산성 pH]
피부 밸런스를 지키는 약산성 pH
pH5.0 ~ pH6.5
피부와 유사한 약산성
유수분 밸런스 유지
피부 보호막 케어
- pH 게이지/반원형 미터를 넣어 pH5.0~pH6.5 범위를 명확히 보여준다.
- 산뜻한 수분감, 물방울, 녹색 잎과 함께 피부 밸런스 느낌을 표현한다.

[핵심 문구 3 — 무향/미향]
인위적인 향료를 넣지 않은
무향 또는 미향
원료와 식물 추출물 고유의 자연스러운 향이 느껴질 수 있습니다.
FRAGRANCE FREE 배지를 부드러운 핑크/화이트 톤으로 작게 넣는다.

[구성 제안]
- 상단: 큰 제목 + 짧은 설명.
- 중앙 왼쪽: EWG 그린 등급 카드와 1-2/3-6/7-10 등급표.
- 중앙 오른쪽: 약산성 pH 게이지와 pH5.0~pH6.5 강조.
- 하단: 무향/미향 FRAGRANCE FREE 카드.
- 전체 정보가 너무 빽빽하지 않도록 둥근 카드 3개로 정리.
- 제품 병/패키지는 넣지 않는다. 성분 안전성/밸런스 정보 중심 컷이다.

[작은 주의 문구]
*EWG 등급은 원료 기준 정보이며, 향은 원료 특성에 따라 개인차가 있을 수 있음

[톤앤매너]
- V7 세트와 맞는 화이트 + 연아쿠아 + 민트그린.
- EWG는 그린 포인트, pH는 블루~그린 게이지, 무향은 소프트 핑크 포인트.
- 과한 공식 인증/정부 보증 느낌 금지. 깨끗하고 신뢰감 있는 화장품 상세페이지 느낌.
- 모바일 상세페이지용 780:1360 세로형, 안전 여백 확보.

[절대 금지]
- Point 6, Point, POINT, CUT, DETAIL CUT, STEP, 독립 숫자 배지, 페이지 번호 금지.
- 브라우저 주소창, 휴대폰 상태바, 검정 UI 바, 안드로이드 내비게이션 바 금지.
- 제품 병/패키지 금지.
- 한국어 깨짐/의미 없는 글자/잘림 금지.
- 치료, 완치, 질병 개선, 아토피 개선, 100% 안전 보장 표현 금지.
- EWG 공식 인증 로고를 그대로 복제하거나 EWG VERIFIED 공식 인증처럼 과장 금지.`;

await fs.writeFile(path.join(outDir, 'prompts/09-ewg-ph-fragrance-submitted.txt'), prompt);
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
await fs.writeFile(path.join(outDir, 'prompts/09-before-ids.json'), JSON.stringify(before.map(getId), null, 2));
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
console.log('submitted', { url: page.url(), title: await page.title() });
await page.screenshot({ path: path.join(root, 'tmp-v7-cut09-submitted.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'prompts/09-chat-url.txt'), page.url() + '\n');
